ace.define("ace/ext/menu_tools/element_generator",["require","exports","module"], function(require, exports, module) {
'use strict';
module.exports.createOption = function createOption (obj) {
    var attribute;
    var el = document.createElement('option');
    for(attribute in obj) {
        if(obj.hasOwnProperty(attribute)) {
            if(attribute === 'selected') {
                el.setAttribute(attribute, obj[attribute]);
            } else {
                el[attribute] = obj[attribute];
            }
        }
    }
    return el;
};
module.exports.createCheckbox = function createCheckbox (id, checked, clss) {
    var el = document.createElement('input');
    el.setAttribute('type', 'checkbox');
    el.setAttribute('id', id);
    el.setAttribute('name', id);
    el.setAttribute('value', checked);
    el.setAttribute('class', clss);
    if(checked) {
        el.setAttribute('checked', 'checked');
    }
    return el;
};
module.exports.createInput = function createInput (id, value, clss) {
    var el = document.createElement('input');
    el.setAttribute('type', 'text');
    el.setAttribute('id', id);
    el.setAttribute('name', id);
    el.setAttribute('value', value);
    el.setAttribute('class', clss);
    return el;
};
module.exports.createLabel = function createLabel (text, labelFor) {
    var el = document.createElement('label');
    el.setAttribute('for', labelFor);
    el.textContent = text;
    return el;
};
module.exports.createSelection = function createSelection (id, values, clss) {
    var el = document.createElement('select');
    el.setAttribute('id', id);
    el.setAttribute('name', id);
    el.setAttribute('class', clss);
    values.forEach(function(item) {
        el.appendChild(module.exports.createOption(item));
    });
    return el;
};

});

ace.define("ace/ext/modelist",["require","exports","module"], function(require, exports, module) {
"use strict";

var modes = [];
function getModeForPath(path) {
    var mode = modesByName.text;
    var fileName = path.split(/[\/\\]/).pop();
    for (var i = 0; i < modes.length; i++) {
        if (modes[i].supportsFile(fileName)) {
            mode = modes[i];
            break;
        }
    }
    return mode;
}

var Mode = function(name, caption, extensions) {
    this.name = name;
    this.caption = caption;
    this.mode = "ace/mode/" + name;
    this.extensions = extensions;
    var re;
    if (/\^/.test(extensions)) {
        re = extensions.replace(/\|(\^)?/g, function(a, b){
            return "$|" + (b ? "^" : "^.*\\.");
        }) + "$";
    } else {
        re = "^.*\\.(" + extensions + ")$";
    }

    this.extRe = new RegExp(re, "gi");
};

Mode.prototype.supportsFile = function(filename) {
    return filename.match(this.extRe);
};
var supportedModes = {
    ABAP:        ["abap"],
    ABC:         ["abc"],
    ActionScript:["as"],
    ADA:         ["ada|adb"],
    Apache_Conf: ["^htaccess|^htgroups|^htpasswd|^conf|htaccess|htgroups|htpasswd"],
    AsciiDoc:    ["asciidoc|adoc"],
    Assembly_x86:["asm|a"],
    AutoHotKey:  ["ahk"],
    BatchFile:   ["bat|cmd"],
    Bro:         ["bro"],
    C_Cpp:       ["cpp|c|cc|cxx|h|hh|hpp|ino"],
    C9Search:    ["c9search_results"],
    Cirru:       ["cirru|cr"],
    Clojure:     ["clj|cljs"],
    Cobol:       ["CBL|COB"],
    coffee:      ["coffee|cf|cson|^Cakefile"],
    ColdFusion:  ["cfm"],
    CSharp:      ["cs"],
    CSS:         ["css"],
    Curly:       ["curly"],
    D:           ["d|di"],
    Dart:        ["dart"],
    Diff:        ["diff|patch"],
    Dockerfile:  ["^Dockerfile"],
    Dot:         ["dot"],
    Drools:      ["drl"],
    Dummy:       ["dummy"],
    DummySyntax: ["dummy"],
    Eiffel:      ["e|ge"],
    EJS:         ["ejs"],
    Elixir:      ["ex|exs"],
    Elm:         ["elm"],
    Erlang:      ["erl|hrl"],
    Forth:       ["frt|fs|ldr|fth|4th"],
    Fortran:     ["f|f90"],
    FTL:         ["ftl"],
    Gcode:       ["gcode"],
    Gherkin:     ["feature"],
    Gitignore:   ["^.gitignore"],
    Glsl:        ["glsl|frag|vert"],
    Gobstones:   ["gbs"],
    golang:      ["go"],
    Groovy:      ["groovy"],
    HAML:        ["haml"],
    Handlebars:  ["hbs|handlebars|tpl|mustache"],
    Haskell:     ["hs"],
    Haskell_Cabal:     ["cabal"],
    haXe:        ["hx"],
    Hjson:       ["hjson"],
    HTML:        ["html|htm|xhtml"],
    HTML_Elixir: ["eex|html.eex"],
    HTML_Ruby:   ["erb|rhtml|html.erb"],
    INI:         ["ini|conf|cfg|prefs"],
    Io:          ["io"],
    Jack:        ["jack"],
    Jade:        ["jade|pug"],
    Java:        ["java"],
    JavaScript:  ["js|jsm|jsx"],
    JSON:        ["json"],
    JSONiq:      ["jq"],
    JSP:         ["jsp"],
    JSX:         ["jsx"],
    Julia:       ["jl"],
    Kotlin:      ["kt|kts"],
    LaTeX:       ["tex|latex|ltx|bib"],
    LESS:        ["less"],
    Liquid:      ["liquid"],
    Lisp:        ["lisp"],
    LiveScript:  ["ls"],
    LogiQL:      ["logic|lql"],
    LSL:         ["lsl"],
    Lua:         ["lua"],
    LuaPage:     ["lp"],
    Lucene:      ["lucene"],
    Makefile:    ["^Makefile|^GNUmakefile|^makefile|^OCamlMakefile|make"],
    Markdown:    ["md|markdown"],
    Mask:        ["mask"],
    MATLAB:      ["matlab"],
    Maze:        ["mz"],
    MEL:         ["mel"],
    MUSHCode:    ["mc|mush"],
    MySQL:       ["mysql"],
    Nix:         ["nix"],
    NSIS:        ["nsi|nsh"],
    ObjectiveC:  ["m|mm"],
    OCaml:       ["ml|mli"],
    Pascal:      ["pas|p"],
    Perl:        ["pl|pm"],
    pgSQL:       ["pgsql"],
    PHP:         ["php|phtml|shtml|php3|php4|php5|phps|phpt|aw|ctp|module"],
    Powershell:  ["ps1"],
    Praat:       ["praat|praatscript|psc|proc"],
    Prolog:      ["plg|prolog"],
    Properties:  ["properties"],
    Protobuf:    ["proto"],
    Python:      ["py"],
    R:           ["r"],
    Razor:       ["cshtml|asp"],
    RDoc:        ["Rd"],
    RHTML:       ["Rhtml"],
    RST:         ["rst"],
    Ruby:        ["rb|ru|gemspec|rake|^Guardfile|^Rakefile|^Gemfile"],
    Rust:        ["rs"],
    SASS:        ["sass"],
    SCAD:        ["scad"],
    Scala:       ["scala"],
    Scheme:      ["scm|sm|rkt|oak|scheme"],
    SCSS:        ["scss"],
    SH:          ["sh|bash|^.bashrc"],
    SJS:         ["sjs"],
    Smarty:      ["smarty|tpl"],
    snippets:    ["snippets"],
    Soy_Template:["soy"],
    Space:       ["space"],
    SQL:         ["sql"],
    SQLServer:   ["sqlserver"],
    Stylus:      ["styl|stylus"],
    SVG:         ["svg"],
    Swift:       ["swift"],
    Tcl:         ["tcl"],
    Tex:         ["tex"],
    Text:        ["txt"],
    Textile:     ["textile"],
    Toml:        ["toml"],
    TSX:         ["tsx"],
    Twig:        ["twig|swig"],
    Typescript:  ["ts|typescript|str"],
    Vala:        ["vala"],
    VBScript:    ["vbs|vb"],
    Velocity:    ["vm"],
    Verilog:     ["v|vh|sv|svh"],
    VHDL:        ["vhd|vhdl"],
    Wollok:      ["wlk|wpgm|wtest"],
    XML:         ["xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl|xaml"],
    XQuery:      ["xq"],
    YAML:        ["yaml|yml"],
    Django:      ["html"]
};

var nameOverrides = {
    ObjectiveC: "Objective-C",
    CSharp: "C#",
    golang: "Go",
    C_Cpp: "C and C++",
    coffee: "CoffeeScript",
    HTML_Ruby: "HTML (Ruby)",
    HTML_Elixir: "HTML (Elixir)",
    FTL: "FreeMarker"
};
var modesByName = {};
for (var name in supportedModes) {
    var data = supportedModes[name];
    var displayName = (nameOverrides[name] || name).replace(/_/g, " ");
    var filename = name.toLowerCase();
    var mode = new Mode(filename, displayName, data[0]);
    modesByName[filename] = mode;
    modes.push(mode);
}

module.exports = {
    getModeForPath: getModeForPath,
    modes: modes,
    modesByName: modesByName
};

});

ace.define("ace/ext/themelist",["require","exports","module","ace/lib/fixoldbrowsers"], function(require, exports, module) {
"use strict";
require("ace/lib/fixoldbrowsers");

var themeData = [
    ["Chrome"         ],
    ["Clouds"         ],
    ["Crimson Editor" ],
    ["Dawn"           ],
    ["Dreamweaver"    ],
    ["Eclipse"        ],
    ["GitHub"         ],
    ["IPlastic"       ],
    ["Solarized Light"],
    ["TextMate"       ],
    ["Tomorrow"       ],
    ["XCode"          ],
    ["Kuroir"],
    ["KatzenMilch"],
    ["SQL Server"           ,"sqlserver"               , "light"],
    ["Ambiance"             ,"ambiance"                ,  "dark"],
    ["Chaos"                ,"chaos"                   ,  "dark"],
    ["Clouds Midnight"      ,"clouds_midnight"         ,  "dark"],
    ["Cobalt"               ,"cobalt"                  ,  "dark"],
    ["Gruvbox"              ,"gruvbox"                 ,  "dark"],
    ["idle Fingers"         ,"idle_fingers"            ,  "dark"],
    ["krTheme"              ,"kr_theme"                ,  "dark"],
    ["Merbivore"            ,"merbivore"               ,  "dark"],
    ["Merbivore Soft"       ,"merbivore_soft"          ,  "dark"],
    ["Mono Industrial"      ,"mono_industrial"         ,  "dark"],
    ["Monokai"              ,"monokai"                 ,  "dark"],
    ["Pastel on dark"       ,"pastel_on_dark"          ,  "dark"],
    ["Solarized Dark"       ,"solarized_dark"          ,  "dark"],
    ["Terminal"             ,"terminal"                ,  "dark"],
    ["Tomorrow Night"       ,"tomorrow_night"          ,  "dark"],
    ["Tomorrow Night Blue"  ,"tomorrow_night_blue"     ,  "dark"],
    ["Tomorrow Night Bright","tomorrow_night_bright"   ,  "dark"],
    ["Tomorrow Night 80s"   ,"tomorrow_night_eighties" ,  "dark"],
    ["Twilight"             ,"twilight"                ,  "dark"],
    ["Vibrant Ink"          ,"vibrant_ink"             ,  "dark"]
];


exports.themesByName = {};
exports.themes = themeData.map(function(data) {
    var name = data[1] || data[0].replace(/ /g, "_").toLowerCase();
    var theme = {
        caption: data[0],
        theme: "ace/theme/" + name,
        isDark: data[2] == "dark",
        name: name
    };
    exports.themesByName[name] = theme;
    return theme;
});

});

ace.define("ace/ext/menu_tools/add_editor_menu_options",["require","exports","module","ace/ext/modelist","ace/ext/themelist"], function(require, exports, module) {
'use strict';
module.exports.addEditorMenuOptions = function addEditorMenuOptions (editor) {
    var modelist = require('../modelist');
    var themelist = require('../themelist');
    editor.menuOptions = {
        setNewLineMode: [{
            textContent: "unix",
            value: "unix"
        }, {
            textContent: "windows",
            value: "windows"
        }, {
            textContent: "auto",
            value: "auto"
        }],
        setTheme: [],
        setMode: [],
        setKeyboardHandler: [{
            textContent: "ace",
            value: ""
        }, {
            textContent: "vim",
            value: "ace/keyboard/vim"
        }, {
            textContent: "emacs",
            value: "ace/keyboard/emacs"
        }, {
            textContent: "textarea",
            value: "ace/keyboard/textarea"
        }, {
            textContent: "sublime",
            value: "ace/keyboard/sublime"
        }]
    };

    editor.menuOptions.setTheme = themelist.themes.map(function(theme) {
        return {
            textContent: theme.caption,
            value: theme.theme
        };
    });

    editor.menuOptions.setMode = modelist.modes.map(function(mode) {
        return {
            textContent: mode.name,
            value: mode.mode
        };
    });
};


});

ace.define("ace/ext/menu_tools/get_set_functions",["require","exports","module"], function(require, exports, module) {
'use strict';
module.exports.getSetFunctions = function getSetFunctions (editor) {
    var out = [];
    var my = {
        'editor' : editor,
        'session' : editor.session,
        'renderer' : editor.renderer
    };
    var opts = [];
    var skip = [
        'setOption',
        'setUndoManager',
        'setDocument',
        'setValue',
        'setBreakpoints',
        'setScrollTop',
        'setScrollLeft',
        'setSelectionStyle',
        'setWrapLimitRange'
    ];
    ['renderer', 'session', 'editor'].forEach(function(esra) {
        var esr = my[esra];
        var clss = esra;
        for(var fn in esr) {
            if(skip.indexOf(fn) === -1) {
                if(/^set/.test(fn) && opts.indexOf(fn) === -1) {
                    opts.push(fn);
                    out.push({
                        'functionName' : fn,
                        'parentObj' : esr,
                        'parentName' : clss
                    });
                }
            }
        }
    });
    return out;
};

});

ace.define("ace/theme/textmate",["require","exports","module","ace/lib/dom"], function(require, exports, module) {
"use strict";

exports.isDark = false;
exports.cssClass = "ace-tm";
exports.cssText = ".ace-tm .ace_gutter {\
background: #f0f0f0;\
color: #333;\
}\
.ace-tm .ace_print-margin {\
width: 1px;\
background: #e8e8e8;\
}\
.ace-tm .ace_fold {\
background-color: #6B72E6;\
}\
.ace-tm {\
background-color: #FFFFFF;\
color: black;\
}\
.ace-tm .ace_cursor {\
color: black;\
}\
.ace-tm .ace_invisible {\
color: rgb(191, 191, 191);\
}\
.ace-tm .ace_storage,\
.ace-tm .ace_keyword {\
color: blue;\
}\
.ace-tm .ace_constant {\
color: rgb(197, 6, 11);\
}\
.ace-tm .ace_constant.ace_buildin {\
color: rgb(88, 72, 246);\
}\
.ace-tm .ace_constant.ace_language {\
color: rgb(88, 92, 246);\
}\
.ace-tm .ace_constant.ace_library {\
color: rgb(6, 150, 14);\
}\
.ace-tm .ace_invalid {\
background-color: rgba(255, 0, 0, 0.1);\
color: red;\
}\
.ace-tm .ace_support.ace_function {\
color: rgb(60, 76, 114);\
}\
.ace-tm .ace_support.ace_constant {\
color: rgb(6, 150, 14);\
}\
.ace-tm .ace_support.ace_type,\
.ace-tm .ace_support.ace_class {\
color: rgb(109, 121, 222);\
}\
.ace-tm .ace_keyword.ace_operator {\
color: rgb(104, 118, 135);\
}\
.ace-tm .ace_string {\
color: rgb(3, 106, 7);\
}\
.ace-tm .ace_comment {\
color: rgb(76, 136, 107);\
}\
.ace-tm .ace_comment.ace_doc {\
color: rgb(0, 102, 255);\
}\
.ace-tm .ace_comment.ace_doc.ace_tag {\
color: rgb(128, 159, 191);\
}\
.ace-tm .ace_constant.ace_numeric {\
color: rgb(0, 0, 205);\
}\
.ace-tm .ace_variable {\
color: rgb(49, 132, 149);\
}\
.ace-tm .ace_xml-pe {\
color: rgb(104, 104, 91);\
}\
.ace-tm .ace_entity.ace_name.ace_function {\
color: #0000A2;\
}\
.ace-tm .ace_heading {\
color: rgb(12, 7, 255);\
}\
.ace-tm .ace_list {\
color:rgb(185, 6, 144);\
}\
.ace-tm .ace_meta.ace_tag {\
color:rgb(0, 22, 142);\
}\
.ace-tm .ace_string.ace_regex {\
color: rgb(255, 0, 0)\
}\
.ace-tm .ace_marker-layer .ace_selection {\
background: rgb(181, 213, 255);\
}\
.ace-tm.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px white;\
}\
.ace-tm .ace_marker-layer .ace_step {\
background: rgb(252, 255, 0);\
}\
.ace-tm .ace_marker-layer .ace_stack {\
background: rgb(164, 229, 101);\
}\
.ace-tm .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid rgb(192, 192, 192);\
}\
.ace-tm .ace_marker-layer .ace_active-line {\
background: rgba(0, 0, 0, 0.07);\
}\
.ace-tm .ace_gutter-active-line {\
background-color : #dcdcdc;\
}\
.ace-tm .ace_marker-layer .ace_selected-word {\
background: rgb(250, 250, 255);\
border: 1px solid rgb(200, 200, 250);\
}\
.ace-tm .ace_indent-guide {\
background: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bLly//BwAmVgd1/w11/gAAAABJRU5ErkJggg==\") right repeat-y;\
}\
";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});

ace.define("ace/ace",["require","exports","module","ace/lib/fixoldbrowsers","ace/lib/dom","ace/lib/event","ace/editor","ace/edit_session","ace/undomanager","ace/virtual_renderer","ace/worker/worker_client","ace/keyboard/hash_handler","ace/placeholder","ace/multi_select","ace/mode/folding/fold_mode","ace/theme/textmate","ace/ext/error_marker","ace/config"], function(require, exports, module) {
"use strict";

require("./lib/fixoldbrowsers");

var dom = require("./lib/dom");
var event = require("./lib/event");

var Editor = require("./editor").Editor;
var EditSession = require("./edit_session").EditSession;
var UndoManager = require("./undomanager").UndoManager;
var Renderer = require("./virtual_renderer").VirtualRenderer;
require("./worker/worker_client");
require("./keyboard/hash_handler");
require("./placeholder");
require("./multi_select");
require("./mode/folding/fold_mode");
require("./theme/textmate");
require("./ext/error_marker");

exports.config = require("./config");
exports.require = require;

if (typeof define === "function")
    exports.define = define;
exports.edit = function(el) {
    if (typeof el == "string") {
        var _id = el;
        el = document.getElementById(_id);
        if (!el)
            throw new Error("ace.edit can't find div #" + _id);
    }

    if (el && el.env && el.env.editor instanceof Editor)
        return el.env.editor;

    var value = "";
    if (el && /input|textarea/i.test(el.tagName)) {
        var oldNode = el;
        value = oldNode.value;
        el = dom.createElement("pre");
        oldNode.parentNode.replaceChild(el, oldNode);
    } else if (el) {
        value = dom.getInnerText(el);
        el.innerHTML = "";
    }

    var doc = exports.createEditSession(value);

    var editor = new Editor(new Renderer(el));
    editor.setSession(doc);

    var env = {
        document: doc,
        editor: editor,
        onResize: editor.resize.bind(editor, null)
    };
    if (oldNode) env.textarea = oldNode;
    event.addListener(window, "resize", env.onResize);
    editor.on("destroy", function() {
        event.removeListener(window, "resize", env.onResize);
        env.editor.container.env = null; // prevent memory leak on old ie
    });
    editor.container.env = editor.env = env;
    return editor;
};
exports.createEditSession = function(text, mode) {
    var doc = new EditSession(text, mode);
    doc.setUndoManager(new UndoManager());
    return doc;
}
exports.EditSession = EditSession;
exports.UndoManager = UndoManager;
exports.version = "1.2.6";
});

ace.define("ace/ext/menu_tools/generate_settings_menu",["require","exports","module","ace/ext/menu_tools/element_generator","ace/ext/menu_tools/add_editor_menu_options","ace/ext/menu_tools/get_set_functions","ace/ace"], function(require, exports, module) {
'use strict';
var egen = require('./element_generator');
var addEditorMenuOptions = require('./add_editor_menu_options').addEditorMenuOptions;
var getSetFunctions = require('./get_set_functions').getSetFunctions;
module.exports.generateSettingsMenu = function generateSettingsMenu (editor) {
    var elements = [];
    function cleanupElementsList() {
        elements.sort(function(a, b) {
            var x = a.getAttribute('contains');
            var y = b.getAttribute('contains');
            return x.localeCompare(y);
        });
    }
    function wrapElements() {
        var topmenu = document.createElement('div');
        topmenu.setAttribute('id', 'ace_settingsmenu');
        elements.forEach(function(element) {
            topmenu.appendChild(element);
        });
        
        var el = topmenu.appendChild(document.createElement('div'));
        var version = require("../../ace").version;
        el.style.padding = "1em";
        el.textContent = "Ace version " + version;
        
        return topmenu;
    }
    function createNewEntry(obj, clss, item, val) {
        var el;
        var div = document.createElement('div');
        div.setAttribute('contains', item);
        div.setAttribute('class', 'ace_optionsMenuEntry');
        div.setAttribute('style', 'clear: both;');

        div.appendChild(egen.createLabel(
            item.replace(/^set/, '').replace(/([A-Z])/g, ' $1').trim(),
            item
        ));

        if (Array.isArray(val)) {
            el = egen.createSelection(item, val, clss);
            el.addEventListener('change', function(e) {
                try{
                    editor.menuOptions[e.target.id].forEach(function(x) {
                        if(x.textContent !== e.target.textContent) {
                            delete x.selected;
                        }
                    });
                    obj[e.target.id](e.target.value);
                } catch (err) {
                    throw new Error(err);
                }
            });
        } else if(typeof val === 'boolean') {
            el = egen.createCheckbox(item, val, clss);
            el.addEventListener('change', function(e) {
                try{
                    obj[e.target.id](!!e.target.checked);
                } catch (err) {
                    throw new Error(err);
                }
            });
        } else {
            el = egen.createInput(item, val, clss);
            el.addEventListener('change', function(e) {
                try{
                    if(e.target.value === 'true') {
                        obj[e.target.id](true);
                    } else if(e.target.value === 'false') {
                        obj[e.target.id](false);
                    } else {
                        obj[e.target.id](e.target.value);
                    }
                } catch (err) {
                    throw new Error(err);
                }
            });
        }
        el.style.cssText = 'float:right;';
        div.appendChild(el);
        return div;
    }
    function makeDropdown(item, esr, clss, fn) {
        var val = editor.menuOptions[item];
        var currentVal = esr[fn]();
        if (typeof currentVal == 'object')
            currentVal = currentVal.$id;
        val.forEach(function(valuex) {
            if (valuex.value === currentVal)
                valuex.selected = 'selected';
        });
        return createNewEntry(esr, clss, item, val);
    }
    function handleSet(setObj) {
        var item = setObj.functionName;
        var esr = setObj.parentObj;
        var clss = setObj.parentName;
        var val;
        var fn = item.replace(/^set/, 'get');
        if(editor.menuOptions[item] !== undefined) {
            elements.push(makeDropdown(item, esr, clss, fn));
        } else if(typeof esr[fn] === 'function') {
            try {
                val = esr[fn]();
                if(typeof val === 'object') {
                    val = val.$id;
                }
                elements.push(
                    createNewEntry(esr, clss, item, val)
                );
            } catch (e) {
            }
        }
    }
    addEditorMenuOptions(editor);
    getSetFunctions(editor).forEach(function(setObj) {
        handleSet(setObj);
    });
    cleanupElementsList();
    return wrapElements();
};

});

ace.define("ace/ext/menu_tools/overlay_page",["require","exports","module","ace/lib/dom"], function(require, exports, module) {
'use strict';
var dom = require("../../lib/dom");
var cssText = "#ace_settingsmenu, #kbshortcutmenu {\
background-color: #F7F7F7;\
color: black;\
box-shadow: -5px 4px 5px rgba(126, 126, 126, 0.55);\
padding: 1em 0.5em 2em 1em;\
overflow: auto;\
position: absolute;\
margin: 0;\
bottom: 0;\
right: 0;\
top: 0;\
z-index: 9991;\
cursor: default;\
}\
.ace_dark #ace_settingsmenu, .ace_dark #kbshortcutmenu {\
box-shadow: -20px 10px 25px rgba(126, 126, 126, 0.25);\
background-color: rgba(255, 255, 255, 0.6);\
color: black;\
}\
.ace_optionsMenuEntry:hover {\
background-color: rgba(100, 100, 100, 0.1);\
-webkit-transition: all 0.5s;\
transition: all 0.3s\
}\
.ace_closeButton {\
background: rgba(245, 146, 146, 0.5);\
border: 1px solid #F48A8A;\
border-radius: 50%;\
padding: 7px;\
position: absolute;\
right: -8px;\
top: -8px;\
z-index: 1000;\
}\
.ace_closeButton{\
background: rgba(245, 146, 146, 0.9);\
}\
.ace_optionsMenuKey {\
color: darkslateblue;\
font-weight: bold;\
}\
.ace_optionsMenuCommand {\
color: darkcyan;\
font-weight: normal;\
}";
dom.importCssString(cssText);
module.exports.overlayPage = function overlayPage(editor, contentElement, top, right, bottom, left) {
    top = top ? 'top: ' + top + ';' : '';
    bottom = bottom ? 'bottom: ' + bottom + ';' : '';
    right = right ? 'right: ' + right + ';' : '';
    left = left ? 'left: ' + left + ';' : '';

    var closer = document.createElement('div');
    var contentContainer = document.createElement('div');

    function documentEscListener(e) {
        if (e.keyCode === 27) {
            closer.click();
        }
    }

    closer.style.cssText = 'margin: 0; padding: 0; ' +
        'position: fixed; top:0; bottom:0; left:0; right:0;' +
        'z-index: 9990; ' +
        'background-color: rgba(0, 0, 0, 0.3);';
    closer.addEventListener('click', function() {
        document.removeEventListener('keydown', documentEscListener);
        closer.parentNode.removeChild(closer);
        editor.focus();
        closer = null;
    });
    document.addEventListener('keydown', documentEscListener);

    contentContainer.style.cssText = top + right + bottom + left;
    contentContainer.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    var wrapper = dom.createElement("div");
    wrapper.style.position = "relative";
    
    var closeButton = dom.createElement("div");
    closeButton.className = "ace_closeButton";
    closeButton.addEventListener('click', function() {
        closer.click();
    });
    
    wrapper.appendChild(closeButton);
    contentContainer.appendChild(wrapper);
    
    contentContainer.appendChild(contentElement);
    closer.appendChild(contentContainer);
    document.body.appendChild(closer);
    editor.blur();
};

});

ace.define("ace/ext/settings_menu",["require","exports","module","ace/ext/menu_tools/generate_settings_menu","ace/ext/menu_tools/overlay_page","ace/editor"], function(require, exports, module) {
"use strict";
var generateSettingsMenu = require('./menu_tools/generate_settings_menu').generateSettingsMenu;
var overlayPage = require('./menu_tools/overlay_page').overlayPage;
function showSettingsMenu(editor) {
    var sm = document.getElementById('ace_settingsmenu');
    if (!sm)    
        overlayPage(editor, generateSettingsMenu(editor), '0', '0', '0');
}
module.exports.init = function(editor) {
    var Editor = require("ace/editor").Editor;
    Editor.prototype.showSettingsMenu = function() {
        showSettingsMenu(this);
    };
};
});
                (function() {
                    ace.require(["ace/ext/settings_menu"], function() {});
                })();
            