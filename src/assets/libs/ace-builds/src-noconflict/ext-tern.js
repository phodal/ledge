ace.define("ace/snippets",["require","exports","module","ace/lib/oop","ace/lib/event_emitter","ace/lib/lang","ace/range","ace/anchor","ace/keyboard/hash_handler","ace/tokenizer","ace/lib/dom","ace/editor"], function(require, exports, module) {
"use strict";
var oop = require("./lib/oop");
var EventEmitter = require("./lib/event_emitter").EventEmitter;
var lang = require("./lib/lang");
var Range = require("./range").Range;
var Anchor = require("./anchor").Anchor;
var HashHandler = require("./keyboard/hash_handler").HashHandler;
var Tokenizer = require("./tokenizer").Tokenizer;
var comparePoints = Range.comparePoints;

var SnippetManager = function() {
    this.snippetMap = {};
    this.snippetNameMap = {};
};

(function() {
    oop.implement(this, EventEmitter);
    
    this.getTokenizer = function() {
        function TabstopToken(str, _, stack) {
            str = str.substr(1);
            if (/^\d+$/.test(str) && !stack.inFormatString)
                return [{tabstopId: parseInt(str, 10)}];
            return [{text: str}];
        }
        function escape(ch) {
            return "(?:[^\\\\" + ch + "]|\\\\.)";
        }
        SnippetManager.$tokenizer = new Tokenizer({
            start: [
                {regex: /:/, onMatch: function(val, state, stack) {
                    if (stack.length && stack[0].expectIf) {
                        stack[0].expectIf = false;
                        stack[0].elseBranch = stack[0];
                        return [stack[0]];
                    }
                    return ":";
                }},
                {regex: /\\./, onMatch: function(val, state, stack) {
                    var ch = val[1];
                    if (ch == "}" && stack.length) {
                        val = ch;
                    }else if ("`$\\".indexOf(ch) != -1) {
                        val = ch;
                    } else if (stack.inFormatString) {
                        if (ch == "n")
                            val = "\n";
                        else if (ch == "t")
                            val = "\n";
                        else if ("ulULE".indexOf(ch) != -1) {
                            val = {changeCase: ch, local: ch > "a"};
                        }
                    }

                    return [val];
                }},
                {regex: /}/, onMatch: function(val, state, stack) {
                    return [stack.length ? stack.shift() : val];
                }},
                {regex: /\$(?:\d+|\w+)/, onMatch: TabstopToken},
                {regex: /\$\{[\dA-Z_a-z]+/, onMatch: function(str, state, stack) {
                    var t = TabstopToken(str.substr(1), state, stack);
                    stack.unshift(t[0]);
                    return t;
                }, next: "snippetVar"},
                {regex: /\n/, token: "newline", merge: false}
            ],
            snippetVar: [
                {regex: "\\|" + escape("\\|") + "*\\|", onMatch: function(val, state, stack) {
                    stack[0].choices = val.slice(1, -1).split(",");
                }, next: "start"},
                {regex: "/(" + escape("/") + "+)/(?:(" + escape("/") + "*)/)(\\w*):?",
                 onMatch: function(val, state, stack) {
                    var ts = stack[0];
                    ts.fmtString = val;

                    val = this.splitRegex.exec(val);
                    ts.guard = val[1];
                    ts.fmt = val[2];
                    ts.flag = val[3];
                    return "";
                }, next: "start"},
                {regex: "`" + escape("`") + "*`", onMatch: function(val, state, stack) {
                    stack[0].code = val.splice(1, -1);
                    return "";
                }, next: "start"},
                {regex: "\\?", onMatch: function(val, state, stack) {
                    if (stack[0])
                        stack[0].expectIf = true;
                }, next: "start"},
                {regex: "([^:}\\\\]|\\\\.)*:?", token: "", next: "start"}
            ],
            formatString: [
                {regex: "/(" + escape("/") + "+)/", token: "regex"},
                {regex: "", onMatch: function(val, state, stack) {
                    stack.inFormatString = true;
                }, next: "start"}
            ]
        });
        SnippetManager.prototype.getTokenizer = function() {
            return SnippetManager.$tokenizer;
        };
        return SnippetManager.$tokenizer;
    };

    this.tokenizeTmSnippet = function(str, startState) {
        return this.getTokenizer().getLineTokens(str, startState).tokens.map(function(x) {
            return x.value || x;
        });
    };

    this.$getDefaultValue = function(editor, name) {
        if (/^[A-Z]\d+$/.test(name)) {
            var i = name.substr(1);
            return (this.variables[name[0] + "__"] || {})[i];
        }
        if (/^\d+$/.test(name)) {
            return (this.variables.__ || {})[name];
        }
        name = name.replace(/^TM_/, "");

        if (!editor)
            return;
        var s = editor.session;
        switch(name) {
            case "CURRENT_WORD":
                var r = s.getWordRange();
            case "SELECTION":
            case "SELECTED_TEXT":
                return s.getTextRange(r);
            case "CURRENT_LINE":
                return s.getLine(editor.getCursorPosition().row);
            case "PREV_LINE": // not possible in textmate
                return s.getLine(editor.getCursorPosition().row - 1);
            case "LINE_INDEX":
                return editor.getCursorPosition().column;
            case "LINE_NUMBER":
                return editor.getCursorPosition().row + 1;
            case "SOFT_TABS":
                return s.getUseSoftTabs() ? "YES" : "NO";
            case "TAB_SIZE":
                return s.getTabSize();
            case "FILENAME":
            case "FILEPATH":
                return "";
            case "FULLNAME":
                return "Ace";
        }
    };
    this.variables = {};
    this.getVariableValue = function(editor, varName) {
        if (this.variables.hasOwnProperty(varName))
            return this.variables[varName](editor, varName) || "";
        return this.$getDefaultValue(editor, varName) || "";
    };
    this.tmStrFormat = function(str, ch, editor) {
        var flag = ch.flag || "";
        var re = ch.guard;
        re = new RegExp(re, flag.replace(/[^gi]/, ""));
        var fmtTokens = this.tokenizeTmSnippet(ch.fmt, "formatString");
        var _self = this;
        var formatted = str.replace(re, function() {
            _self.variables.__ = arguments;
            var fmtParts = _self.resolveVariables(fmtTokens, editor);
            var gChangeCase = "E";
            for (var i  = 0; i < fmtParts.length; i++) {
                var ch = fmtParts[i];
                if (typeof ch == "object") {
                    fmtParts[i] = "";
                    if (ch.changeCase && ch.local) {
                        var next = fmtParts[i + 1];
                        if (next && typeof next == "string") {
                            if (ch.changeCase == "u")
                                fmtParts[i] = next[0].toUpperCase();
                            else
                                fmtParts[i] = next[0].toLowerCase();
                            fmtParts[i + 1] = next.substr(1);
                        }
                    } else if (ch.changeCase) {
                        gChangeCase = ch.changeCase;
                    }
                } else if (gChangeCase == "U") {
                    fmtParts[i] = ch.toUpperCase();
                } else if (gChangeCase == "L") {
                    fmtParts[i] = ch.toLowerCase();
                }
            }
            return fmtParts.join("");
        });
        this.variables.__ = null;
        return formatted;
    };

    this.resolveVariables = function(snippet, editor) {
        var result = [];
        for (var i = 0; i < snippet.length; i++) {
            var ch = snippet[i];
            if (typeof ch == "string") {
                result.push(ch);
            } else if (typeof ch != "object") {
                continue;
            } else if (ch.skip) {
                gotoNext(ch);
            } else if (ch.processed < i) {
                continue;
            } else if (ch.text) {
                var value = this.getVariableValue(editor, ch.text);
                if (value && ch.fmtString)
                    value = this.tmStrFormat(value, ch);
                ch.processed = i;
                if (ch.expectIf == null) {
                    if (value) {
                        result.push(value);
                        gotoNext(ch);
                    }
                } else {
                    if (value) {
                        ch.skip = ch.elseBranch;
                    } else
                        gotoNext(ch);
                }
            } else if (ch.tabstopId != null) {
                result.push(ch);
            } else if (ch.changeCase != null) {
                result.push(ch);
            }
        }
        function gotoNext(ch) {
            var i1 = snippet.indexOf(ch, i + 1);
            if (i1 != -1)
                i = i1;
        }
        return result;
    };

    this.insertSnippetForSelection = function(editor, snippetText) {
        var cursor = editor.getCursorPosition();
        var line = editor.session.getLine(cursor.row);
        var tabString = editor.session.getTabString();
        var indentString = line.match(/^\s*/)[0];
        
        if (cursor.column < indentString.length)
            indentString = indentString.slice(0, cursor.column);

        snippetText = snippetText.replace(/\r/g, "");
        var tokens = this.tokenizeTmSnippet(snippetText);
        tokens = this.resolveVariables(tokens, editor);
        tokens = tokens.map(function(x) {
            if (x == "\n")
                return x + indentString;
            if (typeof x == "string")
                return x.replace(/\t/g, tabString);
            return x;
        });
        var tabstops = [];
        tokens.forEach(function(p, i) {
            if (typeof p != "object")
                return;
            var id = p.tabstopId;
            var ts = tabstops[id];
            if (!ts) {
                ts = tabstops[id] = [];
                ts.index = id;
                ts.value = "";
            }
            if (ts.indexOf(p) !== -1)
                return;
            ts.push(p);
            var i1 = tokens.indexOf(p, i + 1);
            if (i1 === -1)
                return;

            var value = tokens.slice(i + 1, i1);
            var isNested = value.some(function(t) {return typeof t === "object"});          
            if (isNested && !ts.value) {
                ts.value = value;
            } else if (value.length && (!ts.value || typeof ts.value !== "string")) {
                ts.value = value.join("");
            }
        });
        tabstops.forEach(function(ts) {ts.length = 0});
        var expanding = {};
        function copyValue(val) {
            var copy = [];
            for (var i = 0; i < val.length; i++) {
                var p = val[i];
                if (typeof p == "object") {
                    if (expanding[p.tabstopId])
                        continue;
                    var j = val.lastIndexOf(p, i - 1);
                    p = copy[j] || {tabstopId: p.tabstopId};
                }
                copy[i] = p;
            }
            return copy;
        }
        for (var i = 0; i < tokens.length; i++) {
            var p = tokens[i];
            if (typeof p != "object")
                continue;
            var id = p.tabstopId;
            var i1 = tokens.indexOf(p, i + 1);
            if (expanding[id]) {
                if (expanding[id] === p)
                    expanding[id] = null;
                continue;
            }
            
            var ts = tabstops[id];
            var arg = typeof ts.value == "string" ? [ts.value] : copyValue(ts.value);
            arg.unshift(i + 1, Math.max(0, i1 - i));
            arg.push(p);
            expanding[id] = p;
            tokens.splice.apply(tokens, arg);

            if (ts.indexOf(p) === -1)
                ts.push(p);
        }
        var row = 0, column = 0;
        var text = "";
        tokens.forEach(function(t) {
            if (typeof t === "string") {
                var lines = t.split("\n");
                if (lines.length > 1){
                    column = lines[lines.length - 1].length;
                    row += lines.length - 1;
                } else
                    column += t.length;
                text += t;
            } else {
                if (!t.start)
                    t.start = {row: row, column: column};
                else
                    t.end = {row: row, column: column};
            }
        });
        var range = editor.getSelectionRange();
        var end = editor.session.replace(range, text);

        var tabstopManager = new TabstopManager(editor);
        var selectionId = editor.inVirtualSelectionMode && editor.selection.index;
        tabstopManager.addTabstops(tabstops, range.start, end, selectionId);
    };
    
    this.insertSnippet = function(editor, snippetText) {
        var self = this;
        if (editor.inVirtualSelectionMode)
            return self.insertSnippetForSelection(editor, snippetText);
        
        editor.forEachSelection(function() {
            self.insertSnippetForSelection(editor, snippetText);
        }, null, {keepOrder: true});
        
        if (editor.tabstopManager)
            editor.tabstopManager.tabNext();
    };

    this.$getScope = function(editor) {
        var scope = editor.session.$mode.$id || "";
        scope = scope.split("/").pop();
        if (scope === "html" || scope === "php") {
            if (scope === "php" && !editor.session.$mode.inlinePhp) 
                scope = "html";
            var c = editor.getCursorPosition();
            var state = editor.session.getState(c.row);
            if (typeof state === "object") {
                state = state[0];
            }
            if (state.substring) {
                if (state.substring(0, 3) == "js-")
                    scope = "javascript";
                else if (state.substring(0, 4) == "css-")
                    scope = "css";
                else if (state.substring(0, 4) == "php-")
                    scope = "php";
            }
        }
        
        return scope;
    };

    this.getActiveScopes = function(editor) {
        var scope = this.$getScope(editor);
        var scopes = [scope];
        var snippetMap = this.snippetMap;
        if (snippetMap[scope] && snippetMap[scope].includeScopes) {
            scopes.push.apply(scopes, snippetMap[scope].includeScopes);
        }
        scopes.push("_");
        return scopes;
    };

    this.expandWithTab = function(editor, options) {
        var self = this;
        var result = editor.forEachSelection(function() {
            return self.expandSnippetForSelection(editor, options);
        }, null, {keepOrder: true});
        if (result && editor.tabstopManager)
            editor.tabstopManager.tabNext();
        return result;
    };
    
    this.expandSnippetForSelection = function(editor, options) {
        var cursor = editor.getCursorPosition();
        var line = editor.session.getLine(cursor.row);
        var before = line.substring(0, cursor.column);
        var after = line.substr(cursor.column);

        var snippetMap = this.snippetMap;
        var snippet;
        this.getActiveScopes(editor).some(function(scope) {
            var snippets = snippetMap[scope];
            if (snippets)
                snippet = this.findMatchingSnippet(snippets, before, after);
            return !!snippet;
        }, this);
        if (!snippet)
            return false;
        if (options && options.dryRun)
            return true;
        editor.session.doc.removeInLine(cursor.row,
            cursor.column - snippet.replaceBefore.length,
            cursor.column + snippet.replaceAfter.length
        );

        this.variables.M__ = snippet.matchBefore;
        this.variables.T__ = snippet.matchAfter;
        this.insertSnippetForSelection(editor, snippet.content);

        this.variables.M__ = this.variables.T__ = null;
        return true;
    };

    this.findMatchingSnippet = function(snippetList, before, after) {
        for (var i = snippetList.length; i--;) {
            var s = snippetList[i];
            if (s.startRe && !s.startRe.test(before))
                continue;
            if (s.endRe && !s.endRe.test(after))
                continue;
            if (!s.startRe && !s.endRe)
                continue;

            s.matchBefore = s.startRe ? s.startRe.exec(before) : [""];
            s.matchAfter = s.endRe ? s.endRe.exec(after) : [""];
            s.replaceBefore = s.triggerRe ? s.triggerRe.exec(before)[0] : "";
            s.replaceAfter = s.endTriggerRe ? s.endTriggerRe.exec(after)[0] : "";
            return s;
        }
    };

    this.snippetMap = {};
    this.snippetNameMap = {};
    this.register = function(snippets, scope) {
        var snippetMap = this.snippetMap;
        var snippetNameMap = this.snippetNameMap;
        var self = this;
        
        if (!snippets) 
            snippets = [];
        
        function wrapRegexp(src) {
            if (src && !/^\^?\(.*\)\$?$|^\\b$/.test(src))
                src = "(?:" + src + ")";

            return src || "";
        }
        function guardedRegexp(re, guard, opening) {
            re = wrapRegexp(re);
            guard = wrapRegexp(guard);
            if (opening) {
                re = guard + re;
                if (re && re[re.length - 1] != "$")
                    re = re + "$";
            } else {
                re = re + guard;
                if (re && re[0] != "^")
                    re = "^" + re;
            }
            return new RegExp(re);
        }

        function addSnippet(s) {
            if (!s.scope)
                s.scope = scope || "_";
            scope = s.scope;
            if (!snippetMap[scope]) {
                snippetMap[scope] = [];
                snippetNameMap[scope] = {};
            }

            var map = snippetNameMap[scope];
            if (s.name) {
                var old = map[s.name];
                if (old)
                    self.unregister(old);
                map[s.name] = s;
            }
            snippetMap[scope].push(s);

            if (s.tabTrigger && !s.trigger) {
                if (!s.guard && /^\w/.test(s.tabTrigger))
                    s.guard = "\\b";
                s.trigger = lang.escapeRegExp(s.tabTrigger);
            }
            
            if (!s.trigger && !s.guard && !s.endTrigger && !s.endGuard)
                return;
            
            s.startRe = guardedRegexp(s.trigger, s.guard, true);
            s.triggerRe = new RegExp(s.trigger, "", true);

            s.endRe = guardedRegexp(s.endTrigger, s.endGuard, true);
            s.endTriggerRe = new RegExp(s.endTrigger, "", true);
        }

        if (snippets && snippets.content)
            addSnippet(snippets);
        else if (Array.isArray(snippets))
            snippets.forEach(addSnippet);
        
        this._signal("registerSnippets", {scope: scope});
    };
    this.unregister = function(snippets, scope) {
        var snippetMap = this.snippetMap;
        var snippetNameMap = this.snippetNameMap;

        function removeSnippet(s) {
            var nameMap = snippetNameMap[s.scope||scope];
            if (nameMap && nameMap[s.name]) {
                delete nameMap[s.name];
                var map = snippetMap[s.scope||scope];
                var i = map && map.indexOf(s);
                if (i >= 0)
                    map.splice(i, 1);
            }
        }
        if (snippets.content)
            removeSnippet(snippets);
        else if (Array.isArray(snippets))
            snippets.forEach(removeSnippet);
    };
    this.parseSnippetFile = function(str) {
        str = str.replace(/\r/g, "");
        var list = [], snippet = {};
        var re = /^#.*|^({[\s\S]*})\s*$|^(\S+) (.*)$|^((?:\n*\t.*)+)/gm;
        var m;
        while (m = re.exec(str)) {
            if (m[1]) {
                try {
                    snippet = JSON.parse(m[1]);
                    list.push(snippet);
                } catch (e) {}
            } if (m[4]) {
                snippet.content = m[4].replace(/^\t/gm, "");
                list.push(snippet);
                snippet = {};
            } else {
                var key = m[2], val = m[3];
                if (key == "regex") {
                    var guardRe = /\/((?:[^\/\\]|\\.)*)|$/g;
                    snippet.guard = guardRe.exec(val)[1];
                    snippet.trigger = guardRe.exec(val)[1];
                    snippet.endTrigger = guardRe.exec(val)[1];
                    snippet.endGuard = guardRe.exec(val)[1];
                } else if (key == "snippet") {
                    snippet.tabTrigger = val.match(/^\S*/)[0];
                    if (!snippet.name)
                        snippet.name = val;
                } else {
                    snippet[key] = val;
                }
            }
        }
        return list;
    };
    this.getSnippetByName = function(name, editor) {
        var snippetMap = this.snippetNameMap;
        var snippet;
        this.getActiveScopes(editor).some(function(scope) {
            var snippets = snippetMap[scope];
            if (snippets)
                snippet = snippets[name];
            return !!snippet;
        }, this);
        return snippet;
    };

}).call(SnippetManager.prototype);


var TabstopManager = function(editor) {
    if (editor.tabstopManager)
        return editor.tabstopManager;
    editor.tabstopManager = this;
    this.$onChange = this.onChange.bind(this);
    this.$onChangeSelection = lang.delayedCall(this.onChangeSelection.bind(this)).schedule;
    this.$onChangeSession = this.onChangeSession.bind(this);
    this.$onAfterExec = this.onAfterExec.bind(this);
    this.attach(editor);
};
(function() {
    this.attach = function(editor) {
        this.index = 0;
        this.ranges = [];
        this.tabstops = [];
        this.$openTabstops = null;
        this.selectedTabstop = null;

        this.editor = editor;
        this.editor.on("change", this.$onChange);
        this.editor.on("changeSelection", this.$onChangeSelection);
        this.editor.on("changeSession", this.$onChangeSession);
        this.editor.commands.on("afterExec", this.$onAfterExec);
        this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler);
    };
    this.detach = function() {
        this.tabstops.forEach(this.removeTabstopMarkers, this);
        this.ranges = null;
        this.tabstops = null;
        this.selectedTabstop = null;
        this.editor.removeListener("change", this.$onChange);
        this.editor.removeListener("changeSelection", this.$onChangeSelection);
        this.editor.removeListener("changeSession", this.$onChangeSession);
        this.editor.commands.removeListener("afterExec", this.$onAfterExec);
        this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
        this.editor.tabstopManager = null;
        this.editor = null;
    };

    this.onChange = function(delta) {
        var changeRange = delta;
        var isRemove = delta.action[0] == "r";
        var start = delta.start;
        var end = delta.end;
        var startRow = start.row;
        var endRow = end.row;
        var lineDif = endRow - startRow;
        var colDiff = end.column - start.column;

        if (isRemove) {
            lineDif = -lineDif;
            colDiff = -colDiff;
        }
        if (!this.$inChange && isRemove) {
            var ts = this.selectedTabstop;
            var changedOutside = ts && !ts.some(function(r) {
                return comparePoints(r.start, start) <= 0 && comparePoints(r.end, end) >= 0;
            });
            if (changedOutside)
                return this.detach();
        }
        var ranges = this.ranges;
        for (var i = 0; i < ranges.length; i++) {
            var r = ranges[i];
            if (r.end.row < start.row)
                continue;

            if (isRemove && comparePoints(start, r.start) < 0 && comparePoints(end, r.end) > 0) {
                this.removeRange(r);
                i--;
                continue;
            }

            if (r.start.row == startRow && r.start.column > start.column)
                r.start.column += colDiff;
            if (r.end.row == startRow && r.end.column >= start.column)
                r.end.column += colDiff;
            if (r.start.row >= startRow)
                r.start.row += lineDif;
            if (r.end.row >= startRow)
                r.end.row += lineDif;

            if (comparePoints(r.start, r.end) > 0)
                this.removeRange(r);
        }
        if (!ranges.length)
            this.detach();
    };
    this.updateLinkedFields = function() {
        var ts = this.selectedTabstop;
        if (!ts || !ts.hasLinkedRanges)
            return;
        this.$inChange = true;
        var session = this.editor.session;
        var text = session.getTextRange(ts.firstNonLinked);
        for (var i = ts.length; i--;) {
            var range = ts[i];
            if (!range.linked)
                continue;
            var fmt = exports.snippetManager.tmStrFormat(text, range.original);
            session.replace(range, fmt);
        }
        this.$inChange = false;
    };
    this.onAfterExec = function(e) {
        if (e.command && !e.command.readOnly)
            this.updateLinkedFields();
    };
    this.onChangeSelection = function() {
        if (!this.editor)
            return;
        var lead = this.editor.selection.lead;
        var anchor = this.editor.selection.anchor;
        var isEmpty = this.editor.selection.isEmpty();
        for (var i = this.ranges.length; i--;) {
            if (this.ranges[i].linked)
                continue;
            var containsLead = this.ranges[i].contains(lead.row, lead.column);
            var containsAnchor = isEmpty || this.ranges[i].contains(anchor.row, anchor.column);
            if (containsLead && containsAnchor)
                return;
        }
        this.detach();
    };
    this.onChangeSession = function() {
        this.detach();
    };
    this.tabNext = function(dir) {
        var max = this.tabstops.length;
        var index = this.index + (dir || 1);
        index = Math.min(Math.max(index, 1), max);
        if (index == max)
            index = 0;
        this.selectTabstop(index);
        if (index === 0)
            this.detach();
    };
    this.selectTabstop = function(index) {
        this.$openTabstops = null;
        var ts = this.tabstops[this.index];
        if (ts)
            this.addTabstopMarkers(ts);
        this.index = index;
        ts = this.tabstops[this.index];
        if (!ts || !ts.length)
            return;
        
        this.selectedTabstop = ts;
        if (!this.editor.inVirtualSelectionMode) {        
            var sel = this.editor.multiSelect;
            sel.toSingleRange(ts.firstNonLinked.clone());
            for (var i = ts.length; i--;) {
                if (ts.hasLinkedRanges && ts[i].linked)
                    continue;
                sel.addRange(ts[i].clone(), true);
            }
            if (sel.ranges[0])
                sel.addRange(sel.ranges[0].clone());
        } else {
            this.editor.selection.setRange(ts.firstNonLinked);
        }
        
        this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler);
    };
    this.addTabstops = function(tabstops, start, end) {
        if (!this.$openTabstops)
            this.$openTabstops = [];
        if (!tabstops[0]) {
            var p = Range.fromPoints(end, end);
            moveRelative(p.start, start);
            moveRelative(p.end, start);
            tabstops[0] = [p];
            tabstops[0].index = 0;
        }

        var i = this.index;
        var arg = [i + 1, 0];
        var ranges = this.ranges;
        tabstops.forEach(function(ts, index) {
            var dest = this.$openTabstops[index] || ts;
                
            for (var i = ts.length; i--;) {
                var p = ts[i];
                var range = Range.fromPoints(p.start, p.end || p.start);
                movePoint(range.start, start);
                movePoint(range.end, start);
                range.original = p;
                range.tabstop = dest;
                ranges.push(range);
                if (dest != ts)
                    dest.unshift(range);
                else
                    dest[i] = range;
                if (p.fmtString) {
                    range.linked = true;
                    dest.hasLinkedRanges = true;
                } else if (!dest.firstNonLinked)
                    dest.firstNonLinked = range;
            }
            if (!dest.firstNonLinked)
                dest.hasLinkedRanges = false;
            if (dest === ts) {
                arg.push(dest);
                this.$openTabstops[index] = dest;
            }
            this.addTabstopMarkers(dest);
        }, this);
        
        if (arg.length > 2) {
            if (this.tabstops.length)
                arg.push(arg.splice(2, 1)[0]);
            this.tabstops.splice.apply(this.tabstops, arg);
        }
    };

    this.addTabstopMarkers = function(ts) {
        var session = this.editor.session;
        ts.forEach(function(range) {
            if  (!range.markerId)
                range.markerId = session.addMarker(range, "ace_snippet-marker", "text");
        });
    };
    this.removeTabstopMarkers = function(ts) {
        var session = this.editor.session;
        ts.forEach(function(range) {
            session.removeMarker(range.markerId);
            range.markerId = null;
        });
    };
    this.removeRange = function(range) {
        var i = range.tabstop.indexOf(range);
        range.tabstop.splice(i, 1);
        i = this.ranges.indexOf(range);
        this.ranges.splice(i, 1);
        this.editor.session.removeMarker(range.markerId);
        if (!range.tabstop.length) {
            i = this.tabstops.indexOf(range.tabstop);
            if (i != -1)
                this.tabstops.splice(i, 1);
            if (!this.tabstops.length)
                this.detach();
        }
    };

    this.keyboardHandler = new HashHandler();
    this.keyboardHandler.bindKeys({
        "Tab": function(ed) {
            if (exports.snippetManager && exports.snippetManager.expandWithTab(ed)) {
                return;
            }

            ed.tabstopManager.tabNext(1);
        },
        "Shift-Tab": function(ed) {
            ed.tabstopManager.tabNext(-1);
        },
        "Esc": function(ed) {
            ed.tabstopManager.detach();
        },
        "Return": function(ed) {
            return false;
        }
    });
}).call(TabstopManager.prototype);



var changeTracker = {};
changeTracker.onChange = Anchor.prototype.onChange;
changeTracker.setPosition = function(row, column) {
    this.pos.row = row;
    this.pos.column = column;
};
changeTracker.update = function(pos, delta, $insertRight) {
    this.$insertRight = $insertRight;
    this.pos = pos; 
    this.onChange(delta);
};

var movePoint = function(point, diff) {
    if (point.row == 0)
        point.column += diff.column;
    point.row += diff.row;
};

var moveRelative = function(point, start) {
    if (point.row == start.row)
        point.column -= start.column;
    point.row -= start.row;
};


require("./lib/dom").importCssString("\
.ace_snippet-marker {\
    -moz-box-sizing: border-box;\
    box-sizing: border-box;\
    background: rgba(194, 193, 208, 0.09);\
    border: 1px dotted rgba(211, 208, 235, 0.62);\
    position: absolute;\
}");

exports.snippetManager = new SnippetManager();


var Editor = require("./editor").Editor;
(function() {
    this.insertSnippet = function(content, options) {
        return exports.snippetManager.insertSnippet(this, content, options);
    };
    this.expandSnippet = function(options) {
        return exports.snippetManager.expandWithTab(this, options);
    };
}).call(Editor.prototype);

});

ace.define("ace/autocomplete/text_completer",["require","exports","module","ace/range"], function(require, exports, module) {
    var Range = require("../range").Range;
    
    var splitRegex = /[^a-zA-Z_0-9\$\-\u00C0-\u1FFF\u2C00-\uD7FF\w]+/;

    function getWordIndex(doc, pos) {
        var textBefore = doc.getTextRange(Range.fromPoints({row: 0, column:0}, pos));
        return textBefore.split(splitRegex).length - 1;
    }
    function wordDistance(doc, pos) {
        var prefixPos = getWordIndex(doc, pos);
        var words = doc.getValue().split(splitRegex);
        var wordScores = Object.create(null);
        
        var currentWord = words[prefixPos];

        words.forEach(function(word, idx) {
            if (!word || word === currentWord) return;

            var distance = Math.abs(prefixPos - idx);
            var score = words.length - distance;
            if (wordScores[word]) {
                wordScores[word] = Math.max(score, wordScores[word]);
            } else {
                wordScores[word] = score;
            }
        });
        return wordScores;
    }

    exports.getCompletions = function(editor, session, pos, prefix, callback) {
        var wordScore = wordDistance(session, pos, prefix);
        var wordList = Object.keys(wordScore);
        callback(null, wordList.map(function(word) {
            return {
                caption: word,
                value: word,
                score: wordScore[word],
                meta: "local"
            };
        }));
    };
});

ace.define("ace/autocomplete/popup",["require","exports","module","ace/virtual_renderer","ace/editor","ace/range","ace/lib/event","ace/lib/lang","ace/lib/dom"], function(require, exports, module) {
"use strict";

var Renderer = require("../virtual_renderer").VirtualRenderer;
var Editor = require("../editor").Editor;
var Range = require("../range").Range;
var event = require("../lib/event");
var lang = require("../lib/lang");
var dom = require("../lib/dom");

var $singleLineEditor = function(el) {
    var renderer = new Renderer(el);

    renderer.$maxLines = 4;

    var editor = new Editor(renderer);

    editor.setHighlightActiveLine(false);
    editor.setShowPrintMargin(false);
    editor.renderer.setShowGutter(false);
    editor.renderer.setHighlightGutterLine(false);

    editor.$mouseHandler.$focusWaitTimout = 0;
    editor.$highlightTagPending = true;

    return editor;
};

var AcePopup = function(parentNode) {
    var el = dom.createElement("div");
    var popup = new $singleLineEditor(el);

    if (parentNode)
        parentNode.appendChild(el);
    el.style.display = "none";
    popup.renderer.content.style.cursor = "default";
    popup.renderer.setStyle("ace_autocomplete");

    popup.setOption("displayIndentGuides", false);
    popup.setOption("dragDelay", 150);

    var noop = function(){};

    popup.focus = noop;
    popup.$isFocused = true;

    popup.renderer.$cursorLayer.restartTimer = noop;
    popup.renderer.$cursorLayer.element.style.opacity = 0;

    popup.renderer.$maxLines = 8;
    popup.renderer.$keepTextAreaAtCursor = false;

    popup.setHighlightActiveLine(false);
    popup.session.highlight("");
    popup.session.$searchHighlight.clazz = "ace_highlight-marker";

    popup.on("mousedown", function(e) {
        var pos = e.getDocumentPosition();
        popup.selection.moveToPosition(pos);
        selectionMarker.start.row = selectionMarker.end.row = pos.row;
        e.stop();
    });

    var lastMouseEvent;
    var hoverMarker = new Range(-1,0,-1,Infinity);
    var selectionMarker = new Range(-1,0,-1,Infinity);
    selectionMarker.id = popup.session.addMarker(selectionMarker, "ace_active-line", "fullLine");
    popup.setSelectOnHover = function(val) {
        if (!val) {
            hoverMarker.id = popup.session.addMarker(hoverMarker, "ace_line-hover", "fullLine");
        } else if (hoverMarker.id) {
            popup.session.removeMarker(hoverMarker.id);
            hoverMarker.id = null;
        }
    };
    popup.setSelectOnHover(false);
    popup.on("mousemove", function(e) {
        if (!lastMouseEvent) {
            lastMouseEvent = e;
            return;
        }
        if (lastMouseEvent.x == e.x && lastMouseEvent.y == e.y) {
            return;
        }
        lastMouseEvent = e;
        lastMouseEvent.scrollTop = popup.renderer.scrollTop;
        var row = lastMouseEvent.getDocumentPosition().row;
        if (hoverMarker.start.row != row) {
            if (!hoverMarker.id)
                popup.setRow(row);
            setHoverMarker(row);
        }
    });
    popup.renderer.on("beforeRender", function() {
        if (lastMouseEvent && hoverMarker.start.row != -1) {
            lastMouseEvent.$pos = null;
            var row = lastMouseEvent.getDocumentPosition().row;
            if (!hoverMarker.id)
                popup.setRow(row);
            setHoverMarker(row, true);
        }
    });
    popup.renderer.on("afterRender", function() {
        var row = popup.getRow();
        var t = popup.renderer.$textLayer;
        var selected = t.element.childNodes[row - t.config.firstRow];
        if (selected == t.selectedNode)
            return;
        if (t.selectedNode)
            dom.removeCssClass(t.selectedNode, "ace_selected");
        t.selectedNode = selected;
        if (selected)
            dom.addCssClass(selected, "ace_selected");
    });
    var hideHoverMarker = function() { setHoverMarker(-1) };
    var setHoverMarker = function(row, suppressRedraw) {
        if (row !== hoverMarker.start.row) {
            hoverMarker.start.row = hoverMarker.end.row = row;
            if (!suppressRedraw)
                popup.session._emit("changeBackMarker");
            popup._emit("changeHoverMarker");
        }
    };
    popup.getHoveredRow = function() {
        return hoverMarker.start.row;
    };

    event.addListener(popup.container, "mouseout", hideHoverMarker);
    popup.on("hide", hideHoverMarker);
    popup.on("changeSelection", hideHoverMarker);

    popup.session.doc.getLength = function() {
        return popup.data.length;
    };
    popup.session.doc.getLine = function(i) {
        var data = popup.data[i];
        if (typeof data == "string")
            return data;
        return (data && data.value) || "";
    };

    var bgTokenizer = popup.session.bgTokenizer;
    bgTokenizer.$tokenizeRow = function(row) {
        var data = popup.data[row];
        var tokens = [];
        if (!data)
            return tokens;
        if (typeof data == "string")
            data = {value: data};
        if (!data.caption)
            data.caption = data.value || data.name;

        var last = -1;
        var flag, c;
        
        if (data.iconClass)//show icon in popup if specified by completor
            tokens.push({
                type: data.iconClass,
                value: " "
            });
        
        for (var i = 0; i < data.caption.length; i++) {
            c = data.caption[i];
            flag = data.matchMask & (1 << i) ? 1 : 0;
            if (last !== flag) {
                tokens.push({type: data.className || "" + ( flag ? "completion-highlight" : ""), value: c});
                last = flag;
            } else {
                tokens[tokens.length - 1].value += c;
            }
        }

        if (data.meta) {
            var maxW = popup.renderer.$size.scrollerWidth / popup.renderer.layerConfig.characterWidth;
            var metaData = data.meta;
            if (metaData.length + data.caption.length > maxW - 2) {
                metaData = metaData.substr(0, maxW - data.caption.length - 3) + "\u2026"
            }
            tokens.push({type: "rightAlignedText", value: metaData});
        }
        return tokens;
    };
    bgTokenizer.$updateOnChange = noop;
    bgTokenizer.start = noop;

    popup.session.$computeWidth = function() {
        return this.screenWidth = 0;
    };

    popup.$blockScrolling = Infinity;
    popup.isOpen = false;
    popup.isTopdown = false;

    popup.data = [];
    popup.setData = function(list) {
        popup.setValue(lang.stringRepeat("\n", list.length), -1);
        popup.data = list || [];
        popup.setRow(0);
    };
    popup.getData = function(row) {
        return popup.data[row];
    };

    popup.getRow = function() {
        return selectionMarker.start.row;
    };
    popup.setRow = function(line) {
        line = Math.max(0, Math.min(this.data.length, line));
        if (selectionMarker.start.row != line) {
            popup.selection.clearSelection();
            selectionMarker.start.row = selectionMarker.end.row = line || 0;
            popup.session._emit("changeBackMarker");
            popup.moveCursorTo(line || 0, 0);
            if (popup.isOpen)
                popup._signal("select");
        }
    };

    popup.on("changeSelection", function() {
        if (popup.isOpen)
            popup.setRow(popup.selection.lead.row);
        popup.renderer.scrollCursorIntoView();
    });

    popup.hide = function() {
        this.container.style.display = "none";
        this._signal("hide");
        popup.isOpen = false;
    };
    popup.show = function(pos, lineHeight, topdownOnly) {
        var el = this.container;
        var screenHeight = window.innerHeight;
        var screenWidth = window.innerWidth;
        var renderer = this.renderer;
        var maxH = renderer.$maxLines * lineHeight * 1.4;
        var top = pos.top + this.$borderSize;
        var allowTopdown = top > screenHeight / 2 && !topdownOnly;
        if (allowTopdown && top + lineHeight + maxH > screenHeight) {
            renderer.$maxPixelHeight = top - 2 * this.$borderSize;
            el.style.top = "";
            el.style.bottom = screenHeight - top + "px";
            popup.isTopdown = false;
        } else {
            top += lineHeight;
            renderer.$maxPixelHeight = screenHeight - top - 0.2 * lineHeight;
            el.style.top = top + "px";
            el.style.bottom = "";
            popup.isTopdown = true;
        }

        el.style.display = "";
        this.renderer.$textLayer.checkForSizeChanges();

        var left = pos.left;
        if (left + el.offsetWidth > screenWidth)
            left = screenWidth - el.offsetWidth;

        el.style.left = left + "px";

        this._signal("show");
        lastMouseEvent = null;
        popup.isOpen = true;
    };

    popup.getTextLeftOffset = function() {
        return this.$borderSize + this.renderer.$padding + this.$imageSize;
    };

    popup.$imageSize = 0;
    popup.$borderSize = 1;

    return popup;
};

dom.importCssString("\
.ace_editor.ace_autocomplete .ace_marker-layer .ace_active-line {\
    background-color: #CAD6FA;\
    z-index: 1;\
}\
.ace_editor.ace_autocomplete .ace_line-hover {\
    border: 1px solid #abbffe;\
    margin-top: -1px;\
    background: rgba(233,233,253,0.4);\
}\
.ace_editor.ace_autocomplete .ace_line-hover {\
    position: absolute;\
    z-index: 2;\
}\
.ace_editor.ace_autocomplete .ace_scroller {\
   background: none;\
   border: none;\
   box-shadow: none;\
}\
.ace_rightAlignedText {\
    color: gray;\
    display: inline-block;\
    position: absolute;\
    right: 4px;\
    text-align: right;\
    z-index: -1;\
}\
.ace_editor.ace_autocomplete .ace_completion-highlight{\
    color: #000;\
    text-shadow: 0 0 0.01em;\
}\
.ace_editor.ace_autocomplete {\
    width: 280px;\
    z-index: 200000;\
    background: #fbfbfb;\
    color: #444;\
    border: 1px lightgray solid;\
    position: fixed;\
    box-shadow: 2px 3px 5px rgba(0,0,0,.2);\
    line-height: 1.4;\
}");

exports.AcePopup = AcePopup;

});

ace.define("ace/autocomplete/util",["require","exports","module"], function(require, exports, module) {
"use strict";

exports.parForEach = function(array, fn, callback) {
    var completed = 0;
    var arLength = array.length;
    if (arLength === 0)
        callback();
    for (var i = 0; i < arLength; i++) {
        fn(array[i], function(result, err) {
            completed++;
            if (completed === arLength)
                callback(result, err);
        });
    }
};

var ID_REGEX = /[a-zA-Z_0-9\$\-\u00A2-\uFFFF]/;

exports.retrievePrecedingIdentifier = function(text, pos, regex) {
    regex = regex || ID_REGEX;
    var buf = [];
    for (var i = pos-1; i >= 0; i--) {
        if (regex.test(text[i]))
            buf.push(text[i]);
        else
            break;
    }
    return buf.reverse().join("");
};

exports.retrieveFollowingIdentifier = function(text, pos, regex) {
    regex = regex || ID_REGEX;
    var buf = [];
    for (var i = pos; i < text.length; i++) {
        if (regex.test(text[i]))
            buf.push(text[i]);
        else
            break;
    }
    return buf;
};

exports.getCompletionPrefix = function (editor) {
    var pos = editor.getCursorPosition();
    var line = editor.session.getLine(pos.row);
    var prefix;
    editor.completers.forEach(function(completer) {
        if (completer.identifierRegexps) {
            completer.identifierRegexps.forEach(function(identifierRegex) {
                if (!prefix && identifierRegex)
                    prefix = this.retrievePrecedingIdentifier(line, pos.column, identifierRegex);
            }.bind(this));
        }
    }.bind(this));
    return prefix || this.retrievePrecedingIdentifier(line, pos.column);
};

});

ace.define("ace/autocomplete",["require","exports","module","ace/keyboard/hash_handler","ace/autocomplete/popup","ace/autocomplete/util","ace/lib/event","ace/lib/lang","ace/lib/dom","ace/snippets"], function(require, exports, module) {
"use strict";

var HashHandler = require("./keyboard/hash_handler").HashHandler;
var AcePopup = require("./autocomplete/popup").AcePopup;
var util = require("./autocomplete/util");
var event = require("./lib/event");
var lang = require("./lib/lang");
var dom = require("./lib/dom");
var snippetManager = require("./snippets").snippetManager;

var Autocomplete = function() {
    this.autoInsert = false;
    this.autoSelect = true;
    this.exactMatch = false;
    this.gatherCompletionsId = 0;
    this.keyboardHandler = new HashHandler();
    this.keyboardHandler.bindKeys(this.commands);

    this.blurListener = this.blurListener.bind(this);
    this.changeListener = this.changeListener.bind(this);
    this.mousedownListener = this.mousedownListener.bind(this);
    this.mousewheelListener = this.mousewheelListener.bind(this);

    this.changeTimer = lang.delayedCall(function() {
        this.updateCompletions(true);
    }.bind(this));

    this.tooltipTimer = lang.delayedCall(this.updateDocTooltip.bind(this), 50);
};

(function() {

    this.$init = function() {
        this.popup = new AcePopup(document.body || document.documentElement);
        this.popup.on("click", function(e) {
            this.insertMatch();
            e.stop();
        }.bind(this));
        this.popup.focus = this.editor.focus.bind(this.editor);
        this.popup.on("show", this.tooltipTimer.bind(null, null));
        this.popup.on("select", this.tooltipTimer.bind(null, null));
        this.popup.on("changeHoverMarker", this.tooltipTimer.bind(null, null));
        return this.popup;
    };

    this.getPopup = function() {
        return this.popup || this.$init();
    };

    this.openPopup = function(editor, prefix, keepPopupPosition) {
        if (!this.popup)
            this.$init();

        this.popup.setData(this.completions.filtered);

        editor.keyBinding.addKeyboardHandler(this.keyboardHandler);
        
        var renderer = editor.renderer;
        this.popup.setRow(this.autoSelect ? 0 : -1);
        if (!keepPopupPosition) {
            this.popup.setTheme(editor.getTheme());
            this.popup.setFontSize(editor.getFontSize());

            var lineHeight = renderer.layerConfig.lineHeight;

            var pos = renderer.$cursorLayer.getPixelPosition(this.base, true);
            pos.left -= this.popup.getTextLeftOffset();

            var rect = editor.container.getBoundingClientRect();
            pos.top += rect.top - renderer.layerConfig.offset;
            pos.left += rect.left - editor.renderer.scrollLeft;
            pos.left += renderer.gutterWidth;

            this.popup.show(pos, lineHeight);
        } else if (keepPopupPosition && !prefix) {
            this.detach();
        }
    };

    this.detach = function() {
        this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
        this.editor.off("changeSelection", this.changeListener);
        this.editor.off("blur", this.blurListener);
        this.editor.off("mousedown", this.mousedownListener);
        this.editor.off("mousewheel", this.mousewheelListener);
        this.changeTimer.cancel();
        this.hideDocTooltip();

        this.gatherCompletionsId += 1;
        if (this.popup && this.popup.isOpen)
            this.popup.hide();

        if (this.base)
            this.base.detach();
        this.activated = false;
        this.completions = this.base = null;
    };

    this.changeListener = function(e) {
        var cursor = this.editor.selection.lead;
        if (cursor.row != this.base.row || cursor.column < this.base.column) {
            this.detach();
        }
        if (this.activated)
            this.changeTimer.schedule();
        else
            this.detach();
    };

    this.blurListener = function(e) {
        if (e.relatedTarget && e.relatedTarget.nodeName == "A" && e.relatedTarget.href) {
            window.open(e.relatedTarget.href, "_blank");
        }
        var el = document.activeElement;
        var text = this.editor.textInput.getElement();
        var fromTooltip = e.relatedTarget && e.relatedTarget == this.tooltipNode;
        var container = this.popup && this.popup.container;
        if (el != text && el.parentNode != container && !fromTooltip
            && el != this.tooltipNode && e.relatedTarget != text
        ) {
            this.detach();
        }
    };

    this.mousedownListener = function(e) {
        this.detach();
    };

    this.mousewheelListener = function(e) {
        this.detach();
    };

    this.goTo = function(where) {
        var row = this.popup.getRow();
        var max = this.popup.session.getLength() - 1;

        switch(where) {
            case "up": row = row <= 0 ? max : row - 1; break;
            case "down": row = row >= max ? -1 : row + 1; break;
            case "start": row = 0; break;
            case "end": row = max; break;
        }

        this.popup.setRow(row);
    };

    this.insertMatch = function(data, options) {
        if (!data)
            data = this.popup.getData(this.popup.getRow());
        if (!data)
            return false;

        if (data.completer && data.completer.insertMatch) {
            data.completer.insertMatch(this.editor, data);
        } else {
            if (this.completions.filterText) {
                var ranges = this.editor.selection.getAllRanges();
                for (var i = 0, range; range = ranges[i]; i++) {
                    range.start.column -= this.completions.filterText.length;
                    this.editor.session.remove(range);
                }
            }
            if (data.snippet)
                snippetManager.insertSnippet(this.editor, data.snippet);
            else
                this.editor.execCommand("insertstring", data.value || data);
        }
        this.detach();
    };


    this.commands = {
        "Up": function(editor) { editor.completer.goTo("up"); },
        "Down": function(editor) { editor.completer.goTo("down"); },
        "Ctrl-Up|Ctrl-Home": function(editor) { editor.completer.goTo("start"); },
        "Ctrl-Down|Ctrl-End": function(editor) { editor.completer.goTo("end"); },

        "Esc": function(editor) { editor.completer.detach(); },
        "Return": function(editor) { return editor.completer.insertMatch(); },
        "Shift-Return": function(editor) { editor.completer.insertMatch(null, {deleteSuffix: true}); },
        "Tab": function(editor) {
            var result = editor.completer.insertMatch();
            if (!result && !editor.tabstopManager)
                editor.completer.goTo("down");
            else
                return result;
        },

        "PageUp": function(editor) { editor.completer.popup.gotoPageUp(); },
        "PageDown": function(editor) { editor.completer.popup.gotoPageDown(); }
    };

    this.gatherCompletions = function(editor, callback) {
        var session = editor.getSession();
        var pos = editor.getCursorPosition();

        var line = session.getLine(pos.row);
        var prefix = util.getCompletionPrefix(editor);

        this.base = session.doc.createAnchor(pos.row, pos.column - prefix.length);
        this.base.$insertRight = true;

        var matches = [];
        var total = editor.completers.length;
        editor.completers.forEach(function(completer, i) {
            completer.getCompletions(editor, session, pos, prefix, function(err, results) {
                if (!err && results)
                    matches = matches.concat(results);
                var pos = editor.getCursorPosition();
                var line = session.getLine(pos.row);
                callback(null, {
                    prefix: prefix,
                    matches: matches,
                    finished: (--total === 0)
                });
            });
        });
        return true;
    };

    this.showPopup = function(editor) {
        if (this.editor)
            this.detach();

        this.activated = true;

        this.editor = editor;
        if (editor.completer != this) {
            if (editor.completer)
                editor.completer.detach();
            editor.completer = this;
        }

        editor.on("changeSelection", this.changeListener);
        editor.on("blur", this.blurListener);
        editor.on("mousedown", this.mousedownListener);
        editor.on("mousewheel", this.mousewheelListener);

        this.updateCompletions();
    };

    this.updateCompletions = function(keepPopupPosition) {
        if (keepPopupPosition && this.base && this.completions) {
            var pos = this.editor.getCursorPosition();
            var prefix = this.editor.session.getTextRange({start: this.base, end: pos});
            if (prefix == this.completions.filterText)
                return;
            this.completions.setFilter(prefix);
            if (!this.completions.filtered.length)
                return this.detach();
            if (this.completions.filtered.length == 1
            && this.completions.filtered[0].value == prefix
            && !this.completions.filtered[0].snippet)
                return this.detach();
            this.openPopup(this.editor, prefix, keepPopupPosition);
            return;
        }
        var _id = this.gatherCompletionsId;
        this.gatherCompletions(this.editor, function(err, results) {
            var detachIfFinished = function() {
                if (!results.finished) return;
                return this.detach();
            }.bind(this);

            var prefix = results.prefix;
            var matches = results && results.matches;

            if (!matches || !matches.length)
                return detachIfFinished();
            if (prefix.indexOf(results.prefix) !== 0 || _id != this.gatherCompletionsId)
                return;

            this.completions = new FilteredList(matches);

            if (this.exactMatch)
                this.completions.exactMatch = true;

            this.completions.setFilter(prefix);
            var filtered = this.completions.filtered;
            if (!filtered.length)
                return detachIfFinished();
            if (filtered.length == 1 && filtered[0].value == prefix && !filtered[0].snippet)
                return detachIfFinished();
            if (this.autoInsert && filtered.length == 1 && results.finished)
                return this.insertMatch(filtered[0]);

            this.openPopup(this.editor, prefix, keepPopupPosition);
        }.bind(this));
    };

    this.cancelContextMenu = function() {
        this.editor.$mouseHandler.cancelContextMenu();
    };

    this.updateDocTooltip = function() {
        var popup = this.popup;
        var all = popup.data;
        var selected = all && (all[popup.getHoveredRow()] || all[popup.getRow()]);
        var doc = null;
        if (!selected || !this.editor || !this.popup.isOpen)
            return this.hideDocTooltip();
        this.editor.completers.some(function(completer) {
            if (completer.getDocTooltip)
                doc = completer.getDocTooltip(selected);
            return doc;
        });
        if (!doc)
            doc = selected;

        if (typeof doc == "string")
            doc = {docText: doc};
        if (!doc || !(doc.docHTML || doc.docText))
            return this.hideDocTooltip();
        this.showDocTooltip(doc);
    };

    this.showDocTooltip = function(item) {
        if (!this.tooltipNode) {
            this.tooltipNode = dom.createElement("div");
            this.tooltipNode.className = "ace_tooltip ace_doc-tooltip";
            this.tooltipNode.style.margin = 0;
            this.tooltipNode.style.pointerEvents = "auto";
            this.tooltipNode.tabIndex = -1;
            this.tooltipNode.onblur = this.blurListener.bind(this);
        }

        var tooltipNode = this.tooltipNode;
        if (item.docHTML) {
            tooltipNode.innerHTML = item.docHTML;
        } else if (item.docText) {
            tooltipNode.textContent = item.docText;
        }

        if (!tooltipNode.parentNode)
            document.body.appendChild(tooltipNode);
        var popup = this.popup;
        var rect = popup.container.getBoundingClientRect();
        tooltipNode.style.top = popup.container.style.top;
        tooltipNode.style.bottom = popup.container.style.bottom;

        if (window.innerWidth - rect.right < 320) {
            tooltipNode.style.right = window.innerWidth - rect.left + "px";
            tooltipNode.style.left = "";
        } else {
            tooltipNode.style.left = (rect.right + 1) + "px";
            tooltipNode.style.right = "";
        }
        tooltipNode.style.display = "block";
    };

    this.hideDocTooltip = function() {
        this.tooltipTimer.cancel();
        if (!this.tooltipNode) return;
        var el = this.tooltipNode;
        if (!this.editor.isFocused() && document.activeElement == el)
            this.editor.focus();
        this.tooltipNode = null;
        if (el.parentNode)
            el.parentNode.removeChild(el);
    };

}).call(Autocomplete.prototype);

Autocomplete.startCommand = {
    name: "startAutocomplete",
    exec: function(editor) {
        if (!editor.completer)
            editor.completer = new Autocomplete();
        editor.completer.autoInsert = false;
        editor.completer.autoSelect = true;
        editor.completer.showPopup(editor);
        editor.completer.cancelContextMenu();
    },
    bindKey: "Ctrl-Space|Ctrl-Shift-Space|Alt-Space"
};

var FilteredList = function(array, filterText) {
    this.all = array;
    this.filtered = array;
    this.filterText = filterText || "";
    this.exactMatch = false;
};
(function(){
    this.setFilter = function(str) {
        if (str.length > this.filterText && str.lastIndexOf(this.filterText, 0) === 0)
            var matches = this.filtered;
        else
            var matches = this.all;

        this.filterText = str;
        matches = this.filterCompletions(matches, this.filterText);
        matches = matches.sort(function(a, b) {
            return b.exactMatch - a.exactMatch || b.score - a.score;
        });
        var prev = null;
        matches = matches.filter(function(item){
            var caption = item.snippet || item.caption || item.value;
            if (caption === prev) return false;
            prev = caption;
            return true;
        });

        this.filtered = matches;
    };
    this.filterCompletions = function(items, needle) {
        var results = [];
        var upper = needle.toUpperCase();
        var lower = needle.toLowerCase();
        loop: for (var i = 0, item; item = items[i]; i++) {
            var caption = item.value || item.caption || item.snippet;
            if (!caption) continue;
            var lastIndex = -1;
            var matchMask = 0;
            var penalty = 0;
            var index, distance;

            if (this.exactMatch) {
                if (needle !== caption.substr(0, needle.length))
                    continue loop;
            }else{
                for (var j = 0; j < needle.length; j++) {
                    var i1 = caption.indexOf(lower[j], lastIndex + 1);
                    var i2 = caption.indexOf(upper[j], lastIndex + 1);
                    index = (i1 >= 0) ? ((i2 < 0 || i1 < i2) ? i1 : i2) : i2;
                    if (index < 0)
                        continue loop;
                    distance = index - lastIndex - 1;
                    if (distance > 0) {
                        if (lastIndex === -1)
                            penalty += 10;
                        penalty += distance;
                    }
                    matchMask = matchMask | (1 << index);
                    lastIndex = index;
                }
            }
            item.matchMask = matchMask;
            item.exactMatch = penalty ? 0 : 1;
            item.score = (item.score || 0) - penalty;
            results.push(item);
        }
        return results;
    };
}).call(FilteredList.prototype);

exports.Autocomplete = Autocomplete;
exports.FilteredList = FilteredList;

});

ace.define("ace/tern/tern_server",["require","exports","module","ace/range","ace/lib/dom"], function (require, exports, module) {
    "use strict";
    var TernServer = function (options) {
        var self = this;
        this.options = options || {};
        var plugins = this.options.plugins || (this.options.plugins = {});
        if (!plugins.hasOwnProperty('doc_comment')) plugins.doc_comment = {};
        if (!plugins.doc_comment.hasOwnProperty('fullDocs')) plugins.doc_comment.fullDocs = true; //default to true if not specified
        if (!this.options.hasOwnProperty('switchToDoc')) this.options.switchToDoc = function (name, start) {
            console.log('tern.switchToDoc called but not defined (need to specify this in options to enable jumpting between documents). name=' + name + '; start=', start);
        };
        if (!this.options.hasOwnProperty('defs')) this.options.defs = [ /*'jquery',*/ 'browser', 'ecma5'];
        if (!this.options.hasOwnProperty('useWorker')) this.options.useWorker = true;
        if (this.options.useWorker) {
            this.server = new WorkerServer(this, this.options.workerClass);
        }
        else {
            if (this.options.defs && this.options.defs.length > 0) {
                var tmp = [];
                for (var i = 0; i < this.options.defs.length; i++) {
                    tmp.push(eval('def_' + this.options.defs[i]));
                }
                this.options.defs = tmp;
            }

            this.server = new tern.Server({
                getFile: function (name, c) {
                    return getFile(self, name, c);
                },
                async: true,
                defs: this.options.defs,
                plugins: this.options.plugins
            });
        }

        this.docs = Object.create(null);
        this.trackChange = function (change, doc) {
            trackChange(self, doc, change);
        };
        this.cachedArgHints = null;
        this.activeArgHints = null;
        this.jumpStack = [];
        this.aceTextCompletor = null;
        this.lastAutoCompleteFireTime = null;
        this.queryTimeout = 3000;
        if (this.options.queryTimeout && !isNaN(parseInt(this.options.queryTimeout))) this.queryTimeout = parseInt(this.options.queryTimeout);
    };
    var Pos = function (line, ch) {
        return {
            "line": line,
            "ch": ch
        };
    };
    var cls = "Ace-Tern-";
    var bigDoc = 250;
    var aceCommands = {
        ternJumpToDef: {
            name: "ternJumpToDef",
            exec: function (editor) {
                editor.ternServer.jumpToDef(editor);
            },
            bindKey: "Alt-."
        },
        ternJumpBack: {
            name: "ternJumpBack",
            exec: function (editor) {
                editor.ternServer.jumpBack(editor);
            },
            bindKey: "Alt-,"
        },
        ternShowType: {
            name: "ternShowType",
            exec: function (editor) {
                editor.ternServer.showType(editor);
            },
            bindKey: "Ctrl-I"
        },
        ternFindRefs: {
            name: "ternFindRefs",
            exec: function (editor) {
                editor.ternServer.findRefs(editor);
            },
            bindKey: "Ctrl-E"
        },
        ternRename: {
            name: "ternRename",
            exec: function (editor) {
                editor.ternServer.rename(editor);
            },
            bindKey: "Ctrl-Shift-E"
        },
        ternRefresh: {
            name: "ternRefresh",
            exec: function (editor) {
                var full = false;
                if (editor.ternServer.refreshDocLastCalled != null) {
                    if (new Date().getTime() - editor.ternServer.refreshDocLastCalled < 1000) { //less than 1 second
                        full = true;
                    }
                }
                editor.ternServer.refreshDocLastCalled = new Date().getTime();
                editor.ternServer.refreshDoc(editor, full);
            },
            bindKey: "Alt-R"
        },
    };
    var debugCompletions = false;

    TernServer.prototype = {
        bindAceKeys: function (editor) {
            for (var p in aceCommands) {
                var obj = aceCommands[p];
                editor.commands.addCommand(obj);
            }
        },
        addDoc: function (name, doc) {
            var data = {
                doc: doc,
                name: name,
                changed: null
            };
            var value = '';
            if (doc.constructor.name === 'String') {
                value = doc;
            }
            else {
                value = docValue(this, data);
                doc.on("change", this.trackChange);
            }
            this.server.addFile(name, value);
            return this.docs[name] = data;
        },
        delDoc: function (name) {
            var found = this.docs[name];
            if (!found) return;
            try { //stop tracking changes
                found.doc.off("change", this.trackChange);
            }
            catch (ex) {}
            delete this.docs[name];
            this.server.delFile(name);
        },
        hideDoc: function (name) {
            closeAllTips();
            var found = this.docs[name];
            if (found && found.changed) sendDoc(this, found);
        },
        refreshDoc: function (editor, full) {
            var showTip = function (msg) {
                var el = document.createElement('span');
                el.setAttribute('style', 'color:green;');
                el.innerHTML = msg;
                tempTooltip(editor, el, 2000);
            };

            if (full) {
                this.docChanged(editor);
                showTip('Tern fully refreshed (reloaded current doc and all refs)');
                return;
            }

            var doc = findDoc(this, editor);
            sendDoc(this, doc);
            showTip('Tern document refreshed <div style="color:gray; font-size:smaller;">(press hotkey twice in  &lt; 1 second to do a full reload including refs)</div>');
        },
        getCompletions: function (editor, session, pos, prefix, callback) {
            getCompletions(this, editor, session, pos, prefix, callback);
        },
        showType: function (editor, pos, calledFromCursorActivity) {
            showType(this, editor, pos, calledFromCursorActivity);
        },
        updateArgHints: function (editor) {
            updateArgHints(this, editor);
        },
        jumpToDef: function (editor) {
            jumpToDef(this, editor);
        },
        jumpBack: function (editor) {
            jumpBack(this, editor);
        },
        rename: function (editor) {
            rename(this, editor);
        },
        findRefs: function (editor) {
            findRefs(this, editor);
        },
        request: function (editor, query, c, pos, forcePushChangedfile) {
            var self = this;
            var doc = findDoc(this, editor);
            var request = buildRequest(this, doc, query, pos, forcePushChangedfile);

            this.server.request(request, function (error, data) {
                if (!error && self.options.responseFilter) data = self.options.responseFilter(doc, query, request, error, data);
                c(error, data);
            });
        },
        enabledAtCurrentLocation: function (editor) {
            return inJavascriptMode(editor);
        },
        getCallPos: function (editor, pos) {
            return getCallPos(editor, pos);
        },
        docChanged: function (editor) {
            var sf = this;
            for (var p in this.docs) {
                this.delDoc(p);
            }

            var finish = function (name) {
                sf.addDoc(name, editor); //add current doc
                loadExplicitVsRefs(sf, editor);
            };

            if (this.options.getCurrentFileName) {
                this.options.getCurrentFileName(finish);
            }
            else {
                finish('current'); //name the file current
            }
        },
        restart: function () {
            if (!this.options.useWorker) return;
            this.server.restart(this);
        },
        debug: function (message) {
            if (!message) {
                console.log('debug commands: files, filecontents');
                return;
            }
            if (!this.options.useWorker) return;
            this.server.sendDebug(message);
        },
        debugCompletions: function (value) {
            if (value) debugCompletions = true;
            else debugCompletions = false;
        },
    };
    exports.TernServer = TernServer;
    function resolveFilePath(ts, name, cb) {
        if (ts.options.resolveFilePath) {
            ts.options.resolveFilePath(name, cb);
        }
        else {
            cb(name); //return original name
        }
    }
    function getFile(ts, name, cb) {
        var buf = ts.docs[name];
        if (buf) cb(docValue(ts, buf));
        else if (ts.options.getFile) ts.options.getFile(name, cb);
        else cb(null);
    }
    function findDoc(ts, doc, name) {
        for (var n in ts.docs) {
            var cur = ts.docs[n];
            if (cur.doc == doc) return cur;
        }
        if (!name)
            for (var i = 0;; ++i) {
                n = "[doc" + (i || "") + "]"; //name not passed for new doc, so auto generate it
                if (!ts.docs[n]) {
                    name = n;
                    break;
                }
            }
        return ts.addDoc(name, doc);
    }
    function toTernLoc(pos) {
        if (typeof (pos.row) !== 'undefined') {
            return {
                line: pos.row,
                ch: pos.column
            };
        }
        return pos;
    }
    function toAceLoc(pos) {
        if (pos.line) {
            return {
                row: pos.line,
                column: pos.ch
            };
        }
        return pos;
    }
    function buildRequest(ts, doc, query, pos, forcePushChangedfile) {
        var files = [],
            offsetLines = 0,
            allowFragments = !query.fullDocs;
        if (!allowFragments) {
            delete query.fullDocs;
        }
        if (typeof query == "string") {
            query = {
                type: query
            };
        }

        query.lineCharPositions = true;
        if (query.end == null) { //this is null for get completions
            var currentSelection = doc.doc.getSelectionRange(); //returns range: start{row,column}, end{row,column}
            query.end = toTernLoc(pos || currentSelection.end);
            if (currentSelection.start != currentSelection.end) {
                query.start = toTernLoc(currentSelection.start);
            }
        }

        var startPos = query.start || query.end;

        if (doc.changed) {
            if (!forcePushChangedfile && doc.doc.session.getLength() > bigDoc && allowFragments !== false && doc.changed.to - doc.changed.from < 100 && doc.changed.from <= startPos.line && doc.changed.to > query.end.line) {
                files.push(getFragmentAround(doc, startPos, query.end));
                query.file = "#0";
                var offsetLines = files[0].offsetLines;
                if (query.start != null) query.start = Pos(query.start.line - -offsetLines, query.start.ch);
                query.end = Pos(query.end.line - offsetLines, query.end.ch);
            }
            else {
                files.push({
                    type: "full",
                    name: doc.name,
                    text: docValue(ts, doc)
                });
                query.file = doc.name;
                doc.changed = null;
            }
        }
        else {
            query.file = doc.name;
        }
        for (var name in ts.docs) {
            var cur = ts.docs[name];
            if (cur.changed && cur != doc) {
                files.push({
                    type: "full",
                    name: cur.name,
                    text: docValue(ts, cur)
                });
                cur.changed = null;
            }
        }

        return {
            query: query,
            files: files,
            timeout: ts.queryTimeout
        };
    }
    function getFragmentAround(data, start, end) {
        var editor = data.doc;
        var minIndent = null,
            minLine = null,
            endLine,
            tabSize = editor.session.$tabSize;
        for (var p = start.line - 1, min = Math.max(0, p - 50); p >= min; --p) {
            var line = editor.session.getLine(p),
                fn = line.search(/\bfunction\b/);
            if (fn < 0) continue;
            var indent = countColumn(line, null, tabSize);
            if (minIndent != null && minIndent <= indent) continue;
            minIndent = indent;
            minLine = p;
        }
        if (minLine == null) minLine = min;
        var max = Math.min(editor.session.getLength() - 1, end.line + 20);
        if (minIndent == null || minIndent == countColumn(editor.session.getLine(start.line), null, tabSize)) endLine = max;
        else
            for (endLine = end.line + 1; endLine < max; ++endLine) {
                var indent = countColumn(editor.session.getLine(endLine), null, tabSize);
                if (indent <= minIndent) break;
            }
        var from = Pos(minLine, 0);

        return {
            type: "part",
            name: data.name,
            offsetLines: from.line,
            text: editor.session.getTextRange({
                start: toAceLoc(from),
                end: toAceLoc(Pos(endLine, 0))
            })
        };
    }
    function countColumn(string, end, tabSize, startIndex, startValue) {
        if (end == null) {
            end = string.search(/[^\s\u00a0]/);
            if (end == -1) end = string.length;
        }
        for (var i = startIndex || 0, n = startValue || 0; i < end; ++i) {
            if (string.charAt(i) == "\t") n += tabSize - (n % tabSize);
            else ++n;
        }
        return n;
    }
    function docValue(ts, doc) {
        var val = doc.doc.getValue();
        if (ts.options.fileFilter) val = ts.options.fileFilter(val, doc.name, doc.doc);
        return val;
    }
    function typeToIcon(type) {
        var suffix;
        if (type == "?") suffix = "unknown";
        else if (type == "number" || type == "string" || type == "bool") suffix = type;
        else if (/^fn\(/.test(type)) suffix = "fn";
        else if (/^\[/.test(type)) suffix = "array";
        else suffix = "object";
        return cls + "completion " + cls + "completion-" + suffix;
    }
    var popupSelectBound = false;
    function getCompletions(ts, editor, session, pos, prefix, callback) {
        var autoCompleteFiredTwiceInThreshold = function () {
            try {
                var t = ts.lastAutoCompleteFireTime;
                if (!t) {
                    return false;
                }
                var msPassed = new Date().getTime() - t;
                if (msPassed < 1000) { //less than 1 second
                    return true;
                }
            }
            catch (ex) {
                showError({
                    msg: 'autoCompleteFiredTwiceInThreshold',
                    err: ex
                });
            }
            return false;
        };
        var forceEnableAceTextCompletor = autoCompleteFiredTwiceInThreshold();
        if (!forceEnableAceTextCompletor) {
            var t = getCurrentToken(editor);
            if (t && t.type && t.type.indexOf('comment') !== -1) forceEnableAceTextCompletor = true;
        }

        var groupName = '';
        if (debugCompletions) {
            groupName = Math.random().toString(36).slice(2);
            console.group(groupName);
            console.time('get completions from tern server');
        }
        ts.request(editor, {
                type: "completions",
                types: true,
                origins: true,
                docs: true,
                filter: false,
                omitObjectPrototype: false,
                sort: false,
                includeKeywords: true,
                guess: true,
                expandWordForward: true
            },

            function (error, data) {
                if (debugCompletions) console.timeEnd('get completions from tern server');
                if (error) {
                    return showError(ts, editor, error);
                }
                var ternCompletions = data.completions.map(function (item) {
                    return {
                        iconClass: " " + (item.guess ? cls + "guess" : typeToIcon(item.type)),
                        doc: item.doc,
                        type: item.type,
                        caption: item.name,
                        value: item.name,
                        score: 99999,
                        meta: item.origin ? item.origin.replace(/^.*[\\\/]/, '') : "tern"
                    };
                });
                if (debugCompletions) console.time('get and merge other completions');

                var otherCompletions = [];
                if (editor.getOption('enableBasicAutocompletion') === true) {
                    try {
                        otherCompletions = editor.session.$mode.getCompletions();
                    }
                    catch (ex) {
                    }
                }

                if ((forceEnableAceTextCompletor || ternCompletions.length === 0) && ts.aceTextCompletor) {
                    if (debugCompletions) console.time('aceTextCompletor');
                    var textCompletions = [];
                    try {
                        ts.aceTextCompletor.getCompletions(editor, session, pos, prefix, function (error, data) {
                            textCompletions = data.map(function (item) {
                                return {
                                    doc: item.doc,
                                    type: item.type,
                                    caption: item.caption,
                                    value: item.value,
                                    meta: 'localText'
                                };
                            });
                            var otherCompletionsContains = function (value, minLength) {
                                value = value.toLowerCase().trim();
                                if (value.length < 2) {
                                    return true;
                                }
                                var isDupe = false;
                                for (var i = 0; i < otherCompletions.length; i++) {
                                    if (otherCompletions[i].value.toString().toLowerCase() == value) {
                                        isDupe = true;
                                        break;
                                    }
                                }
                                return isDupe;
                            };
                            for (var z = 0; z < textCompletions.length; z++) {
                                var item = textCompletions[z];
                                if (otherCompletionsContains(item.value)) {
                                    continue;
                                }
                                otherCompletions.push(item);
                            }
                        });
                    }
                    catch (ex) {
                        showError(ts, editor, {
                            msg: 'ace text completor error',
                            err: ex
                        });
                    }
                    if (debugCompletions) console.timeEnd('aceTextCompletor');
                }
                if (otherCompletions.length > 0) {
                    var mergedCompletions = ternCompletions.slice(); //copy array
                    for (var n = 0; n < otherCompletions.length; n++) {
                        var b = otherCompletions[n];
                        var isDuplicate = false;
                        for (var i = 0; i < ternCompletions.length; i++) {
                            if (ternCompletions[i].value.toString() === b.value.toString()) {
                                isDuplicate = true;
                                break;
                            }
                        }
                        if (!isDuplicate) {
                            mergedCompletions.push(b);
                        }
                    }
                    ternCompletions = mergedCompletions.slice();
                }
                if (debugCompletions) console.timeEnd('get and merge other completions');
                callback(null, ternCompletions);

                if (debugCompletions) console.groupEnd(groupName);

                var tooltip = null;

                if (!bindPopupSelect()) {
                    popupSelectionChanged(); //call once if popupselect bound exited to show tooltip for first item
                }
                function bindPopupSelect() {
                    if (popupSelectBound) {
                        return false;
                    }
                    if (!editor.completer.popup) { //popup not opened yet
                        setTimeout(bindPopupSelect, 100); //try again in 100ms
                        return;
                    }
                    editor.completer.popup.on('select', popupSelectionChanged);
                    editor.completer.popup.on('hide', function () {
                        closeAllTips();
                    });
                    popupSelectionChanged(); //fire once after first bind
                    popupSelectBound = true; //prevent rebinding
                }
                function popupSelectionChanged() {
                    closeAllTips(); //remove(tooltip); //using close all , but its slower, comeback and remove single if its working right
                    var data = editor.completer.popup.getData(editor.completer.popup.getRow());
                    if (!data || !data.doc) { //no comments
                        return;
                    }
                    var node = editor.completer.popup.renderer.getContainerElement();
                    tooltip = makeTooltip(node.getBoundingClientRect().right + window.pageXOffset, node.getBoundingClientRect().top + window.pageYOffset, createInfoDataTip(data, true), editor);
                    tooltip.className += " " + cls + "hint-doc";
                }
                try {
                    ts.lastAutoCompleteFireTime = new Date().getTime();
                }
                catch (ex) {
                    showError(ts, editor, {
                        msg: 'error with last autoCompleteFireTime ',
                        err: ex
                    });
                }
            });
    }
    function showType(ts, editor, pos, calledFromCursorActivity) {
        if (calledFromCursorActivity) { //check if currently in call, if so, then exit
            if (editor.completer && editor.completer.popup && editor.completer.popup.isOpen) return;
            if (!isOnFunctionCall(editor)) return;
        }
        else { //run this check here if not from cursor as this is run in isOnFunctionCall() above if from cursor
            if (!inJavascriptMode(editor)) {
                return;
            }
        }
        var cb = function (error, data, typeData) {
            var tip = '';
            if (error) {
                if (calledFromCursorActivity) {
                    return;
                }
                return showError(ts, editor, error);
            }
            if (ts.options.typeTip) { //dont know when this is ever entered... was in code mirror plugin...
                tip = ts.options.typeTip(data);
            }
            else {
                if (calledFromCursorActivity) {
                    if (data.hasOwnProperty('guess') && data.guess === true) return; //dont show guesses on auto activity as they are not accurate
                    if (data.type == "?" || data.type == "string" || data.type == "number" || data.type == "bool" || data.type == "date" || data.type == "fn(document: ?)" || data.type == "fn()") {
                        return;
                    }
                }

                if (data.hasOwnProperty('type')) { //type query (first try)
                    if (data.type == "?") {
                        tip = tempTooltip(editor, elFromString('<span>?</span>'), 1000);
                        return;
                    }
                    if (data.type.toString().length > 1 && data.type.toString().substr(0, 2) !== 'fn') {
                        var innerCB = function (error, definitionData) {
                            cb(error, definitionData, data);
                        };
                        ts.request(editor, "definition", innerCB, pos, false, null);
                        return;
                    }
                }
                else { //data is a definition request
                    if (typeData && typeData.hasOwnProperty('type')) {
                        data.type = typeData.type;
                        data.name = typeData.name;
                        data.exprName = typeData.exprName;
                    }
                }
            }
            tip = createInfoDataTip(data, true);
            setTimeout(function () {
                var place = getCusorPosForTooltip(editor);
                makeTooltip(place.left, place.top, tip, editor, true); //tempTooltip(editor, tip, -1); - was temp tooltip.. TODO: add temptooltip fn
            }, 10);
        };

        ts.request(editor, "type", cb, pos, !calledFromCursorActivity);
    }
    function createInfoDataTip(data, includeType, activeArg) {
        var tip = elt("span", null);

        var d = data.doc;
        var params = data.params || parseJsDocParams(d); //parse params

        if (includeType) {
            var fnArgs = data.fnArgs ? data.fnArgs : data.type ? parseFnType(data.type) : null; //will be null if parseFnType detects that this is not a function
            if (fnArgs) {
                var getParam = function (arg, getChildren) {
                    if (params === null) return null;
                    if (!arg.name) return null;
                    var children = [];
                    for (var i = 0; i < params.length; i++) {
                        if (getChildren === true) {
                            if (params[i].parentName.toLowerCase().trim() === arg.name.toLowerCase().trim()) {
                                children.push(params[i]);
                            }
                        }
                        else {
                            if (params[i].name.toLowerCase().trim() === arg.name.toLowerCase().trim()) {
                                return params[i];
                            }
                        }
                    }
                    if (getChildren === true) return children;
                    return null;
                };
                var getParamDetailedName = function (param) {
                    var name = param.name;
                    if (param.optional === true) {
                        if (param.defaultValue) {
                            name = "[" + name + "=" + param.defaultValue + "]";
                        }
                        else {
                            name = "[" + name + "]";
                        }
                    }
                    return name;
                };
                var useDetailedArgHints = params.length === 0 || !isNaN(parseInt(activeArg));
                var typeStr = '';
                typeStr += htmlEncode(data.exprName || data.name || "fn");
                typeStr += "(";
                var activeParam = null,
                    activeParamChildren = []; //one ore more child params for multiple object properties

                for (var i = 0; i < fnArgs.args.length; i++) {
                    var paramStr = '';
                    var isCurrent = !isNaN(parseInt(activeArg)) ? i === activeArg : false;
                    var arg = fnArgs.args[i]; //name,type
                    var name = arg.name || "?";
                    if (name.length > 1 && name.substr(name.length - 1) === '?') {
                        name = name.substr(0, name.length - 1);
                        arg.name = name; //update the arg var with proper name for use below
                    }

                    if (!useDetailedArgHints) {
                        paramStr += htmlEncode(name);
                    }
                    else {
                        var param = getParam(arg, false);
                        var children = getParam(arg, true);
                        var type = arg.type;
                        var optional = false;
                        var defaultValue = '';
                        if (param !== null) {
                            name = param.name;
                            if (param.type) {
                                type = param.type;
                            }
                            if (isCurrent) {
                                activeParam = param;
                            }
                            optional = param.optional;
                            defaultValue = param.defaultValue.trim();
                        }
                        if (children && children.length > 0) {
                            if (isCurrent) {
                                activeParamChildren = children;
                            }
                            type = "{";
                            for (var c = 0; c < children.length; c++) {
                                type += children[c].name;
                                if (c + 1 !== children.length && children.length > 1) type += ", ";
                            }
                            type += "}";
                        }
                        paramStr += type ? '<span class="' + cls + 'type">' + htmlEncode(type) + '</span> ' : '';
                        paramStr += '<span class="' + cls + (isCurrent ? "farg-current" : "farg") + '">' + (htmlEncode(name) || "?") + '</span>';
                        if (defaultValue !== '') {
                            paramStr += '<span class="' + cls + 'jsdoc-param-defaultValue">=' + htmlEncode(defaultValue) + '</span>';
                        }
                        if (optional) {
                            paramStr = '<span class="' + cls + 'jsdoc-param-optionalWrapper">' + '<span class="' + cls + 'farg-optionalBracket">[</span>' + paramStr + '<span class="' + cls + 'jsdoc-param-optionalBracket">]</span>' + '</span>';
                        }
                    }
                    if (i > 0) paramStr = ', ' + paramStr;
                    typeStr += paramStr;
                }

                typeStr += ")";
                if (fnArgs.rettype) {
                    if (useDetailedArgHints) {
                        typeStr += ' -> <span class="' + cls + 'type">' + htmlEncode(fnArgs.rettype) + '</span>';
                    }
                    else {
                        typeStr += ' -> ' + htmlEncode(fnArgs.rettype);
                    }
                }
                typeStr = '<span class="' + cls + (useDetailedArgHints ? "typeHeader" : "typeHeader-simple") + '">' + typeStr + '</span>'; //outer wrapper
                if (useDetailedArgHints) {
                    if (activeParam && activeParam.description) {
                        typeStr += '<div class="' + cls + 'farg-current-description"><span class="' + cls + 'farg-current-name">' + activeParam.name + ': </span>' + activeParam.description + '</div>';
                    }
                    if (activeParamChildren && activeParamChildren.length > 0) {
                        for (var i = 0; i < activeParamChildren.length; i++) {
                            var t = activeParamChildren[i].type ? '<span class="' + cls + 'type">{' + activeParamChildren[i].type + '} </span>' : '';
                            typeStr += '<div class="' + cls + 'farg-current-description">' + t + '<span class="' + cls + 'farg-current-name">' + getParamDetailedName(activeParamChildren[i]) + ': </span>' + activeParamChildren[i].description + '</div>';
                        }
                    }
                }
                tip.appendChild(elFromString(typeStr));
            }
        }
        if (isNaN(parseInt(activeArg))) {
            if (data.doc) {
                var replaceParams = function (str, params) {
                    if (params.length === 0) {
                        return str;
                    }
                    str = str.replace(/@param/gi, '@param'); //make sure all param tags are lowercase
                    var beforeParams = str.substr(0, str.indexOf('@param'));
                    while (str.indexOf('@param') !== -1) {
                        str = str.substring(str.indexOf('@param') + 6); //starting after first param match
                    }
                    if (str.indexOf('@') !== -1) {
                        str = str.substr(str.indexOf('@')); //start at next tag that is not a param
                    }
                    else {
                        str = ''; //@param was likely the last tag, trim remaining as its likely the end of a param description
                    }
                    var paramStr = '';
                    for (var i = 0; i < params.length; i++) {
                        paramStr += '<div>';
                        if (params[i].parentName.trim() === '') {
                            paramStr += ' <span class="' + cls + 'jsdoc-tag">@param</span> ';
                        }
                        else {
                            paramStr += '<span class="' + cls + 'jsdoc-tag-param-child">&nbsp;</span> '; //dont show param tag for child param
                        }
                        paramStr += params[i].type.trim() === '' ? '' : '<span class="' + cls + 'type">{' + params[i].type + '}</span> ';

                        if (params[i].name.trim() !== '') {
                            var name = params[i].name.trim();
                            if (params[i].parentName.trim() !== '') {
                                name = params[i].parentName.trim() + '.' + name;
                            }
                            var pName = '<span class="' + cls + 'jsdoc-param-name">' + name + '</span>';
                            if (params[i].defaultValue.trim() !== '') {
                                pName += '<span class="' + cls + 'jsdoc-param-defaultValue">=' + params[i].defaultValue + '</span>';
                            }
                            if (params[i].optional) {
                                pName = '<span class="' + cls + 'jsdoc-param-optionalWrapper">' + '<span class="' + cls + 'farg-optionalBracket">[</span>' + pName + '<span class="' + cls + 'jsdoc-param-optionalBracket">]</span>' + '</span>';
                            }
                            paramStr += pName;
                        }
                        paramStr += params[i].description.trim() === '' ? '' : ' - <span class="' + cls + 'jsdoc-param-description">' + params[i].description + '</span>';
                        paramStr += '</div>';
                    }
                    if (paramStr !== '') {
                        str = '<span class="' + cls + 'jsdoc-param-wrapper">' + paramStr + '</span>' + str;
                    }

                    return beforeParams + str;
                };
                var highlighTags = function (str) {
                    try {
                        str = ' ' + str + ' '; //add white space for regex
                        var re = / ?@\w{1,50}\s ?/gi;
                        var m;
                        while ((m = re.exec(str)) !== null) {
                            if (m.index === re.lastIndex) {
                                re.lastIndex++;
                            }
                            str = str.replace(m[0], ' <span class="' + cls + 'jsdoc-tag">' + m[0].trim() + '</span> ');
                        }
                    }
                    catch (ex) {
                        showError(ts, editor, ex);
                    }
                    return str.trim();
                };
                var highlightTypes = function (str) {
                    str = ' ' + str + ' '; //add white space for regex
                    try {
                        var re = /\s{[^}]{1,50}}\s/g;
                        var m;
                        while ((m = re.exec(str)) !== null) {
                            if (m.index === re.lastIndex) {
                                re.lastIndex++;
                            }
                            str = str.replace(m[0], ' <span class="' + cls + 'type">' + m[0].trim() + '</span> ');
                        }
                    }
                    catch (ex) {
                        showError(ts, editor, ex);
                    }
                    return str.trim();
                };
                var createLinks = function (str) {
                    try {
                        var httpProto = 'HTTP_PROTO_PLACEHOLDER';
                        var httpsProto = 'HTTPS_PROTO_PLACEHOLDER';
                        var re = /\bhttps?:\/\/[^\s<>"`{}|\^\[\]\\]+/gi;
                        var m;
                        while ((m = re.exec(str)) !== null) {
                            if (m.index === re.lastIndex) {
                                re.lastIndex++;
                            }
                            var withoutProtocol = m[0].replace(/https/i, httpsProto).replace(/http/i, httpProto);
                            var text = m[0].replace(new RegExp('https://', 'i'), '').replace(new RegExp('http://', 'i'), '');
                            str = str.replace(m[0], '<a class="' + cls + 'tooltip-link" href="' + withoutProtocol + '" target="_blank">' + text + ' </a>');
                        }
                        str = str.replace(new RegExp(httpsProto, 'gi'), 'https').replace(new RegExp(httpProto, 'gi'), 'http');
                    }
                    catch (ex) {
                        showError(ts, editor, ex);
                    }
                    return str;
                };

                if (d.substr(0, 1) === '*') {
                    d = d.substr(1); //tern leaves this for jsDoc as they start with /**, not exactly sure why...
                }
                d = htmlEncode(d.trim());
                d = replaceParams(d, params);
                d = highlighTags(d);
                d = highlightTypes(d);
                d = createLinks(d);
                tip.appendChild(elFromString(d));
            }
            if (data.url) {
                tip.appendChild(document.createTextNode(" "));
                var link = elt("a", null, "[docs]");
                link.target = "_blank";
                link.href = data.url;
                tip.appendChild(link);
            }
            if (data.origin) {
                tip.appendChild(elt("div", null, elt("em", null, "source: " + data.origin)));
            }
        }
        return tip;
    }
    function parseJsDocParams(str) {
        if (!str) return [];
        str = str.replace(/@param/gi, '@param'); //make sure all param tags are lowercase
        var params = [];
        while (str.indexOf('@param') !== -1) {
            str = str.substring(str.indexOf('@param') + 6); //starting after first param match
            var nextTagStart = str.indexOf('@'); //split on next param (will break if @symbol inside of param, like a link... dont have to time fullproof right now)

            var paramStr = nextTagStart === -1 ? str : str.substr(0, nextTagStart);
            var thisParam = {
                name: "",
                parentName: "",
                type: "",
                description: "",
                optional: false,
                defaultValue: ""
            };
            var re = /\s{[^}]{1,50}}\s/;
            var m;
            while ((m = re.exec(paramStr)) !== null) {
                if (m.index === re.lastIndex) {
                    re.lastIndex++;
                }
                thisParam.type = m[0];
                paramStr = paramStr.replace(thisParam.type, '').trim(); //remove type from param string
                thisParam.type = thisParam.type.replace('{', '').replace('}', '').replace(' ', '').trim(); //remove brackets and spaces
            }
            paramStr = paramStr.trim(); //we now have a single param string starting after the type, next string should be the parameter name
            if (paramStr.substr(0, 1) === '[') {
                thisParam.optional = true;
                var endBracketIdx = paramStr.indexOf(']');
                if (endBracketIdx === -1) {
                    showError('failed to parse parameter name; Found starting \'[\' but missing closing \']\'');
                    continue; //go to next
                }
                var nameStr = paramStr.substring(0, endBracketIdx + 1);
                paramStr = paramStr.replace(nameStr, '').trim(); //remove name portion from param str
                nameStr = nameStr.replace('[', '').replace(']', ''); //remove brackets
                if (nameStr.indexOf('=') !== -1) {
                    var defaultValue = nameStr.substr(nameStr.indexOf('=') + 1);
                    if (defaultValue.trim() === '') {
                        thisParam.defaultValue = "undefined";
                    }
                    else {
                        thisParam.defaultValue = defaultValue.trim();
                    }
                    thisParam.name = nameStr.substring(0, nameStr.indexOf('=')).trim(); //set name
                }
                else {
                    thisParam.name = nameStr.trim();
                }
            }
            else { //not optional
                var nextSpace = paramStr.indexOf(' ');
                if (nextSpace !== -1) {
                    thisParam.name = paramStr.substr(0, nextSpace);
                    paramStr = paramStr.substr(nextSpace).trim(); //remove name portion from param str
                }
                else { //no more spaces left, next portion of string must be name and there is no description
                    thisParam.name = paramStr;
                    paramStr = '';
                }
            }
            var nameDotIdx = thisParam.name.indexOf('.');
            if (nameDotIdx !== -1) {
                thisParam.parentName = thisParam.name.substring(0, nameDotIdx);
                thisParam.name = thisParam.name.substring(nameDotIdx + 1);
            }
            paramStr = paramStr.trim();
            if (paramStr.length > 0) {
                thisParam.description = paramStr.replace('-', '').trim(); //optional hiphen specified before start of description
            }
            thisParam.name = htmlEncode(thisParam.name);
            thisParam.parentName = htmlEncode(thisParam.parentName);
            thisParam.description = htmlEncode(thisParam.description);
            thisParam.type = htmlEncode(thisParam.type);
            thisParam.defaultValue = htmlEncode(thisParam.defaultValue);
            params.push(thisParam);
        }
        return params;
    }
    function findRefs(ts, editor, cb) {
        if (!inJavascriptMode(editor)) {
            return;
        }
        ts.request(editor, {
            type: "refs",
            fullDocs: true
        }, function (error, data) {
            if (error) return showError(ts, editor, error);
            if (typeof cb === "function") {
                cb(data);
                return;
            }
            closeAllTips();

            var header = document.createElement("div");
            var title = document.createElement("span");
            title.textContent = data.name + '(' + data.type + ')';
            title.setAttribute("style", "font-weight:bold;");
            header.appendChild(title);

            var tip = makeTooltip(null, null, header, editor, false, -1);
            if (!data.refs || data.refs.length === 0) {
                tip.appendChild(elt('div', '', 'No References Found'));
                return;
            }
            var totalRefs = document.createElement("div");
            totalRefs.setAttribute("style", "font-style:italic; margin-bottom:3px; cursor:help");
            totalRefs.innerHTML = data.refs.length + " References Found";
            totalRefs.setAttribute('title', 'Use up and down arrow keys to navigate between references. \n\nPress Esc while focused on the list to close the popup (or use the close button in the top right corner).\n\n This is not guaranteed to find references in other files or references for non-private variables.');
            header.appendChild(totalRefs);
            var refInput = document.createElement("select");
            refInput.setAttribute("multiple", "multiple");
            refInput.addEventListener("change", function () {
                var doc = findDoc(ts, editor); //get current doc in editor
                var el = this,
                    selected;
                for (var i = 0; i < el.options.length; i++) {
                    if (selected) {
                        el[i].selected = false;
                        continue;
                    }
                    if (el[i].selected) {
                        selected = el[i];
                        selected.style.color = "grey";
                    }
                }
                var file = selected.getAttribute("data-file");
                var start = {
                    "line": selected.getAttribute("data-line"),
                    "ch": selected.getAttribute("data-ch")
                };
                var updatePosDelay = 300;
                var targetDoc = {
                    name: file
                };
                if (doc.name == file) {
                    targetDoc = doc; //current doc
                    updatePosDelay = 50;
                }
                var animatedScroll = editor.getAnimatedScroll();
                if (animatedScroll) {
                    editor.setAnimatedScroll(false);
                }

                moveTo(ts, doc, targetDoc, start, null, true);
                setTimeout(function () {
                    moveTooltip(tip, null, null, editor);
                    closeAllTips(tip); //close any tips that moving this might open, except for the ref tip
                    if (animatedScroll) {
                        editor.setAnimatedScroll(true); //re-enable
                    }
                }, updatePosDelay);
            });
            var addRefLine = function (file, start) {
                var el = document.createElement("option");
                el.setAttribute("data-file", file);
                el.setAttribute("data-line", start.line);
                el.setAttribute("data-ch", start.ch);
                el.text = (start.line + 1) + ":" + start.ch + " - " + file; //add 1 to line because editor does not use line 0
                refInput.appendChild(el);
            };
            var finalizeRefInput = function () {
                var height = (refInput.options.length * 15);
                height = height > 175 ? 175 : height;
                refInput.style.height = height + "px";
                tip.appendChild(refInput);
                refInput.focus(); //focus on the input (user can press down key to start traversing refs)
                refInput.addEventListener('keydown', function (e) {
                    if (e && e.keyCode && e.keyCode == 27) {
                        remove(tip);
                    }
                });
            };

            for (var i = 0; i < data.refs.length; i++) {
                var tmp = data.refs[i];
                try {
                    addRefLine(tmp.file, tmp.start);
                    if (i === data.refs.length - 1) {
                        finalizeRefInput();
                    }
                }
                catch (ex) {
                    console.log('findRefs inner loop error (should not happen)', ex);
                }
            }
        });
    }
    function rename(ts, editor) {

        findRefs(ts, editor, function (r) {
            if (!r || r.refs.length === 0) {
                showError(ts, editor, "Cannot rename as no references were found for this variable");
                return;
            }
            var executeRename = function (newName) {
                ts.request(editor, {
                    type: "rename",
                    newName: newName,
                    fullDocs: true
                }, function (error, data) {
                    if (error) return showError(ts, editor, error);
                    applyChanges(ts, data.changes, function (result) {
                        var resultTip = makeTooltip(null, null, elt("div", "", "Replaced " + result.replaced + " references sucessfully"), editor, true);
                        var errors = elt("div", "");
                        errors.setAttribute("style", "color:red");
                        if (result.replaced != r.refs.length) {
                            errors.textContent = " WARNING! original refs: " + r.refs.length + ", replaced refs: " + result.replaced;
                        }
                        if (result.errors !== "") {
                            errors.textContent += " \n Errors encountered:" + result.errors;
                        }
                        if (errors.textContent !== "") {
                            resultTip.appendChild(errors);
                        }
                    });
                });
            };
            var tip = makeTooltip(null, null, elt("div", "", r.name + ": " + r.refs.length + " references found \n (WARNING: this wont work for refs in another file!) \n\n Enter new name:\n"), editor, true);
            var newNameInput = elt('input');
            tip.appendChild(newNameInput);
            try {
                setTimeout(function () {
                    newNameInput.focus();
                }, 100);
            }
            catch (ex) {}

            var goBtn = elt('button', '');
            goBtn.textContent = "Rename";
            goBtn.setAttribute("type", "button");
            goBtn.addEventListener('click', function () {
                remove(tip);
                var newName = newNameInput.value;
                if (!newName || newName.trim().length === 0) {
                    showError(ts, editor, "new name cannot be empty");
                    return;
                }

                executeRename(newName);
            });
            tip.appendChild(goBtn);
        });
    }
    var nextChangeOrig = 0;
    function applyChanges(ts, changes, cb) {
        var Range = ace.require("ace/range").Range; //for ace
        var perFile = Object.create(null);
        for (var i = 0; i < changes.length; ++i) {
            var ch = changes[i];
            (perFile[ch.file] || (perFile[ch.file] = [])).push(ch);
        }
        var result = {
            replaced: 0,
            status: "",
            errors: ""
        };

        for (var file in perFile) {
            var known = ts.docs[file],
                chs = perFile[file];
            if (!known) continue;
            chs.sort(function (a, b) {
                return cmpPos(b.start, a.start);
            });
            var origin = "*rename" + (++nextChangeOrig);
            for (var i = 0; i < chs.length; ++i) {
                try {
                    var ch = chs[i];
                    ch.start = toAceLoc(ch.start);
                    ch.end = toAceLoc(ch.end);
                    known.doc.session.replace(new Range(ch.start.row, ch.start.column, ch.end.row, ch.end.column), ch.text);
                    result.replaced++;
                }
                catch (ex) {
                    result.errors += '\n ' + file + ' - ' + ex.toString();
                    console.log('error applying rename changes', ex);
                }
            }
        }
        if (typeof cb === "function") {
            cb(result);
        }
    }
    function isOnFunctionCall(editor) {
        if (!inJavascriptMode(editor)) return false;
        if (somethingIsSelected(editor)) return false;
        if (isInCall(editor)) return false;

        var tok = getCurrentToken(editor);
        if (!tok) return; //No token at current location
        if (!tok.start) return; //sometimes this is missing... not sure why but makes it impossible to do what we want
        if (tok.type.indexOf('entity.name.function') !== -1) return false; //function definition
        if (tok.type.indexOf('storage.type') !== -1) return false; // could be 'function', which is start of an anon fn
        var nextTok = editor.session.getTokenAt(editor.getSelectionRange().end.row, (tok.start + tok.value.length + 1));
        if (!nextTok || nextTok.value !== "(") return false;

        return true;
    }
    function somethingIsSelected(editor) {
        return editor.getSession().getTextRange(editor.getSelectionRange()) !== '';
    }
    function getCusorPosForTooltip(editor) {
        var place = editor.renderer.$cursorLayer.getPixelPosition(); //this gets left correclty, but not top if there is scrolling
        place.top = editor.renderer.$cursorLayer.cursors[0].offsetTop; //this gets top correctly regardless of scrolling, but left is not correct
        place.top += editor.renderer.scroller.getBoundingClientRect().top; //top offset of editor on page
        place.left += editor.renderer.container.offsetLeft;
        return {
            left: place.left + 45,
            top: place.top + 17
        };
    }
    function getCurrentToken(editor) {
        try {
            var pos = editor.getSelectionRange().end;
            return editor.session.getTokenAt(pos.row, pos.column);
        }
        catch (ex) {
            showError(ts, editor, ex);
        }
    }
    function getCallPos(editor, pos) {
        if (somethingIsSelected(editor)) return;
        if (!inJavascriptMode(editor)) return;
        var start = {}; //start of query to tern (start of the call location)
        var currentPosistion = pos || editor.getSelectionRange().start; //{row,column}
        currentPosistion = toAceLoc(currentPosistion); //just in case
        var currentLine = currentPosistion.row;
        var currentCol = currentPosistion.column;
        var firstLineToCheck = Math.max(0, currentLine - 6);
        var ch = '';
        var depth = 0;
        var commas = [];
        for (var row = currentLine; row >= firstLineToCheck; row--) {
            var thisRow = editor.session.getLine(row);
            if (row === currentLine) {
                thisRow = thisRow.substr(0, currentCol);
            }
            for (var col = thisRow.length; col >= 0; col--) {
                ch = thisRow.substr(col, 1);
                if (ch === '}' || ch === ')' || ch === ']') {
                    depth += 1;
                }
                else if (ch === '{' || ch === '(' || ch === '[') {
                    if (depth > 0) {
                        depth -= 1;
                    }
                    else if (ch === '(') {
                        var debugFnCall = false;
                        var upToParen = thisRow.substr(0, col);
                        if (!upToParen.length) {
                            if (debugFnCall) console.log('not fn call because before parent is empty');
                            break;
                        }
                        if (upToParen.substr(upToParen.length - 1) === ' ') {
                            if (debugFnCall) console.log('not fn call because there is a space before paren');
                            break;
                        }
                        var wordBeforeFnName = upToParen.split(' ').reverse()[1];
                        if (wordBeforeFnName && wordBeforeFnName.toLowerCase() === 'function') {
                            if (debugFnCall) console.log('not fn call because this is a function declaration');
                            break;
                        }
                        var token = editor.session.getTokenAt(row, col);
                        if (token) {
                            if (token.type.toString().indexOf('comment') !== -1 || token.type === 'keyword' || token.type === 'storage.type') {
                                if (debugFnCall) console.log('existing because token is comment, keyword, or storage.type (`function`)');
                                break;
                            }
                        }

                        if (debugFnCall) console.info('getting arg hints!');
                        start = {
                            line: row,
                            ch: col
                        };
                        break;
                    }
                    else {
                        break;
                    }
                }
                else if (ch === ',' && depth === 0) {
                    commas.push({
                        line: row,
                        ch: col
                    });
                }
            }

        }

        if (!start.hasOwnProperty('line')) return; //start not found
        var argpos = 0;
        for (var i = 0; i < commas.length; i++) {
            var p = commas[i];
            if ((p.line === start.line && p.ch > start.ch) || (p.line > start.line)) {
                argpos += 1;
            }
        }

        return {
            start: toTernLoc(start),
            "argpos": argpos
        };
    }
    function isInCall(editor, pos) {
        var callPos = getCallPos(editor, pos);
        if (callPos) {
            return true;
        }
        return false;
    }

    var debounce_updateArgHints = null;
    function updateArgHints(ts, editor) {
        clearTimeout(debounce_updateArgHints);
        closeArgHints(ts);
        var callPos = getCallPos(editor);
        if (!callPos) {
            return;
        }
        var start = callPos.start;
        var argpos = callPos.argpos;
        var cache = ts.cachedArgHints;
        if (cache && cache.doc == editor && cmpPos(start, cache.start) === 0) {
            return showArgHints(ts, editor, argpos);
        }
        debounce_updateArgHints = setTimeout(inner, 500);
        function inner() {
            ts.request(editor, {
                type: "type",
                preferFunction: true,
                end: start
            }, function (error, data) {
                if (error) {
                    if (error.toString().toLowerCase().indexOf('no expression at') === -1 && error.toString().toLowerCase().indexOf('no type found at') === -1) {
                        return showError(ts, editor, error);
                    }
                }
                if (error || !data.type || !(/^fn\(/).test(data.type)) {
                    return;
                }
                ts.cachedArgHints = {
                    start: start,
                    type: parseFnType(data.type),
                    name: data.exprName || data.name || "fn",
                    guess: data.guess,
                    doc: editor,
                    comments: data.doc //added by morgan- include comments with arg hints
                };
                showArgHints(ts, editor, argpos);
            });
        }
    }
    function showArgHints(ts, editor, pos) {
        closeArgHints(ts);
        var cache = ts.cachedArgHints,
            tp = cache.type,
            comments = cache.comments; //added by morgan to include document comments
        if (!cache.hasOwnProperty('params')) {
            if (!cache.comments) {
                cache.params = null;
            }
            else {
                var params = parseJsDocParams(cache.comments);
                if (!params || params.length === 0) {
                    cache.params = null;
                }
                else {
                    cache.params = params;
                }
            }
        }

        var place = getCusorPosForTooltip(editor);
        var data = {
            name: cache.name,
            guess: cache.guess,
            fnArgs: cache.type,
            doc: cache.comments,
            params: cache.params,
        };
        var tip = createInfoDataTip(data, true, pos);
        ts.activeArgHints = makeTooltip(place.left, place.top, tip, editor, true);
        return;
    }
    function parseFnType(text) {
        if (text.substring(0, 2) !== 'fn') return null; //not a function
        if (text.indexOf('(') === -1) return null;

        var args = [],
            pos = 3;

        function skipMatching(upto) {
            var depth = 0,
                start = pos;
            for (;;) {
                var next = text.charAt(pos);
                if (upto.test(next) && !depth) return text.slice(start, pos);
                if (/[{\[\(]/.test(next)) ++depth;
                else if (/[}\]\)]/.test(next)) --depth;
                ++pos;
            }
        }
        if (text.charAt(pos) != ")")
            for (;;) {
                var name = text.slice(pos).match(/^([^, \(\[\{]+): /);
                if (name) {
                    pos += name[0].length;
                    name = name[1];
                }
                args.push({
                    name: name,
                    type: skipMatching(/[\),]/)
                });
                if (text.charAt(pos) == ")") break;
                pos += 2;
            }

        var rettype = text.slice(pos).match(/^\) -> (.*)$/);
        return {
            args: args,
            rettype: rettype && rettype[1]
        };
    }
    function htmlEncode(string) {
        var entityMap = {
            "<": "&lt;",
            ">": "&gt;",
        };
        return String(string).replace(/[<>]/g, function (s) {
            if (!s) return '';
            return entityMap[s];
        });
    }
    function cmpPos(a, b) {
        a = toTernLoc(a);
        b = toTernLoc(b);
        return a.line - b.line || a.ch - b.ch;
    }
    function dialog(cm, text, f) {
        alert('need to implment dialog');
    }
    function elFromString(s) {
        var frag = document.createDocumentFragment(),
            temp = document.createElement('span');
        temp.innerHTML = s;
        while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
        }
        return frag;
    }
    function elt(tagname, cls /*, ... elts*/ ) {
        var e = document.createElement(tagname);
        if (cls) e.className = cls;
        for (var i = 2; i < arguments.length; ++i) {
            var elt = arguments[i];
            if (typeof elt == "string") elt = document.createTextNode(elt);
            e.appendChild(elt);
        }
        return e;
    }
    function closeAllTips(except) {
        var tips = document.querySelectorAll('.' + cls + 'tooltip');
        if (tips.length > 0) {
            for (var i = 0; i < tips.length; i++) {
                if (except && tips[i] == except) {
                    continue;
                }
                remove(tips[i]);
            }
        }
    }
    function tempTooltip(editor, content, timeout) {
        if (!timeout) {
            timeout = 3000;
        }
        var location = getCusorPosForTooltip(editor);
        return makeTooltip(location.left, location.top, content, editor, true, timeout);
    }
    function makeTooltip(x, y, content, editor, closeOnCusorActivity, fadeOutDuration) {
        if (x === null || y === null) {
            var location = getCusorPosForTooltip(editor);
            x = location.left;
            y = location.top;
        }
        var node = elt("div", cls + "tooltip", content);
        node.style.left = x + "px";
        node.style.top = y + "px";
        document.body.appendChild(node);
        var closeBtn = document.createElement('a');
        closeBtn.setAttribute('title', 'close');
        closeBtn.setAttribute('class', cls + 'tooltip-boxclose');
        closeBtn.addEventListener('click', function () {
            remove(node);
        });
        node.appendChild(closeBtn);

        if (closeOnCusorActivity === true) {
            if (!editor) {
                throw Error('tern.makeTooltip called with closeOnCursorActivity=true but editor was not passed. Need to pass editor!');
            }
            var closeThisTip = function () {
                if (!node.parentNode) return; //not sure what this is for, its from CM
                remove(node);
                editor.getSession().selection.off('changeCursor', closeThisTip);
                editor.getSession().off('changeScrollTop', closeThisTip);
                editor.getSession().off('changeScrollLeft', closeThisTip);
            };
            editor.getSession().selection.on('changeCursor', closeThisTip);
            editor.getSession().on('changeScrollTop', closeThisTip);
            editor.getSession().on('changeScrollLeft', closeThisTip);
        }

        if (fadeOutDuration) {
            fadeOutDuration = parseInt(fadeOutDuration, 10);
            if (fadeOutDuration > 100) {
                var fadeThistip = function () {
                    if (!node.parentNode) return; //not sure what this is for, its from CM
                    fadeOut(node, fadeOutDuration);
                    try {
                        editor.getSession().selection.off('changeCursor', closeThisTip);
                        editor.getSession().off('changeScrollTop', closeThisTip);
                        editor.getSession().off('changeScrollLeft', closeThisTip);
                    }
                    catch (ex) {}
                };
                setTimeout(fadeThistip, fadeOutDuration);
            }
        }

        return node;
    }
    function moveTooltip(tip, x, y, editor) {
        if (x === null || y === null) {
            var location = getCusorPosForTooltip(editor);
            x = location.left;
            y = location.top;
        }
        tip.style.left = x + "px";
        tip.style.top = y + "px";
    }
    function remove(node) {
        var p = node && node.parentNode;
        if (p) p.removeChild(node);
    }
    function fadeOut(tooltip, timeout) {
        if (!timeout) {
            timeout = 1100;
        }
        if (timeout === -1) {
            remove(tooltip);
            return;
        }
        tooltip.style.opacity = "0";
        setTimeout(function () {
            remove(tooltip);
        }, timeout);
    }
    function showError(ts, editor, msg, noPopup) {
        try {
            var message = '',
                details = '';

            var isError = function (o) {
                return o && o.name && o.stack && o.message;
            };

            if (isError(msg)) { //msg is an Error object
                message = msg.name + ': ' + msg.message;
                details = msg.stack;
            }
            else if (msg.msg && msg.err) { //msg is object that has string msg and Error object
                message = msg.msg;
                if (isError(msg.err)) {
                    message += ': ' + msg.err.message;
                    details = msg.err.stack;
                }
            }
            else { //msg is string message;
                message = msg;
                details = 'details not supplied. current stack:\n' + new Error().stack;
            }

            console.log('ternError:\t ', message, '\n details:', details); //log the message and deatils (if any)

            if (!noPopup) { //show popup
                var el = elt('span', null, message);
                el.style.color = 'red';
                tempTooltip(editor, el);
            }
        }
        catch (ex) {
            setTimeout(function () {
                if (typeof message === undefined) {
                    message = " (no error passed)";
                }
                throw new Error('tern show error failed.' + message + '\n\n fail error: ' + ex.name + '\n' + ex.message + '\n' + ex.stack);
            }, 0);
        }
    }
    function closeArgHints(ts) {
        if (ts.activeArgHints) {
            remove(ts.activeArgHints);
            ts.activeArgHints = null;
        }
    }
    function jumpToDef(ts, editor) {
        function inner(varName) {
            var req = {
                type: "definition",
                variable: varName || null
            };
            var doc = findDoc(ts, editor);
            ts.server.request(buildRequest(ts, doc, req, null, true), function (error, data) {

                if (error) return showError(ts, editor, error);
                if (!data.file && data.url) {
                    window.open(data.url);
                    return;
                }

                if (data.file) {
                    var localDoc = ts.docs[data.file];
                    var found;
                    if (localDoc && (found = findContext(localDoc.doc, data))) {
                        ts.jumpStack.push({
                            file: doc.name,
                            start: toTernLoc(editor.getSelectionRange().start), //editor.getCursor("from"), (not sure if correct)
                            end: toTernLoc(editor.getSelectionRange().end) //editor.getCursor("to")
                        });
                        moveTo(ts, doc, localDoc, found.start, found.end);
                        return;
                    }
                    else { //not local doc- added by morgan... this still needs work as its a hack for the fact that ts.docs does not contain the file we want, instead it only contains a single file at a time. need to fix this (likely needs a big overhaul)
                        moveTo(ts, doc, {
                            name: data.file
                        }, data.start, data.end);
                        return;
                    }
                }

                showError(ts, editor, "Could not find a definition.");
            });
        }
        inner();
    }
    function moveTo(ts, curDoc, doc, start, end, doNotCloseTips) {
        end = end || start;
        if (curDoc != doc) {
            if (ts.options.switchToDoc) {
                if (!doNotCloseTips) {
                    closeAllTips();
                }
                ts.options.switchToDoc(doc.name, toAceLoc(start), toAceLoc(end));
            }
            else {
                showError(ts, curDoc.doc, 'Need to add editor.ternServer.options.switchToDoc to jump to another document');
            }
            return;
        }
        var pos = toAceLoc(start);
        curDoc.doc.gotoLine(pos.row, pos.column || 0); //this will make sure that the line is expanded
        curDoc.doc.getSession().unfold(pos); //gotoLine is supposed to unfold but its not working properly.. this ensures it gets unfolded

        var sel = curDoc.doc.getSession().getSelection();
        sel.setSelectionRange({
            start: toAceLoc(start),
            end: toAceLoc(end)
        });
    }
    function jumpBack(ts, editor) {
        var pos = ts.jumpStack.pop(),
            doc = pos && ts.docs[pos.file];
        if (!doc) return;
        moveTo(ts, findDoc(ts, editor), doc, pos.start, pos.end);
    }
    function findContext(editor, data) {
        try {
            var before = data.context.slice(0, data.contextOffset).split("\n");
            var startLine = data.start.line - (before.length - 1);
            var ch = null;
            if (before.length == 1) {
                ch = data.start.ch;
            }
            else {
                ch = editor.session.getLine(startLine).length - before[0].length;
            }
            var start = Pos(startLine, ch);

            var text = editor.session.getLine(startLine).slice(start.ch);
            for (var cur = startLine + 1; cur < editor.session.getLength() && text.length < data.context.length; ++cur) {
                text += "\n" + editor.session.getLine(cur);
            }
        }
        catch (ex) {
            console.log('ext-tern.js findContext Error; (error is caused by a doc (string) being passed to this function instead of editor due to ghetto hack from adding VS refs... need to fix eventually. should only occur when jumping to def in separate file)', ex); //,'\neditor:',editor,'\ndata:',data);
        }
        return data;
        console.log(new Error('This part is not complete, need to implement using Ace\'s search functionality'));
        var cursor = editor.getSearchCursor(data.context, 0, false);
        var nearest, nearestDist = Infinity;
        while (cursor.findNext()) {
            var from = cursor.from(),
                dist = Math.abs(from.line - start.line) * 10000;
            if (!dist) dist = Math.abs(from.ch - start.ch);
            if (dist < nearestDist) {
                nearest = from;
                nearestDist = dist;
            }
        }
        if (!nearest) return null;

        if (before.length == 1) nearest.ch += before[0].length;
        else nearest = Pos(nearest.line + (before.length - 1), before[before.length - 1].length);
        if (data.start.line == data.end.line) var end = Pos(nearest.line, nearest.ch + (data.end.ch - data.start.ch));
        else var end = Pos(nearest.line + (data.end.line - data.start.line), data.end.ch);
        return {
            start: nearest,
            end: end
        };
    }
    function atInterestingExpression(editor) {
        var pos = editor.getSelectionRange().end; //editor.getCursor("end"),
        var tok = editor.session.getTokenAt(pos.row, pos.column); // editor.getTokenAt(pos);
        pos = toTernLoc(pos);
        if (tok.start < pos.ch && (tok.type == "comment" || tok.type == "string")) {
            return false;
        }
        return /\w/.test(editor.session.getLine(pos.line).slice(Math.max(pos.ch - 1, 0), pos.ch + 1));
    }
    function sendDoc(ts, doc) {
        ts.server.request({
            files: [{
                type: "full",
                name: doc.name,
                text: docValue(ts, doc)
            }]
        }, function (error) {
            if (error) console.error(error);
            else doc.changed = null;
        });
    }
    function inJavascriptMode(editor) {
        return getCurrentMode(editor) == 'javascript';
    }
    function getCurrentMode(editor) {
        var scope = editor.session.$mode.$id || "";
        scope = scope.split("/").pop();
        if (scope === "html" || scope === "php") {
            if (scope === "php") scope = "html";
            var c = editor.getCursorPosition();
            var state = editor.session.getState(c.row);
            if (typeof state === "object") {
                state = state[0];
            }
            if (state.substring) {
                if (state.substring(0, 3) == "js-") scope = "javascript";
                else if (state.substring(0, 4) == "css-") scope = "css";
                else if (state.substring(0, 4) == "php-") scope = "php";
            }
        }
        return scope;
    }
    function startsWith(str, token) {
        return str.slice(0, token.length).toUpperCase() == token.toUpperCase();
    }
    function trackChange(ts, doc, change) {
        var _change = {};
        _change.from = toTernLoc(change.start);
        _change.to = toTernLoc(change.end);
        _change.text = change.lines;

        var data = findDoc(ts, doc);
        var argHints = ts.cachedArgHints;

        if (argHints && argHints.doc == doc && cmpPos(argHints.start, _change.to) <= 0) {
            ts.cachedArgHints = null;
        }

        var changed = data.changed; //data is the tern server doc, which keeps a changed property, which is null here
        if (changed === null) {
            data.changed = changed = {
                from: _change.from.line,
                to: _change.from.line
            };
        }

        var end = _change.from.line + (_change.text.length - 1);
        if (_change.from.line < changed.to) {
            changed.to = changed.to - (_change.to.line - end);
        }
        if (end >= changed.to) {
            changed.to = end + 1;
        }
        if (changed.from > _change.from.line) {
            changed.from = changed.from.line;
        }
        if (doc.session.getLength() > bigDoc && _change.to - changed.from > 100) {
            setTimeout(function () {
                if (data.changed && data.changed.to - data.changed.from > 100) {
                    sendDoc(ts, data);
                }
            }, 200);
        }
    }
    function loadExplicitVsRefs(ts, editor) {
        if (!editor.ternServer || !editor.ternServer.enabledAtCurrentLocation(editor)) {
            return;
        }
        var isBrowser = window && window.location && window.location.toString().toLowerCase().indexOf('http') === 0;

        var StringtoCheck = "";
        for (var i = 0; i < editor.session.getLength(); i++) {
            var thisLine = editor.session.getLine(i);
            if (thisLine.substr(0, 3) === "///") {
                StringtoCheck += "\n" + thisLine;
            }
            else {
                break; //only top lines may be references
            }
        }
        if (StringtoCheck === '') {
            return;
        }

        var re = /(?!\/\/\/\s*?<reference path=")[^"]*/g;
        var m;
        var refs = [];
        while ((m = re.exec(StringtoCheck)) != null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }
            var r = m[0].replace('"', '');
            if (r.toLowerCase().indexOf('reference path') === -1 && r.trim() !== '' && r.toLowerCase().indexOf('/>') === -1) {
                if (r.toLowerCase().indexOf('vsdoc') === -1) { //dont load vs doc files as they are visual studio xml junk
                    refs.push(r);
                }
            }
        }
        var resultMsgEl = document.createElement('span'),
            addFileDoneCount = 0,
            addFileDoneCountCompleted = 0;
        var addFileDone = function (msg, isErr) {
            addFileDoneCountCompleted++;
        
            var el = document.createElement('div');
            el.setAttribute('style', 'font-size:smaller; font-style:italic; color:' + (isErr ? 'red' : 'gray'));
            el.textContent = msg;
        
            resultMsgEl.appendChild(el);
        
            if (addFileDoneCount == addFileDoneCountCompleted) {
                tempTooltip(editor, resultMsgEl);
            }
        };
        var ReadFile_AddToTern = function (path) {
            try {
                var isFullUrl = path.toLowerCase().indexOf("http") === 0;
                if (isFullUrl || isBrowser) {
                    addFileDoneCount++;
                    var xhr = new XMLHttpRequest();
                    xhr.open("get", path, true);
                    xhr.send();
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4) {
                            if (xhr.status == 200) {
                                console.log('adding web reference: ' + path);
                                addFileDone('adding web reference: ' + path);
                                editor.ternServer.addDoc(path, xhr.responseText);
                            }
                            else {
                                if (xhr.status == 404) { //not found
                                    console.log('error adding web reference (not found): ' + path, xhr);
                                    addFileDone('error adding web reference (not found): ' + path, true);
                                }
                                else {
                                    console.log('error adding web reference (unknown error, see xhr): ' + path, xhr);
                                    addFileDone('error adding web reference (unknown error, see console): ' + path, true);
                                }
                            }
                        }
                    };
                }
                else { //local
                    addFileDoneCount++;
                    resolveFilePath(ts, path, function (resolvedPath) {
                        getFile(ts, resolvedPath, function (err, data) {
                            if (err || !data) {
                                console.log('error getting file: ' + resolvedPath, err);
                                addFileDone('error getting file: ' + resolvedPath + '(see console for details)', true);
                            }
                            else {
                                ts.addDoc(resolvedPath, data.toString());
                                console.log('adding reference: ' + resolvedPath);
                                addFileDone('adding reference: ' + resolvedPath);
                            }
                        });
                    });
                }
            }
            catch (ex) {
                console.log('add to tern error; path=' + path);
                throw ex;
            }
        };

        for (var i = 0; i < refs.length; i++) {
            var thisPath = refs[i];
            ReadFile_AddToTern(thisPath);
        }
    }
    function WorkerServer(ts, workerClass) {
        var worker = workerClass ? new workerClass() : new Worker(ts.options.workerScript);
        var startServer = function (ts) {
            worker.postMessage({
                type: "init",
                defs: ts.options.defs,
                plugins: ts.options.plugins,
                scripts: ts.options.workerDeps
            });
        };

        startServer(ts); //start

        var msgId = 0,
            pending = {};

        function send(data, c) {
            if (c) {
                data.id = ++msgId;
                pending[msgId] = c;
            }
            worker.postMessage(data);
        }
        worker.onmessage = function (e) {
            var data = e.data;
            if (data.type == "getFile") {
                getFile(ts, data.name, function (err, text) {
                    send({
                        type: "getFile",
                        err: String(err),
                        text: text,
                        id: data.id
                    });
                });
            }
            else if (data.type == "debug") {
                console.log('(worker debug) ', data.message);
            }
            else if (data.id && pending[data.id]) {
                pending[data.id](data.err, data.body);
                delete pending[data.id];
            }
        };
        worker.onerror = function (e) {
            for (var id in pending) pending[id](e);
            pending = {};
        };

        this.addFile = function (name, text) {
            send({
                type: "add",
                name: name,
                text: text
            });
        };
        this.delFile = function (name) {
            send({
                type: "del",
                name: name
            });
        };
        this.request = function (body, c) {
            send({
                type: "req",
                body: body
            }, c);
        };
        this.setDefs = function (arr_defs) {
            send({
                type: "setDefs",
                defs: arr_defs
            });
        };
        this.restart = function (ts) {
            startServer(ts);
        };
        this.sendDebug = function (message) {
            send({
                type: "debug",
                body: message
            });
        };
    }
    var dom = require("ace/lib/dom");
    dom.importCssString(".Ace-Tern-tooltip { border: 1px solid silver; border-radius: 3px; color: #444; padding: 2px 5px; padding-right:15px; font-size: 90%; font-family: monospace; background-color: white; white-space: pre-wrap; max-width: 50em; max-height:30em; overflow-y:auto; position: absolute; z-index: 10; -webkit-box-shadow: 2px 3px 5px rgba(0, 0, 0, .2); -moz-box-shadow: 2px 3px 5px rgba(0, 0, 0, .2); box-shadow: 2px 3px 5px rgba(0, 0, 0, .2); transition: opacity 1s; -moz-transition: opacity 1s; -webkit-transition: opacity 1s; -o-transition: opacity 1s; -ms-transition: opacity 1s; } .Ace-Tern-tooltip-boxclose { position:absolute; top:0; right:3px; color:red; } .Ace-Tern-tooltip-boxclose:hover { background-color:yellow; } .Ace-Tern-tooltip-boxclose:before { content:'×'; cursor:pointer; font-weight:bold; font-size:larger; } .Ace-Tern-completion { padding-left: 12px; position: relative; } .Ace-Tern-completion:before { position: absolute; left: 0; bottom: 0; border-radius: 50%; font-weight: bold; height: 13px; width: 13px; font-size:11px; line-height: 14px; text-align: center; color: white; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; } .Ace-Tern-completion-unknown:before { content:'?'; background: #4bb; } .Ace-Tern-completion-object:before { content:'O'; background: #77c; } .Ace-Tern-completion-fn:before { content:'F'; background: #7c7; } .Ace-Tern-completion-array:before { content:'A'; background: #c66; } .Ace-Tern-completion-number:before { content:'1'; background: #999; } .Ace-Tern-completion-string:before { content:'S'; background: #999; } .Ace-Tern-completion-bool:before { content:'B'; background: #999; } .Ace-Tern-completion-guess { color: #999; } .Ace-Tern-hint-doc { max-width: 35em; } .Ace-Tern-fhint-guess { opacity: .7; } .Ace-Tern-fname { color: black; } .Ace-Tern-farg { color: #70a; } .Ace-Tern-farg-current { color: #70a; font-weight:bold; font-size:larger; text-decoration:underline; } .Ace-Tern-farg-current-description { font-style:italic; margin-top:2px; color:black; } .Ace-Tern-farg-current-name { font-weight:bold; } .Ace-Tern-type { color: #07c; font-size:smaller; } .Ace-Tern-jsdoc-tag { color: #B93A38; text-transform: lowercase; font-size:smaller; font-weight:600; } .Ace-Tern-jsdoc-param-wrapper{ /*background-color: #FFFFE3; padding:3px;*/ } .Ace-Tern-jsdoc-tag-param-child{ display:inline-block; width:0px; } .Ace-Tern-jsdoc-param-optionalWrapper { font-style:italic; } .Ace-Tern-jsdoc-param-optionalBracket { color:grey; font-weight:bold; } .Ace-Tern-jsdoc-param-name { color: #70a; font-weight:bold; } .Ace-Tern-jsdoc-param-defaultValue { color:grey; } .Ace-Tern-jsdoc-param-description { color:black; } .Ace-Tern-typeHeader-simple{ font-size:smaller; font-weight:bold; display:block; font-style:italic; margin-bottom:3px; color:grey; } .Ace-Tern-typeHeader{ display:block; font-style:italic; margin-bottom:3px; } .Ace-Tern-tooltip-link{font-size:smaller; color:blue;} .ace_autocomplete {width: 400px !important;}", "ace_tern");

});

ace.define("ace/tern/tern",["require","exports","module","ace/config","ace/lib/lang","ace/snippets","ace/autocomplete/text_completer","ace/autocomplete","ace/tern/tern_server","ace/editor"], function(require, exports, module) {
    "use strict";
    var config = require("../config");
    var lang = require("../lib/lang");
    var snippetManager = require("../snippets").snippetManager;
    var snippetCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
            var snippetMap = snippetManager.snippetMap;
            var completions = [];
            snippetManager.getActiveScopes(editor).forEach(function(scope) {
                var snippets = snippetMap[scope] || [];
                for (var i = snippets.length; i--;) {
                    var s = snippets[i];
                    var caption = s.name || s.tabTrigger;
                    if (!caption)
                        continue;
                    completions.push({
                        caption: caption,
                        snippet: s.content,
                        meta: s.tabTrigger && !s.name ? s.tabTrigger + "\u21E5 " : "snippet",
                        type: "snippet"
                    });
                }
            }, this);
            callback(null, completions);
        },
        getDocTooltip: function(item) {
            if (item.type == "snippet" && !item.docHTML) {
                item.docHTML = [
                    "<b>", lang.escapeHTML(item.caption), "</b>", "<hr></hr>",
                    lang.escapeHTML(item.snippet)
                ].join("");
            }
        }
    };
    var textCompleter = require("../autocomplete/text_completer");
    var keyWordCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
            if (session.$mode.completer) {
                return session.$mode.completer.getCompletions(editor, session, pos, prefix, callback);
            }
            var state = editor.session.getState(pos.row);
            var completions = session.$mode.getCompletions(state, session, pos, prefix);
            callback(null, completions);
        }
    };
    var completers = [snippetCompleter, textCompleter, keyWordCompleter];
    exports.setCompleters = function(val) {
        completers = val || [];
    };

    exports.addCompleter = function(completer) {
        completers.push(completer);
    };

    var expandSnippet = {
        name: "expandSnippet",
        exec: function(editor) {
            var success = snippetManager.expandWithTab(editor);
            if (!success) editor.execCommand("indent"); //note: not sure if this line was added by morgan and if its still relevant..
        },
        bindKey: "tab"
    };

    var loadSnippetsForMode = function(mode) {
        var id = mode.$id;
        if (!snippetManager.files)
            snippetManager.files = {};
        loadSnippetFile(id);
        if (mode.$modes) {
            for (var m in mode.$modes) {
                loadSnippetsForMode(mode.$modes[m]);
            }
        }
    };

    var loadSnippetFile = function(id) {
        if (!id || snippetManager.files[id])
            return;
        var snippetFilePath = id.replace("mode", "snippets");
        snippetManager.files[id] = {};
        config.loadModule(snippetFilePath, function(m) {
            if (m) {
                snippetManager.files[id] = m;
                if (!m.snippets && m.snippetText)
                    m.snippets = snippetManager.parseSnippetFile(m.snippetText);
                snippetManager.register(m.snippets || [], m.scope);
                if (m.includeScopes) {
                    snippetManager.snippetMap[m.scope].includeScopes = m.includeScopes;
                    m.includeScopes.forEach(function(x) {
                        loadSnippetFile("ace/mode/" + x);
                    });
                }
            }
        });
    };

    function getCompletionPrefix(editor) {
        var pos = editor.getCursorPosition();
        var line = editor.session.getLine(pos.row);
        var prefix;
        editor.completers.forEach(function(completer) {
            if (completer.identifierRegexps) {
                completer.identifierRegexps.forEach(function(identifierRegex) {
                    if (!prefix && identifierRegex)
                        prefix = util.retrievePrecedingIdentifier(line, pos.column, identifierRegex);
                });
            }
        });
        return prefix || util.retrievePrecedingIdentifier(line, pos.column);
    }

    var doLiveAutocomplete = function(e) {
        var editor = e.editor;
        var text = e.args || "";
        var hasCompleter = editor.completer && editor.completer.activated;
        if (e.command.name === "backspace") {
            if (hasCompleter && !getCompletionPrefix(editor))
                editor.completer.detach();
        }
        else if (e.command.name === "insertstring") {
            var prefix = getCompletionPrefix(editor);
            if (prefix && !hasCompleter) {
                if (!editor.completer) {
                    editor.completer = new Autocomplete();
                }
                editor.completer.autoInsert = false;
                editor.completer.showPopup(editor);
            }
        }
    };
    var Autocomplete = require("../autocomplete").Autocomplete;
    Autocomplete.startCommand = {
        name: "startAutocomplete",
        exec: function(editor, e) {
            if (!editor.completer) {
                editor.completer = new Autocomplete();
            }
            editor.completers = [];
            if (editor.$enableSnippets) { //snippets are allowed with or without tern
                editor.completers.push(snippetCompleter);
            }

            if (editor.ternServer && editor.$enableTern) {
                if (editor.ternServer.enabledAtCurrentLocation(editor)) {
                    editor.completers.push(editor.ternServer);
                    editor.ternServer.aceTextCompletor = textCompleter; //9.30.2014- give tern the text completor
                }
                else {
                    if (editor.$enableBasicAutocompletion) {
                        editor.completers.push(textCompleter, keyWordCompleter);
                    }
                }
            }
            else { //tern not enabled
                if (editor.$enableBasicAutocompletion) {
                    editor.completers.push(textCompleter, keyWordCompleter);
                }
            }
            editor.completer.showPopup(editor);
            editor.completer.cancelContextMenu();
        },
        bindKey: "Ctrl-Space|Ctrl-Shift-Space|Alt-Space"
    };
    var onChangeMode = function(e, editor) {
        loadSnippetsForMode(editor.session.$mode);
    };
    var ternOptions = {};

    var TernServer = require("./tern_server").TernServer;
    var aceTs;
    var createTernServer = function(cb) {
        var src = ternOptions.workerScript || config.moduleUrl('worker/tern');
        if (ternOptions.useWorker === false) {
            var id = 'ace_tern_files';
            if (document.getElementById(id)) inner();
            else {
                var el = document.createElement('script');
                el.setAttribute('id', id);
                document.head.appendChild(el);
                el.onload = inner;
                el.setAttribute('src', src);
            }
        }
        else inner();

        function inner() {
            if (!ternOptions.workerScript) ternOptions.workerScript = src;
            aceTs = new TernServer(ternOptions);
            cb();
        }
    };
    var editor_for_OnCusorChange = null;
    var debounceArgHints;
    var onCursorChange_Tern = function(e, editor_getSession_selection) {
        clearTimeout(debounceArgHints);
        debounceArgHints = setTimeout(function() {
            editor_for_OnCusorChange.ternServer.updateArgHints(editor_for_OnCusorChange);
        }, 10);
    };
    var onAfterExec_Tern = function(e, commandManager) {
        if (e.command.name === "insertstring" && e.args === ".") {
            if (e.editor.ternServer && e.editor.ternServer.enabledAtCurrentLocation(e.editor)) {
                var pos = e.editor.getSelectionRange().end;
                var tok = e.editor.session.getTokenAt(pos.row, pos.column);
                if (tok) {
                    if (tok.type !== 'string' && tok.type.toString().indexOf('comment') === -1) {
                        try {
                            e.editor.ternServer.lastAutoCompleteFireTime = null; //reset since this was not triggered by user firing command but triggered automatically
                        }
                        catch (ex) {}
                        e.editor.execCommand("startAutocomplete");
                    }
                }
            }
        }
    };

    completers.push(aceTs);
    exports.server = aceTs;

    var Editor = require("../editor").Editor;
    config.defineOptions(Editor.prototype, "editor", {
        enableTern: {
            set: function(val) {
                var self = this;
                if (typeof val === 'object') {
                    ternOptions = val;
                    val = true;
                }
                if (val) {
                    editor_for_OnCusorChange = self; //hack
                    createTernServer(function() {
                        self.completers = completers;
                        self.ternServer = aceTs;
                        self.commands.addCommand(Autocomplete.startCommand);
                        self.getSession().selection.on('changeCursor', onCursorChange_Tern);
                        self.commands.on('afterExec', onAfterExec_Tern);
                        aceTs.bindAceKeys(self);
                        if (ternOptions.startedCb) ternOptions.startedCb();
                    });
                }
                else {
                    delete self.ternServer;
                    self.getSession().selection.off('changeCursor', onCursorChange_Tern);
                    self.commands.off('afterExec', onAfterExec_Tern);
                    if (!self.enableBasicAutocompletion) {
                        self.commands.removeCommand(Autocomplete.startCommand);
                    }
                }
            },
            value: false
        },
        enableBasicAutocompletion: {
            set: function(val) {
                if (val) {
                    this.completers = completers;
                    this.commands.addCommand(Autocomplete.startCommand);
                }
                else {
                    if (!this.$enableTern) {
                        this.commands.removeCommand(Autocomplete.startCommand);
                    }
                }
            },
            value: false
        },
        enableSnippets: {
            set: function(val) {
                if (val) {
                    this.commands.addCommand(expandSnippet);
                    this.on("changeMode", onChangeMode);
                    onChangeMode(null, this);
                }
                else {
                    this.commands.removeCommand(expandSnippet);
                    this.off("changeMode", onChangeMode);
                }
            },
            value: false
        }
    });
});
                (function() {
                    ace.require(["ace/tern/tern"], function() {});
                })();
            