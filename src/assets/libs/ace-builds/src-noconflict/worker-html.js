"no use strict";
;(function(window) {
if (typeof window.window != "undefined" && window.document)
    return;
if (window.require && window.define)
    return;

if (!window.console) {
    window.console = function() {
        var msgs = Array.prototype.slice.call(arguments, 0);
        postMessage({type: "log", data: msgs});
    };
    window.console.error =
    window.console.warn =
    window.console.log =
    window.console.trace = window.console;
}
window.window = window;
window.ace = window;

window.onerror = function(message, file, line, col, err) {
    postMessage({type: "error", data: {
        message: message,
        data: err.data,
        file: file,
        line: line,
        col: col,
        stack: err.stack
    }});
};

window.normalizeModule = function(parentId, moduleName) {
    // normalize plugin requires
    if (moduleName.indexOf("!") !== -1) {
        var chunks = moduleName.split("!");
        return window.normalizeModule(parentId, chunks[0]) + "!" + window.normalizeModule(parentId, chunks[1]);
    }
    // normalize relative requires
    if (moduleName.charAt(0) == ".") {
        var base = parentId.split("/").slice(0, -1).join("/");
        moduleName = (base ? base + "/" : "") + moduleName;
        
        while (moduleName.indexOf(".") !== -1 && previous != moduleName) {
            var previous = moduleName;
            moduleName = moduleName.replace(/^\.\//, "").replace(/\/\.\//, "/").replace(/[^\/]+\/\.\.\//, "");
        }
    }
    
    return moduleName;
};

window.require = function require(parentId, id) {
    if (!id) {
        id = parentId;
        parentId = null;
    }
    if (!id.charAt)
        throw new Error("worker.js require() accepts only (parentId, id) as arguments");

    id = window.normalizeModule(parentId, id);

    var module = window.require.modules[id];
    if (module) {
        if (!module.initialized) {
            module.initialized = true;
            module.exports = module.factory().exports;
        }
        return module.exports;
    }
   
    if (!window.require.tlns)
        return console.log("unable to load " + id);
    
    var path = resolveModuleId(id, window.require.tlns);
    if (path.slice(-3) != ".js") path += ".js";
    
    window.require.id = id;
    window.require.modules[id] = {}; // prevent infinite loop on broken modules
    importScripts(path);
    return window.require(parentId, id);
};
function resolveModuleId(id, paths) {
    var testPath = id, tail = "";
    while (testPath) {
        var alias = paths[testPath];
        if (typeof alias == "string") {
            return alias + tail;
        } else if (alias) {
            return  alias.location.replace(/\/*$/, "/") + (tail || alias.main || alias.name);
        } else if (alias === false) {
            return "";
        }
        var i = testPath.lastIndexOf("/");
        if (i === -1) break;
        tail = testPath.substr(i) + tail;
        testPath = testPath.slice(0, i);
    }
    return id;
}
window.require.modules = {};
window.require.tlns = {};

window.define = function(id, deps, factory) {
    if (arguments.length == 2) {
        factory = deps;
        if (typeof id != "string") {
            deps = id;
            id = window.require.id;
        }
    } else if (arguments.length == 1) {
        factory = id;
        deps = [];
        id = window.require.id;
    }
    
    if (typeof factory != "function") {
        window.require.modules[id] = {
            exports: factory,
            initialized: true
        };
        return;
    }

    if (!deps.length)
        // If there is no dependencies, we inject "require", "exports" and
        // "module" as dependencies, to provide CommonJS compatibility.
        deps = ["require", "exports", "module"];

    var req = function(childId) {
        return window.require(id, childId);
    };

    window.require.modules[id] = {
        exports: {},
        factory: function() {
            var module = this;
            var returnExports = factory.apply(this, deps.map(function(dep) {
                switch (dep) {
                    // Because "require", "exports" and "module" aren't actual
                    // dependencies, we must handle them seperately.
                    case "require": return req;
                    case "exports": return module.exports;
                    case "module":  return module;
                    // But for all other dependencies, we can just go ahead and
                    // require them.
                    default:        return req(dep);
                }
            }));
            if (returnExports)
                module.exports = returnExports;
            return module;
        }
    };
};
window.define.amd = {};
require.tlns = {};
window.initBaseUrls  = function initBaseUrls(topLevelNamespaces) {
    for (var i in topLevelNamespaces)
        require.tlns[i] = topLevelNamespaces[i];
};

window.initSender = function initSender() {

    var EventEmitter = window.require("ace/lib/event_emitter").EventEmitter;
    var oop = window.require("ace/lib/oop");
    
    var Sender = function() {};
    
    (function() {
        
        oop.implement(this, EventEmitter);
                
        this.callback = function(data, callbackId) {
            postMessage({
                type: "call",
                id: callbackId,
                data: data
            });
        };
    
        this.emit = function(name, data) {
            postMessage({
                type: "event",
                name: name,
                data: data
            });
        };
        
    }).call(Sender.prototype);
    
    return new Sender();
};

var main = window.main = null;
var sender = window.sender = null;

window.onmessage = function(e) {
    var msg = e.data;
    if (msg.event && sender) {
        sender._signal(msg.event, msg.data);
    }
    else if (msg.command) {
        if (main[msg.command])
            main[msg.command].apply(main, msg.args);
        else if (window[msg.command])
            window[msg.command].apply(window, msg.args);
        else
            throw new Error("Unknown command:" + msg.command);
    }
    else if (msg.init) {
        window.initBaseUrls(msg.tlns);
        require("ace/lib/es5-shim");
        sender = window.sender = window.initSender();
        var clazz = require(msg.module)[msg.classname];
        main = window.main = new clazz(sender);
    }
};
})(this);

ace.define("ace/lib/oop",["require","exports","module"], function(require, exports, module) {
"use strict";

exports.inherits = function(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
};

exports.mixin = function(obj, mixin) {
    for (var key in mixin) {
        obj[key] = mixin[key];
    }
    return obj;
};

exports.implement = function(proto, mixin) {
    exports.mixin(proto, mixin);
};

});

ace.define("ace/lib/lang",["require","exports","module"], function(require, exports, module) {
"use strict";

exports.last = function(a) {
    return a[a.length - 1];
};

exports.stringReverse = function(string) {
    return string.split("").reverse().join("");
};

exports.stringRepeat = function (string, count) {
    var result = '';
    while (count > 0) {
        if (count & 1)
            result += string;

        if (count >>= 1)
            string += string;
    }
    return result;
};

var trimBeginRegexp = /^\s\s*/;
var trimEndRegexp = /\s\s*$/;

exports.stringTrimLeft = function (string) {
    return string.replace(trimBeginRegexp, '');
};

exports.stringTrimRight = function (string) {
    return string.replace(trimEndRegexp, '');
};

exports.copyObject = function(obj) {
    var copy = {};
    for (var key in obj) {
        copy[key] = obj[key];
    }
    return copy;
};

exports.copyArray = function(array){
    var copy = [];
    for (var i=0, l=array.length; i<l; i++) {
        if (array[i] && typeof array[i] == "object")
            copy[i] = this.copyObject(array[i]);
        else
            copy[i] = array[i];
    }
    return copy;
};

exports.deepCopy = function deepCopy(obj) {
    if (typeof obj !== "object" || !obj)
        return obj;
    var copy;
    if (Array.isArray(obj)) {
        copy = [];
        for (var key = 0; key < obj.length; key++) {
            copy[key] = deepCopy(obj[key]);
        }
        return copy;
    }
    if (Object.prototype.toString.call(obj) !== "[object Object]")
        return obj;
    
    copy = {};
    for (var key in obj)
        copy[key] = deepCopy(obj[key]);
    return copy;
};

exports.arrayToMap = function(arr) {
    var map = {};
    for (var i=0; i<arr.length; i++) {
        map[arr[i]] = 1;
    }
    return map;

};

exports.createMap = function(props) {
    var map = Object.create(null);
    for (var i in props) {
        map[i] = props[i];
    }
    return map;
};
exports.arrayRemove = function(array, value) {
  for (var i = 0; i <= array.length; i++) {
    if (value === array[i]) {
      array.splice(i, 1);
    }
  }
};

exports.escapeRegExp = function(str) {
    return str.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
};

exports.escapeHTML = function(str) {
    return str.replace(/&/g, "&#38;").replace(/"/g, "&#34;").replace(/'/g, "&#39;").replace(/</g, "&#60;");
};

exports.getMatchOffsets = function(string, regExp) {
    var matches = [];

    string.replace(regExp, function(str) {
        matches.push({
            offset: arguments[arguments.length-2],
            length: str.length
        });
    });

    return matches;
};
exports.deferredCall = function(fcn) {
    var timer = null;
    var callback = function() {
        timer = null;
        fcn();
    };

    var deferred = function(timeout) {
        deferred.cancel();
        timer = setTimeout(callback, timeout || 0);
        return deferred;
    };

    deferred.schedule = deferred;

    deferred.call = function() {
        this.cancel();
        fcn();
        return deferred;
    };

    deferred.cancel = function() {
        clearTimeout(timer);
        timer = null;
        return deferred;
    };
    
    deferred.isPending = function() {
        return timer;
    };

    return deferred;
};


exports.delayedCall = function(fcn, defaultTimeout) {
    var timer = null;
    var callback = function() {
        timer = null;
        fcn();
    };

    var _self = function(timeout) {
        if (timer == null)
            timer = setTimeout(callback, timeout || defaultTimeout);
    };

    _self.delay = function(timeout) {
        timer && clearTimeout(timer);
        timer = setTimeout(callback, timeout || defaultTimeout);
    };
    _self.schedule = _self;

    _self.call = function() {
        this.cancel();
        fcn();
    };

    _self.cancel = function() {
        timer && clearTimeout(timer);
        timer = null;
    };

    _self.isPending = function() {
        return timer;
    };

    return _self;
};
});

ace.define("ace/range",["require","exports","module"], function(require, exports, module) {
"use strict";
var comparePoints = function(p1, p2) {
    return p1.row - p2.row || p1.column - p2.column;
};
var Range = function(startRow, startColumn, endRow, endColumn) {
    this.start = {
        row: startRow,
        column: startColumn
    };

    this.end = {
        row: endRow,
        column: endColumn
    };
};

(function() {
    this.isEqual = function(range) {
        return this.start.row === range.start.row &&
            this.end.row === range.end.row &&
            this.start.column === range.start.column &&
            this.end.column === range.end.column;
    };
    this.toString = function() {
        return ("Range: [" + this.start.row + "/" + this.start.column +
            "] -> [" + this.end.row + "/" + this.end.column + "]");
    };

    this.contains = function(row, column) {
        return this.compare(row, column) == 0;
    };
    this.compareRange = function(range) {
        var cmp,
            end = range.end,
            start = range.start;

        cmp = this.compare(end.row, end.column);
        if (cmp == 1) {
            cmp = this.compare(start.row, start.column);
            if (cmp == 1) {
                return 2;
            } else if (cmp == 0) {
                return 1;
            } else {
                return 0;
            }
        } else if (cmp == -1) {
            return -2;
        } else {
            cmp = this.compare(start.row, start.column);
            if (cmp == -1) {
                return -1;
            } else if (cmp == 1) {
                return 42;
            } else {
                return 0;
            }
        }
    };
    this.comparePoint = function(p) {
        return this.compare(p.row, p.column);
    };
    this.containsRange = function(range) {
        return this.comparePoint(range.start) == 0 && this.comparePoint(range.end) == 0;
    };
    this.intersects = function(range) {
        var cmp = this.compareRange(range);
        return (cmp == -1 || cmp == 0 || cmp == 1);
    };
    this.isEnd = function(row, column) {
        return this.end.row == row && this.end.column == column;
    };
    this.isStart = function(row, column) {
        return this.start.row == row && this.start.column == column;
    };
    this.setStart = function(row, column) {
        if (typeof row == "object") {
            this.start.column = row.column;
            this.start.row = row.row;
        } else {
            this.start.row = row;
            this.start.column = column;
        }
    };
    this.setEnd = function(row, column) {
        if (typeof row == "object") {
            this.end.column = row.column;
            this.end.row = row.row;
        } else {
            this.end.row = row;
            this.end.column = column;
        }
    };
    this.inside = function(row, column) {
        if (this.compare(row, column) == 0) {
            if (this.isEnd(row, column) || this.isStart(row, column)) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    };
    this.insideStart = function(row, column) {
        if (this.compare(row, column) == 0) {
            if (this.isEnd(row, column)) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    };
    this.insideEnd = function(row, column) {
        if (this.compare(row, column) == 0) {
            if (this.isStart(row, column)) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    };
    this.compare = function(row, column) {
        if (!this.isMultiLine()) {
            if (row === this.start.row) {
                return column < this.start.column ? -1 : (column > this.end.column ? 1 : 0);
            }
        }

        if (row < this.start.row)
            return -1;

        if (row > this.end.row)
            return 1;

        if (this.start.row === row)
            return column >= this.start.column ? 0 : -1;

        if (this.end.row === row)
            return column <= this.end.column ? 0 : 1;

        return 0;
    };
    this.compareStart = function(row, column) {
        if (this.start.row == row && this.start.column == column) {
            return -1;
        } else {
            return this.compare(row, column);
        }
    };
    this.compareEnd = function(row, column) {
        if (this.end.row == row && this.end.column == column) {
            return 1;
        } else {
            return this.compare(row, column);
        }
    };
    this.compareInside = function(row, column) {
        if (this.end.row == row && this.end.column == column) {
            return 1;
        } else if (this.start.row == row && this.start.column == column) {
            return -1;
        } else {
            return this.compare(row, column);
        }
    };
    this.clipRows = function(firstRow, lastRow) {
        if (this.end.row > lastRow)
            var end = {row: lastRow + 1, column: 0};
        else if (this.end.row < firstRow)
            var end = {row: firstRow, column: 0};

        if (this.start.row > lastRow)
            var start = {row: lastRow + 1, column: 0};
        else if (this.start.row < firstRow)
            var start = {row: firstRow, column: 0};

        return Range.fromPoints(start || this.start, end || this.end);
    };
    this.extend = function(row, column) {
        var cmp = this.compare(row, column);

        if (cmp == 0)
            return this;
        else if (cmp == -1)
            var start = {row: row, column: column};
        else
            var end = {row: row, column: column};

        return Range.fromPoints(start || this.start, end || this.end);
    };

    this.isEmpty = function() {
        return (this.start.row === this.end.row && this.start.column === this.end.column);
    };
    this.isMultiLine = function() {
        return (this.start.row !== this.end.row);
    };
    this.clone = function() {
        return Range.fromPoints(this.start, this.end);
    };
    this.collapseRows = function() {
        if (this.end.column == 0)
            return new Range(this.start.row, 0, Math.max(this.start.row, this.end.row-1), 0)
        else
            return new Range(this.start.row, 0, this.end.row, 0)
    };
    this.toScreenRange = function(session) {
        var screenPosStart = session.documentToScreenPosition(this.start);
        var screenPosEnd = session.documentToScreenPosition(this.end);

        return new Range(
            screenPosStart.row, screenPosStart.column,
            screenPosEnd.row, screenPosEnd.column
        );
    };
    this.moveBy = function(row, column) {
        this.start.row += row;
        this.start.column += column;
        this.end.row += row;
        this.end.column += column;
    };

}).call(Range.prototype);
Range.fromPoints = function(start, end) {
    return new Range(start.row, start.column, end.row, end.column);
};
Range.comparePoints = comparePoints;

Range.comparePoints = function(p1, p2) {
    return p1.row - p2.row || p1.column - p2.column;
};


exports.Range = Range;
});

ace.define("ace/apply_delta",["require","exports","module"], function(require, exports, module) {
"use strict";

function throwDeltaError(delta, errorText){
    console.log("Invalid Delta:", delta);
    throw "Invalid Delta: " + errorText;
}

function positionInDocument(docLines, position) {
    return position.row    >= 0 && position.row    <  docLines.length &&
           position.column >= 0 && position.column <= docLines[position.row].length;
}

function validateDelta(docLines, delta) {
    if (delta.action != "insert" && delta.action != "remove")
        throwDeltaError(delta, "delta.action must be 'insert' or 'remove'");
    if (!(delta.lines instanceof Array))
        throwDeltaError(delta, "delta.lines must be an Array");
    if (!delta.start || !delta.end)
       throwDeltaError(delta, "delta.start/end must be an present");
    var start = delta.start;
    if (!positionInDocument(docLines, delta.start))
        throwDeltaError(delta, "delta.start must be contained in document");
    var end = delta.end;
    if (delta.action == "remove" && !positionInDocument(docLines, end))
        throwDeltaError(delta, "delta.end must contained in document for 'remove' actions");
    var numRangeRows = end.row - start.row;
    var numRangeLastLineChars = (end.column - (numRangeRows == 0 ? start.column : 0));
    if (numRangeRows != delta.lines.length - 1 || delta.lines[numRangeRows].length != numRangeLastLineChars)
        throwDeltaError(delta, "delta.range must match delta lines");
}

exports.applyDelta = function(docLines, delta, doNotValidate) {
    
    var row = delta.start.row;
    var startColumn = delta.start.column;
    var line = docLines[row] || "";
    switch (delta.action) {
        case "insert":
            var lines = delta.lines;
            if (lines.length === 1) {
                docLines[row] = line.substring(0, startColumn) + delta.lines[0] + line.substring(startColumn);
            } else {
                var args = [row, 1].concat(delta.lines);
                docLines.splice.apply(docLines, args);
                docLines[row] = line.substring(0, startColumn) + docLines[row];
                docLines[row + delta.lines.length - 1] += line.substring(startColumn);
            }
            break;
        case "remove":
            var endColumn = delta.end.column;
            var endRow = delta.end.row;
            if (row === endRow) {
                docLines[row] = line.substring(0, startColumn) + line.substring(endColumn);
            } else {
                docLines.splice(
                    row, endRow - row + 1,
                    line.substring(0, startColumn) + docLines[endRow].substring(endColumn)
                );
            }
            break;
    }
}
});

ace.define("ace/lib/event_emitter",["require","exports","module"], function(require, exports, module) {
"use strict";

var EventEmitter = {};
var stopPropagation = function() { this.propagationStopped = true; };
var preventDefault = function() { this.defaultPrevented = true; };

EventEmitter._emit =
EventEmitter._dispatchEvent = function(eventName, e) {
    this._eventRegistry || (this._eventRegistry = {});
    this._defaultHandlers || (this._defaultHandlers = {});

    var listeners = this._eventRegistry[eventName] || [];
    var defaultHandler = this._defaultHandlers[eventName];
    if (!listeners.length && !defaultHandler)
        return;

    if (typeof e != "object" || !e)
        e = {};

    if (!e.type)
        e.type = eventName;
    if (!e.stopPropagation)
        e.stopPropagation = stopPropagation;
    if (!e.preventDefault)
        e.preventDefault = preventDefault;

    listeners = listeners.slice();
    for (var i=0; i<listeners.length; i++) {
        listeners[i](e, this);
        if (e.propagationStopped)
            break;
    }
    
    if (defaultHandler && !e.defaultPrevented)
        return defaultHandler(e, this);
};


EventEmitter._signal = function(eventName, e) {
    var listeners = (this._eventRegistry || {})[eventName];
    if (!listeners)
        return;
    listeners = listeners.slice();
    for (var i=0; i<listeners.length; i++)
        listeners[i](e, this);
};

EventEmitter.once = function(eventName, callback) {
    var _self = this;
    callback && this.addEventListener(eventName, function newCallback() {
        _self.removeEventListener(eventName, newCallback);
        callback.apply(null, arguments);
    });
};


EventEmitter.setDefaultHandler = function(eventName, callback) {
    var handlers = this._defaultHandlers
    if (!handlers)
        handlers = this._defaultHandlers = {_disabled_: {}};
    
    if (handlers[eventName]) {
        var old = handlers[eventName];
        var disabled = handlers._disabled_[eventName];
        if (!disabled)
            handlers._disabled_[eventName] = disabled = [];
        disabled.push(old);
        var i = disabled.indexOf(callback);
        if (i != -1)
            disabled.splice(i, 1);
    }
    handlers[eventName] = callback;
};
EventEmitter.removeDefaultHandler = function(eventName, callback) {
    var handlers = this._defaultHandlers
    if (!handlers)
        return;
    var disabled = handlers._disabled_[eventName];
    
    if (handlers[eventName] == callback) {
        var old = handlers[eventName];
        if (disabled)
            this.setDefaultHandler(eventName, disabled.pop());
    } else if (disabled) {
        var i = disabled.indexOf(callback);
        if (i != -1)
            disabled.splice(i, 1);
    }
};

EventEmitter.on =
EventEmitter.addEventListener = function(eventName, callback, capturing) {
    this._eventRegistry = this._eventRegistry || {};

    var listeners = this._eventRegistry[eventName];
    if (!listeners)
        listeners = this._eventRegistry[eventName] = [];

    if (listeners.indexOf(callback) == -1)
        listeners[capturing ? "unshift" : "push"](callback);
    return callback;
};

EventEmitter.off =
EventEmitter.removeListener =
EventEmitter.removeEventListener = function(eventName, callback) {
    this._eventRegistry = this._eventRegistry || {};

    var listeners = this._eventRegistry[eventName];
    if (!listeners)
        return;

    var index = listeners.indexOf(callback);
    if (index !== -1)
        listeners.splice(index, 1);
};

EventEmitter.removeAllListeners = function(eventName) {
    if (this._eventRegistry) this._eventRegistry[eventName] = [];
};

exports.EventEmitter = EventEmitter;

});

ace.define("ace/anchor",["require","exports","module","ace/lib/oop","ace/lib/event_emitter"], function(require, exports, module) {
"use strict";

var oop = require("./lib/oop");
var EventEmitter = require("./lib/event_emitter").EventEmitter;

var Anchor = exports.Anchor = function(doc, row, column) {
    this.$onChange = this.onChange.bind(this);
    this.attach(doc);
    
    if (typeof column == "undefined")
        this.setPosition(row.row, row.column);
    else
        this.setPosition(row, column);
};

(function() {

    oop.implement(this, EventEmitter);
    this.getPosition = function() {
        return this.$clipPositionToDocument(this.row, this.column);
    };
    this.getDocument = function() {
        return this.document;
    };
    this.$insertRight = false;
    this.onChange = function(delta) {
        if (delta.start.row == delta.end.row && delta.start.row != this.row)
            return;

        if (delta.start.row > this.row)
            return;
            
        var point = $getTransformedPoint(delta, {row: this.row, column: this.column}, this.$insertRight);
        this.setPosition(point.row, point.column, true);
    };
    
    function $pointsInOrder(point1, point2, equalPointsInOrder) {
        var bColIsAfter = equalPointsInOrder ? point1.column <= point2.column : point1.column < point2.column;
        return (point1.row < point2.row) || (point1.row == point2.row && bColIsAfter);
    }
            
    function $getTransformedPoint(delta, point, moveIfEqual) {
        var deltaIsInsert = delta.action == "insert";
        var deltaRowShift = (deltaIsInsert ? 1 : -1) * (delta.end.row    - delta.start.row);
        var deltaColShift = (deltaIsInsert ? 1 : -1) * (delta.end.column - delta.start.column);
        var deltaStart = delta.start;
        var deltaEnd = deltaIsInsert ? deltaStart : delta.end; // Collapse insert range.
        if ($pointsInOrder(point, deltaStart, moveIfEqual)) {
            return {
                row: point.row,
                column: point.column
            };
        }
        if ($pointsInOrder(deltaEnd, point, !moveIfEqual)) {
            return {
                row: point.row + deltaRowShift,
                column: point.column + (point.row == deltaEnd.row ? deltaColShift : 0)
            };
        }
        
        return {
            row: deltaStart.row,
            column: deltaStart.column
        };
    }
    this.setPosition = function(row, column, noClip) {
        var pos;
        if (noClip) {
            pos = {
                row: row,
                column: column
            };
        } else {
            pos = this.$clipPositionToDocument(row, column);
        }

        if (this.row == pos.row && this.column == pos.column)
            return;

        var old = {
            row: this.row,
            column: this.column
        };

        this.row = pos.row;
        this.column = pos.column;
        this._signal("change", {
            old: old,
            value: pos
        });
    };
    this.detach = function() {
        this.document.removeEventListener("change", this.$onChange);
    };
    this.attach = function(doc) {
        this.document = doc || this.document;
        this.document.on("change", this.$onChange);
    };
    this.$clipPositionToDocument = function(row, column) {
        var pos = {};

        if (row >= this.document.getLength()) {
            pos.row = Math.max(0, this.document.getLength() - 1);
            pos.column = this.document.getLine(pos.row).length;
        }
        else if (row < 0) {
            pos.row = 0;
            pos.column = 0;
        }
        else {
            pos.row = row;
            pos.column = Math.min(this.document.getLine(pos.row).length, Math.max(0, column));
        }

        if (column < 0)
            pos.column = 0;

        return pos;
    };

}).call(Anchor.prototype);

});

ace.define("ace/document",["require","exports","module","ace/lib/oop","ace/apply_delta","ace/lib/event_emitter","ace/range","ace/anchor"], function(require, exports, module) {
"use strict";

var oop = require("./lib/oop");
var applyDelta = require("./apply_delta").applyDelta;
var EventEmitter = require("./lib/event_emitter").EventEmitter;
var Range = require("./range").Range;
var Anchor = require("./anchor").Anchor;

var Document = function(textOrLines) {
    this.$lines = [""];
    if (textOrLines.length === 0) {
        this.$lines = [""];
    } else if (Array.isArray(textOrLines)) {
        this.insertMergedLines({row: 0, column: 0}, textOrLines);
    } else {
        this.insert({row: 0, column:0}, textOrLines);
    }
};

(function() {

    oop.implement(this, EventEmitter);
    this.setValue = function(text) {
        var len = this.getLength() - 1;
        this.remove(new Range(0, 0, len, this.getLine(len).length));
        this.insert({row: 0, column: 0}, text);
    };
    this.getValue = function() {
        return this.getAllLines().join(this.getNewLineCharacter());
    };
    this.createAnchor = function(row, column) {
        return new Anchor(this, row, column);
    };
    if ("aaa".split(/a/).length === 0) {
        this.$split = function(text) {
            return text.replace(/\r\n|\r/g, "\n").split("\n");
        };
    } else {
        this.$split = function(text) {
            return text.split(/\r\n|\r|\n/);
        };
    }


    this.$detectNewLine = function(text) {
        var match = text.match(/^.*?(\r\n|\r|\n)/m);
        this.$autoNewLine = match ? match[1] : "\n";
        this._signal("changeNewLineMode");
    };
    this.getNewLineCharacter = function() {
        switch (this.$newLineMode) {
          case "windows":
            return "\r\n";
          case "unix":
            return "\n";
          default:
            return this.$autoNewLine || "\n";
        }
    };

    this.$autoNewLine = "";
    this.$newLineMode = "auto";
    this.setNewLineMode = function(newLineMode) {
        if (this.$newLineMode === newLineMode)
            return;

        this.$newLineMode = newLineMode;
        this._signal("changeNewLineMode");
    };
    this.getNewLineMode = function() {
        return this.$newLineMode;
    };
    this.isNewLine = function(text) {
        return (text == "\r\n" || text == "\r" || text == "\n");
    };
    this.getLine = function(row) {
        return this.$lines[row] || "";
    };
    this.getLines = function(firstRow, lastRow) {
        return this.$lines.slice(firstRow, lastRow + 1);
    };
    this.getAllLines = function() {
        return this.getLines(0, this.getLength());
    };
    this.getLength = function() {
        return this.$lines.length;
    };
    this.getTextRange = function(range) {
        return this.getLinesForRange(range).join(this.getNewLineCharacter());
    };
    this.getLinesForRange = function(range) {
        var lines;
        if (range.start.row === range.end.row) {
            lines = [this.getLine(range.start.row).substring(range.start.column, range.end.column)];
        } else {
            lines = this.getLines(range.start.row, range.end.row);
            lines[0] = (lines[0] || "").substring(range.start.column);
            var l = lines.length - 1;
            if (range.end.row - range.start.row == l)
                lines[l] = lines[l].substring(0, range.end.column);
        }
        return lines;
    };
    this.insertLines = function(row, lines) {
        console.warn("Use of document.insertLines is deprecated. Use the insertFullLines method instead.");
        return this.insertFullLines(row, lines);
    };
    this.removeLines = function(firstRow, lastRow) {
        console.warn("Use of document.removeLines is deprecated. Use the removeFullLines method instead.");
        return this.removeFullLines(firstRow, lastRow);
    };
    this.insertNewLine = function(position) {
        console.warn("Use of document.insertNewLine is deprecated. Use insertMergedLines(position, ['', '']) instead.");
        return this.insertMergedLines(position, ["", ""]);
    };
    this.insert = function(position, text) {
        if (this.getLength() <= 1)
            this.$detectNewLine(text);
        
        return this.insertMergedLines(position, this.$split(text));
    };
    this.insertInLine = function(position, text) {
        var start = this.clippedPos(position.row, position.column);
        var end = this.pos(position.row, position.column + text.length);
        
        this.applyDelta({
            start: start,
            end: end,
            action: "insert",
            lines: [text]
        }, true);
        
        return this.clonePos(end);
    };
    
    this.clippedPos = function(row, column) {
        var length = this.getLength();
        if (row === undefined) {
            row = length;
        } else if (row < 0) {
            row = 0;
        } else if (row >= length) {
            row = length - 1;
            column = undefined;
        }
        var line = this.getLine(row);
        if (column == undefined)
            column = line.length;
        column = Math.min(Math.max(column, 0), line.length);
        return {row: row, column: column};
    };
    
    this.clonePos = function(pos) {
        return {row: pos.row, column: pos.column};
    };
    
    this.pos = function(row, column) {
        return {row: row, column: column};
    };
    
    this.$clipPosition = function(position) {
        var length = this.getLength();
        if (position.row >= length) {
            position.row = Math.max(0, length - 1);
            position.column = this.getLine(length - 1).length;
        } else {
            position.row = Math.max(0, position.row);
            position.column = Math.min(Math.max(position.column, 0), this.getLine(position.row).length);
        }
        return position;
    };
    this.insertFullLines = function(row, lines) {
        row = Math.min(Math.max(row, 0), this.getLength());
        var column = 0;
        if (row < this.getLength()) {
            lines = lines.concat([""]);
            column = 0;
        } else {
            lines = [""].concat(lines);
            row--;
            column = this.$lines[row].length;
        }
        this.insertMergedLines({row: row, column: column}, lines);
    };
    this.insertMergedLines = function(position, lines) {
        var start = this.clippedPos(position.row, position.column);
        var end = {
            row: start.row + lines.length - 1,
            column: (lines.length == 1 ? start.column : 0) + lines[lines.length - 1].length
        };
        
        this.applyDelta({
            start: start,
            end: end,
            action: "insert",
            lines: lines
        });
        
        return this.clonePos(end);
    };
    this.remove = function(range) {
        var start = this.clippedPos(range.start.row, range.start.column);
        var end = this.clippedPos(range.end.row, range.end.column);
        this.applyDelta({
            start: start,
            end: end,
            action: "remove",
            lines: this.getLinesForRange({start: start, end: end})
        });
        return this.clonePos(start);
    };
    this.removeInLine = function(row, startColumn, endColumn) {
        var start = this.clippedPos(row, startColumn);
        var end = this.clippedPos(row, endColumn);
        
        this.applyDelta({
            start: start,
            end: end,
            action: "remove",
            lines: this.getLinesForRange({start: start, end: end})
        }, true);
        
        return this.clonePos(start);
    };
    this.removeFullLines = function(firstRow, lastRow) {
        firstRow = Math.min(Math.max(0, firstRow), this.getLength() - 1);
        lastRow  = Math.min(Math.max(0, lastRow ), this.getLength() - 1);
        var deleteFirstNewLine = lastRow == this.getLength() - 1 && firstRow > 0;
        var deleteLastNewLine  = lastRow  < this.getLength() - 1;
        var startRow = ( deleteFirstNewLine ? firstRow - 1                  : firstRow                    );
        var startCol = ( deleteFirstNewLine ? this.getLine(startRow).length : 0                           );
        var endRow   = ( deleteLastNewLine  ? lastRow + 1                   : lastRow                     );
        var endCol   = ( deleteLastNewLine  ? 0                             : this.getLine(endRow).length );
        var range = new Range(startRow, startCol, endRow, endCol);
        var deletedLines = this.$lines.slice(firstRow, lastRow + 1);
        
        this.applyDelta({
            start: range.start,
            end: range.end,
            action: "remove",
            lines: this.getLinesForRange(range)
        });
        return deletedLines;
    };
    this.removeNewLine = function(row) {
        if (row < this.getLength() - 1 && row >= 0) {
            this.applyDelta({
                start: this.pos(row, this.getLine(row).length),
                end: this.pos(row + 1, 0),
                action: "remove",
                lines: ["", ""]
            });
        }
    };
    this.replace = function(range, text) {
        if (!(range instanceof Range))
            range = Range.fromPoints(range.start, range.end);
        if (text.length === 0 && range.isEmpty())
            return range.start;
        if (text == this.getTextRange(range))
            return range.end;

        this.remove(range);
        var end;
        if (text) {
            end = this.insert(range.start, text);
        }
        else {
            end = range.start;
        }
        
        return end;
    };
    this.applyDeltas = function(deltas) {
        for (var i=0; i<deltas.length; i++) {
            this.applyDelta(deltas[i]);
        }
    };
    this.revertDeltas = function(deltas) {
        for (var i=deltas.length-1; i>=0; i--) {
            this.revertDelta(deltas[i]);
        }
    };
    this.applyDelta = function(delta, doNotValidate) {
        var isInsert = delta.action == "insert";
        if (isInsert ? delta.lines.length <= 1 && !delta.lines[0]
            : !Range.comparePoints(delta.start, delta.end)) {
            return;
        }
        
        if (isInsert && delta.lines.length > 20000)
            this.$splitAndapplyLargeDelta(delta, 20000);
        applyDelta(this.$lines, delta, doNotValidate);
        this._signal("change", delta);
    };
    
    this.$splitAndapplyLargeDelta = function(delta, MAX) {
        var lines = delta.lines;
        var l = lines.length;
        var row = delta.start.row;
        var column = delta.start.column;
        var from = 0, to = 0;
        do {
            from = to;
            to += MAX - 1;
            var chunk = lines.slice(from, to);
            if (to > l) {
                delta.lines = chunk;
                delta.start.row = row + from;
                delta.start.column = column;
                break;
            }
            chunk.push("");
            this.applyDelta({
                start: this.pos(row + from, column),
                end: this.pos(row + to, column = 0),
                action: delta.action,
                lines: chunk
            }, true);
        } while(true);
    };
    this.revertDelta = function(delta) {
        this.applyDelta({
            start: this.clonePos(delta.start),
            end: this.clonePos(delta.end),
            action: (delta.action == "insert" ? "remove" : "insert"),
            lines: delta.lines.slice()
        });
    };
    this.indexToPosition = function(index, startRow) {
        var lines = this.$lines || this.getAllLines();
        var newlineLength = this.getNewLineCharacter().length;
        for (var i = startRow || 0, l = lines.length; i < l; i++) {
            index -= lines[i].length + newlineLength;
            if (index < 0)
                return {row: i, column: index + lines[i].length + newlineLength};
        }
        return {row: l-1, column: lines[l-1].length};
    };
    this.positionToIndex = function(pos, startRow) {
        var lines = this.$lines || this.getAllLines();
        var newlineLength = this.getNewLineCharacter().length;
        var index = 0;
        var row = Math.min(pos.row, lines.length);
        for (var i = startRow || 0; i < row; ++i)
            index += lines[i].length + newlineLength;

        return index + pos.column;
    };

}).call(Document.prototype);

exports.Document = Document;
});

ace.define("ace/worker/mirror",["require","exports","module","ace/range","ace/document","ace/lib/lang"], function(require, exports, module) {
"use strict";

var Range = require("../range").Range;
var Document = require("../document").Document;
var lang = require("../lib/lang");
    
var Mirror = exports.Mirror = function(sender) {
    this.sender = sender;
    var doc = this.doc = new Document("");
    
    var deferredUpdate = this.deferredUpdate = lang.delayedCall(this.onUpdate.bind(this));
    
    var _self = this;
    sender.on("change", function(e) {
        var data = e.data;
        if (data[0].start) {
            doc.applyDeltas(data);
        } else {
            for (var i = 0; i < data.length; i += 2) {
                if (Array.isArray(data[i+1])) {
                    var d = {action: "insert", start: data[i], lines: data[i+1]};
                } else {
                    var d = {action: "remove", start: data[i], end: data[i+1]};
                }
                doc.applyDelta(d, true);
            }
        }
        if (_self.$timeout)
            return deferredUpdate.schedule(_self.$timeout);
        _self.onUpdate();
    });
};

(function() {
    
    this.$timeout = 500;
    
    this.setTimeout = function(timeout) {
        this.$timeout = timeout;
    };
    
    this.setValue = function(value) {
        this.doc.setValue(value);
        this.deferredUpdate.schedule(this.$timeout);
    };
    
    this.getValue = function(callbackId) {
        this.sender.callback(this.doc.getValue(), callbackId);
    };
    
    this.onUpdate = function() {
    };
    
    this.isPending = function() {
        return this.deferredUpdate.isPending();
    };
    
}).call(Mirror.prototype);

});

ace.define("ace/mode/html/saxparser",["require","exports","module"], function(require, exports, module) {
module.exports = (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({
1:[function(_dereq_,module,exports){
function isScopeMarker(node) {
	if (node.namespaceURI === "http://www.w3.org/1999/xhtml") {
		return node.localName === "applet"
			|| node.localName === "caption"
			|| node.localName === "marquee"
			|| node.localName === "object"
			|| node.localName === "table"
			|| node.localName === "td"
			|| node.localName === "th";
	}
	if (node.namespaceURI === "http://www.w3.org/1998/Math/MathML") {
		return node.localName === "mi"
			|| node.localName === "mo"
			|| node.localName === "mn"
			|| node.localName === "ms"
			|| node.localName === "mtext"
			|| node.localName === "annotation-xml";
	}
	if (node.namespaceURI === "http://www.w3.org/2000/svg") {
		return node.localName === "foreignObject"
			|| node.localName === "desc"
			|| node.localName === "title";
	}
}

function isListItemScopeMarker(node) {
	return isScopeMarker(node)
		|| (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'ol')
		|| (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'ul');
}

function isTableScopeMarker(node) {
	return (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'table')
		|| (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'html');
}

function isTableBodyScopeMarker(node) {
	return (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'tbody')
		|| (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'tfoot')
		|| (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'thead')
		|| (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'html');
}

function isTableRowScopeMarker(node) {
	return (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'tr')
		|| (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'html');
}

function isButtonScopeMarker(node) {
	return isScopeMarker(node)
		|| (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'button');
}

function isSelectScopeMarker(node) {
	return !(node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'optgroup')
		&& !(node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'option');
}
function ElementStack() {
	this.elements = [];
	this.rootNode = null;
	this.headElement = null;
	this.bodyElement = null;
}
ElementStack.prototype._inScope = function(localName, isMarker) {
	for (var i = this.elements.length - 1; i >= 0; i--) {
		var node = this.elements[i];
		if (node.localName === localName)
			return true;
		if (isMarker(node))
			return false;
	}
};
ElementStack.prototype.push = function(item) {
	this.elements.push(item);
};
ElementStack.prototype.pushHtmlElement = function(item) {
	this.rootNode = item.node;
	this.push(item);
};
ElementStack.prototype.pushHeadElement = function(item) {
	this.headElement = item.node;
	this.push(item);
};
ElementStack.prototype.pushBodyElement = function(item) {
	this.bodyElement = item.node;
	this.push(item);
};
ElementStack.prototype.pop = function() {
	return this.elements.pop();
};
ElementStack.prototype.remove = function(item) {
	this.elements.splice(this.elements.indexOf(item), 1);
};
ElementStack.prototype.popUntilPopped = function(localName) {
	var element;
	do {
		element = this.pop();
	} while (element.localName != localName);
};

ElementStack.prototype.popUntilTableScopeMarker = function() {
	while (!isTableScopeMarker(this.top))
		this.pop();
};

ElementStack.prototype.popUntilTableBodyScopeMarker = function() {
	while (!isTableBodyScopeMarker(this.top))
		this.pop();
};

ElementStack.prototype.popUntilTableRowScopeMarker = function() {
	while (!isTableRowScopeMarker(this.top))
		this.pop();
};
ElementStack.prototype.item = function(index) {
	return this.elements[index];
};
ElementStack.prototype.contains = function(element) {
	return this.elements.indexOf(element) !== -1;
};
ElementStack.prototype.inScope = function(localName) {
	return this._inScope(localName, isScopeMarker);
};
ElementStack.prototype.inListItemScope = function(localName) {
	return this._inScope(localName, isListItemScopeMarker);
};
ElementStack.prototype.inTableScope = function(localName) {
	return this._inScope(localName, isTableScopeMarker);
};
ElementStack.prototype.inButtonScope = function(localName) {
	return this._inScope(localName, isButtonScopeMarker);
};
ElementStack.prototype.inSelectScope = function(localName) {
	return this._inScope(localName, isSelectScopeMarker);
};
ElementStack.prototype.hasNumberedHeaderElementInScope = function() {
	for (var i = this.elements.length - 1; i >= 0; i--) {
		var node = this.elements[i];
		if (node.isNumberedHeader())
			return true;
		if (isScopeMarker(node))
			return false;
	}
};
ElementStack.prototype.furthestBlockForFormattingElement = function(element) {
	var furthestBlock = null;
	for (var i = this.elements.length - 1; i >= 0; i--) {
		var node = this.elements[i];
		if (node.node === element)
			break;
		if (node.isSpecial())
			furthestBlock = node;
	}
    return furthestBlock;
};
ElementStack.prototype.findIndex = function(localName) {
	for (var i = this.elements.length - 1; i >= 0; i--) {
		if (this.elements[i].localName == localName)
			return i;
	}
    return -1;
};

ElementStack.prototype.remove_openElements_until = function(callback) {
	var finished = false;
	var element;
	while (!finished) {
		element = this.elements.pop();
		finished = callback(element);
	}
	return element;
};

Object.defineProperty(ElementStack.prototype, 'top', {
	get: function() {
		return this.elements[this.elements.length - 1];
	}
});

Object.defineProperty(ElementStack.prototype, 'length', {
	get: function() {
		return this.elements.length;
	}
});

exports.ElementStack = ElementStack;

},
{}],
2:[function(_dereq_,module,exports){
var entities  = _dereq_('html5-entities');
var InputStream = _dereq_('./InputStream').InputStream;

var namedEntityPrefixes = {};
Object.keys(entities).forEach(function (entityKey) {
	for (var i = 0; i < entityKey.length; i++) {
		namedEntityPrefixes[entityKey.substring(0, i + 1)] = true;
	}
});

function isAlphaNumeric(c) {
	return (c >= '0' && c <= '9') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}

function isHexDigit(c) {
	return (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
}

function isDecimalDigit(c) {
	return (c >= '0' && c <= '9');
}

var EntityParser = {};

EntityParser.consumeEntity = function(buffer, tokenizer, additionalAllowedCharacter) {
	var decodedCharacter = '';
	var consumedCharacters = '';
	var ch = buffer.char();
	if (ch === InputStream.EOF)
		return false;
	consumedCharacters += ch;
	if (ch == '\t' || ch == '\n' || ch == '\v' || ch == ' ' || ch == '<' || ch == '&') {
		buffer.unget(consumedCharacters);
		return false;
	}
	if (additionalAllowedCharacter === ch) {
		buffer.unget(consumedCharacters);
		return false;
	}
	if (ch == '#') {
		ch = buffer.shift(1);
		if (ch === InputStream.EOF) {
			tokenizer._parseError("expected-numeric-entity-but-got-eof");
			buffer.unget(consumedCharacters);
			return false;
		}
		consumedCharacters += ch;
		var radix = 10;
		var isDigit = isDecimalDigit;
		if (ch == 'x' || ch == 'X') {
			radix = 16;
			isDigit = isHexDigit;
			ch = buffer.shift(1);
			if (ch === InputStream.EOF) {
				tokenizer._parseError("expected-numeric-entity-but-got-eof");
				buffer.unget(consumedCharacters);
				return false;
			}
			consumedCharacters += ch;
		}
		if (isDigit(ch)) {
			var code = '';
			while (ch !== InputStream.EOF && isDigit(ch)) {
				code += ch;
				ch = buffer.char();
			}
			code = parseInt(code, radix);
			var replacement = this.replaceEntityNumbers(code);
			if (replacement) {
				tokenizer._parseError("invalid-numeric-entity-replaced");
				code = replacement;
			}
			if (code > 0xFFFF && code <= 0x10FFFF) {
		        code -= 0x10000;
		        var first = ((0xffc00 & code) >> 10) + 0xD800;
		        var second = (0x3ff & code) + 0xDC00;
				decodedCharacter = String.fromCharCode(first, second);
			} else
				decodedCharacter = String.fromCharCode(code);
			if (ch !== ';') {
				tokenizer._parseError("numeric-entity-without-semicolon");
				buffer.unget(ch);
			}
			return decodedCharacter;
		}
		buffer.unget(consumedCharacters);
		tokenizer._parseError("expected-numeric-entity");
		return false;
	}
	if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')) {
		var mostRecentMatch = '';
		while (namedEntityPrefixes[consumedCharacters]) {
			if (entities[consumedCharacters]) {
				mostRecentMatch = consumedCharacters;
			}
			if (ch == ';')
				break;
			ch = buffer.char();
			if (ch === InputStream.EOF)
				break;
			consumedCharacters += ch;
		}
		if (!mostRecentMatch) {
			tokenizer._parseError("expected-named-entity");
			buffer.unget(consumedCharacters);
			return false;
		}
		decodedCharacter = entities[mostRecentMatch];
		if (ch === ';' || !additionalAllowedCharacter || !(isAlphaNumeric(ch) || ch === '=')) {
			if (consumedCharacters.length > mostRecentMatch.length) {
				buffer.unget(consumedCharacters.substring(mostRecentMatch.length));
			}
			if (ch !== ';') {
				tokenizer._parseError("named-entity-without-semicolon");
			}
			return decodedCharacter;
		}
		buffer.unget(consumedCharacters);
		return false;
	}
};

EntityParser.replaceEntityNumbers = function(c) {
	switch(c) {
		case 0x00: return 0xFFFD; // REPLACEMENT CHARACTER
		case 0x13: return 0x0010; // Carriage return
		case 0x80: return 0x20AC; // EURO SIGN
		case 0x81: return 0x0081; // <control>
		case 0x82: return 0x201A; // SINGLE LOW-9 QUOTATION MARK
		case 0x83: return 0x0192; // LATIN SMALL LETTER F WITH HOOK
		case 0x84: return 0x201E; // DOUBLE LOW-9 QUOTATION MARK
		case 0x85: return 0x2026; // HORIZONTAL ELLIPSIS
		case 0x86: return 0x2020; // DAGGER
		case 0x87: return 0x2021; // DOUBLE DAGGER
		case 0x88: return 0x02C6; // MODIFIER LETTER CIRCUMFLEX ACCENT
		case 0x89: return 0x2030; // PER MILLE SIGN
		case 0x8A: return 0x0160; // LATIN CAPITAL LETTER S WITH CARON
		case 0x8B: return 0x2039; // SINGLE LEFT-POINTING ANGLE QUOTATION MARK
		case 0x8C: return 0x0152; // LATIN CAPITAL LIGATURE OE
		case 0x8D: return 0x008D; // <control>
		case 0x8E: return 0x017D; // LATIN CAPITAL LETTER Z WITH CARON
		case 0x8F: return 0x008F; // <control>
		case 0x90: return 0x0090; // <control>
		case 0x91: return 0x2018; // LEFT SINGLE QUOTATION MARK
		case 0x92: return 0x2019; // RIGHT SINGLE QUOTATION MARK
		case 0x93: return 0x201C; // LEFT DOUBLE QUOTATION MARK
		case 0x94: return 0x201D; // RIGHT DOUBLE QUOTATION MARK
		case 0x95: return 0x2022; // BULLET
		case 0x96: return 0x2013; // EN DASH
		case 0x97: return 0x2014; // EM DASH
		case 0x98: return 0x02DC; // SMALL TILDE
		case 0x99: return 0x2122; // TRADE MARK SIGN
		case 0x9A: return 0x0161; // LATIN SMALL LETTER S WITH CARON
		case 0x9B: return 0x203A; // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK
		case 0x9C: return 0x0153; // LATIN SMALL LIGATURE OE
		case 0x9D: return 0x009D; // <control>
		case 0x9E: return 0x017E; // LATIN SMALL LETTER Z WITH CARON
		case 0x9F: return 0x0178; // LATIN CAPITAL LETTER Y WITH DIAERESIS
		default:
			if ((c >= 0xD800 && c <= 0xDFFF) || c > 0x10FFFF) {
				return 0xFFFD;
			} else if ((c >= 0x0001 && c <= 0x0008) || (c >= 0x000E && c <= 0x001F) ||
				(c >= 0x007F && c <= 0x009F) || (c >= 0xFDD0 && c <= 0xFDEF) ||
				c == 0x000B || c == 0xFFFE || c == 0x1FFFE || c == 0x2FFFFE ||
				c == 0x2FFFF || c == 0x3FFFE || c == 0x3FFFF || c == 0x4FFFE ||
				c == 0x4FFFF || c == 0x5FFFE || c == 0x5FFFF || c == 0x6FFFE ||
				c == 0x6FFFF || c == 0x7FFFE || c == 0x7FFFF || c == 0x8FFFE ||
				c == 0x8FFFF || c == 0x9FFFE || c == 0x9FFFF || c == 0xAFFFE ||
				c == 0xAFFFF || c == 0xBFFFE || c == 0xBFFFF || c == 0xCFFFE ||
				c == 0xCFFFF || c == 0xDFFFE || c == 0xDFFFF || c == 0xEFFFE ||
				c == 0xEFFFF || c == 0xFFFFE || c == 0xFFFFF || c == 0x10FFFE ||
				c == 0x10FFFF) {
				return c;
			}
	}
};

exports.EntityParser = EntityParser;

},
{"./InputStream":3,"html5-entities":12}],
3:[function(_dereq_,module,exports){
function InputStream() {
	this.data = '';
	this.start = 0;
	this.committed = 0;
	this.eof = false;
	this.lastLocation = {line: 0, column: 0};
}

InputStream.EOF = -1;

InputStream.DRAIN = -2;

InputStream.prototype = {
	slice: function() {
		if(this.start >= this.data.length) {
			if(!this.eof) throw InputStream.DRAIN;
			return InputStream.EOF;
		}
		return this.data.slice(this.start, this.data.length);
	},
	char: function() {
		if(!this.eof && this.start >= this.data.length - 1) throw InputStream.DRAIN;
		if(this.start >= this.data.length) {
			return InputStream.EOF;
		}
		var ch = this.data[this.start++];
		if (ch === '\r')
			ch = '\n';
		return ch;
	},
	advance: function(amount) {
		this.start += amount;
		if(this.start >= this.data.length) {
			if(!this.eof) throw InputStream.DRAIN;
			return InputStream.EOF;
		} else {
			if(this.committed > this.data.length / 2) {
				this.lastLocation = this.location();
				this.data = this.data.slice(this.committed);
				this.start = this.start - this.committed;
				this.committed = 0;
			}
		}
	},
	matchWhile: function(re) {
		if(this.eof && this.start >= this.data.length ) return '';
		var r = new RegExp("^"+re+"+");
		var m = r.exec(this.slice());
		if(m) {
			if(!this.eof && m[0].length == this.data.length - this.start) throw InputStream.DRAIN;
			this.advance(m[0].length);
			return m[0];
		} else {
			return '';
		}
	},
	matchUntil: function(re) {
		var m, s;
		s = this.slice();
		if(s === InputStream.EOF) {
			return '';
		} else if(m = new RegExp(re + (this.eof ? "|$" : "")).exec(s)) {
			var t = this.data.slice(this.start, this.start + m.index);
			this.advance(m.index);
			return t.replace(/\r/g, '\n').replace(/\n{2,}/g, '\n');
		} else {
			throw InputStream.DRAIN;
		}
	},
	append: function(data) {
		this.data += data;
	},
	shift: function(n) {
		if(!this.eof && this.start + n >= this.data.length) throw InputStream.DRAIN;
		if(this.eof && this.start >= this.data.length) return InputStream.EOF;
		var d = this.data.slice(this.start, this.start + n).toString();
		this.advance(Math.min(n, this.data.length - this.start));
		return d;
	},
	peek: function(n) {
		if(!this.eof && this.start + n >= this.data.length) throw InputStream.DRAIN;
		if(this.eof && this.start >= this.data.length) return InputStream.EOF;
		return this.data.slice(this.start, Math.min(this.start + n, this.data.length)).toString();
	},
	length: function() {
		return this.data.length - this.start - 1;
	},
	unget: function(d) {
		if(d === InputStream.EOF) return;
		this.start -= (d.length);
	},
	undo: function() {
		this.start = this.committed;
	},
	commit: function() {
		this.committed = this.start;
	},
	location: function() {
		var lastLine = this.lastLocation.line;
		var lastColumn = this.lastLocation.column;
		var read = this.data.slice(0, this.committed);
		var newlines = read.match(/\n/g);
		var line = newlines ? lastLine + newlines.length : lastLine;
		var column = newlines ? read.length - read.lastIndexOf('\n') - 1 : lastColumn + read.length;
		return {line: line, column: column};
	}
};

exports.InputStream = InputStream;

},
{}],
4:[function(_dereq_,module,exports){
var SpecialElements = {
	"http://www.w3.org/1999/xhtml": [
		'address',
		'applet',
		'area',
		'article',
		'aside',
		'base',
		'basefont',
		'bgsound',
		'blockquote',
		'body',
		'br',
		'button',
		'caption',
		'center',
		'col',
		'colgroup',
		'dd',
		'details',
		'dir',
		'div',
		'dl',
		'dt',
		'embed',
		'fieldset',
		'figcaption',
		'figure',
		'footer',
		'form',
		'frame',
		'frameset',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'head',
		'header',
		'hgroup',
		'hr',
		'html',
		'iframe',
		'img',
		'input',
		'isindex',
		'li',
		'link',
		'listing',
		'main',
		'marquee',
		'menu',
		'menuitem',
		'meta',
		'nav',
		'noembed',
		'noframes',
		'noscript',
		'object',
		'ol',
		'p',
		'param',
		'plaintext',
		'pre',
		'script',
		'section',
		'select',
		'source',
		'style',
		'summary',
		'table',
		'tbody',
		'td',
		'textarea',
		'tfoot',
		'th',
		'thead',
		'title',
		'tr',
		'track',
		'ul',
		'wbr',
		'xmp'
	],
	"http://www.w3.org/1998/Math/MathML": [
		'mi',
		'mo',
		'mn',
		'ms',
		'mtext',
		'annotation-xml'
	],
	"http://www.w3.org/2000/svg": [
		'foreignObject',
		'desc',
		'title'
	]
};


function StackItem(namespaceURI, localName, attributes, node) {
	this.localName = localName;
	this.namespaceURI = namespaceURI;
	this.attributes = attributes;
	this.node = node;
}
StackItem.prototype.isSpecial = function() {
	return this.namespaceURI in SpecialElements &&
		SpecialElements[this.namespaceURI].indexOf(this.localName) > -1;
};

StackItem.prototype.isFosterParenting = function() {
	if (this.namespaceURI === "http://www.w3.org/1999/xhtml") {
		return this.localName === 'table' ||
			this.localName === 'tbody' ||
			this.localName === 'tfoot' ||
			this.localName === 'thead' ||
			this.localName === 'tr';
	}
	return false;
};

StackItem.prototype.isNumberedHeader = function() {
	if (this.namespaceURI === "http://www.w3.org/1999/xhtml") {
		return this.localName === 'h1' ||
			this.localName === 'h2' ||
			this.localName === 'h3' ||
			this.localName === 'h4' ||
			this.localName === 'h5' ||
			this.localName === 'h6';
	}
	return false;
};

StackItem.prototype.isForeign = function() {
	return this.namespaceURI != "http://www.w3.org/1999/xhtml";
};

function getAttribute(item, name) {
	for (var i = 0; i < item.attributes.length; i++) {
		if (item.attributes[i].nodeName == name)
			return item.attributes[i].nodeValue;
	}
	return null;
}

StackItem.prototype.isHtmlIntegrationPoint = function() {
	if (this.namespaceURI === "http://www.w3.org/1998/Math/MathML") {
		if (this.localName !== "annotation-xml")
			return false;
		var encoding = getAttribute(this, 'encoding');
		if (!encoding)
			return false;
		encoding = encoding.toLowerCase();
		return encoding === "text/html" || encoding === "application/xhtml+xml";
	}
	if (this.namespaceURI === "http://www.w3.org/2000/svg") {
		return this.localName === "foreignObject"
			|| this.localName === "desc"
			|| this.localName === "title";
	}
	return false;
};

StackItem.prototype.isMathMLTextIntegrationPoint = function() {
	if (this.namespaceURI === "http://www.w3.org/1998/Math/MathML") {
		return this.localName === "mi"
			|| this.localName === "mo"
			|| this.localName === "mn"
			|| this.localName === "ms"
			|| this.localName === "mtext";
	}
	return false;
};

exports.StackItem = StackItem;

},
{}],
5:[function(_dereq_,module,exports){
var InputStream = _dereq_('./InputStream').InputStream;
var EntityParser = _dereq_('./EntityParser').EntityParser;

function isWhitespace(c){
	return c === " " || c === "\n" || c === "\t" || c === "\r" || c === "\f";
}

function isAlpha(c) {
	return (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z');
}
function Tokenizer(tokenHandler) {
	this._tokenHandler = tokenHandler;
	this._state = Tokenizer.DATA;
	this._inputStream = new InputStream();
	this._currentToken = null;
	this._temporaryBuffer = '';
	this._additionalAllowedCharacter = '';
}

Tokenizer.prototype._parseError = function(code, args) {
	this._tokenHandler.parseError(code, args);
};

Tokenizer.prototype._emitToken = function(token) {
	if (token.type === 'StartTag') {
		for (var i = 1; i < token.data.length; i++) {
			if (!token.data[i].nodeName)
				token.data.splice(i--, 1);
		}
	} else if (token.type === 'EndTag') {
		if (token.selfClosing) {
			this._parseError('self-closing-flag-on-end-tag');
		}
		if (token.data.length !== 0) {
			this._parseError('attributes-in-end-tag');
		}
	}
	this._tokenHandler.processToken(token);
	if (token.type === 'StartTag' && token.selfClosing && !this._tokenHandler.isSelfClosingFlagAcknowledged()) {
		this._parseError('non-void-element-with-trailing-solidus', {name: token.name});
	}
};

Tokenizer.prototype._emitCurrentToken = function() {
	this._state = Tokenizer.DATA;
	this._emitToken(this._currentToken);
};

Tokenizer.prototype._currentAttribute = function() {
	return this._currentToken.data[this._currentToken.data.length - 1];
};

Tokenizer.prototype.setState = function(state) {
	this._state = state;
};

Tokenizer.prototype.tokenize = function(source) {
	Tokenizer.DATA = data_state;
	Tokenizer.RCDATA = rcdata_state;
	Tokenizer.RAWTEXT = rawtext_state;
	Tokenizer.SCRIPT_DATA = script_data_state;
	Tokenizer.PLAINTEXT = plaintext_state;


	this._state = Tokenizer.DATA;

	this._inputStream.append(source);

	this._tokenHandler.startTokenization(this);

	this._inputStream.eof = true;

	var tokenizer = this;

	while (this._state.call(this, this._inputStream));


	function data_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._emitToken({type: 'EOF', data: null});
			return false;
		} else if (data === '&') {
			tokenizer.setState(character_reference_in_data_state);
		} else if (data === '<') {
			tokenizer.setState(tag_open_state);
		} else if (data === '\u0000') {
			tokenizer._emitToken({type: 'Characters', data: data});
			buffer.commit();
		} else {
			var chars = buffer.matchUntil("&|<|\u0000");
			tokenizer._emitToken({type: 'Characters', data: data + chars});
			buffer.commit();
		}
		return true;
	}

	function character_reference_in_data_state(buffer) {
		var character = EntityParser.consumeEntity(buffer, tokenizer);
		tokenizer.setState(data_state);
		tokenizer._emitToken({type: 'Characters', data: character || '&'});
		return true;
	}

	function rcdata_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._emitToken({type: 'EOF', data: null});
			return false;
		} else if (data === '&') {
			tokenizer.setState(character_reference_in_rcdata_state);
		} else if (data === '<') {
			tokenizer.setState(rcdata_less_than_sign_state);
		} else if (data === "\u0000") {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			buffer.commit();
		} else {
			var chars = buffer.matchUntil("&|<|\u0000");
			tokenizer._emitToken({type: 'Characters', data: data + chars});
			buffer.commit();
		}
		return true;
	}

	function character_reference_in_rcdata_state(buffer) {
		var character = EntityParser.consumeEntity(buffer, tokenizer);
		tokenizer.setState(rcdata_state);
		tokenizer._emitToken({type: 'Characters', data: character || '&'});
		return true;
	}

	function rawtext_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._emitToken({type: 'EOF', data: null});
			return false;
		} else if (data === '<') {
			tokenizer.setState(rawtext_less_than_sign_state);
		} else if (data === "\u0000") {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			buffer.commit();
		} else {
			var chars = buffer.matchUntil("<|\u0000");
			tokenizer._emitToken({type: 'Characters', data: data + chars});
		}
		return true;
	}

	function plaintext_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._emitToken({type: 'EOF', data: null});
			return false;
		} else if (data === "\u0000") {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			buffer.commit();
		} else {
			var chars = buffer.matchUntil("\u0000");
			tokenizer._emitToken({type: 'Characters', data: data + chars});
		}
		return true;
	}


	function script_data_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._emitToken({type: 'EOF', data: null});
			return false;
		} else if (data === '<') {
			tokenizer.setState(script_data_less_than_sign_state);
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			buffer.commit();
		} else {
			var chars = buffer.matchUntil("<|\u0000");
			tokenizer._emitToken({type: 'Characters', data: data + chars});
		}
		return true;
	}

	function rcdata_less_than_sign_state(buffer) {
		var data = buffer.char();
		if (data === "/") {
			this._temporaryBuffer = '';
			tokenizer.setState(rcdata_end_tag_open_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: '<'});
			buffer.unget(data);
			tokenizer.setState(rcdata_state);
		}
		return true;
	}

	function rcdata_end_tag_open_state(buffer) {
		var data = buffer.char();
		if (isAlpha(data)) {
			this._temporaryBuffer += data;
			tokenizer.setState(rcdata_end_tag_name_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: '</'});
			buffer.unget(data);
			tokenizer.setState(rcdata_state);
		}
		return true;
	}

	function rcdata_end_tag_name_state(buffer) {
		var appropriate = tokenizer._currentToken && (tokenizer._currentToken.name === this._temporaryBuffer.toLowerCase());
		var data = buffer.char();
		if (isWhitespace(data) && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: this._temporaryBuffer, data: [], selfClosing: false};
			tokenizer.setState(before_attribute_name_state);
		} else if (data === '/' && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: this._temporaryBuffer, data: [], selfClosing: false};
			tokenizer.setState(self_closing_tag_state);
		} else if (data === '>' && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: this._temporaryBuffer, data: [], selfClosing: false};
			tokenizer._emitCurrentToken();
			tokenizer.setState(data_state);
		} else if (isAlpha(data)) {
			this._temporaryBuffer += data;
			buffer.commit();
		} else {
			tokenizer._emitToken({type: 'Characters', data: '</' + this._temporaryBuffer});
			buffer.unget(data);
			tokenizer.setState(rcdata_state);
		}
		return true;
	}

	function rawtext_less_than_sign_state(buffer) {
		var data = buffer.char();
		if (data === "/") {
			this._temporaryBuffer = '';
			tokenizer.setState(rawtext_end_tag_open_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: '<'});
			buffer.unget(data);
			tokenizer.setState(rawtext_state);
		}
		return true;
	}

	function rawtext_end_tag_open_state(buffer) {
		var data = buffer.char();
		if (isAlpha(data)) {
			this._temporaryBuffer += data;
			tokenizer.setState(rawtext_end_tag_name_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: '</'});
			buffer.unget(data);
			tokenizer.setState(rawtext_state);
		}
		return true;
	}

	function rawtext_end_tag_name_state(buffer) {
		var appropriate = tokenizer._currentToken && (tokenizer._currentToken.name === this._temporaryBuffer.toLowerCase());
		var data = buffer.char();
		if (isWhitespace(data) && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: this._temporaryBuffer, data: [], selfClosing: false};
			tokenizer.setState(before_attribute_name_state);
		} else if (data === '/' && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: this._temporaryBuffer, data: [], selfClosing: false};
			tokenizer.setState(self_closing_tag_state);
		} else if (data === '>' && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: this._temporaryBuffer, data: [], selfClosing: false};
			tokenizer._emitCurrentToken();
			tokenizer.setState(data_state);
		} else if (isAlpha(data)) {
			this._temporaryBuffer += data;
			buffer.commit();
		} else {
			tokenizer._emitToken({type: 'Characters', data: '</' + this._temporaryBuffer});
			buffer.unget(data);
			tokenizer.setState(rawtext_state);
		}
		return true;
	}

	function script_data_less_than_sign_state(buffer) {
		var data = buffer.char();
		if (data === "/") {
			this._temporaryBuffer = '';
			tokenizer.setState(script_data_end_tag_open_state);
		} else if (data === '!') {
			tokenizer._emitToken({type: 'Characters', data: '<!'});
			tokenizer.setState(script_data_escape_start_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: '<'});
			buffer.unget(data);
			tokenizer.setState(script_data_state);
		}
		return true;
	}

	function script_data_end_tag_open_state(buffer) {
		var data = buffer.char();
		if (isAlpha(data)) {
			this._temporaryBuffer += data;
			tokenizer.setState(script_data_end_tag_name_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: '</'});
			buffer.unget(data);
			tokenizer.setState(script_data_state);
		}
		return true;
	}

	function script_data_end_tag_name_state(buffer) {
		var appropriate = tokenizer._currentToken && (tokenizer._currentToken.name === this._temporaryBuffer.toLowerCase());
		var data = buffer.char();
		if (isWhitespace(data) && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: 'script', data: [], selfClosing: false};
			tokenizer.setState(before_attribute_name_state);
		} else if (data === '/' && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: 'script', data: [], selfClosing: false};
			tokenizer.setState(self_closing_tag_state);
		} else if (data === '>' && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: 'script', data: [], selfClosing: false};
			tokenizer._emitCurrentToken();
		} else if (isAlpha(data)) {
			this._temporaryBuffer += data;
			buffer.commit();
		} else {
			tokenizer._emitToken({type: 'Characters', data: '</' + this._temporaryBuffer});
			buffer.unget(data);
			tokenizer.setState(script_data_state);
		}
		return true;
	}

	function script_data_escape_start_state(buffer) {
		var data = buffer.char();
		if (data === '-') {
			tokenizer._emitToken({type: 'Characters', data: '-'});
			tokenizer.setState(script_data_escape_start_dash_state);
		} else {
			buffer.unget(data);
			tokenizer.setState(script_data_state);
		}
		return true;
	}

	function script_data_escape_start_dash_state(buffer) {
		var data = buffer.char();
		if (data === '-') {
			tokenizer._emitToken({type: 'Characters', data: '-'});
			tokenizer.setState(script_data_escaped_dash_dash_state);
		} else {
			buffer.unget(data);
			tokenizer.setState(script_data_state);
		}
		return true;
	}

	function script_data_escaped_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '-') {
			tokenizer._emitToken({type: 'Characters', data: '-'});
			tokenizer.setState(script_data_escaped_dash_state);
		} else if (data === '<') {
			tokenizer.setState(script_data_escaped_less_then_sign_state);
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			buffer.commit();
		} else {
			var chars = buffer.matchUntil('<|-|\u0000');
			tokenizer._emitToken({type: 'Characters', data: data + chars});
		}
		return true;
	}

	function script_data_escaped_dash_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '-') {
			tokenizer._emitToken({type: 'Characters', data: '-'});
			tokenizer.setState(script_data_escaped_dash_dash_state);
		} else if (data === '<') {
			tokenizer.setState(script_data_escaped_less_then_sign_state);
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			tokenizer.setState(script_data_escaped_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: data});
			tokenizer.setState(script_data_escaped_state);
		}
		return true;
	}

	function script_data_escaped_dash_dash_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError('eof-in-script');
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '<') {
			tokenizer.setState(script_data_escaped_less_then_sign_state);
		} else if (data === '>') {
			tokenizer._emitToken({type: 'Characters', data: '>'});
			tokenizer.setState(script_data_state);
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			tokenizer.setState(script_data_escaped_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: data});
			tokenizer.setState(script_data_escaped_state);
		}
		return true;
	}

	function script_data_escaped_less_then_sign_state(buffer) {
		var data = buffer.char();
		if (data === '/') {
			this._temporaryBuffer = '';
			tokenizer.setState(script_data_escaped_end_tag_open_state);
		} else if (isAlpha(data)) {
			tokenizer._emitToken({type: 'Characters', data: '<' + data});
			this._temporaryBuffer = data;
			tokenizer.setState(script_data_double_escape_start_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: '<'});
			buffer.unget(data);
			tokenizer.setState(script_data_escaped_state);
		}
		return true;
	}

	function script_data_escaped_end_tag_open_state(buffer) {
		var data = buffer.char();
		if (isAlpha(data)) {
			this._temporaryBuffer = data;
			tokenizer.setState(script_data_escaped_end_tag_name_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: '</'});
			buffer.unget(data);
			tokenizer.setState(script_data_escaped_state);
		}
		return true;
	}

	function script_data_escaped_end_tag_name_state(buffer) {
		var appropriate = tokenizer._currentToken && (tokenizer._currentToken.name === this._temporaryBuffer.toLowerCase());
		var data = buffer.char();
		if (isWhitespace(data) && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: 'script', data: [], selfClosing: false};
			tokenizer.setState(before_attribute_name_state);
		} else if (data === '/' && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: 'script', data: [], selfClosing: false};
			tokenizer.setState(self_closing_tag_state);
		} else if (data === '>' &&  appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: 'script', data: [], selfClosing: false};
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else if (isAlpha(data)) {
			this._temporaryBuffer += data;
			buffer.commit();
		} else {
			tokenizer._emitToken({type: 'Characters', data: '</' + this._temporaryBuffer});
			buffer.unget(data);
			tokenizer.setState(script_data_escaped_state);
		}
		return true;
	}

	function script_data_double_escape_start_state(buffer) {
		var data = buffer.char();
		if (isWhitespace(data) || data === '/' || data === '>') {
			tokenizer._emitToken({type: 'Characters', data: data});
			if (this._temporaryBuffer.toLowerCase() === 'script')
				tokenizer.setState(script_data_double_escaped_state);
			else
				tokenizer.setState(script_data_escaped_state);
		} else if (isAlpha(data)) {
			tokenizer._emitToken({type: 'Characters', data: data});
			this._temporaryBuffer += data;
			buffer.commit();
		} else {
			buffer.unget(data);
			tokenizer.setState(script_data_escaped_state);
		}
		return true;
	}

	function script_data_double_escaped_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError('eof-in-script');
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '-') {
			tokenizer._emitToken({type: 'Characters', data: '-'});
			tokenizer.setState(script_data_double_escaped_dash_state);
		} else if (data === '<') {
			tokenizer._emitToken({type: 'Characters', data: '<'});
			tokenizer.setState(script_data_double_escaped_less_than_sign_state);
		} else if (data === '\u0000') {
			tokenizer._parseError('invalid-codepoint');
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			buffer.commit();
		} else {
			tokenizer._emitToken({type: 'Characters', data: data});
			buffer.commit();
		}
		return true;
	}

	function script_data_double_escaped_dash_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError('eof-in-script');
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '-') {
			tokenizer._emitToken({type: 'Characters', data: '-'});
			tokenizer.setState(script_data_double_escaped_dash_dash_state);
		} else if (data === '<') {
			tokenizer._emitToken({type: 'Characters', data: '<'});
			tokenizer.setState(script_data_double_escaped_less_than_sign_state);
		} else if (data === '\u0000') {
			tokenizer._parseError('invalid-codepoint');
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			tokenizer.setState(script_data_double_escaped_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: data});
			tokenizer.setState(script_data_double_escaped_state);
		}
		return true;
	}

	function script_data_double_escaped_dash_dash_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError('eof-in-script');
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '-') {
			tokenizer._emitToken({type: 'Characters', data: '-'});
			buffer.commit();
		} else if (data === '<') {
			tokenizer._emitToken({type: 'Characters', data: '<'});
			tokenizer.setState(script_data_double_escaped_less_than_sign_state);
		} else if (data === '>') {
			tokenizer._emitToken({type: 'Characters', data: '>'});
			tokenizer.setState(script_data_state);
		} else if (data === '\u0000') {
			tokenizer._parseError('invalid-codepoint');
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			tokenizer.setState(script_data_double_escaped_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: data});
			tokenizer.setState(script_data_double_escaped_state);
		}
		return true;
	}

	function script_data_double_escaped_less_than_sign_state(buffer) {
		var data = buffer.char();
		if (data === '/') {
			tokenizer._emitToken({type: 'Characters', data: '/'});
			this._temporaryBuffer = '';
			tokenizer.setState(script_data_double_escape_end_state);
		} else {
			buffer.unget(data);
			tokenizer.setState(script_data_double_escaped_state);
		}
		return true;
	}

	function script_data_double_escape_end_state(buffer) {
		var data = buffer.char();
		if (isWhitespace(data) || data === '/' || data === '>') {
			tokenizer._emitToken({type: 'Characters', data: data});
			if (this._temporaryBuffer.toLowerCase() === 'script')
				tokenizer.setState(script_data_escaped_state);
			else
				tokenizer.setState(script_data_double_escaped_state);
		} else if (isAlpha(data)) {
			tokenizer._emitToken({type: 'Characters', data: data});
			this._temporaryBuffer += data;
			buffer.commit();
		} else {
			buffer.unget(data);
			tokenizer.setState(script_data_double_escaped_state);
		}
		return true;
	}

	function tag_open_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("bare-less-than-sign-at-eof");
			tokenizer._emitToken({type: 'Characters', data: '<'});
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (isAlpha(data)) {
			tokenizer._currentToken = {type: 'StartTag', name: data.toLowerCase(), data: []};
			tokenizer.setState(tag_name_state);
		} else if (data === '!') {
			tokenizer.setState(markup_declaration_open_state);
		} else if (data === '/') {
			tokenizer.setState(close_tag_open_state);
		} else if (data === '>') {
			tokenizer._parseError("expected-tag-name-but-got-right-bracket");
			tokenizer._emitToken({type: 'Characters', data: "<>"});
			tokenizer.setState(data_state);
		} else if (data === '?') {
			tokenizer._parseError("expected-tag-name-but-got-question-mark");
			buffer.unget(data);
			tokenizer.setState(bogus_comment_state);
		} else {
			tokenizer._parseError("expected-tag-name");
			tokenizer._emitToken({type: 'Characters', data: "<"});
			buffer.unget(data);
			tokenizer.setState(data_state);
		}
		return true;
	}

	function close_tag_open_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("expected-closing-tag-but-got-eof");
			tokenizer._emitToken({type: 'Characters', data: '</'});
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (isAlpha(data)) {
			tokenizer._currentToken = {type: 'EndTag', name: data.toLowerCase(), data: []};
			tokenizer.setState(tag_name_state);
		} else if (data === '>') {
			tokenizer._parseError("expected-closing-tag-but-got-right-bracket");
			tokenizer.setState(data_state);
		} else {
			tokenizer._parseError("expected-closing-tag-but-got-char", {data: data}); // param 1 is datavars:
			buffer.unget(data);
			tokenizer.setState(bogus_comment_state);
		}
		return true;
	}

	function tag_name_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError('eof-in-tag-name');
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (isWhitespace(data)) {
			tokenizer.setState(before_attribute_name_state);
		} else if (isAlpha(data)) {
			tokenizer._currentToken.name += data.toLowerCase();
		} else if (data === '>') {
			tokenizer._emitCurrentToken();
		} else if (data === '/') {
			tokenizer.setState(self_closing_tag_state);
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._currentToken.name += "\uFFFD";
		} else {
			tokenizer._currentToken.name += data;
		}
		buffer.commit();

		return true;
	}

	function before_attribute_name_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("expected-attribute-name-but-got-eof");
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (isWhitespace(data)) {
			return true;
		} else if (isAlpha(data)) {
			tokenizer._currentToken.data.push({nodeName: data.toLowerCase(), nodeValue: ""});
			tokenizer.setState(attribute_name_state);
		} else if (data === '>') {
			tokenizer._emitCurrentToken();
		} else if (data === '/') {
			tokenizer.setState(self_closing_tag_state);
		} else if (data === "'" || data === '"' || data === '=' || data === '<') {
			tokenizer._parseError("invalid-character-in-attribute-name");
			tokenizer._currentToken.data.push({nodeName: data, nodeValue: ""});
			tokenizer.setState(attribute_name_state);
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._currentToken.data.push({nodeName: "\uFFFD", nodeValue: ""});
		} else {
			tokenizer._currentToken.data.push({nodeName: data, nodeValue: ""});
			tokenizer.setState(attribute_name_state);
		}
		return true;
	}

	function attribute_name_state(buffer) {
		var data = buffer.char();
		var leavingThisState = true;
		var shouldEmit = false;
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-attribute-name");
			buffer.unget(data);
			tokenizer.setState(data_state);
			shouldEmit = true;
		} else if (data === '=') {
			tokenizer.setState(before_attribute_value_state);
		} else if (isAlpha(data)) {
			tokenizer._currentAttribute().nodeName += data.toLowerCase();
			leavingThisState = false;
		} else if (data === '>') {
			shouldEmit = true;
		} else if (isWhitespace(data)) {
			tokenizer.setState(after_attribute_name_state);
		} else if (data === '/') {
			tokenizer.setState(self_closing_tag_state);
		} else if (data === "'" || data === '"') {
			tokenizer._parseError("invalid-character-in-attribute-name");
			tokenizer._currentAttribute().nodeName += data;
			leavingThisState = false;
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._currentAttribute().nodeName += "\uFFFD";
		} else {
			tokenizer._currentAttribute().nodeName += data;
			leavingThisState = false;
		}

		if (leavingThisState) {
			var attributes = tokenizer._currentToken.data;
			var currentAttribute = attributes[attributes.length - 1];
			for (var i = attributes.length - 2; i >= 0; i--) {
				if (currentAttribute.nodeName === attributes[i].nodeName) {
					tokenizer._parseError("duplicate-attribute", {name: currentAttribute.nodeName});
					currentAttribute.nodeName = null;
					break;
				}
			}
			if (shouldEmit)
				tokenizer._emitCurrentToken();
		} else {
			buffer.commit();
		}
		return true;
	}

	function after_attribute_name_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("expected-end-of-tag-but-got-eof");
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (isWhitespace(data)) {
			return true;
		} else if (data === '=') {
			tokenizer.setState(before_attribute_value_state);
		} else if (data === '>') {
			tokenizer._emitCurrentToken();
		} else if (isAlpha(data)) {
			tokenizer._currentToken.data.push({nodeName: data, nodeValue: ""});
			tokenizer.setState(attribute_name_state);
		} else if (data === '/') {
			tokenizer.setState(self_closing_tag_state);
		} else if (data === "'" || data === '"' || data === '<') {
			tokenizer._parseError("invalid-character-after-attribute-name");
			tokenizer._currentToken.data.push({nodeName: data, nodeValue: ""});
			tokenizer.setState(attribute_name_state);
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._currentToken.data.push({nodeName: "\uFFFD", nodeValue: ""});
		} else {
			tokenizer._currentToken.data.push({nodeName: data, nodeValue: ""});
			tokenizer.setState(attribute_name_state);
		}
		return true;
	}

	function before_attribute_value_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("expected-attribute-value-but-got-eof");
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (isWhitespace(data)) {
			return true;
		} else if (data === '"') {
			tokenizer.setState(attribute_value_double_quoted_state);
		} else if (data === '&') {
			tokenizer.setState(attribute_value_unquoted_state);
			buffer.unget(data);
		} else if (data === "'") {
			tokenizer.setState(attribute_value_single_quoted_state);
		} else if (data === '>') {
			tokenizer._parseError("expected-attribute-value-but-got-right-bracket");
			tokenizer._emitCurrentToken();
		} else if (data === '=' || data === '<' || data === '`') {
			tokenizer._parseError("unexpected-character-in-unquoted-attribute-value");
			tokenizer._currentAttribute().nodeValue += data;
			tokenizer.setState(attribute_value_unquoted_state);
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._currentAttribute().nodeValue += "\uFFFD";
		} else {
			tokenizer._currentAttribute().nodeValue += data;
			tokenizer.setState(attribute_value_unquoted_state);
		}

		return true;
	}

	function attribute_value_double_quoted_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-attribute-value-double-quote");
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '"') {
			tokenizer.setState(after_attribute_value_state);
		} else if (data === '&') {
			this._additionalAllowedCharacter = '"';
			tokenizer.setState(character_reference_in_attribute_value_state);
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._currentAttribute().nodeValue += "\uFFFD";
		} else {
			var s = buffer.matchUntil('[\0"&]');
			data = data + s;
			tokenizer._currentAttribute().nodeValue += data;
		}
		return true;
	}

	function attribute_value_single_quoted_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-attribute-value-single-quote");
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === "'") {
			tokenizer.setState(after_attribute_value_state);
		} else if (data === '&') {
			this._additionalAllowedCharacter = "'";
			tokenizer.setState(character_reference_in_attribute_value_state);
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._currentAttribute().nodeValue += "\uFFFD";
		} else {
			tokenizer._currentAttribute().nodeValue += data + buffer.matchUntil("\u0000|['&]");
		}
		return true;
	}

	function attribute_value_unquoted_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-after-attribute-value");
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (isWhitespace(data)) {
			tokenizer.setState(before_attribute_name_state);
		} else if (data === '&') {
			this._additionalAllowedCharacter = ">";
			tokenizer.setState(character_reference_in_attribute_value_state);
		} else if (data === '>') {
			tokenizer._emitCurrentToken();
		} else if (data === '"' || data === "'" || data === '=' || data === '`' || data === '<') {
			tokenizer._parseError("unexpected-character-in-unquoted-attribute-value");
			tokenizer._currentAttribute().nodeValue += data;
			buffer.commit();
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._currentAttribute().nodeValue += "\uFFFD";
		} else {
			var o = buffer.matchUntil("\u0000|["+ "\t\n\v\f\x20\r" + "&<>\"'=`" +"]");
			if (o === InputStream.EOF) {
				tokenizer._parseError("eof-in-attribute-value-no-quotes");
				tokenizer._emitCurrentToken();
			}
			buffer.commit();
			tokenizer._currentAttribute().nodeValue += data + o;
		}
		return true;
	}

	function character_reference_in_attribute_value_state(buffer) {
		var character = EntityParser.consumeEntity(buffer, tokenizer, this._additionalAllowedCharacter);
		this._currentAttribute().nodeValue += character || '&';
		if (this._additionalAllowedCharacter === '"')
			tokenizer.setState(attribute_value_double_quoted_state);
		else if (this._additionalAllowedCharacter === '\'')
			tokenizer.setState(attribute_value_single_quoted_state);
		else if (this._additionalAllowedCharacter === '>')
			tokenizer.setState(attribute_value_unquoted_state);
		return true;
	}

	function after_attribute_value_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-after-attribute-value");
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (isWhitespace(data)) {
			tokenizer.setState(before_attribute_name_state);
		} else if (data === '>') {
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else if (data === '/') {
			tokenizer.setState(self_closing_tag_state);
		} else {
			tokenizer._parseError("unexpected-character-after-attribute-value");
			buffer.unget(data);
			tokenizer.setState(before_attribute_name_state);
		}
		return true;
	}

	function self_closing_tag_state(buffer) {
		var c = buffer.char();
		if (c === InputStream.EOF) {
			tokenizer._parseError("unexpected-eof-after-solidus-in-tag");
			buffer.unget(c);
			tokenizer.setState(data_state);
		} else if (c === '>') {
			tokenizer._currentToken.selfClosing = true;
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else {
			tokenizer._parseError("unexpected-character-after-solidus-in-tag");
			buffer.unget(c);
			tokenizer.setState(before_attribute_name_state);
		}
		return true;
	}

	function bogus_comment_state(buffer) {
		var data = buffer.matchUntil('>');
		data = data.replace(/\u0000/g, "\uFFFD");
		buffer.char();
		tokenizer._emitToken({type: 'Comment', data: data});
		tokenizer.setState(data_state);
		return true;
	}

	function markup_declaration_open_state(buffer) {
		var chars = buffer.shift(2);
		if (chars === '--') {
			tokenizer._currentToken = {type: 'Comment', data: ''};
			tokenizer.setState(comment_start_state);
		} else {
			var newchars = buffer.shift(5);
			if (newchars === InputStream.EOF || chars === InputStream.EOF) {
				tokenizer._parseError("expected-dashes-or-doctype");
				tokenizer.setState(bogus_comment_state);
				buffer.unget(chars);
				return true;
			}

			chars += newchars;
			if (chars.toUpperCase() === 'DOCTYPE') {
				tokenizer._currentToken = {type: 'Doctype', name: '', publicId: null, systemId: null, forceQuirks: false};
				tokenizer.setState(doctype_state);
			} else if (tokenizer._tokenHandler.isCdataSectionAllowed() && chars === '[CDATA[') {
				tokenizer.setState(cdata_section_state);
			} else {
				tokenizer._parseError("expected-dashes-or-doctype");
				buffer.unget(chars);
				tokenizer.setState(bogus_comment_state);
			}
		}
		return true;
	}

	function cdata_section_state(buffer) {
		var data = buffer.matchUntil(']]>');
		buffer.shift(3);
		if (data) {
			tokenizer._emitToken({type: 'Characters', data: data});
		}
		tokenizer.setState(data_state);
		return true;
	}

	function comment_start_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-comment");
			tokenizer._emitToken(tokenizer._currentToken);
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '-') {
			tokenizer.setState(comment_start_dash_state);
		} else if (data === '>') {
			tokenizer._parseError("incorrect-comment");
			tokenizer._emitToken(tokenizer._currentToken);
			tokenizer.setState(data_state);
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._currentToken.data += "\uFFFD";
		} else {
			tokenizer._currentToken.data += data;
			tokenizer.setState(comment_state);
		}
		return true;
	}

	function comment_start_dash_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-comment");
			tokenizer._emitToken(tokenizer._currentToken);
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '-') {
			tokenizer.setState(comment_end_state);
		} else if (data === '>') {
			tokenizer._parseError("incorrect-comment");
			tokenizer._emitToken(tokenizer._currentToken);
			tokenizer.setState(data_state);
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._currentToken.data += "\uFFFD";
		} else {
			tokenizer._currentToken.data += '-' + data;
			tokenizer.setState(comment_state);
		}
		return true;
	}

	function comment_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-comment");
			tokenizer._emitToken(tokenizer._currentToken);
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '-') {
			tokenizer.setState(comment_end_dash_state);
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._currentToken.data += "\uFFFD";
		} else {
			tokenizer._currentToken.data += data;
			buffer.commit();
		}
		return true;
	}

	function comment_end_dash_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-comment-end-dash");
			tokenizer._emitToken(tokenizer._currentToken);
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '-') {
			tokenizer.setState(comment_end_state);
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._currentToken.data += "-\uFFFD";
			tokenizer.setState(comment_state);
		} else {
			tokenizer._currentToken.data += '-' + data + buffer.matchUntil('\u0000|-');
			buffer.char();
		}
		return true;
	}

	function comment_end_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-comment-double-dash");
			tokenizer._emitToken(tokenizer._currentToken);
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '>') {
			tokenizer._emitToken(tokenizer._currentToken);
			tokenizer.setState(data_state);
		} else if (data === '!') {
			tokenizer._parseError("unexpected-bang-after-double-dash-in-comment");
			tokenizer.setState(comment_end_bang_state);
		} else if (data === '-') {
			tokenizer._parseError("unexpected-dash-after-double-dash-in-comment");
			tokenizer._currentToken.data += data;
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._currentToken.data += "--\uFFFD";
			tokenizer.setState(comment_state);
		} else {
			tokenizer._parseError("unexpected-char-in-comment");
			tokenizer._currentToken.data += '--' + data;
			tokenizer.setState(comment_state);
		}
		return true;
	}

	function comment_end_bang_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-comment-end-bang-state");
			tokenizer._emitToken(tokenizer._currentToken);
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '>') {
			tokenizer._emitToken(tokenizer._currentToken);
			tokenizer.setState(data_state);
		} else if (data === '-') {
			tokenizer._currentToken.data += '--!';
			tokenizer.setState(comment_end_dash_state);
		} else {
			tokenizer._currentToken.data += '--!' + data;
			tokenizer.setState(comment_state);
		}
		return true;
	}

	function doctype_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("expected-doctype-name-but-got-eof");
			tokenizer._currentToken.forceQuirks = true;
			buffer.unget(data);
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else if (isWhitespace(data)) {
			tokenizer.setState(before_doctype_name_state);
		} else {
			tokenizer._parseError("need-space-after-doctype");
			buffer.unget(data);
			tokenizer.setState(before_doctype_name_state);
		}
		return true;
	}

	function before_doctype_name_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("expected-doctype-name-but-got-eof");
			tokenizer._currentToken.forceQuirks = true;
			buffer.unget(data);
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else if (isWhitespace(data)) {
		} else if (data === '>') {
			tokenizer._parseError("expected-doctype-name-but-got-right-bracket");
			tokenizer._currentToken.forceQuirks = true;
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else {
			if (isAlpha(data))
				data = data.toLowerCase();
			tokenizer._currentToken.name = data;
			tokenizer.setState(doctype_name_state);
		}
		return true;
	}

	function doctype_name_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._currentToken.forceQuirks = true;
			buffer.unget(data);
			tokenizer._parseError("eof-in-doctype-name");
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else if (isWhitespace(data)) {
			tokenizer.setState(after_doctype_name_state);
		} else if (data === '>') {
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else {
			if (isAlpha(data))
				data = data.toLowerCase();
			tokenizer._currentToken.name += data;
			buffer.commit();
		}
		return true;
	}

	function after_doctype_name_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._currentToken.forceQuirks = true;
			buffer.unget(data);
			tokenizer._parseError("eof-in-doctype");
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else if (isWhitespace(data)) {
		} else if (data === '>') {
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else {
			if (['p', 'P'].indexOf(data) > -1) {
				var expected = [['u', 'U'], ['b', 'B'], ['l', 'L'], ['i', 'I'], ['c', 'C']];
				var matched = expected.every(function(expected){
					data = buffer.char();
					return expected.indexOf(data) > -1;
				});
				if (matched) {
					tokenizer.setState(after_doctype_public_keyword_state);
					return true;
				}
			} else if (['s', 'S'].indexOf(data) > -1) {
				var expected = [['y', 'Y'], ['s', 'S'], ['t', 'T'], ['e', 'E'], ['m', 'M']];
				var matched = expected.every(function(expected){
					data = buffer.char();
					return expected.indexOf(data) > -1;
				});
				if (matched) {
					tokenizer.setState(after_doctype_system_keyword_state);
					return true;
				}
			}
			buffer.unget(data);
			tokenizer._currentToken.forceQuirks = true;

			if (data === InputStream.EOF) {
				tokenizer._parseError("eof-in-doctype");
				buffer.unget(data);
				tokenizer.setState(data_state);
				tokenizer._emitCurrentToken();
			} else {
				tokenizer._parseError("expected-space-or-right-bracket-in-doctype", {data: data});
				tokenizer.setState(bogus_doctype_state);
			}
		}
		return true;
	}

	function after_doctype_public_keyword_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-doctype");
			tokenizer._currentToken.forceQuirks = true;
			buffer.unget(data);
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else if (isWhitespace(data)) {
			tokenizer.setState(before_doctype_public_identifier_state);
		} else if (data === "'" || data === '"') {
			tokenizer._parseError("unexpected-char-in-doctype");
			buffer.unget(data);
			tokenizer.setState(before_doctype_public_identifier_state);
		} else {
			buffer.unget(data);
			tokenizer.setState(before_doctype_public_identifier_state);
		}
		return true;
	}

	function before_doctype_public_identifier_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-doctype");
			tokenizer._currentToken.forceQuirks = true;
			buffer.unget(data);
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else if (isWhitespace(data)) {
		} else if (data === '"') {
			tokenizer._currentToken.publicId = '';
			tokenizer.setState(doctype_public_identifier_double_quoted_state);
		} else if (data === "'") {
			tokenizer._currentToken.publicId = '';
			tokenizer.setState(doctype_public_identifier_single_quoted_state);
		} else if (data === '>') {
			tokenizer._parseError("unexpected-end-of-doctype");
			tokenizer._currentToken.forceQuirks = true;
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else {
			tokenizer._parseError("unexpected-char-in-doctype");
			tokenizer._currentToken.forceQuirks = true;
			tokenizer.setState(bogus_doctype_state);
		}
		return true;
	}

	function doctype_public_identifier_double_quoted_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-doctype");
			tokenizer._currentToken.forceQuirks = true;
			buffer.unget(data);
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else if (data === '"') {
			tokenizer.setState(after_doctype_public_identifier_state);
		} else if (data === '>') {
			tokenizer._parseError("unexpected-end-of-doctype");
			tokenizer._currentToken.forceQuirks = true;
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else {
			tokenizer._currentToken.publicId += data;
		}
		return true;
	}

	function doctype_public_identifier_single_quoted_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-doctype");
			tokenizer._currentToken.forceQuirks = true;
			buffer.unget(data);
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else if (data === "'") {
			tokenizer.setState(after_doctype_public_identifier_state);
		} else if (data === '>') {
			tokenizer._parseError("unexpected-end-of-doctype");
			tokenizer._currentToken.forceQuirks = true;
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else {
			tokenizer._currentToken.publicId += data;
		}
		return true;
	}

	function after_doctype_public_identifier_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-doctype");
			tokenizer._currentToken.forceQuirks = true;
			tokenizer._emitCurrentToken();
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (isWhitespace(data)) {
			tokenizer.setState(between_doctype_public_and_system_identifiers_state);
		} else if (data === '>') {
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else if (data === '"') {
			tokenizer._parseError("unexpected-char-in-doctype");
			tokenizer._currentToken.systemId = '';
			tokenizer.setState(doctype_system_identifier_double_quoted_state);
		} else if (data === "'") {
			tokenizer._parseError("unexpected-char-in-doctype");
			tokenizer._currentToken.systemId = '';
			tokenizer.setState(doctype_system_identifier_single_quoted_state);
		} else {
			tokenizer._parseError("unexpected-char-in-doctype");
			tokenizer._currentToken.forceQuirks = true;
			tokenizer.setState(bogus_doctype_state);
		}
		return true;
	}

	function between_doctype_public_and_system_identifiers_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-doctype");
			tokenizer._currentToken.forceQuirks = true;
			tokenizer._emitCurrentToken();
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (isWhitespace(data)) {
		} else if (data === '>') {
			tokenizer._emitCurrentToken();
			tokenizer.setState(data_state);
		} else if (data === '"') {
			tokenizer._currentToken.systemId = '';
			tokenizer.setState(doctype_system_identifier_double_quoted_state);
		} else if (data === "'") {
			tokenizer._currentToken.systemId = '';
			tokenizer.setState(doctype_system_identifier_single_quoted_state);
		} else {
			tokenizer._parseError("unexpected-char-in-doctype");
			tokenizer._currentToken.forceQuirks = true;
			tokenizer.setState(bogus_doctype_state);
		}
		return true;
	}

	function after_doctype_system_keyword_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-doctype");
			tokenizer._currentToken.forceQuirks = true;
			tokenizer._emitCurrentToken();
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (isWhitespace(data)) {
			tokenizer.setState(before_doctype_system_identifier_state);
		} else if (data === "'" || data === '"') {
			tokenizer._parseError("unexpected-char-in-doctype");
			buffer.unget(data);
			tokenizer.setState(before_doctype_system_identifier_state);
		} else {
			buffer.unget(data);
			tokenizer.setState(before_doctype_system_identifier_state);
		}
		return true;
	}

	function before_doctype_system_identifier_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-doctype");
			tokenizer._currentToken.forceQuirks = true;
			tokenizer._emitCurrentToken();
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (isWhitespace(data)) {
		} else if (data === '"') {
			tokenizer._currentToken.systemId = '';
			tokenizer.setState(doctype_system_identifier_double_quoted_state);
		} else if (data === "'") {
			tokenizer._currentToken.systemId = '';
			tokenizer.setState(doctype_system_identifier_single_quoted_state);
		} else if (data === '>') {
			tokenizer._parseError("unexpected-end-of-doctype");
			tokenizer._currentToken.forceQuirks = true;
			tokenizer._emitCurrentToken();
			tokenizer.setState(data_state);
		} else {
			tokenizer._parseError("unexpected-char-in-doctype");
			tokenizer._currentToken.forceQuirks = true;
			tokenizer.setState(bogus_doctype_state);
		}
		return true;
	}

	function doctype_system_identifier_double_quoted_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-doctype");
			tokenizer._currentToken.forceQuirks = true;
			tokenizer._emitCurrentToken();
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '"') {
			tokenizer.setState(after_doctype_system_identifier_state);
		} else if (data === '>') {
			tokenizer._parseError("unexpected-end-of-doctype");
			tokenizer._currentToken.forceQuirks = true;
			tokenizer._emitCurrentToken();
			tokenizer.setState(data_state);
		} else {
			tokenizer._currentToken.systemId += data;
		}
		return true;
	}

	function doctype_system_identifier_single_quoted_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-doctype");
			tokenizer._currentToken.forceQuirks = true;
			tokenizer._emitCurrentToken();
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === "'") {
			tokenizer.setState(after_doctype_system_identifier_state);
		} else if (data === '>') {
			tokenizer._parseError("unexpected-end-of-doctype");
			tokenizer._currentToken.forceQuirks = true;
			tokenizer._emitCurrentToken();
			tokenizer.setState(data_state);
		} else {
			tokenizer._currentToken.systemId += data;
		}
		return true;
	}

	function after_doctype_system_identifier_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("eof-in-doctype");
			tokenizer._currentToken.forceQuirks = true;
			tokenizer._emitCurrentToken();
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (isWhitespace(data)) {
		} else if (data === '>') {
			tokenizer._emitCurrentToken();
			tokenizer.setState(data_state);
		} else {
			tokenizer._parseError("unexpected-char-in-doctype");
			tokenizer.setState(bogus_doctype_state);
		}
		return true;
	}

	function bogus_doctype_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			buffer.unget(data);
			tokenizer._emitCurrentToken();
			tokenizer.setState(data_state);
		} else if (data === '>') {
			tokenizer._emitCurrentToken();
			tokenizer.setState(data_state);
		}
		return true;
	}
};

Object.defineProperty(Tokenizer.prototype, 'lineNumber', {
	get: function() {
		return this._inputStream.location().line;
	}
});

Object.defineProperty(Tokenizer.prototype, 'columnNumber', {
	get: function() {
		return this._inputStream.location().column;
	}
});

exports.Tokenizer = Tokenizer;

},
{"./EntityParser":2,"./InputStream":3}],
6:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

var messages = _dereq_('./messages.json');
var constants = _dereq_('./constants');

var EventEmitter = _dereq_('events').EventEmitter;

var Tokenizer = _dereq_('./Tokenizer').Tokenizer;
var ElementStack = _dereq_('./ElementStack').ElementStack;
var StackItem = _dereq_('./StackItem').StackItem;

var Marker = {};

function isWhitespace(ch) {
	return ch === " " || ch === "\n" || ch === "\t" || ch === "\r" || ch === "\f";
}

function isWhitespaceOrReplacementCharacter(ch) {
	return isWhitespace(ch) || ch === '\uFFFD';
}

function isAllWhitespace(characters) {
	for (var i = 0; i < characters.length; i++) {
		var ch = characters[i];
		if (!isWhitespace(ch))
			return false;
	}
	return true;
}

function isAllWhitespaceOrReplacementCharacters(characters) {
	for (var i = 0; i < characters.length; i++) {
		var ch = characters[i];
		if (!isWhitespaceOrReplacementCharacter(ch))
			return false;
	}
	return true;
}

function getAttribute(node, name) {
	for (var i = 0; i < node.attributes.length; i++) {
		var attribute = node.attributes[i];
		if (attribute.nodeName === name) {
			return attribute;
		}
	}
	return null;
}

function CharacterBuffer(characters) {
	this.characters = characters;
	this.current = 0;
	this.end = this.characters.length;
}

CharacterBuffer.prototype.skipAtMostOneLeadingNewline = function() {
	if (this.characters[this.current] === '\n')
		this.current++;
};

CharacterBuffer.prototype.skipLeadingWhitespace = function() {
	while (isWhitespace(this.characters[this.current])) {
		if (++this.current == this.end)
			return;
	}
};

CharacterBuffer.prototype.skipLeadingNonWhitespace = function() {
	while (!isWhitespace(this.characters[this.current])) {
		if (++this.current == this.end)
			return;
	}
};

CharacterBuffer.prototype.takeRemaining = function() {
	return this.characters.substring(this.current);
};

CharacterBuffer.prototype.takeLeadingWhitespace = function() {
	var start = this.current;
	this.skipLeadingWhitespace();
	if (start === this.current)
		return "";
	return this.characters.substring(start, this.current - start);
};

Object.defineProperty(CharacterBuffer.prototype, 'length', {
	get: function(){
		return this.end - this.current;
	}
});
function TreeBuilder() {
	this.tokenizer = null;
	this.errorHandler = null;
	this.scriptingEnabled = false;
	this.document = null;
	this.head = null;
	this.form = null;
	this.openElements = new ElementStack();
	this.activeFormattingElements = [];
	this.insertionMode = null;
	this.insertionModeName = "";
	this.originalInsertionMode = "";
	this.inQuirksMode = false; // TODO quirks mode
	this.compatMode = "no quirks";
	this.framesetOk = true;
	this.redirectAttachToFosterParent = false;
	this.selfClosingFlagAcknowledged = false;
	this.context = "";
	this.pendingTableCharacters = [];
	this.shouldSkipLeadingNewline = false;

	var tree = this;
	var modes = this.insertionModes = {};
	modes.base = {
		end_tag_handlers: {"-default": 'endTagOther'},
		start_tag_handlers: {"-default": 'startTagOther'},
		processEOF: function() {
			tree.generateImpliedEndTags();
			if (tree.openElements.length > 2) {
				tree.parseError('expected-closing-tag-but-got-eof');
			} else if (tree.openElements.length == 2 &&
				tree.openElements.item(1).localName != 'body') {
				tree.parseError('expected-closing-tag-but-got-eof');
			} else if (tree.context && tree.openElements.length > 1) {
			}
		},
		processComment: function(data) {
			tree.insertComment(data, tree.currentStackItem().node);
		},
		processDoctype: function(name, publicId, systemId, forceQuirks) {
			tree.parseError('unexpected-doctype');
		},
		processStartTag: function(name, attributes, selfClosing) {
			if (this[this.start_tag_handlers[name]]) {
				this[this.start_tag_handlers[name]](name, attributes, selfClosing);
			} else if (this[this.start_tag_handlers["-default"]]) {
				this[this.start_tag_handlers["-default"]](name, attributes, selfClosing);
			} else {
				throw(new Error("No handler found for "+name));
			}
		},
		processEndTag: function(name) {
			if (this[this.end_tag_handlers[name]]) {
				this[this.end_tag_handlers[name]](name);
			} else if (this[this.end_tag_handlers["-default"]]) {
				this[this.end_tag_handlers["-default"]](name);
			} else {
				throw(new Error("No handler found for "+name));
			}
		},
		startTagHtml: function(name, attributes) {
			modes.inBody.startTagHtml(name, attributes);
		}
	};

	modes.initial = Object.create(modes.base);

	modes.initial.processEOF = function() {
		tree.parseError("expected-doctype-but-got-eof");
		this.anythingElse();
		tree.insertionMode.processEOF();
	};

	modes.initial.processComment = function(data) {
		tree.insertComment(data, tree.document);
	};

	modes.initial.processDoctype = function(name, publicId, systemId, forceQuirks) {
		tree.insertDoctype(name || '', publicId || '', systemId || '');

		if (forceQuirks || name != 'html' || (publicId != null && ([
					"+//silmaril//dtd html pro v0r11 19970101//",
					"-//advasoft ltd//dtd html 3.0 aswedit + extensions//",
					"-//as//dtd html 3.0 aswedit + extensions//",
					"-//ietf//dtd html 2.0 level 1//",
					"-//ietf//dtd html 2.0 level 2//",
					"-//ietf//dtd html 2.0 strict level 1//",
					"-//ietf//dtd html 2.0 strict level 2//",
					"-//ietf//dtd html 2.0 strict//",
					"-//ietf//dtd html 2.0//",
					"-//ietf//dtd html 2.1e//",
					"-//ietf//dtd html 3.0//",
					"-//ietf//dtd html 3.0//",
					"-//ietf//dtd html 3.2 final//",
					"-//ietf//dtd html 3.2//",
					"-//ietf//dtd html 3//",
					"-//ietf//dtd html level 0//",
					"-//ietf//dtd html level 0//",
					"-//ietf//dtd html level 1//",
					"-//ietf//dtd html level 1//",
					"-//ietf//dtd html level 2//",
					"-//ietf//dtd html level 2//",
					"-//ietf//dtd html level 3//",
					"-//ietf//dtd html level 3//",
					"-//ietf//dtd html strict level 0//",
					"-//ietf//dtd html strict level 0//",
					"-//ietf//dtd html strict level 1//",
					"-//ietf//dtd html strict level 1//",
					"-//ietf//dtd html strict level 2//",
					"-//ietf//dtd html strict level 2//",
					"-//ietf//dtd html strict level 3//",
					"-//ietf//dtd html strict level 3//",
					"-//ietf//dtd html strict//",
					"-//ietf//dtd html strict//",
					"-//ietf//dtd html strict//",
					"-//ietf//dtd html//",
					"-//ietf//dtd html//",
					"-//ietf//dtd html//",
					"-//metrius//dtd metrius presentational//",
					"-//microsoft//dtd internet explorer 2.0 html strict//",
					"-//microsoft//dtd internet explorer 2.0 html//",
					"-//microsoft//dtd internet explorer 2.0 tables//",
					"-//microsoft//dtd internet explorer 3.0 html strict//",
					"-//microsoft//dtd internet explorer 3.0 html//",
					"-//microsoft//dtd internet explorer 3.0 tables//",
					"-//netscape comm. corp.//dtd html//",
					"-//netscape comm. corp.//dtd strict html//",
					"-//o'reilly and associates//dtd html 2.0//",
					"-//o'reilly and associates//dtd html extended 1.0//",
					"-//spyglass//dtd html 2.0 extended//",
					"-//sq//dtd html 2.0 hotmetal + extensions//",
					"-//sun microsystems corp.//dtd hotjava html//",
					"-//sun microsystems corp.//dtd hotjava strict html//",
					"-//w3c//dtd html 3 1995-03-24//",
					"-//w3c//dtd html 3.2 draft//",
					"-//w3c//dtd html 3.2 final//",
					"-//w3c//dtd html 3.2//",
					"-//w3c//dtd html 3.2s draft//",
					"-//w3c//dtd html 4.0 frameset//",
					"-//w3c//dtd html 4.0 transitional//",
					"-//w3c//dtd html experimental 19960712//",
					"-//w3c//dtd html experimental 970421//",
					"-//w3c//dtd w3 html//",
					"-//w3o//dtd w3 html 3.0//",
					"-//webtechs//dtd mozilla html 2.0//",
					"-//webtechs//dtd mozilla html//",
					"html"
				].some(publicIdStartsWith)
				|| [
					"-//w3o//dtd w3 html strict 3.0//en//",
					"-/w3c/dtd html 4.0 transitional/en",
					"html"
				].indexOf(publicId.toLowerCase()) > -1
				|| (systemId == null && [
					"-//w3c//dtd html 4.01 transitional//",
					"-//w3c//dtd html 4.01 frameset//"
				].some(publicIdStartsWith)))
			)
			|| (systemId != null && (systemId.toLowerCase() == "http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd"))
		) {
			tree.compatMode = "quirks";
			tree.parseError("quirky-doctype");
		} else if (publicId != null && ([
				"-//w3c//dtd xhtml 1.0 transitional//",
				"-//w3c//dtd xhtml 1.0 frameset//"
			].some(publicIdStartsWith)
			|| (systemId != null && [
				"-//w3c//dtd html 4.01 transitional//",
				"-//w3c//dtd html 4.01 frameset//"
			].indexOf(publicId.toLowerCase()) > -1))
		) {
			tree.compatMode = "limited quirks";
			tree.parseError("almost-standards-doctype");
		} else {
			if ((publicId == "-//W3C//DTD HTML 4.0//EN" && (systemId == null || systemId == "http://www.w3.org/TR/REC-html40/strict.dtd"))
				|| (publicId == "-//W3C//DTD HTML 4.01//EN" && (systemId == null || systemId == "http://www.w3.org/TR/html4/strict.dtd"))
				|| (publicId == "-//W3C//DTD XHTML 1.0 Strict//EN" && (systemId == "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"))
				|| (publicId == "-//W3C//DTD XHTML 1.1//EN" && (systemId == "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"))
			) {
			} else if (!((systemId == null || systemId == "about:legacy-compat") && publicId == null)) {
				tree.parseError("unknown-doctype");
			}
		}
		tree.setInsertionMode('beforeHTML');
		function publicIdStartsWith(string) {
			return publicId.toLowerCase().indexOf(string) === 0;
		}
	};

	modes.initial.processCharacters = function(buffer) {
		buffer.skipLeadingWhitespace();
		if (!buffer.length)
			return;
		tree.parseError('expected-doctype-but-got-chars');
		this.anythingElse();
		tree.insertionMode.processCharacters(buffer);
	};

	modes.initial.processStartTag = function(name, attributes, selfClosing) {
		tree.parseError('expected-doctype-but-got-start-tag', {name: name});
		this.anythingElse();
		tree.insertionMode.processStartTag(name, attributes, selfClosing);
	};

	modes.initial.processEndTag = function(name) {
		tree.parseError('expected-doctype-but-got-end-tag', {name: name});
		this.anythingElse();
		tree.insertionMode.processEndTag(name);
	};

	modes.initial.anythingElse = function() {
		tree.compatMode = 'quirks';
		tree.setInsertionMode('beforeHTML');
	};

	modes.beforeHTML = Object.create(modes.base);

	modes.beforeHTML.start_tag_handlers = {
		html: 'startTagHtml',
		'-default': 'startTagOther'
	};

	modes.beforeHTML.processEOF = function() {
		this.anythingElse();
		tree.insertionMode.processEOF();
	};

	modes.beforeHTML.processComment = function(data) {
		tree.insertComment(data, tree.document);
	};

	modes.beforeHTML.processCharacters = function(buffer) {
		buffer.skipLeadingWhitespace();
		if (!buffer.length)
			return;
		this.anythingElse();
		tree.insertionMode.processCharacters(buffer);
	};

	modes.beforeHTML.startTagHtml = function(name, attributes, selfClosing) {
		tree.insertHtmlElement(attributes);
		tree.setInsertionMode('beforeHead');
	};

	modes.beforeHTML.startTagOther = function(name, attributes, selfClosing) {
		this.anythingElse();
		tree.insertionMode.processStartTag(name, attributes, selfClosing);
	};

	modes.beforeHTML.processEndTag = function(name) {
		this.anythingElse();
		tree.insertionMode.processEndTag(name);
	};

	modes.beforeHTML.anythingElse = function() {
		tree.insertHtmlElement();
		tree.setInsertionMode('beforeHead');
	};

	modes.afterAfterBody = Object.create(modes.base);

	modes.afterAfterBody.start_tag_handlers = {
		html: 'startTagHtml',
		'-default': 'startTagOther'
	};

	modes.afterAfterBody.processComment = function(data) {
		tree.insertComment(data, tree.document);
	};

	modes.afterAfterBody.processDoctype = function(data) {
		modes.inBody.processDoctype(data);
	};

	modes.afterAfterBody.startTagHtml = function(data, attributes) {
		modes.inBody.startTagHtml(data, attributes);
	};

	modes.afterAfterBody.startTagOther = function(name, attributes, selfClosing) {
		tree.parseError('unexpected-start-tag', {name: name});
		tree.setInsertionMode('inBody');
		tree.insertionMode.processStartTag(name, attributes, selfClosing);
	};

	modes.afterAfterBody.endTagOther = function(name) {
		tree.parseError('unexpected-end-tag', {name: name});
		tree.setInsertionMode('inBody');
		tree.insertionMode.processEndTag(name);
	};

	modes.afterAfterBody.processCharacters = function(data) {
		if (!isAllWhitespace(data.characters)) {
			tree.parseError('unexpected-char-after-body');
			tree.setInsertionMode('inBody');
			return tree.insertionMode.processCharacters(data);
		}
		modes.inBody.processCharacters(data);
	};

	modes.afterBody = Object.create(modes.base);

	modes.afterBody.end_tag_handlers = {
		html: 'endTagHtml',
		'-default': 'endTagOther'
	};

	modes.afterBody.processComment = function(data) {
		tree.insertComment(data, tree.openElements.rootNode);
	};

	modes.afterBody.processCharacters = function(data) {
		if (!isAllWhitespace(data.characters)) {
			tree.parseError('unexpected-char-after-body');
			tree.setInsertionMode('inBody');
			return tree.insertionMode.processCharacters(data);
		}
		modes.inBody.processCharacters(data);
	};

	modes.afterBody.processStartTag = function(name, attributes, selfClosing) {
		tree.parseError('unexpected-start-tag-after-body', {name: name});
		tree.setInsertionMode('inBody');
		tree.insertionMode.processStartTag(name, attributes, selfClosing);
	};

	modes.afterBody.endTagHtml = function(name) {
		if (tree.context) {
			tree.parseError('end-html-in-innerhtml');
		} else {
			tree.setInsertionMode('afterAfterBody');
		}
	};

	modes.afterBody.endTagOther = function(name) {
		tree.parseError('unexpected-end-tag-after-body', {name: name});
		tree.setInsertionMode('inBody');
		tree.insertionMode.processEndTag(name);
	};

	modes.afterFrameset = Object.create(modes.base);

	modes.afterFrameset.start_tag_handlers = {
		html: 'startTagHtml',
		noframes: 'startTagNoframes',
		'-default': 'startTagOther'
	};

	modes.afterFrameset.end_tag_handlers = {
		html: 'endTagHtml',
		'-default': 'endTagOther'
	};

	modes.afterFrameset.processCharacters = function(buffer) {
		var characters = buffer.takeRemaining();
		var whitespace = "";
		for (var i = 0; i < characters.length; i++) {
			var ch = characters[i];
			if (isWhitespace(ch))
				whitespace += ch;
		}
		if (whitespace) {
			tree.insertText(whitespace);
		}
		if (whitespace.length < characters.length)
			tree.parseError('expected-eof-but-got-char');
	};

	modes.afterFrameset.startTagNoframes = function(name, attributes) {
		modes.inHead.processStartTag(name, attributes);
	};

	modes.afterFrameset.startTagOther = function(name, attributes) {
		tree.parseError("unexpected-start-tag-after-frameset", {name: name});
	};

	modes.afterFrameset.endTagHtml = function(name) {
		tree.setInsertionMode('afterAfterFrameset');
	};

	modes.afterFrameset.endTagOther = function(name) {
		tree.parseError("unexpected-end-tag-after-frameset", {name: name});
	};

	modes.beforeHead = Object.create(modes.base);

	modes.beforeHead.start_tag_handlers = {
		html: 'startTagHtml',
		head: 'startTagHead',
		'-default': 'startTagOther'
	};

	modes.beforeHead.end_tag_handlers = {
		html: 'endTagImplyHead',
		head: 'endTagImplyHead',
		body: 'endTagImplyHead',
		br: 'endTagImplyHead',
		'-default': 'endTagOther'
	};

	modes.beforeHead.processEOF = function() {
		this.startTagHead('head', []);
		tree.insertionMode.processEOF();
	};

	modes.beforeHead.processCharacters = function(buffer) {
		buffer.skipLeadingWhitespace();
		if (!buffer.length)
			return;
		this.startTagHead('head', []);
		tree.insertionMode.processCharacters(buffer);
	};

	modes.beforeHead.startTagHead = function(name, attributes) {
		tree.insertHeadElement(attributes);
		tree.setInsertionMode('inHead');
	};

	modes.beforeHead.startTagOther = function(name, attributes, selfClosing) {
		this.startTagHead('head', []);
		tree.insertionMode.processStartTag(name, attributes, selfClosing);
	};

	modes.beforeHead.endTagImplyHead = function(name) {
		this.startTagHead('head', []);
		tree.insertionMode.processEndTag(name);
	};

	modes.beforeHead.endTagOther = function(name) {
		tree.parseError('end-tag-after-implied-root', {name: name});
	};

	modes.inHead = Object.create(modes.base);

	modes.inHead.start_tag_handlers = {
		html: 'startTagHtml',
		head: 'startTagHead',
		title: 'startTagTitle',
		script: 'startTagScript',
		style: 'startTagNoFramesStyle',
		noscript: 'startTagNoScript',
		noframes: 'startTagNoFramesStyle',
		base: 'startTagBaseBasefontBgsoundLink',
		basefont: 'startTagBaseBasefontBgsoundLink',
		bgsound: 'startTagBaseBasefontBgsoundLink',
		link: 'startTagBaseBasefontBgsoundLink',
		meta: 'startTagMeta',
		"-default": 'startTagOther'
	};

	modes.inHead.end_tag_handlers = {
		head: 'endTagHead',
		html: 'endTagHtmlBodyBr',
		body: 'endTagHtmlBodyBr',
		br: 'endTagHtmlBodyBr',
		"-default": 'endTagOther'
	};

	modes.inHead.processEOF = function() {
		var name = tree.currentStackItem().localName;
		if (['title', 'style', 'script'].indexOf(name) != -1) {
			tree.parseError("expected-named-closing-tag-but-got-eof", {name: name});
			tree.popElement();
		}

		this.anythingElse();

		tree.insertionMode.processEOF();
	};

	modes.inHead.processCharacters = function(buffer) {
		var leadingWhitespace = buffer.takeLeadingWhitespace();
		if (leadingWhitespace)
			tree.insertText(leadingWhitespace);
		if (!buffer.length)
			return;
		this.anythingElse();
		tree.insertionMode.processCharacters(buffer);
	};

	modes.inHead.startTagHtml = function(name, attributes) {
		modes.inBody.processStartTag(name, attributes);
	};

	modes.inHead.startTagHead = function(name, attributes) {
		tree.parseError('two-heads-are-not-better-than-one');
	};

	modes.inHead.startTagTitle = function(name, attributes) {
		tree.processGenericRCDATAStartTag(name, attributes);
	};

	modes.inHead.startTagNoScript = function(name, attributes) {
		if (tree.scriptingEnabled)
			return tree.processGenericRawTextStartTag(name, attributes);
		tree.insertElement(name, attributes);
		tree.setInsertionMode('inHeadNoscript');
	};

	modes.inHead.startTagNoFramesStyle = function(name, attributes) {
		tree.processGenericRawTextStartTag(name, attributes);
	};

	modes.inHead.startTagScript = function(name, attributes) {
		tree.insertElement(name, attributes);
		tree.tokenizer.setState(Tokenizer.SCRIPT_DATA);
		tree.originalInsertionMode = tree.insertionModeName;
		tree.setInsertionMode('text');
	};

	modes.inHead.startTagBaseBasefontBgsoundLink = function(name, attributes) {
		tree.insertSelfClosingElement(name, attributes);
	};

	modes.inHead.startTagMeta = function(name, attributes) {
		tree.insertSelfClosingElement(name, attributes);
	};

	modes.inHead.startTagOther = function(name, attributes, selfClosing) {
		this.anythingElse();
		tree.insertionMode.processStartTag(name, attributes, selfClosing);
	};

	modes.inHead.endTagHead = function(name) {
		if (tree.openElements.item(tree.openElements.length - 1).localName == 'head') {
			tree.openElements.pop();
		} else {
			tree.parseError('unexpected-end-tag', {name: 'head'});
		}
		tree.setInsertionMode('afterHead');
	};

	modes.inHead.endTagHtmlBodyBr = function(name) {
		this.anythingElse();
		tree.insertionMode.processEndTag(name);
	};

	modes.inHead.endTagOther = function(name) {
		tree.parseError('unexpected-end-tag', {name: name});
	};

	modes.inHead.anythingElse = function() {
		this.endTagHead('head');
	};

	modes.afterHead = Object.create(modes.base);

	modes.afterHead.start_tag_handlers = {
		html: 'startTagHtml',
		head: 'startTagHead',
		body: 'startTagBody',
		frameset: 'startTagFrameset',
		base: 'startTagFromHead',
		link: 'startTagFromHead',
		meta: 'startTagFromHead',
		script: 'startTagFromHead',
		style: 'startTagFromHead',
		title: 'startTagFromHead',
		"-default": 'startTagOther'
	};

	modes.afterHead.end_tag_handlers = {
		body: 'endTagBodyHtmlBr',
		html: 'endTagBodyHtmlBr',
		br: 'endTagBodyHtmlBr',
		"-default": 'endTagOther'
	};

	modes.afterHead.processEOF = function() {
		this.anythingElse();
		tree.insertionMode.processEOF();
	};

	modes.afterHead.processCharacters = function(buffer) {
		var leadingWhitespace = buffer.takeLeadingWhitespace();
		if (leadingWhitespace)
			tree.insertText(leadingWhitespace);
		if (!buffer.length)
			return;
		this.anythingElse();
		tree.insertionMode.processCharacters(buffer);
	};

	modes.afterHead.startTagHtml = function(name, attributes) {
		modes.inBody.processStartTag(name, attributes);
	};

	modes.afterHead.startTagBody = function(name, attributes) {
		tree.framesetOk = false;
		tree.insertBodyElement(attributes);
		tree.setInsertionMode('inBody');
	};

	modes.afterHead.startTagFrameset = function(name, attributes) {
		tree.insertElement(name, attributes);
		tree.setInsertionMode('inFrameset');
	};

	modes.afterHead.startTagFromHead = function(name, attributes, selfClosing) {
		tree.parseError("unexpected-start-tag-out-of-my-head", {name: name});
		tree.openElements.push(tree.head);
		modes.inHead.processStartTag(name, attributes, selfClosing);
		tree.openElements.remove(tree.head);
	};

	modes.afterHead.startTagHead = function(name, attributes, selfClosing) {
		tree.parseError('unexpected-start-tag', {name: name});
	};

	modes.afterHead.startTagOther = function(name, attributes, selfClosing) {
		this.anythingElse();
		tree.insertionMode.processStartTag(name, attributes, selfClosing);
	};

	modes.afterHead.endTagBodyHtmlBr = function(name) {
		this.anythingElse();
		tree.insertionMode.processEndTag(name);
	};

	modes.afterHead.endTagOther = function(name) {
		tree.parseError('unexpected-end-tag', {name: name});
	};

	modes.afterHead.anythingElse = function() {
		tree.insertBodyElement([]);
		tree.setInsertionMode('inBody');
		tree.framesetOk = true;
	}

	modes.inBody = Object.create(modes.base);

	modes.inBody.start_tag_handlers = {
		html: 'startTagHtml',
		head: 'startTagMisplaced',
		base: 'startTagProcessInHead',
		basefont: 'startTagProcessInHead',
		bgsound: 'startTagProcessInHead',
		link: 'startTagProcessInHead',
		meta: 'startTagProcessInHead',
		noframes: 'startTagProcessInHead',
		script: 'startTagProcessInHead',
		style: 'startTagProcessInHead',
		title: 'startTagProcessInHead',
		body: 'startTagBody',
		form: 'startTagForm',
		plaintext: 'startTagPlaintext',
		a: 'startTagA',
		button: 'startTagButton',
		xmp: 'startTagXmp',
		table: 'startTagTable',
		hr: 'startTagHr',
		image: 'startTagImage',
		input: 'startTagInput',
		textarea: 'startTagTextarea',
		select: 'startTagSelect',
		isindex: 'startTagIsindex',
		applet:	'startTagAppletMarqueeObject',
		marquee:	'startTagAppletMarqueeObject',
		object:	'startTagAppletMarqueeObject',
		li: 'startTagListItem',
		dd: 'startTagListItem',
		dt: 'startTagListItem',
		address: 'startTagCloseP',
		article: 'startTagCloseP',
		aside: 'startTagCloseP',
		blockquote: 'startTagCloseP',
		center: 'startTagCloseP',
		details: 'startTagCloseP',
		dir: 'startTagCloseP',
		div: 'startTagCloseP',
		dl: 'startTagCloseP',
		fieldset: 'startTagCloseP',
		figcaption: 'startTagCloseP',
		figure: 'startTagCloseP',
		footer: 'startTagCloseP',
		header: 'startTagCloseP',
		hgroup: 'startTagCloseP',
		main: 'startTagCloseP',
		menu: 'startTagCloseP',
		nav: 'startTagCloseP',
		ol: 'startTagCloseP',
		p: 'startTagCloseP',
		section: 'startTagCloseP',
		summary: 'startTagCloseP',
		ul: 'startTagCloseP',
		listing: 'startTagPreListing',
		pre: 'startTagPreListing',
		b: 'startTagFormatting',
		big: 'startTagFormatting',
		code: 'startTagFormatting',
		em: 'startTagFormatting',
		font: 'startTagFormatting',
		i: 'startTagFormatting',
		s: 'startTagFormatting',
		small: 'startTagFormatting',
		strike: 'startTagFormatting',
		strong: 'startTagFormatting',
		tt: 'startTagFormatting',
		u: 'startTagFormatting',
		nobr: 'startTagNobr',
		area: 'startTagVoidFormatting',
		br: 'startTagVoidFormatting',
		embed: 'startTagVoidFormatting',
		img: 'startTagVoidFormatting',
		keygen: 'startTagVoidFormatting',
		wbr: 'startTagVoidFormatting',
		param: 'startTagParamSourceTrack',
		source: 'startTagParamSourceTrack',
		track: 'startTagParamSourceTrack',
		iframe: 'startTagIFrame',
		noembed: 'startTagRawText',
		noscript: 'startTagRawText',
		h1: 'startTagHeading',
		h2: 'startTagHeading',
		h3: 'startTagHeading',
		h4: 'startTagHeading',
		h5: 'startTagHeading',
		h6: 'startTagHeading',
		caption: 'startTagMisplaced',
		col: 'startTagMisplaced',
		colgroup: 'startTagMisplaced',
		frame: 'startTagMisplaced',
		frameset: 'startTagFrameset',
		tbody: 'startTagMisplaced',
		td: 'startTagMisplaced',
		tfoot: 'startTagMisplaced',
		th: 'startTagMisplaced',
		thead: 'startTagMisplaced',
		tr: 'startTagMisplaced',
		option: 'startTagOptionOptgroup',
		optgroup: 'startTagOptionOptgroup',
		math: 'startTagMath',
		svg: 'startTagSVG',
		rt: 'startTagRpRt',
		rp: 'startTagRpRt',
		"-default": 'startTagOther'
	};

	modes.inBody.end_tag_handlers = {
		p: 'endTagP',
		body: 'endTagBody',
		html: 'endTagHtml',
		address: 'endTagBlock',
		article: 'endTagBlock',
		aside: 'endTagBlock',
		blockquote: 'endTagBlock',
		button: 'endTagBlock',
		center: 'endTagBlock',
		details: 'endTagBlock',
		dir: 'endTagBlock',
		div: 'endTagBlock',
		dl: 'endTagBlock',
		fieldset: 'endTagBlock',
		figcaption: 'endTagBlock',
		figure: 'endTagBlock',
		footer: 'endTagBlock',
		header: 'endTagBlock',
		hgroup: 'endTagBlock',
		listing: 'endTagBlock',
		main: 'endTagBlock',
		menu: 'endTagBlock',
		nav: 'endTagBlock',
		ol: 'endTagBlock',
		pre: 'endTagBlock',
		section: 'endTagBlock',
		summary: 'endTagBlock',
		ul: 'endTagBlock',
		form: 'endTagForm',
		applet: 'endTagAppletMarqueeObject',
		marquee: 'endTagAppletMarqueeObject',
		object: 'endTagAppletMarqueeObject',
		dd: 'endTagListItem',
		dt: 'endTagListItem',
		li: 'endTagListItem',
		h1: 'endTagHeading',
		h2: 'endTagHeading',
		h3: 'endTagHeading',
		h4: 'endTagHeading',
		h5: 'endTagHeading',
		h6: 'endTagHeading',
		a: 'endTagFormatting',
		b: 'endTagFormatting',
		big: 'endTagFormatting',
		code: 'endTagFormatting',
		em: 'endTagFormatting',
		font: 'endTagFormatting',
		i: 'endTagFormatting',
		nobr: 'endTagFormatting',
		s: 'endTagFormatting',
		small: 'endTagFormatting',
		strike: 'endTagFormatting',
		strong: 'endTagFormatting',
		tt: 'endTagFormatting',
		u: 'endTagFormatting',
		br: 'endTagBr',
		"-default": 'endTagOther'
	};

	modes.inBody.processCharacters = function(buffer) {
		if (tree.shouldSkipLeadingNewline) {
			tree.shouldSkipLeadingNewline = false;
			buffer.skipAtMostOneLeadingNewline();
		}
		tree.reconstructActiveFormattingElements();
		var characters = buffer.takeRemaining();
		characters = characters.replace(/\u0000/g, function(match, index){
			tree.parseError("invalid-codepoint");
			return '';
		});
		if (!characters)
			return;
		tree.insertText(characters);
		if (tree.framesetOk && !isAllWhitespaceOrReplacementCharacters(characters))
			tree.framesetOk = false;
	};

	modes.inBody.startTagHtml = function(name, attributes) {
		tree.parseError('non-html-root');
		tree.addAttributesToElement(tree.openElements.rootNode, attributes);
	};

	modes.inBody.startTagProcessInHead = function(name, attributes) {
		modes.inHead.processStartTag(name, attributes);
	};

	modes.inBody.startTagBody = function(name, attributes) {
		tree.parseError('unexpected-start-tag', {name: 'body'});
		if (tree.openElements.length == 1 ||
			tree.openElements.item(1).localName != 'body') {
			assert.ok(tree.context);
		} else {
			tree.framesetOk = false;
			tree.addAttributesToElement(tree.openElements.bodyElement, attributes);
		}
	};

	modes.inBody.startTagFrameset = function(name, attributes) {
		tree.parseError('unexpected-start-tag', {name: 'frameset'});
		if (tree.openElements.length == 1 ||
			tree.openElements.item(1).localName != 'body') {
			assert.ok(tree.context);
		} else if (tree.framesetOk) {
			tree.detachFromParent(tree.openElements.bodyElement);
			while (tree.openElements.length > 1)
				tree.openElements.pop();
			tree.insertElement(name, attributes);
			tree.setInsertionMode('inFrameset');
		}
	};

	modes.inBody.startTagCloseP = function(name, attributes) {
		if (tree.openElements.inButtonScope('p'))
			this.endTagP('p');
		tree.insertElement(name, attributes);
	};

	modes.inBody.startTagPreListing = function(name, attributes) {
		if (tree.openElements.inButtonScope('p'))
			this.endTagP('p');
		tree.insertElement(name, attributes);
		tree.framesetOk = false;
		tree.shouldSkipLeadingNewline = true;
	};

	modes.inBody.startTagForm = function(name, attributes) {
		if (tree.form) {
			tree.parseError('unexpected-start-tag', {name: name});
		} else {
			if (tree.openElements.inButtonScope('p'))
				this.endTagP('p');
			tree.insertElement(name, attributes);
			tree.form = tree.currentStackItem();
		}
	};

	modes.inBody.startTagRpRt = function(name, attributes) {
		if (tree.openElements.inScope('ruby')) {
			tree.generateImpliedEndTags();
			if (tree.currentStackItem().localName != 'ruby') {
				tree.parseError('unexpected-start-tag', {name: name});
			}
		}
		tree.insertElement(name, attributes);
	};

	modes.inBody.startTagListItem = function(name, attributes) {
		var stopNames = {li: ['li'], dd: ['dd', 'dt'], dt: ['dd', 'dt']};
		var stopName = stopNames[name];

		var els = tree.openElements;
		for (var i = els.length - 1; i >= 0; i--) {
			var node = els.item(i);
			if (stopName.indexOf(node.localName) != -1) {
				tree.insertionMode.processEndTag(node.localName);
				break;
			}
			if (node.isSpecial() && node.localName !== 'p' && node.localName !== 'address' && node.localName !== 'div')
				break;
		}
		if (tree.openElements.inButtonScope('p'))
			this.endTagP('p');
		tree.insertElement(name, attributes);
		tree.framesetOk = false;
	};

	modes.inBody.startTagPlaintext = function(name, attributes) {
		if (tree.openElements.inButtonScope('p'))
			this.endTagP('p');
		tree.insertElement(name, attributes);
		tree.tokenizer.setState(Tokenizer.PLAINTEXT);
	};

	modes.inBody.startTagHeading = function(name, attributes) {
		if (tree.openElements.inButtonScope('p'))
			this.endTagP('p');
		if (tree.currentStackItem().isNumberedHeader()) {
			tree.parseError('unexpected-start-tag', {name: name});
			tree.popElement();
		}
		tree.insertElement(name, attributes);
	};

	modes.inBody.startTagA = function(name, attributes) {
		var activeA = tree.elementInActiveFormattingElements('a');
		if (activeA) {
			tree.parseError("unexpected-start-tag-implies-end-tag", {startName: "a", endName: "a"});
			tree.adoptionAgencyEndTag('a');
			if (tree.openElements.contains(activeA))
				tree.openElements.remove(activeA);
			tree.removeElementFromActiveFormattingElements(activeA);
		}
		tree.reconstructActiveFormattingElements();
		tree.insertFormattingElement(name, attributes);
	};

	modes.inBody.startTagFormatting = function(name, attributes) {
		tree.reconstructActiveFormattingElements();
		tree.insertFormattingElement(name, attributes);
	};

	modes.inBody.startTagNobr = function(name, attributes) {
		tree.reconstructActiveFormattingElements();
		if (tree.openElements.inScope('nobr')) {
			tree.parseError("unexpected-start-tag-implies-end-tag", {startName: 'nobr', endName: 'nobr'});
			this.processEndTag('nobr');
				tree.reconstructActiveFormattingElements();
		}
		tree.insertFormattingElement(name, attributes);
	};

	modes.inBody.startTagButton = function(name, attributes) {
		if (tree.openElements.inScope('button')) {
			tree.parseError('unexpected-start-tag-implies-end-tag', {startName: 'button', endName: 'button'});
			this.processEndTag('button');
			tree.insertionMode.processStartTag(name, attributes);
		} else {
			tree.framesetOk = false;
			tree.reconstructActiveFormattingElements();
			tree.insertElement(name, attributes);
		}
	};

	modes.inBody.startTagAppletMarqueeObject = function(name, attributes) {
		tree.reconstructActiveFormattingElements();
		tree.insertElement(name, attributes);
		tree.activeFormattingElements.push(Marker);
		tree.framesetOk = false;
	};

	modes.inBody.endTagAppletMarqueeObject = function(name) {
		if (!tree.openElements.inScope(name)) {
			tree.parseError("unexpected-end-tag", {name: name});
		} else {
			tree.generateImpliedEndTags();
			if (tree.currentStackItem().localName != name) {
				tree.parseError('end-tag-too-early', {name: name});
			}
			tree.openElements.popUntilPopped(name);
			tree.clearActiveFormattingElements();
		}
	};

	modes.inBody.startTagXmp = function(name, attributes) {
		if (tree.openElements.inButtonScope('p'))
			this.processEndTag('p');
		tree.reconstructActiveFormattingElements();
		tree.processGenericRawTextStartTag(name, attributes);
		tree.framesetOk = false;
	};

	modes.inBody.startTagTable = function(name, attributes) {
		if (tree.compatMode !== "quirks")
			if (tree.openElements.inButtonScope('p'))
				this.processEndTag('p');
		tree.insertElement(name, attributes);
		tree.setInsertionMode('inTable');
		tree.framesetOk = false;
	};

	modes.inBody.startTagVoidFormatting = function(name, attributes) {
		tree.reconstructActiveFormattingElements();
		tree.insertSelfClosingElement(name, attributes);
		tree.framesetOk = false;
	};

	modes.inBody.startTagParamSourceTrack = function(name, attributes) {
		tree.insertSelfClosingElement(name, attributes);
	};

	modes.inBody.startTagHr = function(name, attributes) {
		if (tree.openElements.inButtonScope('p'))
			this.endTagP('p');
		tree.insertSelfClosingElement(name, attributes);
		tree.framesetOk = false;
	};

	modes.inBody.startTagImage = function(name, attributes) {
		tree.parseError('unexpected-start-tag-treated-as', {originalName: 'image', newName: 'img'});
		this.processStartTag('img', attributes);
	};

	modes.inBody.startTagInput = function(name, attributes) {
		var currentFramesetOk = tree.framesetOk;
		this.startTagVoidFormatting(name, attributes);
		for (var key in attributes) {
			if (attributes[key].nodeName == 'type') {
				if (attributes[key].nodeValue.toLowerCase() == 'hidden')
					tree.framesetOk = currentFramesetOk;
				break;
			}
		}
	};

	modes.inBody.startTagIsindex = function(name, attributes) {
		tree.parseError('deprecated-tag', {name: 'isindex'});
		tree.selfClosingFlagAcknowledged = true;
		if (tree.form)
			return;
		var formAttributes = [];
		var inputAttributes = [];
		var prompt = "This is a searchable index. Enter search keywords: ";
		for (var key in attributes) {
			switch (attributes[key].nodeName) {
				case 'action':
					formAttributes.push({nodeName: 'action',
						nodeValue: attributes[key].nodeValue});
					break;
				case 'prompt':
					prompt = attributes[key].nodeValue;
					break;
				case 'name':
					break;
				default:
					inputAttributes.push({nodeName: attributes[key].nodeName,
						nodeValue: attributes[key].nodeValue});
			}
		}
		inputAttributes.push({nodeName: 'name', nodeValue: 'isindex'});
		this.processStartTag('form', formAttributes);
		this.processStartTag('hr');
		this.processStartTag('label');
		this.processCharacters(new CharacterBuffer(prompt));
		this.processStartTag('input', inputAttributes);
		this.processEndTag('label');
		this.processStartTag('hr');
		this.processEndTag('form');
	};

	modes.inBody.startTagTextarea = function(name, attributes) {
		tree.insertElement(name, attributes);
		tree.tokenizer.setState(Tokenizer.RCDATA);
		tree.originalInsertionMode = tree.insertionModeName;
		tree.shouldSkipLeadingNewline = true;
		tree.framesetOk = false;
		tree.setInsertionMode('text');
	};

	modes.inBody.startTagIFrame = function(name, attributes) {
		tree.framesetOk = false;
		this.startTagRawText(name, attributes);
	};

	modes.inBody.startTagRawText = function(name, attributes) {
		tree.processGenericRawTextStartTag(name, attributes);
	};

	modes.inBody.startTagSelect = function(name, attributes) {
		tree.reconstructActiveFormattingElements();
		tree.insertElement(name, attributes);
		tree.framesetOk = false;
		var insertionModeName = tree.insertionModeName;
		if (insertionModeName == 'inTable' ||
			insertionModeName == 'inCaption' ||
			insertionModeName == 'inColumnGroup' ||
			insertionModeName == 'inTableBody' ||
			insertionModeName == 'inRow' ||
			insertionModeName == 'inCell') {
			tree.setInsertionMode('inSelectInTable');
		} else {
			tree.setInsertionMode('inSelect');
		}
	};

	modes.inBody.startTagMisplaced = function(name, attributes) {
		tree.parseError('unexpected-start-tag-ignored', {name: name});
	};

	modes.inBody.endTagMisplaced = function(name) {
		tree.parseError("unexpected-end-tag", {name: name});
	};

	modes.inBody.endTagBr = function(name) {
		tree.parseError("unexpected-end-tag-treated-as", {originalName: "br", newName: "br element"});
		tree.reconstructActiveFormattingElements();
		tree.insertElement(name, []);
		tree.popElement();
	};

	modes.inBody.startTagOptionOptgroup = function(name, attributes) {
		if (tree.currentStackItem().localName == 'option')
			tree.popElement();
		tree.reconstructActiveFormattingElements();
		tree.insertElement(name, attributes);
	};

	modes.inBody.startTagOther = function(name, attributes) {
		tree.reconstructActiveFormattingElements();
		tree.insertElement(name, attributes);
	};

	modes.inBody.endTagOther = function(name) {
		var node;
		for (var i = tree.openElements.length - 1; i > 0; i--) {
			node = tree.openElements.item(i);
			if (node.localName == name) {
				tree.generateImpliedEndTags(name);
				if (tree.currentStackItem().localName != name)
					tree.parseError('unexpected-end-tag', {name: name});
				tree.openElements.remove_openElements_until(function(x) {return x === node;});
				break;
			}
			if (node.isSpecial()) {
				tree.parseError('unexpected-end-tag', {name: name});
				break;
			}
		}
	};

	modes.inBody.startTagMath = function(name, attributes, selfClosing) {
		tree.reconstructActiveFormattingElements();
		attributes = tree.adjustMathMLAttributes(attributes);
		attributes = tree.adjustForeignAttributes(attributes);
		tree.insertForeignElement(name, attributes, "http://www.w3.org/1998/Math/MathML", selfClosing);
	};

	modes.inBody.startTagSVG = function(name, attributes, selfClosing) {
		tree.reconstructActiveFormattingElements();
		attributes = tree.adjustSVGAttributes(attributes);
		attributes = tree.adjustForeignAttributes(attributes);
		tree.insertForeignElement(name, attributes, "http://www.w3.org/2000/svg", selfClosing);
	};

	modes.inBody.endTagP = function(name) {
		if (!tree.openElements.inButtonScope('p')) {
			tree.parseError('unexpected-end-tag', {name: 'p'});
			this.startTagCloseP('p', []);
			this.endTagP('p');
		} else {
			tree.generateImpliedEndTags('p');
			if (tree.currentStackItem().localName != 'p')
				tree.parseError('unexpected-implied-end-tag', {name: 'p'});
			tree.openElements.popUntilPopped(name);
		}
	};

	modes.inBody.endTagBody = function(name) {
		if (!tree.openElements.inScope('body')) {
			tree.parseError('unexpected-end-tag', {name: name});
			return;
		}
		if (tree.currentStackItem().localName != 'body') {
			tree.parseError('expected-one-end-tag-but-got-another', {
				expectedName: tree.currentStackItem().localName,
				gotName: name
			});
		}
		tree.setInsertionMode('afterBody');
	};

	modes.inBody.endTagHtml = function(name) {
		if (!tree.openElements.inScope('body')) {
			tree.parseError('unexpected-end-tag', {name: name});
			return;
		}
		if (tree.currentStackItem().localName != 'body') {
			tree.parseError('expected-one-end-tag-but-got-another', {
				expectedName: tree.currentStackItem().localName,
				gotName: name
			});
		}
		tree.setInsertionMode('afterBody');
		tree.insertionMode.processEndTag(name);
	};

	modes.inBody.endTagBlock = function(name) {
		if (!tree.openElements.inScope(name)) {
			tree.parseError('unexpected-end-tag', {name: name});
		} else {
			tree.generateImpliedEndTags();
			if (tree.currentStackItem().localName != name) {
				tree.parseError('end-tag-too-early', {name: name});
			}
			tree.openElements.popUntilPopped(name);
		}
	};

	modes.inBody.endTagForm = function(name)  {
		var node = tree.form;
		tree.form = null;
		if (!node || !tree.openElements.inScope(name)) {
			tree.parseError('unexpected-end-tag', {name: name});
		} else {
			tree.generateImpliedEndTags();
			if (tree.currentStackItem() != node) {
				tree.parseError('end-tag-too-early-ignored', {name: 'form'});
			}
			tree.openElements.remove(node);
		}
	};

	modes.inBody.endTagListItem = function(name) {
		if (!tree.openElements.inListItemScope(name)) {
			tree.parseError('unexpected-end-tag', {name: name});
		} else {
			tree.generateImpliedEndTags(name);
			if (tree.currentStackItem().localName != name)
				tree.parseError('end-tag-too-early', {name: name});
			tree.openElements.popUntilPopped(name);
		}
	};

	modes.inBody.endTagHeading = function(name) {
		if (!tree.openElements.hasNumberedHeaderElementInScope()) {
			tree.parseError('unexpected-end-tag', {name: name});
			return;
		}
		tree.generateImpliedEndTags();
		if (tree.currentStackItem().localName != name)
			tree.parseError('end-tag-too-early', {name: name});

		tree.openElements.remove_openElements_until(function(e) {
			return e.isNumberedHeader();
		});
	};

	modes.inBody.endTagFormatting = function(name, attributes) {
		if (!tree.adoptionAgencyEndTag(name))
			this.endTagOther(name, attributes);
	};

	modes.inCaption = Object.create(modes.base);

	modes.inCaption.start_tag_handlers = {
		html: 'startTagHtml',
		caption: 'startTagTableElement',
		col: 'startTagTableElement',
		colgroup: 'startTagTableElement',
		tbody: 'startTagTableElement',
		td: 'startTagTableElement',
		tfoot: 'startTagTableElement',
		thead: 'startTagTableElement',
		tr: 'startTagTableElement',
		'-default': 'startTagOther'
	};

	modes.inCaption.end_tag_handlers = {
		caption: 'endTagCaption',
		table: 'endTagTable',
		body: 'endTagIgnore',
		col: 'endTagIgnore',
		colgroup: 'endTagIgnore',
		html: 'endTagIgnore',
		tbody: 'endTagIgnore',
		td: 'endTagIgnore',
		tfood: 'endTagIgnore',
		thead: 'endTagIgnore',
		tr: 'endTagIgnore',
		'-default': 'endTagOther'
	};

	modes.inCaption.processCharacters = function(data) {
		modes.inBody.processCharacters(data);
	};

	modes.inCaption.startTagTableElement = function(name, attributes) {
		tree.parseError('unexpected-end-tag', {name: name});
		var ignoreEndTag = !tree.openElements.inTableScope('caption');
		tree.insertionMode.processEndTag('caption');
		if (!ignoreEndTag) tree.insertionMode.processStartTag(name, attributes);
	};

	modes.inCaption.startTagOther = function(name, attributes, selfClosing) {
		modes.inBody.processStartTag(name, attributes, selfClosing);
	};

	modes.inCaption.endTagCaption = function(name) {
		if (!tree.openElements.inTableScope('caption')) {
			assert.ok(tree.context);
			tree.parseError('unexpected-end-tag', {name: name});
		} else {
			tree.generateImpliedEndTags();
			if (tree.currentStackItem().localName != 'caption') {
				tree.parseError('expected-one-end-tag-but-got-another', {
					gotName: "caption",
					expectedName: tree.currentStackItem().localName
				});
			}
			tree.openElements.popUntilPopped('caption');
			tree.clearActiveFormattingElements();
			tree.setInsertionMode('inTable');
		}
	};

	modes.inCaption.endTagTable = function(name) {
		tree.parseError("unexpected-end-table-in-caption");
		var ignoreEndTag = !tree.openElements.inTableScope('caption');
		tree.insertionMode.processEndTag('caption');
		if (!ignoreEndTag) tree.insertionMode.processEndTag(name);
	};

	modes.inCaption.endTagIgnore = function(name) {
		tree.parseError('unexpected-end-tag', {name: name});
	};

	modes.inCaption.endTagOther = function(name) {
		modes.inBody.processEndTag(name);
	};

	modes.inCell = Object.create(modes.base);

	modes.inCell.start_tag_handlers = {
		html: 'startTagHtml',
		caption: 'startTagTableOther',
		col: 'startTagTableOther',
		colgroup: 'startTagTableOther',
		tbody: 'startTagTableOther',
		td: 'startTagTableOther',
		tfoot: 'startTagTableOther',
		th: 'startTagTableOther',
		thead: 'startTagTableOther',
		tr: 'startTagTableOther',
		'-default': 'startTagOther'
	};

	modes.inCell.end_tag_handlers = {
		td: 'endTagTableCell',
		th: 'endTagTableCell',
		body: 'endTagIgnore',
		caption: 'endTagIgnore',
		col: 'endTagIgnore',
		colgroup: 'endTagIgnore',
		html: 'endTagIgnore',
		table: 'endTagImply',
		tbody: 'endTagImply',
		tfoot: 'endTagImply',
		thead: 'endTagImply',
		tr: 'endTagImply',
		'-default': 'endTagOther'
	};

	modes.inCell.processCharacters = function(data) {
		modes.inBody.processCharacters(data);
	};

	modes.inCell.startTagTableOther = function(name, attributes, selfClosing) {
		if (tree.openElements.inTableScope('td') || tree.openElements.inTableScope('th')) {
			this.closeCell();
			tree.insertionMode.processStartTag(name, attributes, selfClosing);
		} else {
			tree.parseError('unexpected-start-tag', {name: name});
		}
	};

	modes.inCell.startTagOther = function(name, attributes, selfClosing) {
		modes.inBody.processStartTag(name, attributes, selfClosing);
	};

	modes.inCell.endTagTableCell = function(name) {
		if (tree.openElements.inTableScope(name)) {
			tree.generateImpliedEndTags(name);
			if (tree.currentStackItem().localName != name.toLowerCase()) {
				tree.parseError('unexpected-cell-end-tag', {name: name});
				tree.openElements.popUntilPopped(name);
			} else {
				tree.popElement();
			}
			tree.clearActiveFormattingElements();
			tree.setInsertionMode('inRow');
		} else {
			tree.parseError('unexpected-end-tag', {name: name});
		}
	};

	modes.inCell.endTagIgnore = function(name) {
		tree.parseError('unexpected-end-tag', {name: name});
	};

	modes.inCell.endTagImply = function(name) {
		if (tree.openElements.inTableScope(name)) {
			this.closeCell();
			tree.insertionMode.processEndTag(name);
		} else {
			tree.parseError('unexpected-end-tag', {name: name});
		}
	};

	modes.inCell.endTagOther = function(name) {
		modes.inBody.processEndTag(name);
	};

	modes.inCell.closeCell = function() {
		if (tree.openElements.inTableScope('td')) {
			this.endTagTableCell('td');
		} else if (tree.openElements.inTableScope('th')) {
			this.endTagTableCell('th');
		}
	};


	modes.inColumnGroup = Object.create(modes.base);

	modes.inColumnGroup.start_tag_handlers = {
		html: 'startTagHtml',
		col: 'startTagCol',
		'-default': 'startTagOther'
	};

	modes.inColumnGroup.end_tag_handlers = {
		colgroup: 'endTagColgroup',
		col: 'endTagCol',
		'-default': 'endTagOther'
	};

	modes.inColumnGroup.ignoreEndTagColgroup = function() {
		return tree.currentStackItem().localName == 'html';
	};

	modes.inColumnGroup.processCharacters = function(buffer) {
		var leadingWhitespace = buffer.takeLeadingWhitespace();
		if (leadingWhitespace)
			tree.insertText(leadingWhitespace);
		if (!buffer.length)
			return;
		var ignoreEndTag = this.ignoreEndTagColgroup();
		this.endTagColgroup('colgroup');
		if (!ignoreEndTag) tree.insertionMode.processCharacters(buffer);
	};

	modes.inColumnGroup.startTagCol = function(name, attributes) {
		tree.insertSelfClosingElement(name, attributes);
	};

	modes.inColumnGroup.startTagOther = function(name, attributes, selfClosing) {
		var ignoreEndTag = this.ignoreEndTagColgroup();
		this.endTagColgroup('colgroup');
		if (!ignoreEndTag) tree.insertionMode.processStartTag(name, attributes, selfClosing);
	};

	modes.inColumnGroup.endTagColgroup = function(name) {
		if (this.ignoreEndTagColgroup()) {
			assert.ok(tree.context);
			tree.parseError('unexpected-end-tag', {name: name});
		} else {
			tree.popElement();
			tree.setInsertionMode('inTable');
		}
	};

	modes.inColumnGroup.endTagCol = function(name) {
		tree.parseError("no-end-tag", {name: 'col'});
	};

	modes.inColumnGroup.endTagOther = function(name) {
		var ignoreEndTag = this.ignoreEndTagColgroup();
		this.endTagColgroup('colgroup');
		if (!ignoreEndTag) tree.insertionMode.processEndTag(name) ;
	};

	modes.inForeignContent = Object.create(modes.base);

	modes.inForeignContent.processStartTag = function(name, attributes, selfClosing) {
		if (['b', 'big', 'blockquote', 'body', 'br', 'center', 'code', 'dd', 'div', 'dl', 'dt', 'em', 'embed', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'hr', 'i', 'img', 'li', 'listing', 'menu', 'meta', 'nobr', 'ol', 'p', 'pre', 'ruby', 's', 'small', 'span', 'strong', 'strike', 'sub', 'sup', 'table', 'tt', 'u', 'ul', 'var'].indexOf(name) != -1
				|| (name == 'font' && attributes.some(function(attr){ return ['color', 'face', 'size'].indexOf(attr.nodeName) >= 0 }))) {
			tree.parseError('unexpected-html-element-in-foreign-content', {name: name});
			while (tree.currentStackItem().isForeign()
				&& !tree.currentStackItem().isHtmlIntegrationPoint()
				&& !tree.currentStackItem().isMathMLTextIntegrationPoint()) {
				tree.openElements.pop();
			}
			tree.insertionMode.processStartTag(name, attributes, selfClosing);
			return;
		}
		if (tree.currentStackItem().namespaceURI == "http://www.w3.org/1998/Math/MathML") {
			attributes = tree.adjustMathMLAttributes(attributes);
		}
		if (tree.currentStackItem().namespaceURI == "http://www.w3.org/2000/svg") {
			name = tree.adjustSVGTagNameCase(name);
			attributes = tree.adjustSVGAttributes(attributes);
		}
		attributes = tree.adjustForeignAttributes(attributes);
		tree.insertForeignElement(name, attributes, tree.currentStackItem().namespaceURI, selfClosing);
	};

	modes.inForeignContent.processEndTag = function(name) {
		var node = tree.currentStackItem();
		var index = tree.openElements.length - 1;
		if (node.localName.toLowerCase() != name)
			tree.parseError("unexpected-end-tag", {name: name});

		while (true) {
			if (index === 0)
				break;
			if (node.localName.toLowerCase() == name) {
				while (tree.openElements.pop() != node);
				break;
			}
			index -= 1;
			node = tree.openElements.item(index);
			if (node.isForeign()) {
				continue;
			} else {
				tree.insertionMode.processEndTag(name);
				break;
			}
		}
	};

	modes.inForeignContent.processCharacters = function(buffer) {
		var characters = buffer.takeRemaining();
		characters = characters.replace(/\u0000/g, function(match, index){
			tree.parseError('invalid-codepoint');
			return '\uFFFD';
		});
		if (tree.framesetOk && !isAllWhitespaceOrReplacementCharacters(characters))
			tree.framesetOk = false;
		tree.insertText(characters);
	};

	modes.inHeadNoscript = Object.create(modes.base);

	modes.inHeadNoscript.start_tag_handlers = {
		html: 'startTagHtml',
		basefont: 'startTagBasefontBgsoundLinkMetaNoframesStyle',
		bgsound: 'startTagBasefontBgsoundLinkMetaNoframesStyle',
		link: 'startTagBasefontBgsoundLinkMetaNoframesStyle',
		meta: 'startTagBasefontBgsoundLinkMetaNoframesStyle',
		noframes: 'startTagBasefontBgsoundLinkMetaNoframesStyle',
		style: 'startTagBasefontBgsoundLinkMetaNoframesStyle',
		head: 'startTagHeadNoscript',
		noscript: 'startTagHeadNoscript',
		"-default": 'startTagOther'
	};

	modes.inHeadNoscript.end_tag_handlers = {
		noscript: 'endTagNoscript',
		br: 'endTagBr',
		'-default': 'endTagOther'
	};

	modes.inHeadNoscript.processCharacters = function(buffer) {
		var leadingWhitespace = buffer.takeLeadingWhitespace();
		if (leadingWhitespace)
			tree.insertText(leadingWhitespace);
		if (!buffer.length)
			return;
		tree.parseError("unexpected-char-in-frameset");
		this.anythingElse();
		tree.insertionMode.processCharacters(buffer);
	};

	modes.inHeadNoscript.processComment = function(data) {
		modes.inHead.processComment(data);
	};

	modes.inHeadNoscript.startTagBasefontBgsoundLinkMetaNoframesStyle = function(name, attributes) {
		modes.inHead.processStartTag(name, attributes);
	};

	modes.inHeadNoscript.startTagHeadNoscript = function(name, attributes) {
		tree.parseError("unexpected-start-tag-in-frameset", {name: name});
	};

	modes.inHeadNoscript.startTagOther = function(name, attributes) {
		tree.parseError("unexpected-start-tag-in-frameset", {name: name});
		this.anythingElse();
		tree.insertionMode.processStartTag(name, attributes);
	};

	modes.inHeadNoscript.endTagBr = function(name, attributes) {
		tree.parseError("unexpected-end-tag-in-frameset", {name: name});
		this.anythingElse();
		tree.insertionMode.processEndTag(name, attributes);
	};

	modes.inHeadNoscript.endTagNoscript = function(name, attributes) {
		tree.popElement();
		tree.setInsertionMode('inHead');
	};

	modes.inHeadNoscript.endTagOther = function(name, attributes) {
		tree.parseError("unexpected-end-tag-in-frameset", {name: name});
	};

	modes.inHeadNoscript.anythingElse = function() {
		tree.popElement();
		tree.setInsertionMode('inHead');
	};


	modes.inFrameset = Object.create(modes.base);

	modes.inFrameset.start_tag_handlers = {
		html: 'startTagHtml',
		frameset: 'startTagFrameset',
		frame: 'startTagFrame',
		noframes: 'startTagNoframes',
		"-default": 'startTagOther'
	};

	modes.inFrameset.end_tag_handlers = {
		frameset: 'endTagFrameset',
		noframes: 'endTagNoframes',
		'-default': 'endTagOther'
	};

	modes.inFrameset.processCharacters = function(data) {
		tree.parseError("unexpected-char-in-frameset");
	};

	modes.inFrameset.startTagFrameset = function(name, attributes) {
		tree.insertElement(name, attributes);
	};

	modes.inFrameset.startTagFrame = function(name, attributes) {
		tree.insertSelfClosingElement(name, attributes);
	};

	modes.inFrameset.startTagNoframes = function(name, attributes) {
		modes.inBody.processStartTag(name, attributes);
	};

	modes.inFrameset.startTagOther = function(name, attributes) {
		tree.parseError("unexpected-start-tag-in-frameset", {name: name});
	};

	modes.inFrameset.endTagFrameset = function(name, attributes) {
		if (tree.currentStackItem().localName == 'html') {
			tree.parseError("unexpected-frameset-in-frameset-innerhtml");
		} else {
			tree.popElement();
		}

		if (!tree.context && tree.currentStackItem().localName != 'frameset') {
			tree.setInsertionMode('afterFrameset');
		}
	};

	modes.inFrameset.endTagNoframes = function(name) {
		modes.inBody.processEndTag(name);
	};

	modes.inFrameset.endTagOther = function(name) {
		tree.parseError("unexpected-end-tag-in-frameset", {name: name});
	};

	modes.inTable = Object.create(modes.base);

	modes.inTable.start_tag_handlers = {
		html: 'startTagHtml',
		caption: 'startTagCaption',
		colgroup: 'startTagColgroup',
		col: 'startTagCol',
		table: 'startTagTable',
		tbody: 'startTagRowGroup',
		tfoot: 'startTagRowGroup',
		thead: 'startTagRowGroup',
		td: 'startTagImplyTbody',
		th: 'startTagImplyTbody',
		tr: 'startTagImplyTbody',
		style: 'startTagStyleScript',
		script: 'startTagStyleScript',
		input: 'startTagInput',
		form: 'startTagForm',
		'-default': 'startTagOther'
	};

	modes.inTable.end_tag_handlers = {
		table: 'endTagTable',
		body: 'endTagIgnore',
		caption: 'endTagIgnore',
		col: 'endTagIgnore',
		colgroup: 'endTagIgnore',
		html: 'endTagIgnore',
		tbody: 'endTagIgnore',
		td: 'endTagIgnore',
		tfoot: 'endTagIgnore',
		th: 'endTagIgnore',
		thead: 'endTagIgnore',
		tr: 'endTagIgnore',
		'-default': 'endTagOther'
	};

	modes.inTable.processCharacters =  function(data) {
		if (tree.currentStackItem().isFosterParenting()) {
			var originalInsertionMode = tree.insertionModeName;
			tree.setInsertionMode('inTableText');
			tree.originalInsertionMode = originalInsertionMode;
			tree.insertionMode.processCharacters(data);
		} else {
			tree.redirectAttachToFosterParent = true;
			modes.inBody.processCharacters(data);
			tree.redirectAttachToFosterParent = false;
		}
	};

	modes.inTable.startTagCaption = function(name, attributes) {
		tree.openElements.popUntilTableScopeMarker();
		tree.activeFormattingElements.push(Marker);
		tree.insertElement(name, attributes);
		tree.setInsertionMode('inCaption');
	};

	modes.inTable.startTagColgroup = function(name, attributes) {
		tree.openElements.popUntilTableScopeMarker();
		tree.insertElement(name, attributes);
		tree.setInsertionMode('inColumnGroup');
	};

	modes.inTable.startTagCol = function(name, attributes) {
		this.startTagColgroup('colgroup', []);
		tree.insertionMode.processStartTag(name, attributes);
	};

	modes.inTable.startTagRowGroup = function(name, attributes) {
		tree.openElements.popUntilTableScopeMarker();
		tree.insertElement(name, attributes);
		tree.setInsertionMode('inTableBody');
	};

	modes.inTable.startTagImplyTbody = function(name, attributes) {
		this.startTagRowGroup('tbody', []);
		tree.insertionMode.processStartTag(name, attributes);
	};

	modes.inTable.startTagTable = function(name, attributes) {
		tree.parseError("unexpected-start-tag-implies-end-tag",
				{startName: "table", endName: "table"});
		tree.insertionMode.processEndTag('table');
		if (!tree.context) tree.insertionMode.processStartTag(name, attributes);
	};

	modes.inTable.startTagStyleScript = function(name, attributes) {
		modes.inHead.processStartTag(name, attributes);
	};

	modes.inTable.startTagInput = function(name, attributes) {
		for (var key in attributes) {
			if (attributes[key].nodeName.toLowerCase() == 'type') {
				if (attributes[key].nodeValue.toLowerCase() == 'hidden') {
					tree.parseError("unexpected-hidden-input-in-table");
					tree.insertElement(name, attributes);
					tree.openElements.pop();
					return;
				}
				break;
			}
		}
		this.startTagOther(name, attributes);
	};

	modes.inTable.startTagForm = function(name, attributes) {
		tree.parseError("unexpected-form-in-table");
		if (!tree.form) {
			tree.insertElement(name, attributes);
			tree.form = tree.currentStackItem();
			tree.openElements.pop();
		}
	};

	modes.inTable.startTagOther = function(name, attributes, selfClosing) {
		tree.parseError("unexpected-start-tag-implies-table-voodoo", {name: name});
		tree.redirectAttachToFosterParent = true;
		modes.inBody.processStartTag(name, attributes, selfClosing);
		tree.redirectAttachToFosterParent = false;
	};

	modes.inTable.endTagTable = function(name) {
		if (tree.openElements.inTableScope(name)) {
			tree.generateImpliedEndTags();
			if (tree.currentStackItem().localName != name) {
				tree.parseError("end-tag-too-early-named", {gotName: 'table', expectedName: tree.currentStackItem().localName});
			}

			tree.openElements.popUntilPopped('table');
			tree.resetInsertionMode();
		} else {
			assert.ok(tree.context);
			tree.parseError('unexpected-end-tag', {name: name});
		}
	};

	modes.inTable.endTagIgnore = function(name) {
		tree.parseError("unexpected-end-tag", {name: name});
	};

	modes.inTable.endTagOther = function(name) {
		tree.parseError("unexpected-end-tag-implies-table-voodoo", {name: name});
		tree.redirectAttachToFosterParent = true;
		modes.inBody.processEndTag(name);
		tree.redirectAttachToFosterParent = false;
	};

	modes.inTableText = Object.create(modes.base);

	modes.inTableText.flushCharacters = function() {
		var characters = tree.pendingTableCharacters.join('');
		if (!isAllWhitespace(characters)) {
			tree.redirectAttachToFosterParent = true;
			tree.reconstructActiveFormattingElements();
			tree.insertText(characters);
			tree.framesetOk = false;
			tree.redirectAttachToFosterParent = false;
		} else {
			tree.insertText(characters);
		}
		tree.pendingTableCharacters = [];
	};

	modes.inTableText.processComment = function(data) {
		this.flushCharacters();
		tree.setInsertionMode(tree.originalInsertionMode);
		tree.insertionMode.processComment(data);
	};

	modes.inTableText.processEOF = function(data) {
		this.flushCharacters();
		tree.setInsertionMode(tree.originalInsertionMode);
		tree.insertionMode.processEOF();
	};

	modes.inTableText.processCharacters = function(buffer) {
		var characters = buffer.takeRemaining();
		characters = characters.replace(/\u0000/g, function(match, index){
			tree.parseError("invalid-codepoint");
			return '';
		});
		if (!characters)
			return;
		tree.pendingTableCharacters.push(characters);
	};

	modes.inTableText.processStartTag = function(name, attributes, selfClosing) {
		this.flushCharacters();
		tree.setInsertionMode(tree.originalInsertionMode);
		tree.insertionMode.processStartTag(name, attributes, selfClosing);
	};

	modes.inTableText.processEndTag = function(name, attributes) {
		this.flushCharacters();
		tree.setInsertionMode(tree.originalInsertionMode);
		tree.insertionMode.processEndTag(name, attributes);
	};

	modes.inTableBody = Object.create(modes.base);

	modes.inTableBody.start_tag_handlers = {
		html: 'startTagHtml',
		tr: 'startTagTr',
		td: 'startTagTableCell',
		th: 'startTagTableCell',
		caption: 'startTagTableOther',
		col: 'startTagTableOther',
		colgroup: 'startTagTableOther',
		tbody: 'startTagTableOther',
		tfoot: 'startTagTableOther',
		thead: 'startTagTableOther',
		'-default': 'startTagOther'
	};

	modes.inTableBody.end_tag_handlers = {
		table: 'endTagTable',
		tbody: 'endTagTableRowGroup',
		tfoot: 'endTagTableRowGroup',
		thead: 'endTagTableRowGroup',
		body: 'endTagIgnore',
		caption: 'endTagIgnore',
		col: 'endTagIgnore',
		colgroup: 'endTagIgnore',
		html: 'endTagIgnore',
		td: 'endTagIgnore',
		th: 'endTagIgnore',
		tr: 'endTagIgnore',
		'-default': 'endTagOther'
	};

	modes.inTableBody.processCharacters = function(data) {
		modes.inTable.processCharacters(data);
	};

	modes.inTableBody.startTagTr = function(name, attributes) {
		tree.openElements.popUntilTableBodyScopeMarker();
		tree.insertElement(name, attributes);
		tree.setInsertionMode('inRow');
	};

	modes.inTableBody.startTagTableCell = function(name, attributes) {
		tree.parseError("unexpected-cell-in-table-body", {name: name});
		this.startTagTr('tr', []);
		tree.insertionMode.processStartTag(name, attributes);
	};

	modes.inTableBody.startTagTableOther = function(name, attributes) {
		if (tree.openElements.inTableScope('tbody') ||  tree.openElements.inTableScope('thead') || tree.openElements.inTableScope('tfoot')) {
			tree.openElements.popUntilTableBodyScopeMarker();
			this.endTagTableRowGroup(tree.currentStackItem().localName);
			tree.insertionMode.processStartTag(name, attributes);
		} else {
			tree.parseError('unexpected-start-tag', {name: name});
		}
	};

	modes.inTableBody.startTagOther = function(name, attributes) {
		modes.inTable.processStartTag(name, attributes);
	};

	modes.inTableBody.endTagTableRowGroup = function(name) {
		if (tree.openElements.inTableScope(name)) {
			tree.openElements.popUntilTableBodyScopeMarker();
			tree.popElement();
			tree.setInsertionMode('inTable');
		} else {
			tree.parseError('unexpected-end-tag-in-table-body', {name: name});
		}
	};

	modes.inTableBody.endTagTable = function(name) {
		if (tree.openElements.inTableScope('tbody') ||  tree.openElements.inTableScope('thead') || tree.openElements.inTableScope('tfoot')) {
			tree.openElements.popUntilTableBodyScopeMarker();
			this.endTagTableRowGroup(tree.currentStackItem().localName);
			tree.insertionMode.processEndTag(name);
		} else {
			tree.parseError('unexpected-end-tag', {name: name});
		}
	};

	modes.inTableBody.endTagIgnore = function(name) {
		tree.parseError("unexpected-end-tag-in-table-body", {name: name});
	};

	modes.inTableBody.endTagOther = function(name) {
		modes.inTable.processEndTag(name);
	};

	modes.inSelect = Object.create(modes.base);

	modes.inSelect.start_tag_handlers = {
		html: 'startTagHtml',
		option: 'startTagOption',
		optgroup: 'startTagOptgroup',
		select: 'startTagSelect',
		input: 'startTagInput',
		keygen: 'startTagInput',
		textarea: 'startTagInput',
		script: 'startTagScript',
		'-default': 'startTagOther'
	};

	modes.inSelect.end_tag_handlers = {
		option: 'endTagOption',
		optgroup: 'endTagOptgroup',
		select: 'endTagSelect',
		caption: 'endTagTableElements',
		table: 'endTagTableElements',
		tbody: 'endTagTableElements',
		tfoot: 'endTagTableElements',
		thead: 'endTagTableElements',
		tr: 'endTagTableElements',
		td: 'endTagTableElements',
		th: 'endTagTableElements',
		'-default': 'endTagOther'
	};

	modes.inSelect.processCharacters = function(buffer) {
		var data = buffer.takeRemaining();
		data = data.replace(/\u0000/g, function(match, index){
			tree.parseError("invalid-codepoint");
			return '';
		});
		if (!data)
			return;
		tree.insertText(data);
	};

	modes.inSelect.startTagOption = function(name, attributes) {
		if (tree.currentStackItem().localName == 'option')
			tree.popElement();
		tree.insertElement(name, attributes);
	};

	modes.inSelect.startTagOptgroup = function(name, attributes) {
		if (tree.currentStackItem().localName == 'option')
			tree.popElement();
		if (tree.currentStackItem().localName == 'optgroup')
			tree.popElement();
		tree.insertElement(name, attributes);
	};

	modes.inSelect.endTagOption = function(name) {
		if (tree.currentStackItem().localName !== 'option') {
			tree.parseError('unexpected-end-tag-in-select', {name: name});
			return;
		}
		tree.popElement();
	};

	modes.inSelect.endTagOptgroup = function(name) {
		if (tree.currentStackItem().localName == 'option' && tree.openElements.item(tree.openElements.length - 2).localName == 'optgroup') {
			tree.popElement();
		}
		if (tree.currentStackItem().localName == 'optgroup') {
			tree.popElement();
		} else {
			tree.parseError('unexpected-end-tag-in-select', {name: 'optgroup'});
		}
	};

	modes.inSelect.startTagSelect = function(name) {
		tree.parseError("unexpected-select-in-select");
		this.endTagSelect('select');
	};

	modes.inSelect.endTagSelect = function(name) {
		if (tree.openElements.inTableScope('select')) {
			tree.openElements.popUntilPopped('select');
			tree.resetInsertionMode();
		} else {
			tree.parseError('unexpected-end-tag', {name: name});
		}
	};

	modes.inSelect.startTagInput = function(name, attributes) {
		tree.parseError("unexpected-input-in-select");
		if (tree.openElements.inSelectScope('select')) {
			this.endTagSelect('select');
			tree.insertionMode.processStartTag(name, attributes);
		}
	};

	modes.inSelect.startTagScript = function(name, attributes) {
		modes.inHead.processStartTag(name, attributes);
	};

	modes.inSelect.endTagTableElements = function(name) {
		tree.parseError('unexpected-end-tag-in-select', {name: name});
		if (tree.openElements.inTableScope(name)) {
			this.endTagSelect('select');
			tree.insertionMode.processEndTag(name);
		}
	};

	modes.inSelect.startTagOther = function(name, attributes) {
		tree.parseError("unexpected-start-tag-in-select", {name: name});
	};

	modes.inSelect.endTagOther = function(name) {
		tree.parseError('unexpected-end-tag-in-select', {name: name});
	};

	modes.inSelectInTable = Object.create(modes.base);

	modes.inSelectInTable.start_tag_handlers = {
		caption: 'startTagTable',
		table: 'startTagTable',
		tbody: 'startTagTable',
		tfoot: 'startTagTable',
		thead: 'startTagTable',
		tr: 'startTagTable',
		td: 'startTagTable',
		th: 'startTagTable',
		'-default': 'startTagOther'
	};

	modes.inSelectInTable.end_tag_handlers = {
		caption: 'endTagTable',
		table: 'endTagTable',
		tbody: 'endTagTable',
		tfoot: 'endTagTable',
		thead: 'endTagTable',
		tr: 'endTagTable',
		td: 'endTagTable',
		th: 'endTagTable',
		'-default': 'endTagOther'
	};

	modes.inSelectInTable.processCharacters = function(data) {
		modes.inSelect.processCharacters(data);
	};

	modes.inSelectInTable.startTagTable = function(name, attributes) {
		tree.parseError("unexpected-table-element-start-tag-in-select-in-table", {name: name});
		this.endTagOther("select");
		tree.insertionMode.processStartTag(name, attributes);
	};

	modes.inSelectInTable.startTagOther = function(name, attributes, selfClosing) {
		modes.inSelect.processStartTag(name, attributes, selfClosing);
	};

	modes.inSelectInTable.endTagTable = function(name) {
		tree.parseError("unexpected-table-element-end-tag-in-select-in-table", {name: name});
		if (tree.openElements.inTableScope(name)) {
			this.endTagOther("select");
			tree.insertionMode.processEndTag(name);
		}
	};

	modes.inSelectInTable.endTagOther = function(name) {
		modes.inSelect.processEndTag(name);
	};

	modes.inRow = Object.create(modes.base);

	modes.inRow.start_tag_handlers = {
		html: 'startTagHtml',
		td: 'startTagTableCell',
		th: 'startTagTableCell',
		caption: 'startTagTableOther',
		col: 'startTagTableOther',
		colgroup: 'startTagTableOther',
		tbody: 'startTagTableOther',
		tfoot: 'startTagTableOther',
		thead: 'startTagTableOther',
		tr: 'startTagTableOther',
		'-default': 'startTagOther'
	};

	modes.inRow.end_tag_handlers = {
		tr: 'endTagTr',
		table: 'endTagTable',
		tbody: 'endTagTableRowGroup',
		tfoot: 'endTagTableRowGroup',
		thead: 'endTagTableRowGroup',
		body: 'endTagIgnore',
		caption: 'endTagIgnore',
		col: 'endTagIgnore',
		colgroup: 'endTagIgnore',
		html: 'endTagIgnore',
		td: 'endTagIgnore',
		th: 'endTagIgnore',
		'-default': 'endTagOther'
	};

	modes.inRow.processCharacters = function(data) {
		modes.inTable.processCharacters(data);
	};

	modes.inRow.startTagTableCell = function(name, attributes) {
		tree.openElements.popUntilTableRowScopeMarker();
		tree.insertElement(name, attributes);
		tree.setInsertionMode('inCell');
		tree.activeFormattingElements.push(Marker);
	};

	modes.inRow.startTagTableOther = function(name, attributes) {
		var ignoreEndTag = this.ignoreEndTagTr();
		this.endTagTr('tr');
		if (!ignoreEndTag) tree.insertionMode.processStartTag(name, attributes);
	};

	modes.inRow.startTagOther = function(name, attributes, selfClosing) {
		modes.inTable.processStartTag(name, attributes, selfClosing);
	};

	modes.inRow.endTagTr = function(name) {
		if (this.ignoreEndTagTr()) {
			assert.ok(tree.context);
			tree.parseError('unexpected-end-tag', {name: name});
		} else {
			tree.openElements.popUntilTableRowScopeMarker();
			tree.popElement();
			tree.setInsertionMode('inTableBody');
		}
	};

	modes.inRow.endTagTable = function(name) {
		var ignoreEndTag = this.ignoreEndTagTr();
		this.endTagTr('tr');
		if (!ignoreEndTag) tree.insertionMode.processEndTag(name);
	};

	modes.inRow.endTagTableRowGroup = function(name) {
		if (tree.openElements.inTableScope(name)) {
			this.endTagTr('tr');
			tree.insertionMode.processEndTag(name);
		} else {
			tree.parseError('unexpected-end-tag', {name: name});
		}
	};

	modes.inRow.endTagIgnore = function(name) {
		tree.parseError("unexpected-end-tag-in-table-row", {name: name});
	};

	modes.inRow.endTagOther = function(name) {
		modes.inTable.processEndTag(name);
	};

	modes.inRow.ignoreEndTagTr = function() {
		return !tree.openElements.inTableScope('tr');
	};

	modes.afterAfterFrameset = Object.create(modes.base);

	modes.afterAfterFrameset.start_tag_handlers = {
		html: 'startTagHtml',
		noframes: 'startTagNoFrames',
		'-default': 'startTagOther'
	};

	modes.afterAfterFrameset.processEOF = function() {};

	modes.afterAfterFrameset.processComment = function(data) {
		tree.insertComment(data, tree.document);
	};

	modes.afterAfterFrameset.processCharacters = function(buffer) {
		var characters = buffer.takeRemaining();
		var whitespace = "";
		for (var i = 0; i < characters.length; i++) {
			var ch = characters[i];
			if (isWhitespace(ch))
				whitespace += ch;
		}
		if (whitespace) {
			tree.reconstructActiveFormattingElements();
			tree.insertText(whitespace);
		}
		if (whitespace.length < characters.length)
			tree.parseError('expected-eof-but-got-char');
	};

	modes.afterAfterFrameset.startTagNoFrames = function(name, attributes) {
		modes.inHead.processStartTag(name, attributes);
	};

	modes.afterAfterFrameset.startTagOther = function(name, attributes, selfClosing) {
		tree.parseError('expected-eof-but-got-start-tag', {name: name});
	};

	modes.afterAfterFrameset.processEndTag = function(name, attributes) {
		tree.parseError('expected-eof-but-got-end-tag', {name: name});
	};

	modes.text = Object.create(modes.base);

	modes.text.start_tag_handlers = {
		'-default': 'startTagOther'
	};

	modes.text.end_tag_handlers = {
		script: 'endTagScript',
		'-default': 'endTagOther'
	};

	modes.text.processCharacters = function(buffer) {
		if (tree.shouldSkipLeadingNewline) {
			tree.shouldSkipLeadingNewline = false;
			buffer.skipAtMostOneLeadingNewline();
		}
		var data = buffer.takeRemaining();
		if (!data)
			return;
		tree.insertText(data);
	};

	modes.text.processEOF = function() {
		tree.parseError("expected-named-closing-tag-but-got-eof",
			{name: tree.currentStackItem().localName});
		tree.openElements.pop();
		tree.setInsertionMode(tree.originalInsertionMode);
		tree.insertionMode.processEOF();
	};

	modes.text.startTagOther = function(name) {
		throw "Tried to process start tag " + name + " in RCDATA/RAWTEXT mode";
	};

	modes.text.endTagScript = function(name) {
		var node = tree.openElements.pop();
		assert.ok(node.localName == 'script');
		tree.setInsertionMode(tree.originalInsertionMode);
	};

	modes.text.endTagOther = function(name) {
		tree.openElements.pop();
		tree.setInsertionMode(tree.originalInsertionMode);
	};
}

TreeBuilder.prototype.setInsertionMode = function(name) {
	this.insertionMode = this.insertionModes[name];
	this.insertionModeName = name;
};
TreeBuilder.prototype.adoptionAgencyEndTag = function(name) {
	var outerIterationLimit = 8;
	var innerIterationLimit = 3;
	var formattingElement;

	function isActiveFormattingElement(el) {
		return el === formattingElement;
	}

	var outerLoopCounter = 0;

	while (outerLoopCounter++ < outerIterationLimit) {
		formattingElement = this.elementInActiveFormattingElements(name);

		if (!formattingElement || (this.openElements.contains(formattingElement) && !this.openElements.inScope(formattingElement.localName))) {
			this.parseError('adoption-agency-1.1', {name: name});
			return false;
		}
		if (!this.openElements.contains(formattingElement)) {
			this.parseError('adoption-agency-1.2', {name: name});
			this.removeElementFromActiveFormattingElements(formattingElement);
			return true;
		}
		if (!this.openElements.inScope(formattingElement.localName)) {
			this.parseError('adoption-agency-4.4', {name: name});
		}

		if (formattingElement != this.currentStackItem()) {
			this.parseError('adoption-agency-1.3', {name: name});
		}
		var furthestBlock = this.openElements.furthestBlockForFormattingElement(formattingElement.node);

		if (!furthestBlock) {
			this.openElements.remove_openElements_until(isActiveFormattingElement);
			this.removeElementFromActiveFormattingElements(formattingElement);
			return true;
		}

		var afeIndex = this.openElements.elements.indexOf(formattingElement);
		var commonAncestor = this.openElements.item(afeIndex - 1);

		var bookmark = this.activeFormattingElements.indexOf(formattingElement);

		var node = furthestBlock;
		var lastNode = furthestBlock;
		var index = this.openElements.elements.indexOf(node);

		var innerLoopCounter = 0;
		while (innerLoopCounter++ < innerIterationLimit) {
			index -= 1;
			node = this.openElements.item(index);
			if (this.activeFormattingElements.indexOf(node) < 0) {
				this.openElements.elements.splice(index, 1);
				continue;
			}
			if (node == formattingElement)
				break;

			if (lastNode == furthestBlock)
				bookmark = this.activeFormattingElements.indexOf(node) + 1;

			var clone = this.createElement(node.namespaceURI, node.localName, node.attributes);
			var newNode = new StackItem(node.namespaceURI, node.localName, node.attributes, clone);

			this.activeFormattingElements[this.activeFormattingElements.indexOf(node)] = newNode;
			this.openElements.elements[this.openElements.elements.indexOf(node)] = newNode;

			node = newNode;
			this.detachFromParent(lastNode.node);
			this.attachNode(lastNode.node, node.node);
			lastNode = node;
		}

		this.detachFromParent(lastNode.node);
		if (commonAncestor.isFosterParenting()) {
			this.insertIntoFosterParent(lastNode.node);
		} else {
			this.attachNode(lastNode.node, commonAncestor.node);
		}

		var clone = this.createElement("http://www.w3.org/1999/xhtml", formattingElement.localName, formattingElement.attributes);
		var formattingClone = new StackItem(formattingElement.namespaceURI, formattingElement.localName, formattingElement.attributes, clone);

		this.reparentChildren(furthestBlock.node, clone);
		this.attachNode(clone, furthestBlock.node);

		this.removeElementFromActiveFormattingElements(formattingElement);
		this.activeFormattingElements.splice(Math.min(bookmark, this.activeFormattingElements.length), 0, formattingClone);

		this.openElements.remove(formattingElement);
		this.openElements.elements.splice(this.openElements.elements.indexOf(furthestBlock) + 1, 0, formattingClone);
	}

	return true;
};

TreeBuilder.prototype.start = function() {
	throw "Not mplemented";
};

TreeBuilder.prototype.startTokenization = function(tokenizer) {
	this.tokenizer = tokenizer;
	this.compatMode = "no quirks";
	this.originalInsertionMode = "initial";
	this.framesetOk = true;
	this.openElements = new ElementStack();
	this.activeFormattingElements = [];
	this.start();
	if (this.context) {
		switch(this.context) {
		case 'title':
		case 'textarea':
			this.tokenizer.setState(Tokenizer.RCDATA);
			break;
		case 'style':
		case 'xmp':
		case 'iframe':
		case 'noembed':
		case 'noframes':
			this.tokenizer.setState(Tokenizer.RAWTEXT);
			break;
		case 'script':
			this.tokenizer.setState(Tokenizer.SCRIPT_DATA);
			break;
		case 'noscript':
			if (this.scriptingEnabled)
				this.tokenizer.setState(Tokenizer.RAWTEXT);
			break;
		case 'plaintext':
			this.tokenizer.setState(Tokenizer.PLAINTEXT);
			break;
		}
		this.insertHtmlElement();
		this.resetInsertionMode();
	} else {
		this.setInsertionMode('initial');
	}
};

TreeBuilder.prototype.processToken = function(token) {
	this.selfClosingFlagAcknowledged = false;

	var currentNode = this.openElements.top || null;
	var insertionMode;
	if (!currentNode || !currentNode.isForeign() ||
		(currentNode.isMathMLTextIntegrationPoint() &&
			((token.type == 'StartTag' &&
					!(token.name in {mglyph:0, malignmark:0})) ||
				(token.type === 'Characters'))
		) ||
		(currentNode.namespaceURI == "http://www.w3.org/1998/Math/MathML" &&
			currentNode.localName == 'annotation-xml' &&
			token.type == 'StartTag' && token.name == 'svg'
		) ||
		(currentNode.isHtmlIntegrationPoint() &&
			token.type in {StartTag:0, Characters:0}
		) ||
		token.type == 'EOF'
	) {
		insertionMode = this.insertionMode;
	} else {
		insertionMode = this.insertionModes.inForeignContent;
	}
	switch(token.type) {
	case 'Characters':
		var buffer = new CharacterBuffer(token.data);
		insertionMode.processCharacters(buffer);
		break;
	case 'Comment':
		insertionMode.processComment(token.data);
		break;
	case 'StartTag':
		insertionMode.processStartTag(token.name, token.data, token.selfClosing);
		break;
	case 'EndTag':
		insertionMode.processEndTag(token.name);
		break;
	case 'Doctype':
		insertionMode.processDoctype(token.name, token.publicId, token.systemId, token.forceQuirks);
		break;
	case 'EOF':
		insertionMode.processEOF();
		break;
	}
};
TreeBuilder.prototype.isCdataSectionAllowed = function() {
	return this.openElements.length > 0 && this.currentStackItem().isForeign();
};
TreeBuilder.prototype.isSelfClosingFlagAcknowledged = function() {
	return this.selfClosingFlagAcknowledged;
};

TreeBuilder.prototype.createElement = function(namespaceURI, localName, attributes) {
	throw new Error("Not implemented");
};

TreeBuilder.prototype.attachNode = function(child, parent) {
	throw new Error("Not implemented");
};

TreeBuilder.prototype.attachNodeToFosterParent = function(child, table, stackParent) {
	throw new Error("Not implemented");
};

TreeBuilder.prototype.detachFromParent = function(node) {
	throw new Error("Not implemented");
};

TreeBuilder.prototype.addAttributesToElement = function(element, attributes) {
	throw new Error("Not implemented");
};

TreeBuilder.prototype.insertHtmlElement = function(attributes) {
	var root = this.createElement("http://www.w3.org/1999/xhtml", 'html', attributes);
	this.attachNode(root, this.document);
	this.openElements.pushHtmlElement(new StackItem("http://www.w3.org/1999/xhtml", 'html', attributes, root));
	return root;
};

TreeBuilder.prototype.insertHeadElement = function(attributes) {
	var element = this.createElement("http://www.w3.org/1999/xhtml", "head", attributes);
	this.head = new StackItem("http://www.w3.org/1999/xhtml", "head", attributes, element);
	this.attachNode(element, this.openElements.top.node);
	this.openElements.pushHeadElement(this.head);
	return element;
};

TreeBuilder.prototype.insertBodyElement = function(attributes) {
	var element = this.createElement("http://www.w3.org/1999/xhtml", "body", attributes);
	this.attachNode(element, this.openElements.top.node);
	this.openElements.pushBodyElement(new StackItem("http://www.w3.org/1999/xhtml", "body", attributes, element));
	return element;
};

TreeBuilder.prototype.insertIntoFosterParent = function(node) {
	var tableIndex = this.openElements.findIndex('table');
	var tableElement = this.openElements.item(tableIndex).node;
	if (tableIndex === 0)
		return this.attachNode(node, tableElement);
	this.attachNodeToFosterParent(node, tableElement, this.openElements.item(tableIndex - 1).node);
};

TreeBuilder.prototype.insertElement = function(name, attributes, namespaceURI, selfClosing) {
	if (!namespaceURI)
		namespaceURI = "http://www.w3.org/1999/xhtml";
	var element = this.createElement(namespaceURI, name, attributes);
	if (this.shouldFosterParent())
		this.insertIntoFosterParent(element);
	else
		this.attachNode(element, this.openElements.top.node);
	if (!selfClosing)
		this.openElements.push(new StackItem(namespaceURI, name, attributes, element));
};

TreeBuilder.prototype.insertFormattingElement = function(name, attributes) {
	this.insertElement(name, attributes, "http://www.w3.org/1999/xhtml");
	this.appendElementToActiveFormattingElements(this.currentStackItem());
};

TreeBuilder.prototype.insertSelfClosingElement = function(name, attributes) {
	this.selfClosingFlagAcknowledged = true;
	this.insertElement(name, attributes, "http://www.w3.org/1999/xhtml", true);
};

TreeBuilder.prototype.insertForeignElement = function(name, attributes, namespaceURI, selfClosing) {
	if (selfClosing)
		this.selfClosingFlagAcknowledged = true;
	this.insertElement(name, attributes, namespaceURI, selfClosing);
};

TreeBuilder.prototype.insertComment = function(data, parent) {
	throw new Error("Not implemented");
};

TreeBuilder.prototype.insertDoctype = function(name, publicId, systemId) {
	throw new Error("Not implemented");
};

TreeBuilder.prototype.insertText = function(data) {
	throw new Error("Not implemented");
};
TreeBuilder.prototype.currentStackItem = function() {
	return this.openElements.top;
};
TreeBuilder.prototype.popElement = function() {
	return this.openElements.pop();
};
TreeBuilder.prototype.shouldFosterParent = function() {
	return this.redirectAttachToFosterParent && this.currentStackItem().isFosterParenting();
};
TreeBuilder.prototype.generateImpliedEndTags = function(exclude) {
	var name = this.openElements.top.localName;
	if (['dd', 'dt', 'li', 'option', 'optgroup', 'p', 'rp', 'rt'].indexOf(name) != -1 && name != exclude) {
		this.popElement();
		this.generateImpliedEndTags(exclude);
	}
};
TreeBuilder.prototype.reconstructActiveFormattingElements = function() {
	if (this.activeFormattingElements.length === 0)
		return;
	var i = this.activeFormattingElements.length - 1;
	var entry = this.activeFormattingElements[i];
	if (entry == Marker || this.openElements.contains(entry))
		return;

	while (entry != Marker && !this.openElements.contains(entry)) {
		i -= 1;
		entry = this.activeFormattingElements[i];
		if (!entry)
			break;
	}

	while (true) {
		i += 1;
		entry = this.activeFormattingElements[i];
		this.insertElement(entry.localName, entry.attributes);
		var element = this.currentStackItem();
		this.activeFormattingElements[i] = element;
		if (element == this.activeFormattingElements[this.activeFormattingElements.length -1])
			break;
	}

};
TreeBuilder.prototype.ensureNoahsArkCondition = function(item) {
	var kNoahsArkCapacity = 3;
	if (this.activeFormattingElements.length < kNoahsArkCapacity)
		return;
	var candidates = [];
	var newItemAttributeCount = item.attributes.length;
	for (var i = this.activeFormattingElements.length - 1; i >= 0; i--) {
		var candidate = this.activeFormattingElements[i];
		if (candidate === Marker)
			break;
		if (item.localName !== candidate.localName || item.namespaceURI !== candidate.namespaceURI)
			continue;
		if (candidate.attributes.length != newItemAttributeCount)
			continue;
		candidates.push(candidate);
	}
	if (candidates.length < kNoahsArkCapacity)
		return;

	var remainingCandidates = [];
	var attributes = item.attributes;
	for (var i = 0; i < attributes.length; i++) {
		var attribute = attributes[i];

		for (var j = 0; j < candidates.length; j++) {
			var candidate = candidates[j];
			var candidateAttribute = getAttribute(candidate, attribute.nodeName);
			if (candidateAttribute && candidateAttribute.nodeValue === attribute.nodeValue)
				remainingCandidates.push(candidate);
		}
		if (remainingCandidates.length < kNoahsArkCapacity)
			return;
		candidates = remainingCandidates;
		remainingCandidates = [];
	}
	for (var i = kNoahsArkCapacity - 1; i < candidates.length; i++)
		this.removeElementFromActiveFormattingElements(candidates[i]);
};
TreeBuilder.prototype.appendElementToActiveFormattingElements = function(item) {
	this.ensureNoahsArkCondition(item);
	this.activeFormattingElements.push(item);
};
TreeBuilder.prototype.removeElementFromActiveFormattingElements = function(item) {
	var index = this.activeFormattingElements.indexOf(item);
	if (index >= 0)
		this.activeFormattingElements.splice(index, 1);
};

TreeBuilder.prototype.elementInActiveFormattingElements = function(name) {
	var els = this.activeFormattingElements;
	for (var i = els.length - 1; i >= 0; i--) {
		if (els[i] == Marker) break;
		if (els[i].localName == name) return els[i];
	}
	return false;
};

TreeBuilder.prototype.clearActiveFormattingElements = function() {
    while (!(this.activeFormattingElements.length === 0 || this.activeFormattingElements.pop() == Marker));
};

TreeBuilder.prototype.reparentChildren = function(oldParent, newParent) {
	throw new Error("Not implemented");
};
TreeBuilder.prototype.setFragmentContext = function(context) {
	this.context = context;
};
TreeBuilder.prototype.parseError = function(code, args) {
	if (!this.errorHandler)
		return;
	var message = formatMessage(messages[code], args);
	this.errorHandler.error(message, this.tokenizer._inputStream.location(), code);
};
TreeBuilder.prototype.resetInsertionMode = function() {
	var last = false;
	var node = null;
	for (var i = this.openElements.length - 1; i >= 0; i--) {
		node = this.openElements.item(i);
		if (i === 0) {
			assert.ok(this.context);
			last = true;
			node = new StackItem("http://www.w3.org/1999/xhtml", this.context, [], null);
		}

		if (node.namespaceURI === "http://www.w3.org/1999/xhtml") {
			if (node.localName === 'select')
				return this.setInsertionMode('inSelect');
			if (node.localName === 'td' || node.localName === 'th')
				return this.setInsertionMode('inCell');
			if (node.localName === 'tr')
				return this.setInsertionMode('inRow');
			if (node.localName === 'tbody' || node.localName === 'thead' || node.localName === 'tfoot')
				return this.setInsertionMode('inTableBody');
			if (node.localName === 'caption')
				return this.setInsertionMode('inCaption');
			if (node.localName === 'colgroup')
				return this.setInsertionMode('inColumnGroup');
			if (node.localName === 'table')
				return this.setInsertionMode('inTable');
			if (node.localName === 'head' && !last)
				return this.setInsertionMode('inHead');
			if (node.localName === 'body')
				return this.setInsertionMode('inBody');
			if (node.localName === 'frameset')
				return this.setInsertionMode('inFrameset');
			if (node.localName === 'html')
				if (!this.openElements.headElement)
					return this.setInsertionMode('beforeHead');
				else
					return this.setInsertionMode('afterHead');
		}

		if (last)
			return this.setInsertionMode('inBody');
	}
};

TreeBuilder.prototype.processGenericRCDATAStartTag = function(name, attributes) {
	this.insertElement(name, attributes);
	this.tokenizer.setState(Tokenizer.RCDATA);
	this.originalInsertionMode = this.insertionModeName;
	this.setInsertionMode('text');
};

TreeBuilder.prototype.processGenericRawTextStartTag = function(name, attributes) {
	this.insertElement(name, attributes);
	this.tokenizer.setState(Tokenizer.RAWTEXT);
	this.originalInsertionMode = this.insertionModeName;
	this.setInsertionMode('text');
};

TreeBuilder.prototype.adjustMathMLAttributes = function(attributes) {
	attributes.forEach(function(a) {
		a.namespaceURI = "http://www.w3.org/1998/Math/MathML";
		if (constants.MATHMLAttributeMap[a.nodeName])
			a.nodeName = constants.MATHMLAttributeMap[a.nodeName];
	});
	return attributes;
};

TreeBuilder.prototype.adjustSVGTagNameCase = function(name) {
	return constants.SVGTagMap[name] || name;
};

TreeBuilder.prototype.adjustSVGAttributes = function(attributes) {
	attributes.forEach(function(a) {
		a.namespaceURI = "http://www.w3.org/2000/svg";
		if (constants.SVGAttributeMap[a.nodeName])
			a.nodeName = constants.SVGAttributeMap[a.nodeName];
	});
	return attributes;
};

TreeBuilder.prototype.adjustForeignAttributes = function(attributes) {
	for (var i = 0; i < attributes.length; i++) {
		var attribute = attributes[i];
		var adjusted = constants.ForeignAttributeMap[attribute.nodeName];
		if (adjusted) {
			attribute.nodeName = adjusted.localName;
			attribute.prefix = adjusted.prefix;
			attribute.namespaceURI = adjusted.namespaceURI;
		}
	}
	return attributes;
};

function formatMessage(format, args) {
	return format.replace(new RegExp('{[0-9a-z-]+}', 'gi'), function(match) {
		return args[match.slice(1, -1)] || match;
	});
}

exports.TreeBuilder = TreeBuilder;

},
{"./ElementStack":1,"./StackItem":4,"./Tokenizer":5,"./constants":7,"./messages.json":8,"assert":13,"events":16}],
7:[function(_dereq_,module,exports){
exports.SVGTagMap = {
	"altglyph": "altGlyph",
	"altglyphdef": "altGlyphDef",
	"altglyphitem": "altGlyphItem",
	"animatecolor": "animateColor",
	"animatemotion": "animateMotion",
	"animatetransform": "animateTransform",
	"clippath": "clipPath",
	"feblend": "feBlend",
	"fecolormatrix": "feColorMatrix",
	"fecomponenttransfer": "feComponentTransfer",
	"fecomposite": "feComposite",
	"feconvolvematrix": "feConvolveMatrix",
	"fediffuselighting": "feDiffuseLighting",
	"fedisplacementmap": "feDisplacementMap",
	"fedistantlight": "feDistantLight",
	"feflood": "feFlood",
	"fefunca": "feFuncA",
	"fefuncb": "feFuncB",
	"fefuncg": "feFuncG",
	"fefuncr": "feFuncR",
	"fegaussianblur": "feGaussianBlur",
	"feimage": "feImage",
	"femerge": "feMerge",
	"femergenode": "feMergeNode",
	"femorphology": "feMorphology",
	"feoffset": "feOffset",
	"fepointlight": "fePointLight",
	"fespecularlighting": "feSpecularLighting",
	"fespotlight": "feSpotLight",
	"fetile": "feTile",
	"feturbulence": "feTurbulence",
	"foreignobject": "foreignObject",
	"glyphref": "glyphRef",
	"lineargradient": "linearGradient",
	"radialgradient": "radialGradient",
	"textpath": "textPath"
};

exports.MATHMLAttributeMap = {
	definitionurl: 'definitionURL'
};

exports.SVGAttributeMap = {
	attributename:	'attributeName',
	attributetype:	'attributeType',
	basefrequency:	'baseFrequency',
	baseprofile:	'baseProfile',
	calcmode:	'calcMode',
	clippathunits:	'clipPathUnits',
	contentscripttype:	'contentScriptType',
	contentstyletype:	'contentStyleType',
	diffuseconstant:	'diffuseConstant',
	edgemode:	'edgeMode',
	externalresourcesrequired:	'externalResourcesRequired',
	filterres:	'filterRes',
	filterunits:	'filterUnits',
	glyphref:	'glyphRef',
	gradienttransform:	'gradientTransform',
	gradientunits:	'gradientUnits',
	kernelmatrix:	'kernelMatrix',
	kernelunitlength:	'kernelUnitLength',
	keypoints:	'keyPoints',
	keysplines:	'keySplines',
	keytimes:	'keyTimes',
	lengthadjust:	'lengthAdjust',
	limitingconeangle:	'limitingConeAngle',
	markerheight:	'markerHeight',
	markerunits:	'markerUnits',
	markerwidth:	'markerWidth',
	maskcontentunits:	'maskContentUnits',
	maskunits:	'maskUnits',
	numoctaves:	'numOctaves',
	pathlength:	'pathLength',
	patterncontentunits:	'patternContentUnits',
	patterntransform:	'patternTransform',
	patternunits:	'patternUnits',
	pointsatx:	'pointsAtX',
	pointsaty:	'pointsAtY',
	pointsatz:	'pointsAtZ',
	preservealpha:	'preserveAlpha',
	preserveaspectratio:	'preserveAspectRatio',
	primitiveunits:	'primitiveUnits',
	refx:	'refX',
	refy:	'refY',
	repeatcount:	'repeatCount',
	repeatdur:	'repeatDur',
	requiredextensions:	'requiredExtensions',
	requiredfeatures:	'requiredFeatures',
	specularconstant:	'specularConstant',
	specularexponent:	'specularExponent',
	spreadmethod:	'spreadMethod',
	startoffset:	'startOffset',
	stddeviation:	'stdDeviation',
	stitchtiles:	'stitchTiles',
	surfacescale:	'surfaceScale',
	systemlanguage:	'systemLanguage',
	tablevalues:	'tableValues',
	targetx:	'targetX',
	targety:	'targetY',
	textlength:	'textLength',
	viewbox:	'viewBox',
	viewtarget:	'viewTarget',
	xchannelselector:	'xChannelSelector',
	ychannelselector:	'yChannelSelector',
	zoomandpan:	'zoomAndPan'
};

exports.ForeignAttributeMap = {
	"xlink:actuate": {prefix: "xlink", localName: "actuate", namespaceURI: "http://www.w3.org/1999/xlink"},
	"xlink:arcrole": {prefix: "xlink", localName: "arcrole", namespaceURI: "http://www.w3.org/1999/xlink"},
	"xlink:href": {prefix: "xlink", localName: "href", namespaceURI: "http://www.w3.org/1999/xlink"},
	"xlink:role": {prefix: "xlink", localName: "role", namespaceURI: "http://www.w3.org/1999/xlink"},
	"xlink:show": {prefix: "xlink", localName: "show", namespaceURI: "http://www.w3.org/1999/xlink"},
	"xlink:title": {prefix: "xlink", localName: "title", namespaceURI: "http://www.w3.org/1999/xlink"},
	"xlink:type": {prefix: "xlink", localName: "title", namespaceURI: "http://www.w3.org/1999/xlink"},
	"xml:base": {prefix: "xml", localName: "base", namespaceURI: "http://www.w3.org/XML/1998/namespace"},
	"xml:lang": {prefix: "xml", localName: "lang", namespaceURI: "http://www.w3.org/XML/1998/namespace"},
	"xml:space": {prefix: "xml", localName: "space", namespaceURI: "http://www.w3.org/XML/1998/namespace"},
	"xmlns": {prefix: null, localName: "xmlns", namespaceURI: "http://www.w3.org/2000/xmlns/"},
	"xmlns:xlink": {prefix: "xmlns", localName: "xlink", namespaceURI: "http://www.w3.org/2000/xmlns/"},
};
},
{}],
8:[function(_dereq_,module,exports){
module.exports={
	"null-character":
		"Null character in input stream, replaced with U+FFFD.",
	"invalid-codepoint":
		"Invalid codepoint in stream",
	"incorrectly-placed-solidus":
		"Solidus (/) incorrectly placed in tag.",
	"incorrect-cr-newline-entity":
		"Incorrect CR newline entity, replaced with LF.",
	"illegal-windows-1252-entity":
		"Entity used with illegal number (windows-1252 reference).",
	"cant-convert-numeric-entity":
		"Numeric entity couldn't be converted to character (codepoint U+{charAsInt}).",
	"invalid-numeric-entity-replaced":
		"Numeric entity represents an illegal codepoint. Expanded to the C1 controls range.",
	"numeric-entity-without-semicolon":
		"Numeric entity didn't end with ';'.",
	"expected-numeric-entity-but-got-eof":
		"Numeric entity expected. Got end of file instead.",
	"expected-numeric-entity":
		"Numeric entity expected but none found.",
	"named-entity-without-semicolon":
		"Named entity didn't end with ';'.",
	"expected-named-entity":
		"Named entity expected. Got none.",
	"attributes-in-end-tag":
		"End tag contains unexpected attributes.",
	"self-closing-flag-on-end-tag":
		"End tag contains unexpected self-closing flag.",
	"bare-less-than-sign-at-eof":
		"End of file after <.",
	"expected-tag-name-but-got-right-bracket":
		"Expected tag name. Got '>' instead.",
	"expected-tag-name-but-got-question-mark":
		"Expected tag name. Got '?' instead. (HTML doesn't support processing instructions.)",
	"expected-tag-name":
		"Expected tag name. Got something else instead.",
	"expected-closing-tag-but-got-right-bracket":
		"Expected closing tag. Got '>' instead. Ignoring '</>'.",
	"expected-closing-tag-but-got-eof":
		"Expected closing tag. Unexpected end of file.",
	"expected-closing-tag-but-got-char":
		"Expected closing tag. Unexpected character '{data}' found.",
	"eof-in-tag-name":
		"Unexpected end of file in the tag name.",
	"expected-attribute-name-but-got-eof":
		"Unexpected end of file. Expected attribute name instead.",
	"eof-in-attribute-name":
		"Unexpected end of file in attribute name.",
	"invalid-character-in-attribute-name":
		"Invalid character in attribute name.",
	"duplicate-attribute":
		"Dropped duplicate attribute '{name}' on tag.",
	"expected-end-of-tag-but-got-eof":
		"Unexpected end of file. Expected = or end of tag.",
	"expected-attribute-value-but-got-eof":
		"Unexpected end of file. Expected attribute value.",
	"expected-attribute-value-but-got-right-bracket":
		"Expected attribute value. Got '>' instead.",
	"unexpected-character-in-unquoted-attribute-value":
		"Unexpected character in unquoted attribute",
	"invalid-character-after-attribute-name":
		"Unexpected character after attribute name.",
	"unexpected-character-after-attribute-value":
		"Unexpected character after attribute value.",
	"eof-in-attribute-value-double-quote":
		"Unexpected end of file in attribute value (\").",
	"eof-in-attribute-value-single-quote":
		"Unexpected end of file in attribute value (').",
	"eof-in-attribute-value-no-quotes":
		"Unexpected end of file in attribute value.",
	"eof-after-attribute-value":
		"Unexpected end of file after attribute value.",
	"unexpected-eof-after-solidus-in-tag":
		"Unexpected end of file in tag. Expected >.",
	"unexpected-character-after-solidus-in-tag":
		"Unexpected character after / in tag. Expected >.",
	"expected-dashes-or-doctype":
		"Expected '--' or 'DOCTYPE'. Not found.",
	"unexpected-bang-after-double-dash-in-comment":
		"Unexpected ! after -- in comment.",
	"incorrect-comment":
		"Incorrect comment.",
	"eof-in-comment":
		"Unexpected end of file in comment.",
	"eof-in-comment-end-dash":
		"Unexpected end of file in comment (-).",
	"unexpected-dash-after-double-dash-in-comment":
		"Unexpected '-' after '--' found in comment.",
	"eof-in-comment-double-dash":
		"Unexpected end of file in comment (--).",
	"eof-in-comment-end-bang-state":
		"Unexpected end of file in comment.",
	"unexpected-char-in-comment":
		"Unexpected character in comment found.",
	"need-space-after-doctype":
		"No space after literal string 'DOCTYPE'.",
	"expected-doctype-name-but-got-right-bracket":
		"Unexpected > character. Expected DOCTYPE name.",
	"expected-doctype-name-but-got-eof":
		"Unexpected end of file. Expected DOCTYPE name.",
	"eof-in-doctype-name":
		"Unexpected end of file in DOCTYPE name.",
	"eof-in-doctype":
		"Unexpected end of file in DOCTYPE.",
	"expected-space-or-right-bracket-in-doctype":
		"Expected space or '>'. Got '{data}'.",
	"unexpected-end-of-doctype":
		"Unexpected end of DOCTYPE.",
	"unexpected-char-in-doctype":
		"Unexpected character in DOCTYPE.",
	"eof-in-bogus-doctype":
		"Unexpected end of file in bogus doctype.",
	"eof-in-innerhtml":
		"Unexpected EOF in inner html mode.",
	"unexpected-doctype":
		"Unexpected DOCTYPE. Ignored.",
	"non-html-root":
		"html needs to be the first start tag.",
	"expected-doctype-but-got-eof":
		"Unexpected End of file. Expected DOCTYPE.",
	"unknown-doctype":
		"Erroneous DOCTYPE. Expected <!DOCTYPE html>.",
	"quirky-doctype":
		"Quirky doctype. Expected <!DOCTYPE html>.",
	"almost-standards-doctype":
		"Almost standards mode doctype. Expected <!DOCTYPE html>.",
	"obsolete-doctype":
		"Obsolete doctype. Expected <!DOCTYPE html>.",
	"expected-doctype-but-got-chars":
		"Non-space characters found without seeing a doctype first. Expected e.g. <!DOCTYPE html>.",
	"expected-doctype-but-got-start-tag":
		"Start tag seen without seeing a doctype first. Expected e.g. <!DOCTYPE html>.",
	"expected-doctype-but-got-end-tag":
		"End tag seen without seeing a doctype first. Expected e.g. <!DOCTYPE html>.",
	"end-tag-after-implied-root":
		"Unexpected end tag ({name}) after the (implied) root element.",
	"expected-named-closing-tag-but-got-eof":
		"Unexpected end of file. Expected end tag ({name}).",
	"two-heads-are-not-better-than-one":
		"Unexpected start tag head in existing head. Ignored.",
	"unexpected-end-tag":
		"Unexpected end tag ({name}). Ignored.",
	"unexpected-implied-end-tag":
		"End tag {name} implied, but there were open elements.",
	"unexpected-start-tag-out-of-my-head":
		"Unexpected start tag ({name}) that can be in head. Moved.",
	"unexpected-start-tag":
		"Unexpected start tag ({name}).",
	"missing-end-tag":
		"Missing end tag ({name}).",
	"missing-end-tags":
		"Missing end tags ({name}).",
	"unexpected-start-tag-implies-end-tag":
		"Unexpected start tag ({startName}) implies end tag ({endName}).",
	"unexpected-start-tag-treated-as":
		"Unexpected start tag ({originalName}). Treated as {newName}.",
	"deprecated-tag":
		"Unexpected start tag {name}. Don't use it!",
	"unexpected-start-tag-ignored":
		"Unexpected start tag {name}. Ignored.",
	"expected-one-end-tag-but-got-another":
		"Unexpected end tag ({gotName}). Missing end tag ({expectedName}).",
	"end-tag-too-early":
		"End tag ({name}) seen too early. Expected other end tag.",
	"end-tag-too-early-named":
		"Unexpected end tag ({gotName}). Expected end tag ({expectedName}.",
	"end-tag-too-early-ignored":
		"End tag ({name}) seen too early. Ignored.",
	"adoption-agency-1.1":
		"End tag ({name}) violates step 1, paragraph 1 of the adoption agency algorithm.",
	"adoption-agency-1.2":
		"End tag ({name}) violates step 1, paragraph 2 of the adoption agency algorithm.",
	"adoption-agency-1.3":
		"End tag ({name}) violates step 1, paragraph 3 of the adoption agency algorithm.",
	"adoption-agency-4.4":
		"End tag ({name}) violates step 4, paragraph 4 of the adoption agency algorithm.",
	"unexpected-end-tag-treated-as":
		"Unexpected end tag ({originalName}). Treated as {newName}.",
	"no-end-tag":
		"This element ({name}) has no end tag.",
	"unexpected-implied-end-tag-in-table":
		"Unexpected implied end tag ({name}) in the table phase.",
	"unexpected-implied-end-tag-in-table-body":
		"Unexpected implied end tag ({name}) in the table body phase.",
	"unexpected-char-implies-table-voodoo":
		"Unexpected non-space characters in table context caused voodoo mode.",
	"unexpected-hidden-input-in-table":
		"Unexpected input with type hidden in table context.",
	"unexpected-form-in-table":
		"Unexpected form in table context.",
	"unexpected-start-tag-implies-table-voodoo":
		"Unexpected start tag ({name}) in table context caused voodoo mode.",
	"unexpected-end-tag-implies-table-voodoo":
		"Unexpected end tag ({name}) in table context caused voodoo mode.",
	"unexpected-cell-in-table-body":
		"Unexpected table cell start tag ({name}) in the table body phase.",
	"unexpected-cell-end-tag":
		"Got table cell end tag ({name}) while required end tags are missing.",
	"unexpected-end-tag-in-table-body":
		"Unexpected end tag ({name}) in the table body phase. Ignored.",
	"unexpected-implied-end-tag-in-table-row":
		"Unexpected implied end tag ({name}) in the table row phase.",
	"unexpected-end-tag-in-table-row":
		"Unexpected end tag ({name}) in the table row phase. Ignored.",
	"unexpected-select-in-select":
		"Unexpected select start tag in the select phase treated as select end tag.",
	"unexpected-input-in-select":
		"Unexpected input start tag in the select phase.",
	"unexpected-start-tag-in-select":
		"Unexpected start tag token ({name}) in the select phase. Ignored.",
	"unexpected-end-tag-in-select":
		"Unexpected end tag ({name}) in the select phase. Ignored.",
	"unexpected-table-element-start-tag-in-select-in-table":
		"Unexpected table element start tag ({name}) in the select in table phase.",
	"unexpected-table-element-end-tag-in-select-in-table":
		"Unexpected table element end tag ({name}) in the select in table phase.",
	"unexpected-char-after-body":
		"Unexpected non-space characters in the after body phase.",
	"unexpected-start-tag-after-body":
		"Unexpected start tag token ({name}) in the after body phase.",
	"unexpected-end-tag-after-body":
		"Unexpected end tag token ({name}) in the after body phase.",
	"unexpected-char-in-frameset":
		"Unepxected characters in the frameset phase. Characters ignored.",
	"unexpected-start-tag-in-frameset":
		"Unexpected start tag token ({name}) in the frameset phase. Ignored.",
	"unexpected-frameset-in-frameset-innerhtml":
		"Unexpected end tag token (frameset in the frameset phase (innerHTML).",
	"unexpected-end-tag-in-frameset":
		"Unexpected end tag token ({name}) in the frameset phase. Ignored.",
	"unexpected-char-after-frameset":
		"Unexpected non-space characters in the after frameset phase. Ignored.",
	"unexpected-start-tag-after-frameset":
		"Unexpected start tag ({name}) in the after frameset phase. Ignored.",
	"unexpected-end-tag-after-frameset":
		"Unexpected end tag ({name}) in the after frameset phase. Ignored.",
	"expected-eof-but-got-char":
		"Unexpected non-space characters. Expected end of file.",
	"expected-eof-but-got-start-tag":
		"Unexpected start tag ({name}). Expected end of file.",
	"expected-eof-but-got-end-tag":
		"Unexpected end tag ({name}). Expected end of file.",
	"unexpected-end-table-in-caption":
		"Unexpected end table tag in caption. Generates implied end caption.",
	"end-html-in-innerhtml":
		"Unexpected html end tag in inner html mode.",
	"eof-in-table":
		"Unexpected end of file. Expected table content.",
	"eof-in-script":
		"Unexpected end of file. Expected script content.",
	"non-void-element-with-trailing-solidus":
		"Trailing solidus not allowed on element {name}.",
	"unexpected-html-element-in-foreign-content":
		"HTML start tag \"{name}\" in a foreign namespace context.",
	"unexpected-start-tag-in-table":
		"Unexpected {name}. Expected table content."
}
},
{}],
9:[function(_dereq_,module,exports){
var SAXTreeBuilder = _dereq_('./SAXTreeBuilder').SAXTreeBuilder;
var Tokenizer = _dereq_('../Tokenizer').Tokenizer;
var TreeParser = _dereq_('./TreeParser').TreeParser;

function SAXParser() {
	this.contentHandler = null;
	this._errorHandler = null;
	this._treeBuilder = new SAXTreeBuilder();
	this._tokenizer = new Tokenizer(this._treeBuilder);
	this._scriptingEnabled = false;
}

SAXParser.prototype.parse = function(source) {
	this._tokenizer.tokenize(source);
	var document = this._treeBuilder.document;
	if (document) {
		new TreeParser(this.contentHandler).parse(document);
	}
};

SAXParser.prototype.parseFragment = function(source, context) {
	this._treeBuilder.setFragmentContext(context);
	this._tokenizer.tokenize(source);
	var fragment = this._treeBuilder.getFragment();
	if (fragment) {
		new TreeParser(this.contentHandler).parse(fragment);
	}
};

Object.defineProperty(SAXParser.prototype, 'scriptingEnabled', {
	get: function() {
		return this._scriptingEnabled;
	},
	set: function(value) {
		this._scriptingEnabled = value;
		this._treeBuilder.scriptingEnabled = value;
	}
});

Object.defineProperty(SAXParser.prototype, 'errorHandler', {
	get: function() {
		return this._errorHandler;
	},
	set: function(value) {
		this._errorHandler = value;
		this._treeBuilder.errorHandler = value;
	}
});

exports.SAXParser = SAXParser;

},
{"../Tokenizer":5,"./SAXTreeBuilder":10,"./TreeParser":11}],
10:[function(_dereq_,module,exports){
var util = _dereq_('util');
var TreeBuilder = _dereq_('../TreeBuilder').TreeBuilder;

function SAXTreeBuilder() {
	TreeBuilder.call(this);
}

util.inherits(SAXTreeBuilder, TreeBuilder);

SAXTreeBuilder.prototype.start = function(tokenizer) {
	this.document = new Document(this.tokenizer);
};

SAXTreeBuilder.prototype.end = function() {
	this.document.endLocator = this.tokenizer;
};

SAXTreeBuilder.prototype.insertDoctype = function(name, publicId, systemId) {
	var doctype = new DTD(this.tokenizer, name, publicId, systemId);
	doctype.endLocator = this.tokenizer;
	this.document.appendChild(doctype);
};

SAXTreeBuilder.prototype.createElement = function(namespaceURI, localName, attributes) {
	var element = new Element(this.tokenizer, namespaceURI, localName, localName, attributes || []);
	return element;
};

SAXTreeBuilder.prototype.insertComment = function(data, parent) {
	if (!parent)
		parent = this.currentStackItem();
	var comment = new Comment(this.tokenizer, data);
	parent.appendChild(comment);
};

SAXTreeBuilder.prototype.appendCharacters = function(parent, data) {
	var text = new Characters(this.tokenizer, data);
	parent.appendChild(text);
};

SAXTreeBuilder.prototype.insertText = function(data) {
	if (this.redirectAttachToFosterParent && this.openElements.top.isFosterParenting()) {
		var tableIndex = this.openElements.findIndex('table');
		var tableItem = this.openElements.item(tableIndex);
		var table = tableItem.node;
		if (tableIndex === 0) {
			return this.appendCharacters(table, data);
		}
		var text = new Characters(this.tokenizer, data);
		var parent = table.parentNode;
		if (parent) {
			parent.insertBetween(text, table.previousSibling, table);
			return;
		}
		var stackParent = this.openElements.item(tableIndex - 1).node;
		stackParent.appendChild(text);
		return;
	}
	this.appendCharacters(this.currentStackItem().node, data);
};

SAXTreeBuilder.prototype.attachNode = function(node, parent) {
	parent.appendChild(node);
};

SAXTreeBuilder.prototype.attachNodeToFosterParent = function(child, table, stackParent) {
	var parent = table.parentNode;
	if (parent)
		parent.insertBetween(child, table.previousSibling, table);
	else
		stackParent.appendChild(child);
};

SAXTreeBuilder.prototype.detachFromParent = function(element) {
	element.detach();
};

SAXTreeBuilder.prototype.reparentChildren = function(oldParent, newParent) {
	newParent.appendChildren(oldParent.firstChild);
};

SAXTreeBuilder.prototype.getFragment = function() {
	var fragment = new DocumentFragment();
	this.reparentChildren(this.openElements.rootNode, fragment);
	return fragment;
};

function getAttribute(node, name) {
	for (var i = 0; i < node.attributes.length; i++) {
		var attribute = node.attributes[i];
		if (attribute.nodeName === name)
			return attribute.nodeValue;
	}
}

SAXTreeBuilder.prototype.addAttributesToElement = function(element, attributes) {
	for (var i = 0; i < attributes.length; i++) {
		var attribute = attributes[i];
		if (!getAttribute(element, attribute.nodeName))
			element.attributes.push(attribute);
	}
};

var NodeType = {
	CDATA: 1,
	CHARACTERS: 2,
	COMMENT: 3,
	DOCUMENT: 4,
	DOCUMENT_FRAGMENT: 5,
	DTD: 6,
	ELEMENT: 7,
	ENTITY: 8,
	IGNORABLE_WHITESPACE: 9,
	PROCESSING_INSTRUCTION: 10,
	SKIPPED_ENTITY: 11
};
function Node(locator) {
	if (!locator) {
		this.columnNumber = -1;
		this.lineNumber = -1;
	} else {
		this.columnNumber = locator.columnNumber;
		this.lineNumber = locator.lineNumber;
	}
	this.parentNode = null;
	this.nextSibling = null;
	this.firstChild = null;
}
Node.prototype.visit = function(treeParser) {
	throw new Error("Not Implemented");
};
Node.prototype.revisit = function(treeParser) {
	return;
};
Node.prototype.detach = function() {
	if (this.parentNode !== null) {
		this.parentNode.removeChild(this);
		this.parentNode = null;
	}
};

Object.defineProperty(Node.prototype, 'previousSibling', {
	get: function() {
		var prev = null;
		var next = this.parentNode.firstChild;
		for(;;) {
			if (this == next) {
				return prev;
			}
			prev = next;
			next = next.nextSibling;
		}
	}
});


function ParentNode(locator) {
	Node.call(this, locator);
	this.lastChild = null;
	this._endLocator = null;
}

ParentNode.prototype = Object.create(Node.prototype);
ParentNode.prototype.insertBefore = function(child, sibling) {
	if (!sibling) {
		return this.appendChild(child);
	}
	child.detach();
	child.parentNode = this;
	if (this.firstChild == sibling) {
		child.nextSibling = sibling;
		this.firstChild = child;
	} else {
		var prev = this.firstChild;
		var next = this.firstChild.nextSibling;
		while (next != sibling) {
			prev = next;
			next = next.nextSibling;
		}
		prev.nextSibling = child;
		child.nextSibling = next;
	}
	return child;
};

ParentNode.prototype.insertBetween = function(child, prev, next) {
	if (!next) {
		return this.appendChild(child);
	}
	child.detach();
	child.parentNode = this;
	child.nextSibling = next;
	if (!prev) {
		firstChild = child;
	} else {
		prev.nextSibling = child;
	}
	return child;
};
ParentNode.prototype.appendChild = function(child) {
	child.detach();
	child.parentNode = this;
	if (!this.firstChild) {
		this.firstChild = child;
	} else {
		this.lastChild.nextSibling = child;
	}
	this.lastChild = child;
	return child;
};
ParentNode.prototype.appendChildren = function(parent) {
	var child = parent.firstChild;
	if (!child) {
		return;
	}
	var another = parent;
	if (!this.firstChild) {
		this.firstChild = child;
	} else {
		this.lastChild.nextSibling = child;
	}
	this.lastChild = another.lastChild;
	do {
		child.parentNode = this;
	} while ((child = child.nextSibling));
	another.firstChild = null;
	another.lastChild = null;
};
ParentNode.prototype.removeChild = function(node) {
	if (this.firstChild == node) {
		this.firstChild = node.nextSibling;
		if (this.lastChild == node) {
			this.lastChild = null;
		}
	} else {
		var prev = this.firstChild;
		var next = this.firstChild.nextSibling;
		while (next != node) {
			prev = next;
			next = next.nextSibling;
		}
		prev.nextSibling = node.nextSibling;
		if (this.lastChild == node) {
			this.lastChild = prev;
		}
	}
	node.parentNode = null;
	return node;
};

Object.defineProperty(ParentNode.prototype, 'endLocator', {
	get: function() {
		return this._endLocator;
	},
	set: function(endLocator) {
		this._endLocator = {
			lineNumber: endLocator.lineNumber,
			columnNumber: endLocator.columnNumber
		};
	}
});
function Document (locator) {
	ParentNode.call(this, locator);
	this.nodeType = NodeType.DOCUMENT;
}

Document.prototype = Object.create(ParentNode.prototype);
Document.prototype.visit = function(treeParser) {
	treeParser.startDocument(this);
};
Document.prototype.revisit = function(treeParser) {
	treeParser.endDocument(this.endLocator);
};
function DocumentFragment() {
	ParentNode.call(this, new Locator());
	this.nodeType = NodeType.DOCUMENT_FRAGMENT;
}

DocumentFragment.prototype = Object.create(ParentNode.prototype);
DocumentFragment.prototype.visit = function(treeParser) {
};
function Element(locator, uri, localName, qName, atts, prefixMappings) {
	ParentNode.call(this, locator);
	this.uri = uri;
	this.localName = localName;
	this.qName = qName;
	this.attributes = atts;
	this.prefixMappings = prefixMappings;
	this.nodeType = NodeType.ELEMENT;
}

Element.prototype = Object.create(ParentNode.prototype);
Element.prototype.visit = function(treeParser) {
	if (this.prefixMappings) {
		for (var key in prefixMappings) {
			var mapping = prefixMappings[key];
			treeParser.startPrefixMapping(mapping.getPrefix(),
					mapping.getUri(), this);
		}
	}
	treeParser.startElement(this.uri, this.localName, this.qName, this.attributes, this);
};
Element.prototype.revisit = function(treeParser) {
	treeParser.endElement(this.uri, this.localName, this.qName, this.endLocator);
	if (this.prefixMappings) {
		for (var key in prefixMappings) {
			var mapping = prefixMappings[key];
			treeParser.endPrefixMapping(mapping.getPrefix(), this.endLocator);
		}
	}
};
function Characters(locator, data){
	Node.call(this, locator);
	this.data = data;
	this.nodeType = NodeType.CHARACTERS;
}

Characters.prototype = Object.create(Node.prototype);
Characters.prototype.visit = function (treeParser) {
	treeParser.characters(this.data, 0, this.data.length, this);
};
function IgnorableWhitespace(locator, data) {
	Node.call(this, locator);
	this.data = data;
	this.nodeType = NodeType.IGNORABLE_WHITESPACE;
}

IgnorableWhitespace.prototype = Object.create(Node.prototype);
IgnorableWhitespace.prototype.visit = function(treeParser) {
	treeParser.ignorableWhitespace(this.data, 0, this.data.length, this);
};
function Comment(locator, data) {
	Node.call(this, locator);
	this.data = data;
	this.nodeType = NodeType.COMMENT;
}

Comment.prototype = Object.create(Node.prototype);
Comment.prototype.visit = function(treeParser) {
	treeParser.comment(this.data, 0, this.data.length, this);
};
function CDATA(locator) {
	ParentNode.call(this, locator);
	this.nodeType = NodeType.CDATA;
}

CDATA.prototype = Object.create(ParentNode.prototype);
CDATA.prototype.visit = function(treeParser) {
	treeParser.startCDATA(this);
};
CDATA.prototype.revisit = function(treeParser) {
	treeParser.endCDATA(this.endLocator);
};
function Entity(name) {
	ParentNode.call(this);
	this.name = name;
	this.nodeType = NodeType.ENTITY;
}

Entity.prototype = Object.create(ParentNode.prototype);
Entity.prototype.visit = function(treeParser) {
	treeParser.startEntity(this.name, this);
};
Entity.prototype.revisit = function(treeParser) {
	treeParser.endEntity(this.name);
};

function SkippedEntity(name) {
	Node.call(this);
	this.name = name;
	this.nodeType = NodeType.SKIPPED_ENTITY;
}

SkippedEntity.prototype = Object.create(Node.prototype);
SkippedEntity.prototype.visit = function(treeParser) {
	treeParser.skippedEntity(this.name, this);
};
function ProcessingInstruction(target, data) {
	Node.call(this);
	this.target = target;
	this.data = data;
}

ProcessingInstruction.prototype = Object.create(Node.prototype);
ProcessingInstruction.prototype.visit = function(treeParser) {
	treeParser.processingInstruction(this.target, this.data, this);
};
ProcessingInstruction.prototype.getNodeType = function() {
	return NodeType.PROCESSING_INSTRUCTION;
};
function DTD(name, publicIdentifier, systemIdentifier) {
	ParentNode.call(this);
	this.name = name;
	this.publicIdentifier = publicIdentifier;
	this.systemIdentifier = systemIdentifier;
	this.nodeType = NodeType.DTD;
}

DTD.prototype = Object.create(ParentNode.prototype);
DTD.prototype.visit = function(treeParser) {
	treeParser.startDTD(this.name, this.publicIdentifier, this.systemIdentifier, this);
};
DTD.prototype.revisit = function(treeParser) {
	treeParser.endDTD();
};

exports.SAXTreeBuilder = SAXTreeBuilder;

},
{"../TreeBuilder":6,"util":20}],
11:[function(_dereq_,module,exports){
function TreeParser(contentHandler, lexicalHandler){
	this.contentHandler;
	this.lexicalHandler;
	this.locatorDelegate;

	if (!contentHandler) {
		throw new IllegalArgumentException("contentHandler was null.");
	}
	this.contentHandler = contentHandler;
	if (!lexicalHandler) {
		this.lexicalHandler = new NullLexicalHandler();
	} else {
		this.lexicalHandler = lexicalHandler;
	}
}
TreeParser.prototype.parse = function(node) {
	this.contentHandler.documentLocator = this;
	var current = node;
	var next;
	for (;;) {
		current.visit(this);
		if (next = current.firstChild) {
			current = next;
			continue;
		}
		for (;;) {
			current.revisit(this);
			if (current == node) {
				return;
			}
			if (next = current.nextSibling) {
				current = next;
				break;
			}
			current = current.parentNode;
		}
	}
};
TreeParser.prototype.characters = function(ch, start, length, locator) {
	this.locatorDelegate = locator;
	this.contentHandler.characters(ch, start, length);
};
TreeParser.prototype.endDocument = function(locator) {
	this.locatorDelegate = locator;
	this.contentHandler.endDocument();
};
TreeParser.prototype.endElement = function(uri, localName, qName, locator) {
	this.locatorDelegate = locator;
	this.contentHandler.endElement(uri, localName, qName);
};
TreeParser.prototype.endPrefixMapping = function(prefix, locator) {
	this.locatorDelegate = locator;
	this.contentHandler.endPrefixMapping(prefix);
};
TreeParser.prototype.ignorableWhitespace = function(ch, start, length, locator) {
	this.locatorDelegate = locator;
	this.contentHandler.ignorableWhitespace(ch, start, length);
};
TreeParser.prototype.processingInstruction = function(target, data, locator) {
	this.locatorDelegate = locator;
	this.contentHandler.processingInstruction(target, data);
};
TreeParser.prototype.skippedEntity = function(name, locator) {
	this.locatorDelegate = locator;
	this.contentHandler.skippedEntity(name);
};
TreeParser.prototype.startDocument = function(locator) {
	this.locatorDelegate = locator;
	this.contentHandler.startDocument();
};
TreeParser.prototype.startElement = function(uri, localName, qName, atts, locator) {
	this.locatorDelegate = locator;
	this.contentHandler.startElement(uri, localName, qName, atts);
};
TreeParser.prototype.startPrefixMapping = function(prefix, uri, locator) {
	this.locatorDelegate = locator;
	this.contentHandler.startPrefixMapping(prefix, uri);
};
TreeParser.prototype.comment = function(ch, start, length, locator) {
	this.locatorDelegate = locator;
	this.lexicalHandler.comment(ch, start, length);
};
TreeParser.prototype.endCDATA = function(locator) {
	this.locatorDelegate = locator;
	this.lexicalHandler.endCDATA();
};
TreeParser.prototype.endDTD = function(locator) {
	this.locatorDelegate = locator;
	this.lexicalHandler.endDTD();
};
TreeParser.prototype.endEntity = function(name, locator) {
	this.locatorDelegate = locator;
	this.lexicalHandler.endEntity(name);
};
TreeParser.prototype.startCDATA = function(locator) {
	this.locatorDelegate = locator;
	this.lexicalHandler.startCDATA();
};
TreeParser.prototype.startDTD = function(name, publicId, systemId, locator) {
	this.locatorDelegate = locator;
	this.lexicalHandler.startDTD(name, publicId, systemId);
};
TreeParser.prototype.startEntity = function(name, locator) {
	this.locatorDelegate = locator;
	this.lexicalHandler.startEntity(name);
};

Object.defineProperty(TreeParser.prototype, 'columnNumber', {
	get: function() {
		if (!this.locatorDelegate)
			return -1;
		else
			return this.locatorDelegate.columnNumber;
	}
});

Object.defineProperty(TreeParser.prototype, 'lineNumber', {
	get: function() {
		if (!this.locatorDelegate)
			return -1;
		else
			return this.locatorDelegate.lineNumber;
	}
});
function NullLexicalHandler() {

}

NullLexicalHandler.prototype.comment = function() {};
NullLexicalHandler.prototype.endCDATA = function() {};
NullLexicalHandler.prototype.endDTD = function() {};
NullLexicalHandler.prototype.endEntity = function() {};
NullLexicalHandler.prototype.startCDATA = function() {};
NullLexicalHandler.prototype.startDTD = function() {};
NullLexicalHandler.prototype.startEntity = function() {};

exports.TreeParser = TreeParser;

},
{}],
12:[function(_dereq_,module,exports){
module.exports = {
	"Aacute;": "\u00C1",
	"Aacute": "\u00C1",
	"aacute;": "\u00E1",
	"aacute": "\u00E1",
	"Abreve;": "\u0102",
	"abreve;": "\u0103",
	"ac;": "\u223E",
	"acd;": "\u223F",
	"acE;": "\u223E\u0333",
	"Acirc;": "\u00C2",
	"Acirc": "\u00C2",
	"acirc;": "\u00E2",
	"acirc": "\u00E2",
	"acute;": "\u00B4",
	"acute": "\u00B4",
	"Acy;": "\u0410",
	"acy;": "\u0430",
	"AElig;": "\u00C6",
	"AElig": "\u00C6",
	"aelig;": "\u00E6",
	"aelig": "\u00E6",
	"af;": "\u2061",
	"Afr;": "\uD835\uDD04",
	"afr;": "\uD835\uDD1E",
	"Agrave;": "\u00C0",
	"Agrave": "\u00C0",
	"agrave;": "\u00E0",
	"agrave": "\u00E0",
	"alefsym;": "\u2135",
	"aleph;": "\u2135",
	"Alpha;": "\u0391",
	"alpha;": "\u03B1",
	"Amacr;": "\u0100",
	"amacr;": "\u0101",
	"amalg;": "\u2A3F",
	"amp;": "\u0026",
	"amp": "\u0026",
	"AMP;": "\u0026",
	"AMP": "\u0026",
	"andand;": "\u2A55",
	"And;": "\u2A53",
	"and;": "\u2227",
	"andd;": "\u2A5C",
	"andslope;": "\u2A58",
	"andv;": "\u2A5A",
	"ang;": "\u2220",
	"ange;": "\u29A4",
	"angle;": "\u2220",
	"angmsdaa;": "\u29A8",
	"angmsdab;": "\u29A9",
	"angmsdac;": "\u29AA",
	"angmsdad;": "\u29AB",
	"angmsdae;": "\u29AC",
	"angmsdaf;": "\u29AD",
	"angmsdag;": "\u29AE",
	"angmsdah;": "\u29AF",
	"angmsd;": "\u2221",
	"angrt;": "\u221F",
	"angrtvb;": "\u22BE",
	"angrtvbd;": "\u299D",
	"angsph;": "\u2222",
	"angst;": "\u00C5",
	"angzarr;": "\u237C",
	"Aogon;": "\u0104",
	"aogon;": "\u0105",
	"Aopf;": "\uD835\uDD38",
	"aopf;": "\uD835\uDD52",
	"apacir;": "\u2A6F",
	"ap;": "\u2248",
	"apE;": "\u2A70",
	"ape;": "\u224A",
	"apid;": "\u224B",
	"apos;": "\u0027",
	"ApplyFunction;": "\u2061",
	"approx;": "\u2248",
	"approxeq;": "\u224A",
	"Aring;": "\u00C5",
	"Aring": "\u00C5",
	"aring;": "\u00E5",
	"aring": "\u00E5",
	"Ascr;": "\uD835\uDC9C",
	"ascr;": "\uD835\uDCB6",
	"Assign;": "\u2254",
	"ast;": "\u002A",
	"asymp;": "\u2248",
	"asympeq;": "\u224D",
	"Atilde;": "\u00C3",
	"Atilde": "\u00C3",
	"atilde;": "\u00E3",
	"atilde": "\u00E3",
	"Auml;": "\u00C4",
	"Auml": "\u00C4",
	"auml;": "\u00E4",
	"auml": "\u00E4",
	"awconint;": "\u2233",
	"awint;": "\u2A11",
	"backcong;": "\u224C",
	"backepsilon;": "\u03F6",
	"backprime;": "\u2035",
	"backsim;": "\u223D",
	"backsimeq;": "\u22CD",
	"Backslash;": "\u2216",
	"Barv;": "\u2AE7",
	"barvee;": "\u22BD",
	"barwed;": "\u2305",
	"Barwed;": "\u2306",
	"barwedge;": "\u2305",
	"bbrk;": "\u23B5",
	"bbrktbrk;": "\u23B6",
	"bcong;": "\u224C",
	"Bcy;": "\u0411",
	"bcy;": "\u0431",
	"bdquo;": "\u201E",
	"becaus;": "\u2235",
	"because;": "\u2235",
	"Because;": "\u2235",
	"bemptyv;": "\u29B0",
	"bepsi;": "\u03F6",
	"bernou;": "\u212C",
	"Bernoullis;": "\u212C",
	"Beta;": "\u0392",
	"beta;": "\u03B2",
	"beth;": "\u2136",
	"between;": "\u226C",
	"Bfr;": "\uD835\uDD05",
	"bfr;": "\uD835\uDD1F",
	"bigcap;": "\u22C2",
	"bigcirc;": "\u25EF",
	"bigcup;": "\u22C3",
	"bigodot;": "\u2A00",
	"bigoplus;": "\u2A01",
	"bigotimes;": "\u2A02",
	"bigsqcup;": "\u2A06",
	"bigstar;": "\u2605",
	"bigtriangledown;": "\u25BD",
	"bigtriangleup;": "\u25B3",
	"biguplus;": "\u2A04",
	"bigvee;": "\u22C1",
	"bigwedge;": "\u22C0",
	"bkarow;": "\u290D",
	"blacklozenge;": "\u29EB",
	"blacksquare;": "\u25AA",
	"blacktriangle;": "\u25B4",
	"blacktriangledown;": "\u25BE",
	"blacktriangleleft;": "\u25C2",
	"blacktriangleright;": "\u25B8",
	"blank;": "\u2423",
	"blk12;": "\u2592",
	"blk14;": "\u2591",
	"blk34;": "\u2593",
	"block;": "\u2588",
	"bne;": "\u003D\u20E5",
	"bnequiv;": "\u2261\u20E5",
	"bNot;": "\u2AED",
	"bnot;": "\u2310",
	"Bopf;": "\uD835\uDD39",
	"bopf;": "\uD835\uDD53",
	"bot;": "\u22A5",
	"bottom;": "\u22A5",
	"bowtie;": "\u22C8",
	"boxbox;": "\u29C9",
	"boxdl;": "\u2510",
	"boxdL;": "\u2555",
	"boxDl;": "\u2556",
	"boxDL;": "\u2557",
	"boxdr;": "\u250C",
	"boxdR;": "\u2552",
	"boxDr;": "\u2553",
	"boxDR;": "\u2554",
	"boxh;": "\u2500",
	"boxH;": "\u2550",
	"boxhd;": "\u252C",
	"boxHd;": "\u2564",
	"boxhD;": "\u2565",
	"boxHD;": "\u2566",
	"boxhu;": "\u2534",
	"boxHu;": "\u2567",
	"boxhU;": "\u2568",
	"boxHU;": "\u2569",
	"boxminus;": "\u229F",
	"boxplus;": "\u229E",
	"boxtimes;": "\u22A0",
	"boxul;": "\u2518",
	"boxuL;": "\u255B",
	"boxUl;": "\u255C",
	"boxUL;": "\u255D",
	"boxur;": "\u2514",
	"boxuR;": "\u2558",
	"boxUr;": "\u2559",
	"boxUR;": "\u255A",
	"boxv;": "\u2502",
	"boxV;": "\u2551",
	"boxvh;": "\u253C",
	"boxvH;": "\u256A",
	"boxVh;": "\u256B",
	"boxVH;": "\u256C",
	"boxvl;": "\u2524",
	"boxvL;": "\u2561",
	"boxVl;": "\u2562",
	"boxVL;": "\u2563",
	"boxvr;": "\u251C",
	"boxvR;": "\u255E",
	"boxVr;": "\u255F",
	"boxVR;": "\u2560",
	"bprime;": "\u2035",
	"breve;": "\u02D8",
	"Breve;": "\u02D8",
	"brvbar;": "\u00A6",
	"brvbar": "\u00A6",
	"bscr;": "\uD835\uDCB7",
	"Bscr;": "\u212C",
	"bsemi;": "\u204F",
	"bsim;": "\u223D",
	"bsime;": "\u22CD",
	"bsolb;": "\u29C5",
	"bsol;": "\u005C",
	"bsolhsub;": "\u27C8",
	"bull;": "\u2022",
	"bullet;": "\u2022",
	"bump;": "\u224E",
	"bumpE;": "\u2AAE",
	"bumpe;": "\u224F",
	"Bumpeq;": "\u224E",
	"bumpeq;": "\u224F",
	"Cacute;": "\u0106",
	"cacute;": "\u0107",
	"capand;": "\u2A44",
	"capbrcup;": "\u2A49",
	"capcap;": "\u2A4B",
	"cap;": "\u2229",
	"Cap;": "\u22D2",
	"capcup;": "\u2A47",
	"capdot;": "\u2A40",
	"CapitalDifferentialD;": "\u2145",
	"caps;": "\u2229\uFE00",
	"caret;": "\u2041",
	"caron;": "\u02C7",
	"Cayleys;": "\u212D",
	"ccaps;": "\u2A4D",
	"Ccaron;": "\u010C",
	"ccaron;": "\u010D",
	"Ccedil;": "\u00C7",
	"Ccedil": "\u00C7",
	"ccedil;": "\u00E7",
	"ccedil": "\u00E7",
	"Ccirc;": "\u0108",
	"ccirc;": "\u0109",
	"Cconint;": "\u2230",
	"ccups;": "\u2A4C",
	"ccupssm;": "\u2A50",
	"Cdot;": "\u010A",
	"cdot;": "\u010B",
	"cedil;": "\u00B8",
	"cedil": "\u00B8",
	"Cedilla;": "\u00B8",
	"cemptyv;": "\u29B2",
	"cent;": "\u00A2",
	"cent": "\u00A2",
	"centerdot;": "\u00B7",
	"CenterDot;": "\u00B7",
	"cfr;": "\uD835\uDD20",
	"Cfr;": "\u212D",
	"CHcy;": "\u0427",
	"chcy;": "\u0447",
	"check;": "\u2713",
	"checkmark;": "\u2713",
	"Chi;": "\u03A7",
	"chi;": "\u03C7",
	"circ;": "\u02C6",
	"circeq;": "\u2257",
	"circlearrowleft;": "\u21BA",
	"circlearrowright;": "\u21BB",
	"circledast;": "\u229B",
	"circledcirc;": "\u229A",
	"circleddash;": "\u229D",
	"CircleDot;": "\u2299",
	"circledR;": "\u00AE",
	"circledS;": "\u24C8",
	"CircleMinus;": "\u2296",
	"CirclePlus;": "\u2295",
	"CircleTimes;": "\u2297",
	"cir;": "\u25CB",
	"cirE;": "\u29C3",
	"cire;": "\u2257",
	"cirfnint;": "\u2A10",
	"cirmid;": "\u2AEF",
	"cirscir;": "\u29C2",
	"ClockwiseContourIntegral;": "\u2232",
	"CloseCurlyDoubleQuote;": "\u201D",
	"CloseCurlyQuote;": "\u2019",
	"clubs;": "\u2663",
	"clubsuit;": "\u2663",
	"colon;": "\u003A",
	"Colon;": "\u2237",
	"Colone;": "\u2A74",
	"colone;": "\u2254",
	"coloneq;": "\u2254",
	"comma;": "\u002C",
	"commat;": "\u0040",
	"comp;": "\u2201",
	"compfn;": "\u2218",
	"complement;": "\u2201",
	"complexes;": "\u2102",
	"cong;": "\u2245",
	"congdot;": "\u2A6D",
	"Congruent;": "\u2261",
	"conint;": "\u222E",
	"Conint;": "\u222F",
	"ContourIntegral;": "\u222E",
	"copf;": "\uD835\uDD54",
	"Copf;": "\u2102",
	"coprod;": "\u2210",
	"Coproduct;": "\u2210",
	"copy;": "\u00A9",
	"copy": "\u00A9",
	"COPY;": "\u00A9",
	"COPY": "\u00A9",
	"copysr;": "\u2117",
	"CounterClockwiseContourIntegral;": "\u2233",
	"crarr;": "\u21B5",
	"cross;": "\u2717",
	"Cross;": "\u2A2F",
	"Cscr;": "\uD835\uDC9E",
	"cscr;": "\uD835\uDCB8",
	"csub;": "\u2ACF",
	"csube;": "\u2AD1",
	"csup;": "\u2AD0",
	"csupe;": "\u2AD2",
	"ctdot;": "\u22EF",
	"cudarrl;": "\u2938",
	"cudarrr;": "\u2935",
	"cuepr;": "\u22DE",
	"cuesc;": "\u22DF",
	"cularr;": "\u21B6",
	"cularrp;": "\u293D",
	"cupbrcap;": "\u2A48",
	"cupcap;": "\u2A46",
	"CupCap;": "\u224D",
	"cup;": "\u222A",
	"Cup;": "\u22D3",
	"cupcup;": "\u2A4A",
	"cupdot;": "\u228D",
	"cupor;": "\u2A45",
	"cups;": "\u222A\uFE00",
	"curarr;": "\u21B7",
	"curarrm;": "\u293C",
	"curlyeqprec;": "\u22DE",
	"curlyeqsucc;": "\u22DF",
	"curlyvee;": "\u22CE",
	"curlywedge;": "\u22CF",
	"curren;": "\u00A4",
	"curren": "\u00A4",
	"curvearrowleft;": "\u21B6",
	"curvearrowright;": "\u21B7",
	"cuvee;": "\u22CE",
	"cuwed;": "\u22CF",
	"cwconint;": "\u2232",
	"cwint;": "\u2231",
	"cylcty;": "\u232D",
	"dagger;": "\u2020",
	"Dagger;": "\u2021",
	"daleth;": "\u2138",
	"darr;": "\u2193",
	"Darr;": "\u21A1",
	"dArr;": "\u21D3",
	"dash;": "\u2010",
	"Dashv;": "\u2AE4",
	"dashv;": "\u22A3",
	"dbkarow;": "\u290F",
	"dblac;": "\u02DD",
	"Dcaron;": "\u010E",
	"dcaron;": "\u010F",
	"Dcy;": "\u0414",
	"dcy;": "\u0434",
	"ddagger;": "\u2021",
	"ddarr;": "\u21CA",
	"DD;": "\u2145",
	"dd;": "\u2146",
	"DDotrahd;": "\u2911",
	"ddotseq;": "\u2A77",
	"deg;": "\u00B0",
	"deg": "\u00B0",
	"Del;": "\u2207",
	"Delta;": "\u0394",
	"delta;": "\u03B4",
	"demptyv;": "\u29B1",
	"dfisht;": "\u297F",
	"Dfr;": "\uD835\uDD07",
	"dfr;": "\uD835\uDD21",
	"dHar;": "\u2965",
	"dharl;": "\u21C3",
	"dharr;": "\u21C2",
	"DiacriticalAcute;": "\u00B4",
	"DiacriticalDot;": "\u02D9",
	"DiacriticalDoubleAcute;": "\u02DD",
	"DiacriticalGrave;": "\u0060",
	"DiacriticalTilde;": "\u02DC",
	"diam;": "\u22C4",
	"diamond;": "\u22C4",
	"Diamond;": "\u22C4",
	"diamondsuit;": "\u2666",
	"diams;": "\u2666",
	"die;": "\u00A8",
	"DifferentialD;": "\u2146",
	"digamma;": "\u03DD",
	"disin;": "\u22F2",
	"div;": "\u00F7",
	"divide;": "\u00F7",
	"divide": "\u00F7",
	"divideontimes;": "\u22C7",
	"divonx;": "\u22C7",
	"DJcy;": "\u0402",
	"djcy;": "\u0452",
	"dlcorn;": "\u231E",
	"dlcrop;": "\u230D",
	"dollar;": "\u0024",
	"Dopf;": "\uD835\uDD3B",
	"dopf;": "\uD835\uDD55",
	"Dot;": "\u00A8",
	"dot;": "\u02D9",
	"DotDot;": "\u20DC",
	"doteq;": "\u2250",
	"doteqdot;": "\u2251",
	"DotEqual;": "\u2250",
	"dotminus;": "\u2238",
	"dotplus;": "\u2214",
	"dotsquare;": "\u22A1",
	"doublebarwedge;": "\u2306",
	"DoubleContourIntegral;": "\u222F",
	"DoubleDot;": "\u00A8",
	"DoubleDownArrow;": "\u21D3",
	"DoubleLeftArrow;": "\u21D0",
	"DoubleLeftRightArrow;": "\u21D4",
	"DoubleLeftTee;": "\u2AE4",
	"DoubleLongLeftArrow;": "\u27F8",
	"DoubleLongLeftRightArrow;": "\u27FA",
	"DoubleLongRightArrow;": "\u27F9",
	"DoubleRightArrow;": "\u21D2",
	"DoubleRightTee;": "\u22A8",
	"DoubleUpArrow;": "\u21D1",
	"DoubleUpDownArrow;": "\u21D5",
	"DoubleVerticalBar;": "\u2225",
	"DownArrowBar;": "\u2913",
	"downarrow;": "\u2193",
	"DownArrow;": "\u2193",
	"Downarrow;": "\u21D3",
	"DownArrowUpArrow;": "\u21F5",
	"DownBreve;": "\u0311",
	"downdownarrows;": "\u21CA",
	"downharpoonleft;": "\u21C3",
	"downharpoonright;": "\u21C2",
	"DownLeftRightVector;": "\u2950",
	"DownLeftTeeVector;": "\u295E",
	"DownLeftVectorBar;": "\u2956",
	"DownLeftVector;": "\u21BD",
	"DownRightTeeVector;": "\u295F",
	"DownRightVectorBar;": "\u2957",
	"DownRightVector;": "\u21C1",
	"DownTeeArrow;": "\u21A7",
	"DownTee;": "\u22A4",
	"drbkarow;": "\u2910",
	"drcorn;": "\u231F",
	"drcrop;": "\u230C",
	"Dscr;": "\uD835\uDC9F",
	"dscr;": "\uD835\uDCB9",
	"DScy;": "\u0405",
	"dscy;": "\u0455",
	"dsol;": "\u29F6",
	"Dstrok;": "\u0110",
	"dstrok;": "\u0111",
	"dtdot;": "\u22F1",
	"dtri;": "\u25BF",
	"dtrif;": "\u25BE",
	"duarr;": "\u21F5",
	"duhar;": "\u296F",
	"dwangle;": "\u29A6",
	"DZcy;": "\u040F",
	"dzcy;": "\u045F",
	"dzigrarr;": "\u27FF",
	"Eacute;": "\u00C9",
	"Eacute": "\u00C9",
	"eacute;": "\u00E9",
	"eacute": "\u00E9",
	"easter;": "\u2A6E",
	"Ecaron;": "\u011A",
	"ecaron;": "\u011B",
	"Ecirc;": "\u00CA",
	"Ecirc": "\u00CA",
	"ecirc;": "\u00EA",
	"ecirc": "\u00EA",
	"ecir;": "\u2256",
	"ecolon;": "\u2255",
	"Ecy;": "\u042D",
	"ecy;": "\u044D",
	"eDDot;": "\u2A77",
	"Edot;": "\u0116",
	"edot;": "\u0117",
	"eDot;": "\u2251",
	"ee;": "\u2147",
	"efDot;": "\u2252",
	"Efr;": "\uD835\uDD08",
	"efr;": "\uD835\uDD22",
	"eg;": "\u2A9A",
	"Egrave;": "\u00C8",
	"Egrave": "\u00C8",
	"egrave;": "\u00E8",
	"egrave": "\u00E8",
	"egs;": "\u2A96",
	"egsdot;": "\u2A98",
	"el;": "\u2A99",
	"Element;": "\u2208",
	"elinters;": "\u23E7",
	"ell;": "\u2113",
	"els;": "\u2A95",
	"elsdot;": "\u2A97",
	"Emacr;": "\u0112",
	"emacr;": "\u0113",
	"empty;": "\u2205",
	"emptyset;": "\u2205",
	"EmptySmallSquare;": "\u25FB",
	"emptyv;": "\u2205",
	"EmptyVerySmallSquare;": "\u25AB",
	"emsp13;": "\u2004",
	"emsp14;": "\u2005",
	"emsp;": "\u2003",
	"ENG;": "\u014A",
	"eng;": "\u014B",
	"ensp;": "\u2002",
	"Eogon;": "\u0118",
	"eogon;": "\u0119",
	"Eopf;": "\uD835\uDD3C",
	"eopf;": "\uD835\uDD56",
	"epar;": "\u22D5",
	"eparsl;": "\u29E3",
	"eplus;": "\u2A71",
	"epsi;": "\u03B5",
	"Epsilon;": "\u0395",
	"epsilon;": "\u03B5",
	"epsiv;": "\u03F5",
	"eqcirc;": "\u2256",
	"eqcolon;": "\u2255",
	"eqsim;": "\u2242",
	"eqslantgtr;": "\u2A96",
	"eqslantless;": "\u2A95",
	"Equal;": "\u2A75",
	"equals;": "\u003D",
	"EqualTilde;": "\u2242",
	"equest;": "\u225F",
	"Equilibrium;": "\u21CC",
	"equiv;": "\u2261",
	"equivDD;": "\u2A78",
	"eqvparsl;": "\u29E5",
	"erarr;": "\u2971",
	"erDot;": "\u2253",
	"escr;": "\u212F",
	"Escr;": "\u2130",
	"esdot;": "\u2250",
	"Esim;": "\u2A73",
	"esim;": "\u2242",
	"Eta;": "\u0397",
	"eta;": "\u03B7",
	"ETH;": "\u00D0",
	"ETH": "\u00D0",
	"eth;": "\u00F0",
	"eth": "\u00F0",
	"Euml;": "\u00CB",
	"Euml": "\u00CB",
	"euml;": "\u00EB",
	"euml": "\u00EB",
	"euro;": "\u20AC",
	"excl;": "\u0021",
	"exist;": "\u2203",
	"Exists;": "\u2203",
	"expectation;": "\u2130",
	"exponentiale;": "\u2147",
	"ExponentialE;": "\u2147",
	"fallingdotseq;": "\u2252",
	"Fcy;": "\u0424",
	"fcy;": "\u0444",
	"female;": "\u2640",
	"ffilig;": "\uFB03",
	"fflig;": "\uFB00",
	"ffllig;": "\uFB04",
	"Ffr;": "\uD835\uDD09",
	"ffr;": "\uD835\uDD23",
	"filig;": "\uFB01",
	"FilledSmallSquare;": "\u25FC",
	"FilledVerySmallSquare;": "\u25AA",
	"fjlig;": "\u0066\u006A",
	"flat;": "\u266D",
	"fllig;": "\uFB02",
	"fltns;": "\u25B1",
	"fnof;": "\u0192",
	"Fopf;": "\uD835\uDD3D",
	"fopf;": "\uD835\uDD57",
	"forall;": "\u2200",
	"ForAll;": "\u2200",
	"fork;": "\u22D4",
	"forkv;": "\u2AD9",
	"Fouriertrf;": "\u2131",
	"fpartint;": "\u2A0D",
	"frac12;": "\u00BD",
	"frac12": "\u00BD",
	"frac13;": "\u2153",
	"frac14;": "\u00BC",
	"frac14": "\u00BC",
	"frac15;": "\u2155",
	"frac16;": "\u2159",
	"frac18;": "\u215B",
	"frac23;": "\u2154",
	"frac25;": "\u2156",
	"frac34;": "\u00BE",
	"frac34": "\u00BE",
	"frac35;": "\u2157",
	"frac38;": "\u215C",
	"frac45;": "\u2158",
	"frac56;": "\u215A",
	"frac58;": "\u215D",
	"frac78;": "\u215E",
	"frasl;": "\u2044",
	"frown;": "\u2322",
	"fscr;": "\uD835\uDCBB",
	"Fscr;": "\u2131",
	"gacute;": "\u01F5",
	"Gamma;": "\u0393",
	"gamma;": "\u03B3",
	"Gammad;": "\u03DC",
	"gammad;": "\u03DD",
	"gap;": "\u2A86",
	"Gbreve;": "\u011E",
	"gbreve;": "\u011F",
	"Gcedil;": "\u0122",
	"Gcirc;": "\u011C",
	"gcirc;": "\u011D",
	"Gcy;": "\u0413",
	"gcy;": "\u0433",
	"Gdot;": "\u0120",
	"gdot;": "\u0121",
	"ge;": "\u2265",
	"gE;": "\u2267",
	"gEl;": "\u2A8C",
	"gel;": "\u22DB",
	"geq;": "\u2265",
	"geqq;": "\u2267",
	"geqslant;": "\u2A7E",
	"gescc;": "\u2AA9",
	"ges;": "\u2A7E",
	"gesdot;": "\u2A80",
	"gesdoto;": "\u2A82",
	"gesdotol;": "\u2A84",
	"gesl;": "\u22DB\uFE00",
	"gesles;": "\u2A94",
	"Gfr;": "\uD835\uDD0A",
	"gfr;": "\uD835\uDD24",
	"gg;": "\u226B",
	"Gg;": "\u22D9",
	"ggg;": "\u22D9",
	"gimel;": "\u2137",
	"GJcy;": "\u0403",
	"gjcy;": "\u0453",
	"gla;": "\u2AA5",
	"gl;": "\u2277",
	"glE;": "\u2A92",
	"glj;": "\u2AA4",
	"gnap;": "\u2A8A",
	"gnapprox;": "\u2A8A",
	"gne;": "\u2A88",
	"gnE;": "\u2269",
	"gneq;": "\u2A88",
	"gneqq;": "\u2269",
	"gnsim;": "\u22E7",
	"Gopf;": "\uD835\uDD3E",
	"gopf;": "\uD835\uDD58",
	"grave;": "\u0060",
	"GreaterEqual;": "\u2265",
	"GreaterEqualLess;": "\u22DB",
	"GreaterFullEqual;": "\u2267",
	"GreaterGreater;": "\u2AA2",
	"GreaterLess;": "\u2277",
	"GreaterSlantEqual;": "\u2A7E",
	"GreaterTilde;": "\u2273",
	"Gscr;": "\uD835\uDCA2",
	"gscr;": "\u210A",
	"gsim;": "\u2273",
	"gsime;": "\u2A8E",
	"gsiml;": "\u2A90",
	"gtcc;": "\u2AA7",
	"gtcir;": "\u2A7A",
	"gt;": "\u003E",
	"gt": "\u003E",
	"GT;": "\u003E",
	"GT": "\u003E",
	"Gt;": "\u226B",
	"gtdot;": "\u22D7",
	"gtlPar;": "\u2995",
	"gtquest;": "\u2A7C",
	"gtrapprox;": "\u2A86",
	"gtrarr;": "\u2978",
	"gtrdot;": "\u22D7",
	"gtreqless;": "\u22DB",
	"gtreqqless;": "\u2A8C",
	"gtrless;": "\u2277",
	"gtrsim;": "\u2273",
	"gvertneqq;": "\u2269\uFE00",
	"gvnE;": "\u2269\uFE00",
	"Hacek;": "\u02C7",
	"hairsp;": "\u200A",
	"half;": "\u00BD",
	"hamilt;": "\u210B",
	"HARDcy;": "\u042A",
	"hardcy;": "\u044A",
	"harrcir;": "\u2948",
	"harr;": "\u2194",
	"hArr;": "\u21D4",
	"harrw;": "\u21AD",
	"Hat;": "\u005E",
	"hbar;": "\u210F",
	"Hcirc;": "\u0124",
	"hcirc;": "\u0125",
	"hearts;": "\u2665",
	"heartsuit;": "\u2665",
	"hellip;": "\u2026",
	"hercon;": "\u22B9",
	"hfr;": "\uD835\uDD25",
	"Hfr;": "\u210C",
	"HilbertSpace;": "\u210B",
	"hksearow;": "\u2925",
	"hkswarow;": "\u2926",
	"hoarr;": "\u21FF",
	"homtht;": "\u223B",
	"hookleftarrow;": "\u21A9",
	"hookrightarrow;": "\u21AA",
	"hopf;": "\uD835\uDD59",
	"Hopf;": "\u210D",
	"horbar;": "\u2015",
	"HorizontalLine;": "\u2500",
	"hscr;": "\uD835\uDCBD",
	"Hscr;": "\u210B",
	"hslash;": "\u210F",
	"Hstrok;": "\u0126",
	"hstrok;": "\u0127",
	"HumpDownHump;": "\u224E",
	"HumpEqual;": "\u224F",
	"hybull;": "\u2043",
	"hyphen;": "\u2010",
	"Iacute;": "\u00CD",
	"Iacute": "\u00CD",
	"iacute;": "\u00ED",
	"iacute": "\u00ED",
	"ic;": "\u2063",
	"Icirc;": "\u00CE",
	"Icirc": "\u00CE",
	"icirc;": "\u00EE",
	"icirc": "\u00EE",
	"Icy;": "\u0418",
	"icy;": "\u0438",
	"Idot;": "\u0130",
	"IEcy;": "\u0415",
	"iecy;": "\u0435",
	"iexcl;": "\u00A1",
	"iexcl": "\u00A1",
	"iff;": "\u21D4",
	"ifr;": "\uD835\uDD26",
	"Ifr;": "\u2111",
	"Igrave;": "\u00CC",
	"Igrave": "\u00CC",
	"igrave;": "\u00EC",
	"igrave": "\u00EC",
	"ii;": "\u2148",
	"iiiint;": "\u2A0C",
	"iiint;": "\u222D",
	"iinfin;": "\u29DC",
	"iiota;": "\u2129",
	"IJlig;": "\u0132",
	"ijlig;": "\u0133",
	"Imacr;": "\u012A",
	"imacr;": "\u012B",
	"image;": "\u2111",
	"ImaginaryI;": "\u2148",
	"imagline;": "\u2110",
	"imagpart;": "\u2111",
	"imath;": "\u0131",
	"Im;": "\u2111",
	"imof;": "\u22B7",
	"imped;": "\u01B5",
	"Implies;": "\u21D2",
	"incare;": "\u2105",
	"in;": "\u2208",
	"infin;": "\u221E",
	"infintie;": "\u29DD",
	"inodot;": "\u0131",
	"intcal;": "\u22BA",
	"int;": "\u222B",
	"Int;": "\u222C",
	"integers;": "\u2124",
	"Integral;": "\u222B",
	"intercal;": "\u22BA",
	"Intersection;": "\u22C2",
	"intlarhk;": "\u2A17",
	"intprod;": "\u2A3C",
	"InvisibleComma;": "\u2063",
	"InvisibleTimes;": "\u2062",
	"IOcy;": "\u0401",
	"iocy;": "\u0451",
	"Iogon;": "\u012E",
	"iogon;": "\u012F",
	"Iopf;": "\uD835\uDD40",
	"iopf;": "\uD835\uDD5A",
	"Iota;": "\u0399",
	"iota;": "\u03B9",
	"iprod;": "\u2A3C",
	"iquest;": "\u00BF",
	"iquest": "\u00BF",
	"iscr;": "\uD835\uDCBE",
	"Iscr;": "\u2110",
	"isin;": "\u2208",
	"isindot;": "\u22F5",
	"isinE;": "\u22F9",
	"isins;": "\u22F4",
	"isinsv;": "\u22F3",
	"isinv;": "\u2208",
	"it;": "\u2062",
	"Itilde;": "\u0128",
	"itilde;": "\u0129",
	"Iukcy;": "\u0406",
	"iukcy;": "\u0456",
	"Iuml;": "\u00CF",
	"Iuml": "\u00CF",
	"iuml;": "\u00EF",
	"iuml": "\u00EF",
	"Jcirc;": "\u0134",
	"jcirc;": "\u0135",
	"Jcy;": "\u0419",
	"jcy;": "\u0439",
	"Jfr;": "\uD835\uDD0D",
	"jfr;": "\uD835\uDD27",
	"jmath;": "\u0237",
	"Jopf;": "\uD835\uDD41",
	"jopf;": "\uD835\uDD5B",
	"Jscr;": "\uD835\uDCA5",
	"jscr;": "\uD835\uDCBF",
	"Jsercy;": "\u0408",
	"jsercy;": "\u0458",
	"Jukcy;": "\u0404",
	"jukcy;": "\u0454",
	"Kappa;": "\u039A",
	"kappa;": "\u03BA",
	"kappav;": "\u03F0",
	"Kcedil;": "\u0136",
	"kcedil;": "\u0137",
	"Kcy;": "\u041A",
	"kcy;": "\u043A",
	"Kfr;": "\uD835\uDD0E",
	"kfr;": "\uD835\uDD28",
	"kgreen;": "\u0138",
	"KHcy;": "\u0425",
	"khcy;": "\u0445",
	"KJcy;": "\u040C",
	"kjcy;": "\u045C",
	"Kopf;": "\uD835\uDD42",
	"kopf;": "\uD835\uDD5C",
	"Kscr;": "\uD835\uDCA6",
	"kscr;": "\uD835\uDCC0",
	"lAarr;": "\u21DA",
	"Lacute;": "\u0139",
	"lacute;": "\u013A",
	"laemptyv;": "\u29B4",
	"lagran;": "\u2112",
	"Lambda;": "\u039B",
	"lambda;": "\u03BB",
	"lang;": "\u27E8",
	"Lang;": "\u27EA",
	"langd;": "\u2991",
	"langle;": "\u27E8",
	"lap;": "\u2A85",
	"Laplacetrf;": "\u2112",
	"laquo;": "\u00AB",
	"laquo": "\u00AB",
	"larrb;": "\u21E4",
	"larrbfs;": "\u291F",
	"larr;": "\u2190",
	"Larr;": "\u219E",
	"lArr;": "\u21D0",
	"larrfs;": "\u291D",
	"larrhk;": "\u21A9",
	"larrlp;": "\u21AB",
	"larrpl;": "\u2939",
	"larrsim;": "\u2973",
	"larrtl;": "\u21A2",
	"latail;": "\u2919",
	"lAtail;": "\u291B",
	"lat;": "\u2AAB",
	"late;": "\u2AAD",
	"lates;": "\u2AAD\uFE00",
	"lbarr;": "\u290C",
	"lBarr;": "\u290E",
	"lbbrk;": "\u2772",
	"lbrace;": "\u007B",
	"lbrack;": "\u005B",
	"lbrke;": "\u298B",
	"lbrksld;": "\u298F",
	"lbrkslu;": "\u298D",
	"Lcaron;": "\u013D",
	"lcaron;": "\u013E",
	"Lcedil;": "\u013B",
	"lcedil;": "\u013C",
	"lceil;": "\u2308",
	"lcub;": "\u007B",
	"Lcy;": "\u041B",
	"lcy;": "\u043B",
	"ldca;": "\u2936",
	"ldquo;": "\u201C",
	"ldquor;": "\u201E",
	"ldrdhar;": "\u2967",
	"ldrushar;": "\u294B",
	"ldsh;": "\u21B2",
	"le;": "\u2264",
	"lE;": "\u2266",
	"LeftAngleBracket;": "\u27E8",
	"LeftArrowBar;": "\u21E4",
	"leftarrow;": "\u2190",
	"LeftArrow;": "\u2190",
	"Leftarrow;": "\u21D0",
	"LeftArrowRightArrow;": "\u21C6",
	"leftarrowtail;": "\u21A2",
	"LeftCeiling;": "\u2308",
	"LeftDoubleBracket;": "\u27E6",
	"LeftDownTeeVector;": "\u2961",
	"LeftDownVectorBar;": "\u2959",
	"LeftDownVector;": "\u21C3",
	"LeftFloor;": "\u230A",
	"leftharpoondown;": "\u21BD",
	"leftharpoonup;": "\u21BC",
	"leftleftarrows;": "\u21C7",
	"leftrightarrow;": "\u2194",
	"LeftRightArrow;": "\u2194",
	"Leftrightarrow;": "\u21D4",
	"leftrightarrows;": "\u21C6",
	"leftrightharpoons;": "\u21CB",
	"leftrightsquigarrow;": "\u21AD",
	"LeftRightVector;": "\u294E",
	"LeftTeeArrow;": "\u21A4",
	"LeftTee;": "\u22A3",
	"LeftTeeVector;": "\u295A",
	"leftthreetimes;": "\u22CB",
	"LeftTriangleBar;": "\u29CF",
	"LeftTriangle;": "\u22B2",
	"LeftTriangleEqual;": "\u22B4",
	"LeftUpDownVector;": "\u2951",
	"LeftUpTeeVector;": "\u2960",
	"LeftUpVectorBar;": "\u2958",
	"LeftUpVector;": "\u21BF",
	"LeftVectorBar;": "\u2952",
	"LeftVector;": "\u21BC",
	"lEg;": "\u2A8B",
	"leg;": "\u22DA",
	"leq;": "\u2264",
	"leqq;": "\u2266",
	"leqslant;": "\u2A7D",
	"lescc;": "\u2AA8",
	"les;": "\u2A7D",
	"lesdot;": "\u2A7F",
	"lesdoto;": "\u2A81",
	"lesdotor;": "\u2A83",
	"lesg;": "\u22DA\uFE00",
	"lesges;": "\u2A93",
	"lessapprox;": "\u2A85",
	"lessdot;": "\u22D6",
	"lesseqgtr;": "\u22DA",
	"lesseqqgtr;": "\u2A8B",
	"LessEqualGreater;": "\u22DA",
	"LessFullEqual;": "\u2266",
	"LessGreater;": "\u2276",
	"lessgtr;": "\u2276",
	"LessLess;": "\u2AA1",
	"lesssim;": "\u2272",
	"LessSlantEqual;": "\u2A7D",
	"LessTilde;": "\u2272",
	"lfisht;": "\u297C",
	"lfloor;": "\u230A",
	"Lfr;": "\uD835\uDD0F",
	"lfr;": "\uD835\uDD29",
	"lg;": "\u2276",
	"lgE;": "\u2A91",
	"lHar;": "\u2962",
	"lhard;": "\u21BD",
	"lharu;": "\u21BC",
	"lharul;": "\u296A",
	"lhblk;": "\u2584",
	"LJcy;": "\u0409",
	"ljcy;": "\u0459",
	"llarr;": "\u21C7",
	"ll;": "\u226A",
	"Ll;": "\u22D8",
	"llcorner;": "\u231E",
	"Lleftarrow;": "\u21DA",
	"llhard;": "\u296B",
	"lltri;": "\u25FA",
	"Lmidot;": "\u013F",
	"lmidot;": "\u0140",
	"lmoustache;": "\u23B0",
	"lmoust;": "\u23B0",
	"lnap;": "\u2A89",
	"lnapprox;": "\u2A89",
	"lne;": "\u2A87",
	"lnE;": "\u2268",
	"lneq;": "\u2A87",
	"lneqq;": "\u2268",
	"lnsim;": "\u22E6",
	"loang;": "\u27EC",
	"loarr;": "\u21FD",
	"lobrk;": "\u27E6",
	"longleftarrow;": "\u27F5",
	"LongLeftArrow;": "\u27F5",
	"Longleftarrow;": "\u27F8",
	"longleftrightarrow;": "\u27F7",
	"LongLeftRightArrow;": "\u27F7",
	"Longleftrightarrow;": "\u27FA",
	"longmapsto;": "\u27FC",
	"longrightarrow;": "\u27F6",
	"LongRightArrow;": "\u27F6",
	"Longrightarrow;": "\u27F9",
	"looparrowleft;": "\u21AB",
	"looparrowright;": "\u21AC",
	"lopar;": "\u2985",
	"Lopf;": "\uD835\uDD43",
	"lopf;": "\uD835\uDD5D",
	"loplus;": "\u2A2D",
	"lotimes;": "\u2A34",
	"lowast;": "\u2217",
	"lowbar;": "\u005F",
	"LowerLeftArrow;": "\u2199",
	"LowerRightArrow;": "\u2198",
	"loz;": "\u25CA",
	"lozenge;": "\u25CA",
	"lozf;": "\u29EB",
	"lpar;": "\u0028",
	"lparlt;": "\u2993",
	"lrarr;": "\u21C6",
	"lrcorner;": "\u231F",
	"lrhar;": "\u21CB",
	"lrhard;": "\u296D",
	"lrm;": "\u200E",
	"lrtri;": "\u22BF",
	"lsaquo;": "\u2039",
	"lscr;": "\uD835\uDCC1",
	"Lscr;": "\u2112",
	"lsh;": "\u21B0",
	"Lsh;": "\u21B0",
	"lsim;": "\u2272",
	"lsime;": "\u2A8D",
	"lsimg;": "\u2A8F",
	"lsqb;": "\u005B",
	"lsquo;": "\u2018",
	"lsquor;": "\u201A",
	"Lstrok;": "\u0141",
	"lstrok;": "\u0142",
	"ltcc;": "\u2AA6",
	"ltcir;": "\u2A79",
	"lt;": "\u003C",
	"lt": "\u003C",
	"LT;": "\u003C",
	"LT": "\u003C",
	"Lt;": "\u226A",
	"ltdot;": "\u22D6",
	"lthree;": "\u22CB",
	"ltimes;": "\u22C9",
	"ltlarr;": "\u2976",
	"ltquest;": "\u2A7B",
	"ltri;": "\u25C3",
	"ltrie;": "\u22B4",
	"ltrif;": "\u25C2",
	"ltrPar;": "\u2996",
	"lurdshar;": "\u294A",
	"luruhar;": "\u2966",
	"lvertneqq;": "\u2268\uFE00",
	"lvnE;": "\u2268\uFE00",
	"macr;": "\u00AF",
	"macr": "\u00AF",
	"male;": "\u2642",
	"malt;": "\u2720",
	"maltese;": "\u2720",
	"Map;": "\u2905",
	"map;": "\u21A6",
	"mapsto;": "\u21A6",
	"mapstodown;": "\u21A7",
	"mapstoleft;": "\u21A4",
	"mapstoup;": "\u21A5",
	"marker;": "\u25AE",
	"mcomma;": "\u2A29",
	"Mcy;": "\u041C",
	"mcy;": "\u043C",
	"mdash;": "\u2014",
	"mDDot;": "\u223A",
	"measuredangle;": "\u2221",
	"MediumSpace;": "\u205F",
	"Mellintrf;": "\u2133",
	"Mfr;": "\uD835\uDD10",
	"mfr;": "\uD835\uDD2A",
	"mho;": "\u2127",
	"micro;": "\u00B5",
	"micro": "\u00B5",
	"midast;": "\u002A",
	"midcir;": "\u2AF0",
	"mid;": "\u2223",
	"middot;": "\u00B7",
	"middot": "\u00B7",
	"minusb;": "\u229F",
	"minus;": "\u2212",
	"minusd;": "\u2238",
	"minusdu;": "\u2A2A",
	"MinusPlus;": "\u2213",
	"mlcp;": "\u2ADB",
	"mldr;": "\u2026",
	"mnplus;": "\u2213",
	"models;": "\u22A7",
	"Mopf;": "\uD835\uDD44",
	"mopf;": "\uD835\uDD5E",
	"mp;": "\u2213",
	"mscr;": "\uD835\uDCC2",
	"Mscr;": "\u2133",
	"mstpos;": "\u223E",
	"Mu;": "\u039C",
	"mu;": "\u03BC",
	"multimap;": "\u22B8",
	"mumap;": "\u22B8",
	"nabla;": "\u2207",
	"Nacute;": "\u0143",
	"nacute;": "\u0144",
	"nang;": "\u2220\u20D2",
	"nap;": "\u2249",
	"napE;": "\u2A70\u0338",
	"napid;": "\u224B\u0338",
	"napos;": "\u0149",
	"napprox;": "\u2249",
	"natural;": "\u266E",
	"naturals;": "\u2115",
	"natur;": "\u266E",
	"nbsp;": "\u00A0",
	"nbsp": "\u00A0",
	"nbump;": "\u224E\u0338",
	"nbumpe;": "\u224F\u0338",
	"ncap;": "\u2A43",
	"Ncaron;": "\u0147",
	"ncaron;": "\u0148",
	"Ncedil;": "\u0145",
	"ncedil;": "\u0146",
	"ncong;": "\u2247",
	"ncongdot;": "\u2A6D\u0338",
	"ncup;": "\u2A42",
	"Ncy;": "\u041D",
	"ncy;": "\u043D",
	"ndash;": "\u2013",
	"nearhk;": "\u2924",
	"nearr;": "\u2197",
	"neArr;": "\u21D7",
	"nearrow;": "\u2197",
	"ne;": "\u2260",
	"nedot;": "\u2250\u0338",
	"NegativeMediumSpace;": "\u200B",
	"NegativeThickSpace;": "\u200B",
	"NegativeThinSpace;": "\u200B",
	"NegativeVeryThinSpace;": "\u200B",
	"nequiv;": "\u2262",
	"nesear;": "\u2928",
	"nesim;": "\u2242\u0338",
	"NestedGreaterGreater;": "\u226B",
	"NestedLessLess;": "\u226A",
	"NewLine;": "\u000A",
	"nexist;": "\u2204",
	"nexists;": "\u2204",
	"Nfr;": "\uD835\uDD11",
	"nfr;": "\uD835\uDD2B",
	"ngE;": "\u2267\u0338",
	"nge;": "\u2271",
	"ngeq;": "\u2271",
	"ngeqq;": "\u2267\u0338",
	"ngeqslant;": "\u2A7E\u0338",
	"nges;": "\u2A7E\u0338",
	"nGg;": "\u22D9\u0338",
	"ngsim;": "\u2275",
	"nGt;": "\u226B\u20D2",
	"ngt;": "\u226F",
	"ngtr;": "\u226F",
	"nGtv;": "\u226B\u0338",
	"nharr;": "\u21AE",
	"nhArr;": "\u21CE",
	"nhpar;": "\u2AF2",
	"ni;": "\u220B",
	"nis;": "\u22FC",
	"nisd;": "\u22FA",
	"niv;": "\u220B",
	"NJcy;": "\u040A",
	"njcy;": "\u045A",
	"nlarr;": "\u219A",
	"nlArr;": "\u21CD",
	"nldr;": "\u2025",
	"nlE;": "\u2266\u0338",
	"nle;": "\u2270",
	"nleftarrow;": "\u219A",
	"nLeftarrow;": "\u21CD",
	"nleftrightarrow;": "\u21AE",
	"nLeftrightarrow;": "\u21CE",
	"nleq;": "\u2270",
	"nleqq;": "\u2266\u0338",
	"nleqslant;": "\u2A7D\u0338",
	"nles;": "\u2A7D\u0338",
	"nless;": "\u226E",
	"nLl;": "\u22D8\u0338",
	"nlsim;": "\u2274",
	"nLt;": "\u226A\u20D2",
	"nlt;": "\u226E",
	"nltri;": "\u22EA",
	"nltrie;": "\u22EC",
	"nLtv;": "\u226A\u0338",
	"nmid;": "\u2224",
	"NoBreak;": "\u2060",
	"NonBreakingSpace;": "\u00A0",
	"nopf;": "\uD835\uDD5F",
	"Nopf;": "\u2115",
	"Not;": "\u2AEC",
	"not;": "\u00AC",
	"not": "\u00AC",
	"NotCongruent;": "\u2262",
	"NotCupCap;": "\u226D",
	"NotDoubleVerticalBar;": "\u2226",
	"NotElement;": "\u2209",
	"NotEqual;": "\u2260",
	"NotEqualTilde;": "\u2242\u0338",
	"NotExists;": "\u2204",
	"NotGreater;": "\u226F",
	"NotGreaterEqual;": "\u2271",
	"NotGreaterFullEqual;": "\u2267\u0338",
	"NotGreaterGreater;": "\u226B\u0338",
	"NotGreaterLess;": "\u2279",
	"NotGreaterSlantEqual;": "\u2A7E\u0338",
	"NotGreaterTilde;": "\u2275",
	"NotHumpDownHump;": "\u224E\u0338",
	"NotHumpEqual;": "\u224F\u0338",
	"notin;": "\u2209",
	"notindot;": "\u22F5\u0338",
	"notinE;": "\u22F9\u0338",
	"notinva;": "\u2209",
	"notinvb;": "\u22F7",
	"notinvc;": "\u22F6",
	"NotLeftTriangleBar;": "\u29CF\u0338",
	"NotLeftTriangle;": "\u22EA",
	"NotLeftTriangleEqual;": "\u22EC",
	"NotLess;": "\u226E",
	"NotLessEqual;": "\u2270",
	"NotLessGreater;": "\u2278",
	"NotLessLess;": "\u226A\u0338",
	"NotLessSlantEqual;": "\u2A7D\u0338",
	"NotLessTilde;": "\u2274",
	"NotNestedGreaterGreater;": "\u2AA2\u0338",
	"NotNestedLessLess;": "\u2AA1\u0338",
	"notni;": "\u220C",
	"notniva;": "\u220C",
	"notnivb;": "\u22FE",
	"notnivc;": "\u22FD",
	"NotPrecedes;": "\u2280",
	"NotPrecedesEqual;": "\u2AAF\u0338",
	"NotPrecedesSlantEqual;": "\u22E0",
	"NotReverseElement;": "\u220C",
	"NotRightTriangleBar;": "\u29D0\u0338",
	"NotRightTriangle;": "\u22EB",
	"NotRightTriangleEqual;": "\u22ED",
	"NotSquareSubset;": "\u228F\u0338",
	"NotSquareSubsetEqual;": "\u22E2",
	"NotSquareSuperset;": "\u2290\u0338",
	"NotSquareSupersetEqual;": "\u22E3",
	"NotSubset;": "\u2282\u20D2",
	"NotSubsetEqual;": "\u2288",
	"NotSucceeds;": "\u2281",
	"NotSucceedsEqual;": "\u2AB0\u0338",
	"NotSucceedsSlantEqual;": "\u22E1",
	"NotSucceedsTilde;": "\u227F\u0338",
	"NotSuperset;": "\u2283\u20D2",
	"NotSupersetEqual;": "\u2289",
	"NotTilde;": "\u2241",
	"NotTildeEqual;": "\u2244",
	"NotTildeFullEqual;": "\u2247",
	"NotTildeTilde;": "\u2249",
	"NotVerticalBar;": "\u2224",
	"nparallel;": "\u2226",
	"npar;": "\u2226",
	"nparsl;": "\u2AFD\u20E5",
	"npart;": "\u2202\u0338",
	"npolint;": "\u2A14",
	"npr;": "\u2280",
	"nprcue;": "\u22E0",
	"nprec;": "\u2280",
	"npreceq;": "\u2AAF\u0338",
	"npre;": "\u2AAF\u0338",
	"nrarrc;": "\u2933\u0338",
	"nrarr;": "\u219B",
	"nrArr;": "\u21CF",
	"nrarrw;": "\u219D\u0338",
	"nrightarrow;": "\u219B",
	"nRightarrow;": "\u21CF",
	"nrtri;": "\u22EB",
	"nrtrie;": "\u22ED",
	"nsc;": "\u2281",
	"nsccue;": "\u22E1",
	"nsce;": "\u2AB0\u0338",
	"Nscr;": "\uD835\uDCA9",
	"nscr;": "\uD835\uDCC3",
	"nshortmid;": "\u2224",
	"nshortparallel;": "\u2226",
	"nsim;": "\u2241",
	"nsime;": "\u2244",
	"nsimeq;": "\u2244",
	"nsmid;": "\u2224",
	"nspar;": "\u2226",
	"nsqsube;": "\u22E2",
	"nsqsupe;": "\u22E3",
	"nsub;": "\u2284",
	"nsubE;": "\u2AC5\u0338",
	"nsube;": "\u2288",
	"nsubset;": "\u2282\u20D2",
	"nsubseteq;": "\u2288",
	"nsubseteqq;": "\u2AC5\u0338",
	"nsucc;": "\u2281",
	"nsucceq;": "\u2AB0\u0338",
	"nsup;": "\u2285",
	"nsupE;": "\u2AC6\u0338",
	"nsupe;": "\u2289",
	"nsupset;": "\u2283\u20D2",
	"nsupseteq;": "\u2289",
	"nsupseteqq;": "\u2AC6\u0338",
	"ntgl;": "\u2279",
	"Ntilde;": "\u00D1",
	"Ntilde": "\u00D1",
	"ntilde;": "\u00F1",
	"ntilde": "\u00F1",
	"ntlg;": "\u2278",
	"ntriangleleft;": "\u22EA",
	"ntrianglelefteq;": "\u22EC",
	"ntriangleright;": "\u22EB",
	"ntrianglerighteq;": "\u22ED",
	"Nu;": "\u039D",
	"nu;": "\u03BD",
	"num;": "\u0023",
	"numero;": "\u2116",
	"numsp;": "\u2007",
	"nvap;": "\u224D\u20D2",
	"nvdash;": "\u22AC",
	"nvDash;": "\u22AD",
	"nVdash;": "\u22AE",
	"nVDash;": "\u22AF",
	"nvge;": "\u2265\u20D2",
	"nvgt;": "\u003E\u20D2",
	"nvHarr;": "\u2904",
	"nvinfin;": "\u29DE",
	"nvlArr;": "\u2902",
	"nvle;": "\u2264\u20D2",
	"nvlt;": "\u003C\u20D2",
	"nvltrie;": "\u22B4\u20D2",
	"nvrArr;": "\u2903",
	"nvrtrie;": "\u22B5\u20D2",
	"nvsim;": "\u223C\u20D2",
	"nwarhk;": "\u2923",
	"nwarr;": "\u2196",
	"nwArr;": "\u21D6",
	"nwarrow;": "\u2196",
	"nwnear;": "\u2927",
	"Oacute;": "\u00D3",
	"Oacute": "\u00D3",
	"oacute;": "\u00F3",
	"oacute": "\u00F3",
	"oast;": "\u229B",
	"Ocirc;": "\u00D4",
	"Ocirc": "\u00D4",
	"ocirc;": "\u00F4",
	"ocirc": "\u00F4",
	"ocir;": "\u229A",
	"Ocy;": "\u041E",
	"ocy;": "\u043E",
	"odash;": "\u229D",
	"Odblac;": "\u0150",
	"odblac;": "\u0151",
	"odiv;": "\u2A38",
	"odot;": "\u2299",
	"odsold;": "\u29BC",
	"OElig;": "\u0152",
	"oelig;": "\u0153",
	"ofcir;": "\u29BF",
	"Ofr;": "\uD835\uDD12",
	"ofr;": "\uD835\uDD2C",
	"ogon;": "\u02DB",
	"Ograve;": "\u00D2",
	"Ograve": "\u00D2",
	"ograve;": "\u00F2",
	"ograve": "\u00F2",
	"ogt;": "\u29C1",
	"ohbar;": "\u29B5",
	"ohm;": "\u03A9",
	"oint;": "\u222E",
	"olarr;": "\u21BA",
	"olcir;": "\u29BE",
	"olcross;": "\u29BB",
	"oline;": "\u203E",
	"olt;": "\u29C0",
	"Omacr;": "\u014C",
	"omacr;": "\u014D",
	"Omega;": "\u03A9",
	"omega;": "\u03C9",
	"Omicron;": "\u039F",
	"omicron;": "\u03BF",
	"omid;": "\u29B6",
	"ominus;": "\u2296",
	"Oopf;": "\uD835\uDD46",
	"oopf;": "\uD835\uDD60",
	"opar;": "\u29B7",
	"OpenCurlyDoubleQuote;": "\u201C",
	"OpenCurlyQuote;": "\u2018",
	"operp;": "\u29B9",
	"oplus;": "\u2295",
	"orarr;": "\u21BB",
	"Or;": "\u2A54",
	"or;": "\u2228",
	"ord;": "\u2A5D",
	"order;": "\u2134",
	"orderof;": "\u2134",
	"ordf;": "\u00AA",
	"ordf": "\u00AA",
	"ordm;": "\u00BA",
	"ordm": "\u00BA",
	"origof;": "\u22B6",
	"oror;": "\u2A56",
	"orslope;": "\u2A57",
	"orv;": "\u2A5B",
	"oS;": "\u24C8",
	"Oscr;": "\uD835\uDCAA",
	"oscr;": "\u2134",
	"Oslash;": "\u00D8",
	"Oslash": "\u00D8",
	"oslash;": "\u00F8",
	"oslash": "\u00F8",
	"osol;": "\u2298",
	"Otilde;": "\u00D5",
	"Otilde": "\u00D5",
	"otilde;": "\u00F5",
	"otilde": "\u00F5",
	"otimesas;": "\u2A36",
	"Otimes;": "\u2A37",
	"otimes;": "\u2297",
	"Ouml;": "\u00D6",
	"Ouml": "\u00D6",
	"ouml;": "\u00F6",
	"ouml": "\u00F6",
	"ovbar;": "\u233D",
	"OverBar;": "\u203E",
	"OverBrace;": "\u23DE",
	"OverBracket;": "\u23B4",
	"OverParenthesis;": "\u23DC",
	"para;": "\u00B6",
	"para": "\u00B6",
	"parallel;": "\u2225",
	"par;": "\u2225",
	"parsim;": "\u2AF3",
	"parsl;": "\u2AFD",
	"part;": "\u2202",
	"PartialD;": "\u2202",
	"Pcy;": "\u041F",
	"pcy;": "\u043F",
	"percnt;": "\u0025",
	"period;": "\u002E",
	"permil;": "\u2030",
	"perp;": "\u22A5",
	"pertenk;": "\u2031",
	"Pfr;": "\uD835\uDD13",
	"pfr;": "\uD835\uDD2D",
	"Phi;": "\u03A6",
	"phi;": "\u03C6",
	"phiv;": "\u03D5",
	"phmmat;": "\u2133",
	"phone;": "\u260E",
	"Pi;": "\u03A0",
	"pi;": "\u03C0",
	"pitchfork;": "\u22D4",
	"piv;": "\u03D6",
	"planck;": "\u210F",
	"planckh;": "\u210E",
	"plankv;": "\u210F",
	"plusacir;": "\u2A23",
	"plusb;": "\u229E",
	"pluscir;": "\u2A22",
	"plus;": "\u002B",
	"plusdo;": "\u2214",
	"plusdu;": "\u2A25",
	"pluse;": "\u2A72",
	"PlusMinus;": "\u00B1",
	"plusmn;": "\u00B1",
	"plusmn": "\u00B1",
	"plussim;": "\u2A26",
	"plustwo;": "\u2A27",
	"pm;": "\u00B1",
	"Poincareplane;": "\u210C",
	"pointint;": "\u2A15",
	"popf;": "\uD835\uDD61",
	"Popf;": "\u2119",
	"pound;": "\u00A3",
	"pound": "\u00A3",
	"prap;": "\u2AB7",
	"Pr;": "\u2ABB",
	"pr;": "\u227A",
	"prcue;": "\u227C",
	"precapprox;": "\u2AB7",
	"prec;": "\u227A",
	"preccurlyeq;": "\u227C",
	"Precedes;": "\u227A",
	"PrecedesEqual;": "\u2AAF",
	"PrecedesSlantEqual;": "\u227C",
	"PrecedesTilde;": "\u227E",
	"preceq;": "\u2AAF",
	"precnapprox;": "\u2AB9",
	"precneqq;": "\u2AB5",
	"precnsim;": "\u22E8",
	"pre;": "\u2AAF",
	"prE;": "\u2AB3",
	"precsim;": "\u227E",
	"prime;": "\u2032",
	"Prime;": "\u2033",
	"primes;": "\u2119",
	"prnap;": "\u2AB9",
	"prnE;": "\u2AB5",
	"prnsim;": "\u22E8",
	"prod;": "\u220F",
	"Product;": "\u220F",
	"profalar;": "\u232E",
	"profline;": "\u2312",
	"profsurf;": "\u2313",
	"prop;": "\u221D",
	"Proportional;": "\u221D",
	"Proportion;": "\u2237",
	"propto;": "\u221D",
	"prsim;": "\u227E",
	"prurel;": "\u22B0",
	"Pscr;": "\uD835\uDCAB",
	"pscr;": "\uD835\uDCC5",
	"Psi;": "\u03A8",
	"psi;": "\u03C8",
	"puncsp;": "\u2008",
	"Qfr;": "\uD835\uDD14",
	"qfr;": "\uD835\uDD2E",
	"qint;": "\u2A0C",
	"qopf;": "\uD835\uDD62",
	"Qopf;": "\u211A",
	"qprime;": "\u2057",
	"Qscr;": "\uD835\uDCAC",
	"qscr;": "\uD835\uDCC6",
	"quaternions;": "\u210D",
	"quatint;": "\u2A16",
	"quest;": "\u003F",
	"questeq;": "\u225F",
	"quot;": "\u0022",
	"quot": "\u0022",
	"QUOT;": "\u0022",
	"QUOT": "\u0022",
	"rAarr;": "\u21DB",
	"race;": "\u223D\u0331",
	"Racute;": "\u0154",
	"racute;": "\u0155",
	"radic;": "\u221A",
	"raemptyv;": "\u29B3",
	"rang;": "\u27E9",
	"Rang;": "\u27EB",
	"rangd;": "\u2992",
	"range;": "\u29A5",
	"rangle;": "\u27E9",
	"raquo;": "\u00BB",
	"raquo": "\u00BB",
	"rarrap;": "\u2975",
	"rarrb;": "\u21E5",
	"rarrbfs;": "\u2920",
	"rarrc;": "\u2933",
	"rarr;": "\u2192",
	"Rarr;": "\u21A0",
	"rArr;": "\u21D2",
	"rarrfs;": "\u291E",
	"rarrhk;": "\u21AA",
	"rarrlp;": "\u21AC",
	"rarrpl;": "\u2945",
	"rarrsim;": "\u2974",
	"Rarrtl;": "\u2916",
	"rarrtl;": "\u21A3",
	"rarrw;": "\u219D",
	"ratail;": "\u291A",
	"rAtail;": "\u291C",
	"ratio;": "\u2236",
	"rationals;": "\u211A",
	"rbarr;": "\u290D",
	"rBarr;": "\u290F",
	"RBarr;": "\u2910",
	"rbbrk;": "\u2773",
	"rbrace;": "\u007D",
	"rbrack;": "\u005D",
	"rbrke;": "\u298C",
	"rbrksld;": "\u298E",
	"rbrkslu;": "\u2990",
	"Rcaron;": "\u0158",
	"rcaron;": "\u0159",
	"Rcedil;": "\u0156",
	"rcedil;": "\u0157",
	"rceil;": "\u2309",
	"rcub;": "\u007D",
	"Rcy;": "\u0420",
	"rcy;": "\u0440",
	"rdca;": "\u2937",
	"rdldhar;": "\u2969",
	"rdquo;": "\u201D",
	"rdquor;": "\u201D",
	"rdsh;": "\u21B3",
	"real;": "\u211C",
	"realine;": "\u211B",
	"realpart;": "\u211C",
	"reals;": "\u211D",
	"Re;": "\u211C",
	"rect;": "\u25AD",
	"reg;": "\u00AE",
	"reg": "\u00AE",
	"REG;": "\u00AE",
	"REG": "\u00AE",
	"ReverseElement;": "\u220B",
	"ReverseEquilibrium;": "\u21CB",
	"ReverseUpEquilibrium;": "\u296F",
	"rfisht;": "\u297D",
	"rfloor;": "\u230B",
	"rfr;": "\uD835\uDD2F",
	"Rfr;": "\u211C",
	"rHar;": "\u2964",
	"rhard;": "\u21C1",
	"rharu;": "\u21C0",
	"rharul;": "\u296C",
	"Rho;": "\u03A1",
	"rho;": "\u03C1",
	"rhov;": "\u03F1",
	"RightAngleBracket;": "\u27E9",
	"RightArrowBar;": "\u21E5",
	"rightarrow;": "\u2192",
	"RightArrow;": "\u2192",
	"Rightarrow;": "\u21D2",
	"RightArrowLeftArrow;": "\u21C4",
	"rightarrowtail;": "\u21A3",
	"RightCeiling;": "\u2309",
	"RightDoubleBracket;": "\u27E7",
	"RightDownTeeVector;": "\u295D",
	"RightDownVectorBar;": "\u2955",
	"RightDownVector;": "\u21C2",
	"RightFloor;": "\u230B",
	"rightharpoondown;": "\u21C1",
	"rightharpoonup;": "\u21C0",
	"rightleftarrows;": "\u21C4",
	"rightleftharpoons;": "\u21CC",
	"rightrightarrows;": "\u21C9",
	"rightsquigarrow;": "\u219D",
	"RightTeeArrow;": "\u21A6",
	"RightTee;": "\u22A2",
	"RightTeeVector;": "\u295B",
	"rightthreetimes;": "\u22CC",
	"RightTriangleBar;": "\u29D0",
	"RightTriangle;": "\u22B3",
	"RightTriangleEqual;": "\u22B5",
	"RightUpDownVector;": "\u294F",
	"RightUpTeeVector;": "\u295C",
	"RightUpVectorBar;": "\u2954",
	"RightUpVector;": "\u21BE",
	"RightVectorBar;": "\u2953",
	"RightVector;": "\u21C0",
	"ring;": "\u02DA",
	"risingdotseq;": "\u2253",
	"rlarr;": "\u21C4",
	"rlhar;": "\u21CC",
	"rlm;": "\u200F",
	"rmoustache;": "\u23B1",
	"rmoust;": "\u23B1",
	"rnmid;": "\u2AEE",
	"roang;": "\u27ED",
	"roarr;": "\u21FE",
	"robrk;": "\u27E7",
	"ropar;": "\u2986",
	"ropf;": "\uD835\uDD63",
	"Ropf;": "\u211D",
	"roplus;": "\u2A2E",
	"rotimes;": "\u2A35",
	"RoundImplies;": "\u2970",
	"rpar;": "\u0029",
	"rpargt;": "\u2994",
	"rppolint;": "\u2A12",
	"rrarr;": "\u21C9",
	"Rrightarrow;": "\u21DB",
	"rsaquo;": "\u203A",
	"rscr;": "\uD835\uDCC7",
	"Rscr;": "\u211B",
	"rsh;": "\u21B1",
	"Rsh;": "\u21B1",
	"rsqb;": "\u005D",
	"rsquo;": "\u2019",
	"rsquor;": "\u2019",
	"rthree;": "\u22CC",
	"rtimes;": "\u22CA",
	"rtri;": "\u25B9",
	"rtrie;": "\u22B5",
	"rtrif;": "\u25B8",
	"rtriltri;": "\u29CE",
	"RuleDelayed;": "\u29F4",
	"ruluhar;": "\u2968",
	"rx;": "\u211E",
	"Sacute;": "\u015A",
	"sacute;": "\u015B",
	"sbquo;": "\u201A",
	"scap;": "\u2AB8",
	"Scaron;": "\u0160",
	"scaron;": "\u0161",
	"Sc;": "\u2ABC",
	"sc;": "\u227B",
	"sccue;": "\u227D",
	"sce;": "\u2AB0",
	"scE;": "\u2AB4",
	"Scedil;": "\u015E",
	"scedil;": "\u015F",
	"Scirc;": "\u015C",
	"scirc;": "\u015D",
	"scnap;": "\u2ABA",
	"scnE;": "\u2AB6",
	"scnsim;": "\u22E9",
	"scpolint;": "\u2A13",
	"scsim;": "\u227F",
	"Scy;": "\u0421",
	"scy;": "\u0441",
	"sdotb;": "\u22A1",
	"sdot;": "\u22C5",
	"sdote;": "\u2A66",
	"searhk;": "\u2925",
	"searr;": "\u2198",
	"seArr;": "\u21D8",
	"searrow;": "\u2198",
	"sect;": "\u00A7",
	"sect": "\u00A7",
	"semi;": "\u003B",
	"seswar;": "\u2929",
	"setminus;": "\u2216",
	"setmn;": "\u2216",
	"sext;": "\u2736",
	"Sfr;": "\uD835\uDD16",
	"sfr;": "\uD835\uDD30",
	"sfrown;": "\u2322",
	"sharp;": "\u266F",
	"SHCHcy;": "\u0429",
	"shchcy;": "\u0449",
	"SHcy;": "\u0428",
	"shcy;": "\u0448",
	"ShortDownArrow;": "\u2193",
	"ShortLeftArrow;": "\u2190",
	"shortmid;": "\u2223",
	"shortparallel;": "\u2225",
	"ShortRightArrow;": "\u2192",
	"ShortUpArrow;": "\u2191",
	"shy;": "\u00AD",
	"shy": "\u00AD",
	"Sigma;": "\u03A3",
	"sigma;": "\u03C3",
	"sigmaf;": "\u03C2",
	"sigmav;": "\u03C2",
	"sim;": "\u223C",
	"simdot;": "\u2A6A",
	"sime;": "\u2243",
	"simeq;": "\u2243",
	"simg;": "\u2A9E",
	"simgE;": "\u2AA0",
	"siml;": "\u2A9D",
	"simlE;": "\u2A9F",
	"simne;": "\u2246",
	"simplus;": "\u2A24",
	"simrarr;": "\u2972",
	"slarr;": "\u2190",
	"SmallCircle;": "\u2218",
	"smallsetminus;": "\u2216",
	"smashp;": "\u2A33",
	"smeparsl;": "\u29E4",
	"smid;": "\u2223",
	"smile;": "\u2323",
	"smt;": "\u2AAA",
	"smte;": "\u2AAC",
	"smtes;": "\u2AAC\uFE00",
	"SOFTcy;": "\u042C",
	"softcy;": "\u044C",
	"solbar;": "\u233F",
	"solb;": "\u29C4",
	"sol;": "\u002F",
	"Sopf;": "\uD835\uDD4A",
	"sopf;": "\uD835\uDD64",
	"spades;": "\u2660",
	"spadesuit;": "\u2660",
	"spar;": "\u2225",
	"sqcap;": "\u2293",
	"sqcaps;": "\u2293\uFE00",
	"sqcup;": "\u2294",
	"sqcups;": "\u2294\uFE00",
	"Sqrt;": "\u221A",
	"sqsub;": "\u228F",
	"sqsube;": "\u2291",
	"sqsubset;": "\u228F",
	"sqsubseteq;": "\u2291",
	"sqsup;": "\u2290",
	"sqsupe;": "\u2292",
	"sqsupset;": "\u2290",
	"sqsupseteq;": "\u2292",
	"square;": "\u25A1",
	"Square;": "\u25A1",
	"SquareIntersection;": "\u2293",
	"SquareSubset;": "\u228F",
	"SquareSubsetEqual;": "\u2291",
	"SquareSuperset;": "\u2290",
	"SquareSupersetEqual;": "\u2292",
	"SquareUnion;": "\u2294",
	"squarf;": "\u25AA",
	"squ;": "\u25A1",
	"squf;": "\u25AA",
	"srarr;": "\u2192",
	"Sscr;": "\uD835\uDCAE",
	"sscr;": "\uD835\uDCC8",
	"ssetmn;": "\u2216",
	"ssmile;": "\u2323",
	"sstarf;": "\u22C6",
	"Star;": "\u22C6",
	"star;": "\u2606",
	"starf;": "\u2605",
	"straightepsilon;": "\u03F5",
	"straightphi;": "\u03D5",
	"strns;": "\u00AF",
	"sub;": "\u2282",
	"Sub;": "\u22D0",
	"subdot;": "\u2ABD",
	"subE;": "\u2AC5",
	"sube;": "\u2286",
	"subedot;": "\u2AC3",
	"submult;": "\u2AC1",
	"subnE;": "\u2ACB",
	"subne;": "\u228A",
	"subplus;": "\u2ABF",
	"subrarr;": "\u2979",
	"subset;": "\u2282",
	"Subset;": "\u22D0",
	"subseteq;": "\u2286",
	"subseteqq;": "\u2AC5",
	"SubsetEqual;": "\u2286",
	"subsetneq;": "\u228A",
	"subsetneqq;": "\u2ACB",
	"subsim;": "\u2AC7",
	"subsub;": "\u2AD5",
	"subsup;": "\u2AD3",
	"succapprox;": "\u2AB8",
	"succ;": "\u227B",
	"succcurlyeq;": "\u227D",
	"Succeeds;": "\u227B",
	"SucceedsEqual;": "\u2AB0",
	"SucceedsSlantEqual;": "\u227D",
	"SucceedsTilde;": "\u227F",
	"succeq;": "\u2AB0",
	"succnapprox;": "\u2ABA",
	"succneqq;": "\u2AB6",
	"succnsim;": "\u22E9",
	"succsim;": "\u227F",
	"SuchThat;": "\u220B",
	"sum;": "\u2211",
	"Sum;": "\u2211",
	"sung;": "\u266A",
	"sup1;": "\u00B9",
	"sup1": "\u00B9",
	"sup2;": "\u00B2",
	"sup2": "\u00B2",
	"sup3;": "\u00B3",
	"sup3": "\u00B3",
	"sup;": "\u2283",
	"Sup;": "\u22D1",
	"supdot;": "\u2ABE",
	"supdsub;": "\u2AD8",
	"supE;": "\u2AC6",
	"supe;": "\u2287",
	"supedot;": "\u2AC4",
	"Superset;": "\u2283",
	"SupersetEqual;": "\u2287",
	"suphsol;": "\u27C9",
	"suphsub;": "\u2AD7",
	"suplarr;": "\u297B",
	"supmult;": "\u2AC2",
	"supnE;": "\u2ACC",
	"supne;": "\u228B",
	"supplus;": "\u2AC0",
	"supset;": "\u2283",
	"Supset;": "\u22D1",
	"supseteq;": "\u2287",
	"supseteqq;": "\u2AC6",
	"supsetneq;": "\u228B",
	"supsetneqq;": "\u2ACC",
	"supsim;": "\u2AC8",
	"supsub;": "\u2AD4",
	"supsup;": "\u2AD6",
	"swarhk;": "\u2926",
	"swarr;": "\u2199",
	"swArr;": "\u21D9",
	"swarrow;": "\u2199",
	"swnwar;": "\u292A",
	"szlig;": "\u00DF",
	"szlig": "\u00DF",
	"Tab;": "\u0009",
	"target;": "\u2316",
	"Tau;": "\u03A4",
	"tau;": "\u03C4",
	"tbrk;": "\u23B4",
	"Tcaron;": "\u0164",
	"tcaron;": "\u0165",
	"Tcedil;": "\u0162",
	"tcedil;": "\u0163",
	"Tcy;": "\u0422",
	"tcy;": "\u0442",
	"tdot;": "\u20DB",
	"telrec;": "\u2315",
	"Tfr;": "\uD835\uDD17",
	"tfr;": "\uD835\uDD31",
	"there4;": "\u2234",
	"therefore;": "\u2234",
	"Therefore;": "\u2234",
	"Theta;": "\u0398",
	"theta;": "\u03B8",
	"thetasym;": "\u03D1",
	"thetav;": "\u03D1",
	"thickapprox;": "\u2248",
	"thicksim;": "\u223C",
	"ThickSpace;": "\u205F\u200A",
	"ThinSpace;": "\u2009",
	"thinsp;": "\u2009",
	"thkap;": "\u2248",
	"thksim;": "\u223C",
	"THORN;": "\u00DE",
	"THORN": "\u00DE",
	"thorn;": "\u00FE",
	"thorn": "\u00FE",
	"tilde;": "\u02DC",
	"Tilde;": "\u223C",
	"TildeEqual;": "\u2243",
	"TildeFullEqual;": "\u2245",
	"TildeTilde;": "\u2248",
	"timesbar;": "\u2A31",
	"timesb;": "\u22A0",
	"times;": "\u00D7",
	"times": "\u00D7",
	"timesd;": "\u2A30",
	"tint;": "\u222D",
	"toea;": "\u2928",
	"topbot;": "\u2336",
	"topcir;": "\u2AF1",
	"top;": "\u22A4",
	"Topf;": "\uD835\uDD4B",
	"topf;": "\uD835\uDD65",
	"topfork;": "\u2ADA",
	"tosa;": "\u2929",
	"tprime;": "\u2034",
	"trade;": "\u2122",
	"TRADE;": "\u2122",
	"triangle;": "\u25B5",
	"triangledown;": "\u25BF",
	"triangleleft;": "\u25C3",
	"trianglelefteq;": "\u22B4",
	"triangleq;": "\u225C",
	"triangleright;": "\u25B9",
	"trianglerighteq;": "\u22B5",
	"tridot;": "\u25EC",
	"trie;": "\u225C",
	"triminus;": "\u2A3A",
	"TripleDot;": "\u20DB",
	"triplus;": "\u2A39",
	"trisb;": "\u29CD",
	"tritime;": "\u2A3B",
	"trpezium;": "\u23E2",
	"Tscr;": "\uD835\uDCAF",
	"tscr;": "\uD835\uDCC9",
	"TScy;": "\u0426",
	"tscy;": "\u0446",
	"TSHcy;": "\u040B",
	"tshcy;": "\u045B",
	"Tstrok;": "\u0166",
	"tstrok;": "\u0167",
	"twixt;": "\u226C",
	"twoheadleftarrow;": "\u219E",
	"twoheadrightarrow;": "\u21A0",
	"Uacute;": "\u00DA",
	"Uacute": "\u00DA",
	"uacute;": "\u00FA",
	"uacute": "\u00FA",
	"uarr;": "\u2191",
	"Uarr;": "\u219F",
	"uArr;": "\u21D1",
	"Uarrocir;": "\u2949",
	"Ubrcy;": "\u040E",
	"ubrcy;": "\u045E",
	"Ubreve;": "\u016C",
	"ubreve;": "\u016D",
	"Ucirc;": "\u00DB",
	"Ucirc": "\u00DB",
	"ucirc;": "\u00FB",
	"ucirc": "\u00FB",
	"Ucy;": "\u0423",
	"ucy;": "\u0443",
	"udarr;": "\u21C5",
	"Udblac;": "\u0170",
	"udblac;": "\u0171",
	"udhar;": "\u296E",
	"ufisht;": "\u297E",
	"Ufr;": "\uD835\uDD18",
	"ufr;": "\uD835\uDD32",
	"Ugrave;": "\u00D9",
	"Ugrave": "\u00D9",
	"ugrave;": "\u00F9",
	"ugrave": "\u00F9",
	"uHar;": "\u2963",
	"uharl;": "\u21BF",
	"uharr;": "\u21BE",
	"uhblk;": "\u2580",
	"ulcorn;": "\u231C",
	"ulcorner;": "\u231C",
	"ulcrop;": "\u230F",
	"ultri;": "\u25F8",
	"Umacr;": "\u016A",
	"umacr;": "\u016B",
	"uml;": "\u00A8",
	"uml": "\u00A8",
	"UnderBar;": "\u005F",
	"UnderBrace;": "\u23DF",
	"UnderBracket;": "\u23B5",
	"UnderParenthesis;": "\u23DD",
	"Union;": "\u22C3",
	"UnionPlus;": "\u228E",
	"Uogon;": "\u0172",
	"uogon;": "\u0173",
	"Uopf;": "\uD835\uDD4C",
	"uopf;": "\uD835\uDD66",
	"UpArrowBar;": "\u2912",
	"uparrow;": "\u2191",
	"UpArrow;": "\u2191",
	"Uparrow;": "\u21D1",
	"UpArrowDownArrow;": "\u21C5",
	"updownarrow;": "\u2195",
	"UpDownArrow;": "\u2195",
	"Updownarrow;": "\u21D5",
	"UpEquilibrium;": "\u296E",
	"upharpoonleft;": "\u21BF",
	"upharpoonright;": "\u21BE",
	"uplus;": "\u228E",
	"UpperLeftArrow;": "\u2196",
	"UpperRightArrow;": "\u2197",
	"upsi;": "\u03C5",
	"Upsi;": "\u03D2",
	"upsih;": "\u03D2",
	"Upsilon;": "\u03A5",
	"upsilon;": "\u03C5",
	"UpTeeArrow;": "\u21A5",
	"UpTee;": "\u22A5",
	"upuparrows;": "\u21C8",
	"urcorn;": "\u231D",
	"urcorner;": "\u231D",
	"urcrop;": "\u230E",
	"Uring;": "\u016E",
	"uring;": "\u016F",
	"urtri;": "\u25F9",
	"Uscr;": "\uD835\uDCB0",
	"uscr;": "\uD835\uDCCA",
	"utdot;": "\u22F0",
	"Utilde;": "\u0168",
	"utilde;": "\u0169",
	"utri;": "\u25B5",
	"utrif;": "\u25B4",
	"uuarr;": "\u21C8",
	"Uuml;": "\u00DC",
	"Uuml": "\u00DC",
	"uuml;": "\u00FC",
	"uuml": "\u00FC",
	"uwangle;": "\u29A7",
	"vangrt;": "\u299C",
	"varepsilon;": "\u03F5",
	"varkappa;": "\u03F0",
	"varnothing;": "\u2205",
	"varphi;": "\u03D5",
	"varpi;": "\u03D6",
	"varpropto;": "\u221D",
	"varr;": "\u2195",
	"vArr;": "\u21D5",
	"varrho;": "\u03F1",
	"varsigma;": "\u03C2",
	"varsubsetneq;": "\u228A\uFE00",
	"varsubsetneqq;": "\u2ACB\uFE00",
	"varsupsetneq;": "\u228B\uFE00",
	"varsupsetneqq;": "\u2ACC\uFE00",
	"vartheta;": "\u03D1",
	"vartriangleleft;": "\u22B2",
	"vartriangleright;": "\u22B3",
	"vBar;": "\u2AE8",
	"Vbar;": "\u2AEB",
	"vBarv;": "\u2AE9",
	"Vcy;": "\u0412",
	"vcy;": "\u0432",
	"vdash;": "\u22A2",
	"vDash;": "\u22A8",
	"Vdash;": "\u22A9",
	"VDash;": "\u22AB",
	"Vdashl;": "\u2AE6",
	"veebar;": "\u22BB",
	"vee;": "\u2228",
	"Vee;": "\u22C1",
	"veeeq;": "\u225A",
	"vellip;": "\u22EE",
	"verbar;": "\u007C",
	"Verbar;": "\u2016",
	"vert;": "\u007C",
	"Vert;": "\u2016",
	"VerticalBar;": "\u2223",
	"VerticalLine;": "\u007C",
	"VerticalSeparator;": "\u2758",
	"VerticalTilde;": "\u2240",
	"VeryThinSpace;": "\u200A",
	"Vfr;": "\uD835\uDD19",
	"vfr;": "\uD835\uDD33",
	"vltri;": "\u22B2",
	"vnsub;": "\u2282\u20D2",
	"vnsup;": "\u2283\u20D2",
	"Vopf;": "\uD835\uDD4D",
	"vopf;": "\uD835\uDD67",
	"vprop;": "\u221D",
	"vrtri;": "\u22B3",
	"Vscr;": "\uD835\uDCB1",
	"vscr;": "\uD835\uDCCB",
	"vsubnE;": "\u2ACB\uFE00",
	"vsubne;": "\u228A\uFE00",
	"vsupnE;": "\u2ACC\uFE00",
	"vsupne;": "\u228B\uFE00",
	"Vvdash;": "\u22AA",
	"vzigzag;": "\u299A",
	"Wcirc;": "\u0174",
	"wcirc;": "\u0175",
	"wedbar;": "\u2A5F",
	"wedge;": "\u2227",
	"Wedge;": "\u22C0",
	"wedgeq;": "\u2259",
	"weierp;": "\u2118",
	"Wfr;": "\uD835\uDD1A",
	"wfr;": "\uD835\uDD34",
	"Wopf;": "\uD835\uDD4E",
	"wopf;": "\uD835\uDD68",
	"wp;": "\u2118",
	"wr;": "\u2240",
	"wreath;": "\u2240",
	"Wscr;": "\uD835\uDCB2",
	"wscr;": "\uD835\uDCCC",
	"xcap;": "\u22C2",
	"xcirc;": "\u25EF",
	"xcup;": "\u22C3",
	"xdtri;": "\u25BD",
	"Xfr;": "\uD835\uDD1B",
	"xfr;": "\uD835\uDD35",
	"xharr;": "\u27F7",
	"xhArr;": "\u27FA",
	"Xi;": "\u039E",
	"xi;": "\u03BE",
	"xlarr;": "\u27F5",
	"xlArr;": "\u27F8",
	"xmap;": "\u27FC",
	"xnis;": "\u22FB",
	"xodot;": "\u2A00",
	"Xopf;": "\uD835\uDD4F",
	"xopf;": "\uD835\uDD69",
	"xoplus;": "\u2A01",
	"xotime;": "\u2A02",
	"xrarr;": "\u27F6",
	"xrArr;": "\u27F9",
	"Xscr;": "\uD835\uDCB3",
	"xscr;": "\uD835\uDCCD",
	"xsqcup;": "\u2A06",
	"xuplus;": "\u2A04",
	"xutri;": "\u25B3",
	"xvee;": "\u22C1",
	"xwedge;": "\u22C0",
	"Yacute;": "\u00DD",
	"Yacute": "\u00DD",
	"yacute;": "\u00FD",
	"yacute": "\u00FD",
	"YAcy;": "\u042F",
	"yacy;": "\u044F",
	"Ycirc;": "\u0176",
	"ycirc;": "\u0177",
	"Ycy;": "\u042B",
	"ycy;": "\u044B",
	"yen;": "\u00A5",
	"yen": "\u00A5",
	"Yfr;": "\uD835\uDD1C",
	"yfr;": "\uD835\uDD36",
	"YIcy;": "\u0407",
	"yicy;": "\u0457",
	"Yopf;": "\uD835\uDD50",
	"yopf;": "\uD835\uDD6A",
	"Yscr;": "\uD835\uDCB4",
	"yscr;": "\uD835\uDCCE",
	"YUcy;": "\u042E",
	"yucy;": "\u044E",
	"yuml;": "\u00FF",
	"yuml": "\u00FF",
	"Yuml;": "\u0178",
	"Zacute;": "\u0179",
	"zacute;": "\u017A",
	"Zcaron;": "\u017D",
	"zcaron;": "\u017E",
	"Zcy;": "\u0417",
	"zcy;": "\u0437",
	"Zdot;": "\u017B",
	"zdot;": "\u017C",
	"zeetrf;": "\u2128",
	"ZeroWidthSpace;": "\u200B",
	"Zeta;": "\u0396",
	"zeta;": "\u03B6",
	"zfr;": "\uD835\uDD37",
	"Zfr;": "\u2128",
	"ZHcy;": "\u0416",
	"zhcy;": "\u0436",
	"zigrarr;": "\u21DD",
	"zopf;": "\uD835\uDD6B",
	"Zopf;": "\u2124",
	"Zscr;": "\uD835\uDCB5",
	"zscr;": "\uD835\uDCCF",
	"zwj;": "\u200D",
	"zwnj;": "\u200C"
};

},
{}],
13:[function(_dereq_,module,exports){
var util = _dereq_('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

var assert = module.exports = ok;

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    var err = new Error();
    if (err.stack) {
      var out = err.stack;
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}
assert.fail = fail;

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  if (a.prototype !== b.prototype) return false;
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  if (ka.length != kb.length)
    return false;
  ka.sort();
  kb.sort();
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},
{"util/":15}],
14:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},
{}],
15:[function(_dereq_,module,exports){
(function (process,global){

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};
exports.deprecate = function(fn, msg) {
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};
function inspect(obj, opts) {
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    ctx.showHidden = opts;
  } else if (opts) {
    exports._extend(ctx, opts);
  }
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      value.inspect !== exports.inspect &&
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = _dereq_('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};
exports.inherits = _dereq_('inherits');

exports._extend = function(origin, add) {
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,_dereq_("/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},
{"./support/isBuffer":14,"/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":18,"inherits":17}],
16:[function(_dereq_,module,exports){

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;
EventEmitter.defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    this._events[type].push(listener);
  else
    this._events[type] = [this._events[type], listener];
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},
{}],
17:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},
{}],
18:[function(_dereq_,module,exports){

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.once = noop;
process.off = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},
{}],
19:[function(_dereq_,module,exports){
module.exports=_dereq_(14)
},
{}],
20:[function(_dereq_,module,exports){
module.exports=_dereq_(15)
},
{"./support/isBuffer":19,"/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":18,"inherits":17}]},{},[9])
(9)

});


/**
 * Modifications:
 * changed ace.define("ace/mode/html_worker" to ace.define("ace/mode/html_worker_original"
 */
ace.define("ace/mode/html_worker_original",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/worker/mirror","ace/mode/html/saxparser"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var lang = require("../lib/lang");
var Mirror = require("../worker/mirror").Mirror;
var SAXParser = require("./html/saxparser").SAXParser;

var errorTypes = {
    "expected-doctype-but-got-start-tag": "info",
    "expected-doctype-but-got-chars": "info",
    "non-html-root": "info"
}

var Worker = exports.Worker = function(sender) {
    Mirror.call(this, sender);
    this.setTimeout(400);
    this.context = null;
};

oop.inherits(Worker, Mirror);

(function() {

    this.setOptions = function(options) {
        this.context = options.context;
    };

    this.onUpdate = function() {
        var value = this.doc.getValue();
        if (!value)
            return;
        var parser = new SAXParser();
        var errors = [];
        var noop = function(){};
        parser.contentHandler = {
           startDocument: noop,
           endDocument: noop,
           startElement: noop,
           endElement: noop,
           characters: noop
        };
        parser.errorHandler = {
            error: function(message, location, code) {
                errors.push({
                    row: location.line,
                    column: location.column,
                    text: message,
                    type: errorTypes[code] || "error"
                });
            }
        };
        if (this.context)
            parser.parseFragment(value, this.context);
        else
            parser.parse(value);
        this.sender.emit("error", errors);
    };

}).call(Worker.prototype);

});

ace.define("ace/lib/es5-shim",["require","exports","module"], function(require, exports, module) {

function Empty() {}

if (!Function.prototype.bind) {
    Function.prototype.bind = function bind(that) { // .length is 1
        var target = this;
        if (typeof target != "function") {
            throw new TypeError("Function.prototype.bind called on incompatible " + target);
        }
        var args = slice.call(arguments, 1); // for normal call
        var bound = function () {

            if (this instanceof bound) {

                var result = target.apply(
                    this,
                    args.concat(slice.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return this;

            } else {
                return target.apply(
                    that,
                    args.concat(slice.call(arguments))
                );

            }

        };
        if(target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            Empty.prototype = null;
        }
        return bound;
    };
}
var call = Function.prototype.call;
var prototypeOfArray = Array.prototype;
var prototypeOfObject = Object.prototype;
var slice = prototypeOfArray.slice;
var _toString = call.bind(prototypeOfObject.toString);
var owns = call.bind(prototypeOfObject.hasOwnProperty);
var defineGetter;
var defineSetter;
var lookupGetter;
var lookupSetter;
var supportsAccessors;
if ((supportsAccessors = owns(prototypeOfObject, "__defineGetter__"))) {
    defineGetter = call.bind(prototypeOfObject.__defineGetter__);
    defineSetter = call.bind(prototypeOfObject.__defineSetter__);
    lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
    lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
}
if ([1,2].splice(0).length != 2) {
    if(function() { // test IE < 9 to splice bug - see issue #138
        function makeArray(l) {
            var a = new Array(l+2);
            a[0] = a[1] = 0;
            return a;
        }
        var array = [], lengthBefore;
        
        array.splice.apply(array, makeArray(20));
        array.splice.apply(array, makeArray(26));

        lengthBefore = array.length; //46
        array.splice(5, 0, "XXX"); // add one element

        lengthBefore + 1 == array.length

        if (lengthBefore + 1 == array.length) {
            return true;// has right splice implementation without bugs
        }
    }()) {//IE 6/7
        var array_splice = Array.prototype.splice;
        Array.prototype.splice = function(start, deleteCount) {
            if (!arguments.length) {
                return [];
            } else {
                return array_splice.apply(this, [
                    start === void 0 ? 0 : start,
                    deleteCount === void 0 ? (this.length - start) : deleteCount
                ].concat(slice.call(arguments, 2)))
            }
        };
    } else {//IE8
        Array.prototype.splice = function(pos, removeCount){
            var length = this.length;
            if (pos > 0) {
                if (pos > length)
                    pos = length;
            } else if (pos == void 0) {
                pos = 0;
            } else if (pos < 0) {
                pos = Math.max(length + pos, 0);
            }

            if (!(pos+removeCount < length))
                removeCount = length - pos;

            var removed = this.slice(pos, pos+removeCount);
            var insert = slice.call(arguments, 2);
            var add = insert.length;
            if (pos === length) {
                if (add) {
                    this.push.apply(this, insert);
                }
            } else {
                var remove = Math.min(removeCount, length - pos);
                var tailOldPos = pos + remove;
                var tailNewPos = tailOldPos + add - remove;
                var tailCount = length - tailOldPos;
                var lengthAfterRemove = length - remove;

                if (tailNewPos < tailOldPos) { // case A
                    for (var i = 0; i < tailCount; ++i) {
                        this[tailNewPos+i] = this[tailOldPos+i];
                    }
                } else if (tailNewPos > tailOldPos) { // case B
                    for (i = tailCount; i--; ) {
                        this[tailNewPos+i] = this[tailOldPos+i];
                    }
                } // else, add == remove (nothing to do)

                if (add && pos === lengthAfterRemove) {
                    this.length = lengthAfterRemove; // truncate array
                    this.push.apply(this, insert);
                } else {
                    this.length = lengthAfterRemove + add; // reserves space
                    for (i = 0; i < add; ++i) {
                        this[pos+i] = insert[i];
                    }
                }
            }
            return removed;
        };
    }
}
if (!Array.isArray) {
    Array.isArray = function isArray(obj) {
        return _toString(obj) == "[object Array]";
    };
}
var boxedString = Object("a"),
    splitString = boxedString[0] != "a" || !(0 in boxedString);

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function forEach(fun /*, thisp*/) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            thisp = arguments[1],
            i = -1,
            length = self.length >>> 0;
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(); // TODO message
        }

        while (++i < length) {
            if (i in self) {
                fun.call(thisp, self[i], i, object);
            }
        }
    };
}
if (!Array.prototype.map) {
    Array.prototype.map = function map(fun /*, thisp*/) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0,
            result = Array(length),
            thisp = arguments[1];
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self)
                result[i] = fun.call(thisp, self[i], i, object);
        }
        return result;
    };
}
if (!Array.prototype.filter) {
    Array.prototype.filter = function filter(fun /*, thisp */) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                    object,
            length = self.length >>> 0,
            result = [],
            value,
            thisp = arguments[1];
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                value = self[i];
                if (fun.call(thisp, value, i, object)) {
                    result.push(value);
                }
            }
        }
        return result;
    };
}
if (!Array.prototype.every) {
    Array.prototype.every = function every(fun /*, thisp */) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0,
            thisp = arguments[1];
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self && !fun.call(thisp, self[i], i, object)) {
                return false;
            }
        }
        return true;
    };
}
if (!Array.prototype.some) {
    Array.prototype.some = function some(fun /*, thisp */) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0,
            thisp = arguments[1];
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self && fun.call(thisp, self[i], i, object)) {
                return true;
            }
        }
        return false;
    };
}
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function reduce(fun /*, initial*/) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0;
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }
        if (!length && arguments.length == 1) {
            throw new TypeError("reduce of empty array with no initial value");
        }

        var i = 0;
        var result;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i++];
                    break;
                }
                if (++i >= length) {
                    throw new TypeError("reduce of empty array with no initial value");
                }
            } while (true);
        }

        for (; i < length; i++) {
            if (i in self) {
                result = fun.call(void 0, result, self[i], i, object);
            }
        }

        return result;
    };
}
if (!Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function reduceRight(fun /*, initial*/) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0;
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }
        if (!length && arguments.length == 1) {
            throw new TypeError("reduceRight of empty array with no initial value");
        }

        var result, i = length - 1;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i--];
                    break;
                }
                if (--i < 0) {
                    throw new TypeError("reduceRight of empty array with no initial value");
                }
            } while (true);
        }

        do {
            if (i in this) {
                result = fun.call(void 0, result, self[i], i, object);
            }
        } while (i--);

        return result;
    };
}
if (!Array.prototype.indexOf || ([0, 1].indexOf(1, 2) != -1)) {
    Array.prototype.indexOf = function indexOf(sought /*, fromIndex */ ) {
        var self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                toObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }

        var i = 0;
        if (arguments.length > 1) {
            i = toInteger(arguments[1]);
        }
        i = i >= 0 ? i : Math.max(0, length + i);
        for (; i < length; i++) {
            if (i in self && self[i] === sought) {
                return i;
            }
        }
        return -1;
    };
}
if (!Array.prototype.lastIndexOf || ([0, 1].lastIndexOf(0, -3) != -1)) {
    Array.prototype.lastIndexOf = function lastIndexOf(sought /*, fromIndex */) {
        var self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                toObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }
        var i = length - 1;
        if (arguments.length > 1) {
            i = Math.min(i, toInteger(arguments[1]));
        }
        i = i >= 0 ? i : length - Math.abs(i);
        for (; i >= 0; i--) {
            if (i in self && sought === self[i]) {
                return i;
            }
        }
        return -1;
    };
}
if (!Object.getPrototypeOf) {
    Object.getPrototypeOf = function getPrototypeOf(object) {
        return object.__proto__ || (
            object.constructor ?
            object.constructor.prototype :
            prototypeOfObject
        );
    };
}
if (!Object.getOwnPropertyDescriptor) {
    var ERR_NON_OBJECT = "Object.getOwnPropertyDescriptor called on a " +
                         "non-object: ";
    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
        if ((typeof object != "object" && typeof object != "function") || object === null)
            throw new TypeError(ERR_NON_OBJECT + object);
        if (!owns(object, property))
            return;

        var descriptor, getter, setter;
        descriptor =  { enumerable: true, configurable: true };
        if (supportsAccessors) {
            var prototype = object.__proto__;
            object.__proto__ = prototypeOfObject;

            var getter = lookupGetter(object, property);
            var setter = lookupSetter(object, property);
            object.__proto__ = prototype;

            if (getter || setter) {
                if (getter) descriptor.get = getter;
                if (setter) descriptor.set = setter;
                return descriptor;
            }
        }
        descriptor.value = object[property];
        return descriptor;
    };
}
if (!Object.getOwnPropertyNames) {
    Object.getOwnPropertyNames = function getOwnPropertyNames(object) {
        return Object.keys(object);
    };
}
if (!Object.create) {
    var createEmpty;
    if (Object.prototype.__proto__ === null) {
        createEmpty = function () {
            return { "__proto__": null };
        };
    } else {
        createEmpty = function () {
            var empty = {};
            for (var i in empty)
                empty[i] = null;
            empty.constructor =
            empty.hasOwnProperty =
            empty.propertyIsEnumerable =
            empty.isPrototypeOf =
            empty.toLocaleString =
            empty.toString =
            empty.valueOf =
            empty.__proto__ = null;
            return empty;
        }
    }

    Object.create = function create(prototype, properties) {
        var object;
        if (prototype === null) {
            object = createEmpty();
        } else {
            if (typeof prototype != "object")
                throw new TypeError("typeof prototype["+(typeof prototype)+"] != 'object'");
            var Type = function () {};
            Type.prototype = prototype;
            object = new Type();
            object.__proto__ = prototype;
        }
        if (properties !== void 0)
            Object.defineProperties(object, properties);
        return object;
    };
}

function doesDefinePropertyWork(object) {
    try {
        Object.defineProperty(object, "sentinel", {});
        return "sentinel" in object;
    } catch (exception) {
    }
}
if (Object.defineProperty) {
    var definePropertyWorksOnObject = doesDefinePropertyWork({});
    var definePropertyWorksOnDom = typeof document == "undefined" ||
        doesDefinePropertyWork(document.createElement("div"));
    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
        var definePropertyFallback = Object.defineProperty;
    }
}

if (!Object.defineProperty || definePropertyFallback) {
    var ERR_NON_OBJECT_DESCRIPTOR = "Property description must be an object: ";
    var ERR_NON_OBJECT_TARGET = "Object.defineProperty called on non-object: "
    var ERR_ACCESSORS_NOT_SUPPORTED = "getters & setters can not be defined " +
                                      "on this javascript engine";

    Object.defineProperty = function defineProperty(object, property, descriptor) {
        if ((typeof object != "object" && typeof object != "function") || object === null)
            throw new TypeError(ERR_NON_OBJECT_TARGET + object);
        if ((typeof descriptor != "object" && typeof descriptor != "function") || descriptor === null)
            throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
        if (definePropertyFallback) {
            try {
                return definePropertyFallback.call(Object, object, property, descriptor);
            } catch (exception) {
            }
        }
        if (owns(descriptor, "value")) {

            if (supportsAccessors && (lookupGetter(object, property) ||
                                      lookupSetter(object, property)))
            {
                var prototype = object.__proto__;
                object.__proto__ = prototypeOfObject;
                delete object[property];
                object[property] = descriptor.value;
                object.__proto__ = prototype;
            } else {
                object[property] = descriptor.value;
            }
        } else {
            if (!supportsAccessors)
                throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
            if (owns(descriptor, "get"))
                defineGetter(object, property, descriptor.get);
            if (owns(descriptor, "set"))
                defineSetter(object, property, descriptor.set);
        }

        return object;
    };
}
if (!Object.defineProperties) {
    Object.defineProperties = function defineProperties(object, properties) {
        for (var property in properties) {
            if (owns(properties, property))
                Object.defineProperty(object, property, properties[property]);
        }
        return object;
    };
}
if (!Object.seal) {
    Object.seal = function seal(object) {
        return object;
    };
}
if (!Object.freeze) {
    Object.freeze = function freeze(object) {
        return object;
    };
}
try {
    Object.freeze(function () {});
} catch (exception) {
    Object.freeze = (function freeze(freezeObject) {
        return function freeze(object) {
            if (typeof object == "function") {
                return object;
            } else {
                return freezeObject(object);
            }
        };
    })(Object.freeze);
}
if (!Object.preventExtensions) {
    Object.preventExtensions = function preventExtensions(object) {
        return object;
    };
}
if (!Object.isSealed) {
    Object.isSealed = function isSealed(object) {
        return false;
    };
}
if (!Object.isFrozen) {
    Object.isFrozen = function isFrozen(object) {
        return false;
    };
}
if (!Object.isExtensible) {
    Object.isExtensible = function isExtensible(object) {
        if (Object(object) === object) {
            throw new TypeError(); // TODO message
        }
        var name = '';
        while (owns(object, name)) {
            name += '?';
        }
        object[name] = true;
        var returnValue = owns(object, name);
        delete object[name];
        return returnValue;
    };
}
if (!Object.keys) {
    var hasDontEnumBug = true,
        dontEnums = [
            "toString",
            "toLocaleString",
            "valueOf",
            "hasOwnProperty",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "constructor"
        ],
        dontEnumsLength = dontEnums.length;

    for (var key in {"toString": null}) {
        hasDontEnumBug = false;
    }

    Object.keys = function keys(object) {

        if (
            (typeof object != "object" && typeof object != "function") ||
            object === null
        ) {
            throw new TypeError("Object.keys called on a non-object");
        }

        var keys = [];
        for (var name in object) {
            if (owns(object, name)) {
                keys.push(name);
            }
        }

        if (hasDontEnumBug) {
            for (var i = 0, ii = dontEnumsLength; i < ii; i++) {
                var dontEnum = dontEnums[i];
                if (owns(object, dontEnum)) {
                    keys.push(dontEnum);
                }
            }
        }
        return keys;
    };

}
if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}
var ws = "\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003" +
    "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028" +
    "\u2029\uFEFF";
if (!String.prototype.trim || ws.trim()) {
    ws = "[" + ws + "]";
    var trimBeginRegexp = new RegExp("^" + ws + ws + "*"),
        trimEndRegexp = new RegExp(ws + ws + "*$");
    String.prototype.trim = function trim() {
        return String(this).replace(trimBeginRegexp, "").replace(trimEndRegexp, "");
    };
}

function toInteger(n) {
    n = +n;
    if (n !== n) { // isNaN
        n = 0;
    } else if (n !== 0 && n !== (1/0) && n !== -(1/0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }
    return n;
}

function isPrimitive(input) {
    var type = typeof input;
    return (
        input === null ||
        type === "undefined" ||
        type === "boolean" ||
        type === "number" ||
        type === "string"
    );
}

function toPrimitive(input) {
    var val, valueOf, toString;
    if (isPrimitive(input)) {
        return input;
    }
    valueOf = input.valueOf;
    if (typeof valueOf === "function") {
        val = valueOf.call(input);
        if (isPrimitive(val)) {
            return val;
        }
    }
    toString = input.toString;
    if (typeof toString === "function") {
        val = toString.call(input);
        if (isPrimitive(val)) {
            return val;
        }
    }
    throw new TypeError();
}
var toObject = function (o) {
    if (o == null) { // this matches both null and undefined
        throw new TypeError("can't convert "+o+" to object");
    }
    return Object(o);
};

});



/**
 * Modifications:
 * Added the two segements below from worker-javascript.js
 * Added custom function to extract javascript from html
 */
ace.define("ace/mode/javascript/jshint",["require","exports","module"], function(require, exports, module) {
module.exports = (function outer (modules, cache, entry) {
    var previousRequire = typeof require == "function" && require;
    function newRequire(name, jumped){
        if(!cache[name]) {
            if(!modules[name]) {
                var currentRequire = typeof require == "function" && require;
                if (!jumped && currentRequire) return currentRequire(name, true);
                if (previousRequire) return previousRequire(name, true);
                var err = new Error('Cannot find module \'' + name + '\'');
                err.code = 'MODULE_NOT_FOUND';
                throw err;
            }
            var m = cache[name] = {exports:{}};
            modules[name][0].call(m.exports, function(x){
                var id = modules[name][1][x];
                return newRequire(id ? id : x);
            },m,m.exports,outer,modules,cache,entry);
        }
        return cache[name].exports;
    }
    for(var i=0;i<entry.length;i++) newRequire(entry[i]);
    return newRequire(entry[0]);
})
({"/node_modules/browserify/node_modules/events/events.js":[function(_dereq_,module,exports){

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;
EventEmitter.defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    this._events[type].push(listener);
  else
    this._events[type] = [this._events[type], listener];
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],"/node_modules/jshint/data/ascii-identifier-data.js":[function(_dereq_,module,exports){
var identifierStartTable = [];

for (var i = 0; i < 128; i++) {
  identifierStartTable[i] =
    i === 36 ||           // $
    i >= 65 && i <= 90 || // A-Z
    i === 95 ||           // _
    i >= 97 && i <= 122;  // a-z
}

var identifierPartTable = [];

for (var i = 0; i < 128; i++) {
  identifierPartTable[i] =
    identifierStartTable[i] || // $, _, A-Z, a-z
    i >= 48 && i <= 57;        // 0-9
}

module.exports = {
  asciiIdentifierStartTable: identifierStartTable,
  asciiIdentifierPartTable: identifierPartTable
};

},{}],"/node_modules/jshint/lodash.js":[function(_dereq_,module,exports){
(function (global){
;(function() {

  var undefined;

  var VERSION = '3.7.0';

  var FUNC_ERROR_TEXT = 'Expected a function';

  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag = '[object Function]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      objectTag = '[object Object]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      weakMapTag = '[object WeakMap]';

  var arrayBufferTag = '[object ArrayBuffer]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  var reIsDeepProp = /\.|\[(?:[^[\]]+|(["'])(?:(?!\1)[^\n\\]|\\.)*?)\1\]/,
      reIsPlainProp = /^\w*$/,
      rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;

  var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g,
      reHasRegExpChars = RegExp(reRegExpChars.source);

  var reEscapeChar = /\\(\\)?/g;

  var reFlags = /\w*$/;

  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
  typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
  typedArrayTags[dateTag] = typedArrayTags[errorTag] =
  typedArrayTags[funcTag] = typedArrayTags[mapTag] =
  typedArrayTags[numberTag] = typedArrayTags[objectTag] =
  typedArrayTags[regexpTag] = typedArrayTags[setTag] =
  typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

  var cloneableTags = {};
  cloneableTags[argsTag] = cloneableTags[arrayTag] =
  cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =
  cloneableTags[dateTag] = cloneableTags[float32Tag] =
  cloneableTags[float64Tag] = cloneableTags[int8Tag] =
  cloneableTags[int16Tag] = cloneableTags[int32Tag] =
  cloneableTags[numberTag] = cloneableTags[objectTag] =
  cloneableTags[regexpTag] = cloneableTags[stringTag] =
  cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
  cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag] = cloneableTags[funcTag] =
  cloneableTags[mapTag] = cloneableTags[setTag] =
  cloneableTags[weakMapTag] = false;

  var objectTypes = {
    'function': true,
    'object': true
  };

  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global && global.Object && global;

  var freeSelf = objectTypes[typeof self] && self && self.Object && self;

  var freeWindow = objectTypes[typeof window] && window && window.Object && window;

  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  var root = freeGlobal || ((freeWindow !== (this && this.window)) && freeWindow) || freeSelf || this;

  function baseFindIndex(array, predicate, fromRight) {
    var length = array.length,
        index = fromRight ? length : -1;

    while ((fromRight ? index-- : ++index < length)) {
      if (predicate(array[index], index, array)) {
        return index;
      }
    }
    return -1;
  }

  function baseIndexOf(array, value, fromIndex) {
    if (value !== value) {
      return indexOfNaN(array, fromIndex);
    }
    var index = fromIndex - 1,
        length = array.length;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  function baseIsFunction(value) {
    return typeof value == 'function' || false;
  }

  function baseToString(value) {
    if (typeof value == 'string') {
      return value;
    }
    return value == null ? '' : (value + '');
  }

  function indexOfNaN(array, fromIndex, fromRight) {
    var length = array.length,
        index = fromIndex + (fromRight ? 0 : -1);

    while ((fromRight ? index-- : ++index < length)) {
      var other = array[index];
      if (other !== other) {
        return index;
      }
    }
    return -1;
  }

  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }

  var arrayProto = Array.prototype,
      objectProto = Object.prototype;

  var fnToString = Function.prototype.toString;

  var hasOwnProperty = objectProto.hasOwnProperty;

  var objToString = objectProto.toString;

  var reIsNative = RegExp('^' +
    escapeRegExp(objToString)
    .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  var ArrayBuffer = isNative(ArrayBuffer = root.ArrayBuffer) && ArrayBuffer,
      bufferSlice = isNative(bufferSlice = ArrayBuffer && new ArrayBuffer(0).slice) && bufferSlice,
      floor = Math.floor,
      getOwnPropertySymbols = isNative(getOwnPropertySymbols = Object.getOwnPropertySymbols) && getOwnPropertySymbols,
      getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
      push = arrayProto.push,
      preventExtensions = isNative(Object.preventExtensions = Object.preventExtensions) && preventExtensions,
      propertyIsEnumerable = objectProto.propertyIsEnumerable,
      Uint8Array = isNative(Uint8Array = root.Uint8Array) && Uint8Array;

  var Float64Array = (function() {
    try {
      var func = isNative(func = root.Float64Array) && func,
          result = new func(new ArrayBuffer(10), 0, 1) && func;
    } catch(e) {}
    return result;
  }());

  var nativeAssign = (function() {
    var object = { '1': 0 },
        func = preventExtensions && isNative(func = Object.assign) && func;

    try { func(preventExtensions(object), 'xo'); } catch(e) {}
    return !object[1] && func;
  }());

  var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
      nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
      nativeMax = Math.max,
      nativeMin = Math.min;

  var NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;

  var MAX_ARRAY_LENGTH = Math.pow(2, 32) - 1,
      MAX_ARRAY_INDEX =  MAX_ARRAY_LENGTH - 1,
      HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;

  var FLOAT64_BYTES_PER_ELEMENT = Float64Array ? Float64Array.BYTES_PER_ELEMENT : 0;

  var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

  function lodash() {
  }

  var support = lodash.support = {};

  (function(x) {
    var Ctor = function() { this.x = x; },
        object = { '0': x, 'length': x },
        props = [];

    Ctor.prototype = { 'valueOf': x, 'y': x };
    for (var key in new Ctor) { props.push(key); }

    support.funcDecomp = /\bthis\b/.test(function() { return this; });

    support.funcNames = typeof Function.name == 'string';

    try {
      support.nonEnumArgs = !propertyIsEnumerable.call(arguments, 1);
    } catch(e) {
      support.nonEnumArgs = true;
    }
  }(1, 0));

  function arrayCopy(source, array) {
    var index = -1,
        length = source.length;

    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }

  function arrayEach(array, iteratee) {
    var index = -1,
        length = array.length;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  function arrayFilter(array, predicate) {
    var index = -1,
        length = array.length,
        resIndex = -1,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[++resIndex] = value;
      }
    }
    return result;
  }

  function arrayMap(array, iteratee) {
    var index = -1,
        length = array.length,
        result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }

  function arrayMax(array) {
    var index = -1,
        length = array.length,
        result = NEGATIVE_INFINITY;

    while (++index < length) {
      var value = array[index];
      if (value > result) {
        result = value;
      }
    }
    return result;
  }

  function arraySome(array, predicate) {
    var index = -1,
        length = array.length;

    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true;
      }
    }
    return false;
  }

  function assignWith(object, source, customizer) {
    var props = keys(source);
    push.apply(props, getSymbols(source));

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index],
          value = object[key],
          result = customizer(value, source[key], key, object, source);

      if ((result === result ? (result !== value) : (value === value)) ||
          (value === undefined && !(key in object))) {
        object[key] = result;
      }
    }
    return object;
  }

  var baseAssign = nativeAssign || function(object, source) {
    return source == null
      ? object
      : baseCopy(source, getSymbols(source), baseCopy(source, keys(source), object));
  };

  function baseCopy(source, props, object) {
    object || (object = {});

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index];
      object[key] = source[key];
    }
    return object;
  }

  function baseCallback(func, thisArg, argCount) {
    var type = typeof func;
    if (type == 'function') {
      return thisArg === undefined
        ? func
        : bindCallback(func, thisArg, argCount);
    }
    if (func == null) {
      return identity;
    }
    if (type == 'object') {
      return baseMatches(func);
    }
    return thisArg === undefined
      ? property(func)
      : baseMatchesProperty(func, thisArg);
  }

  function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
    var result;
    if (customizer) {
      result = object ? customizer(value, key, object) : customizer(value);
    }
    if (result !== undefined) {
      return result;
    }
    if (!isObject(value)) {
      return value;
    }
    var isArr = isArray(value);
    if (isArr) {
      result = initCloneArray(value);
      if (!isDeep) {
        return arrayCopy(value, result);
      }
    } else {
      var tag = objToString.call(value),
          isFunc = tag == funcTag;

      if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
        result = initCloneObject(isFunc ? {} : value);
        if (!isDeep) {
          return baseAssign(result, value);
        }
      } else {
        return cloneableTags[tag]
          ? initCloneByTag(value, tag, isDeep)
          : (object ? value : {});
      }
    }
    stackA || (stackA = []);
    stackB || (stackB = []);

    var length = stackA.length;
    while (length--) {
      if (stackA[length] == value) {
        return stackB[length];
      }
    }
    stackA.push(value);
    stackB.push(result);

    (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
      result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);
    });
    return result;
  }

  var baseEach = createBaseEach(baseForOwn);

  function baseFilter(collection, predicate) {
    var result = [];
    baseEach(collection, function(value, index, collection) {
      if (predicate(value, index, collection)) {
        result.push(value);
      }
    });
    return result;
  }

  var baseFor = createBaseFor();

  function baseForIn(object, iteratee) {
    return baseFor(object, iteratee, keysIn);
  }

  function baseForOwn(object, iteratee) {
    return baseFor(object, iteratee, keys);
  }

  function baseGet(object, path, pathKey) {
    if (object == null) {
      return;
    }
    if (pathKey !== undefined && pathKey in toObject(object)) {
      path = [pathKey];
    }
    var index = -1,
        length = path.length;

    while (object != null && ++index < length) {
      var result = object = object[path[index]];
    }
    return result;
  }

  function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
    if (value === other) {
      return value !== 0 || (1 / value == 1 / other);
    }
    var valType = typeof value,
        othType = typeof other;

    if ((valType != 'function' && valType != 'object' && othType != 'function' && othType != 'object') ||
        value == null || other == null) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
  }

  function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
    var objIsArr = isArray(object),
        othIsArr = isArray(other),
        objTag = arrayTag,
        othTag = arrayTag;

    if (!objIsArr) {
      objTag = objToString.call(object);
      if (objTag == argsTag) {
        objTag = objectTag;
      } else if (objTag != objectTag) {
        objIsArr = isTypedArray(object);
      }
    }
    if (!othIsArr) {
      othTag = objToString.call(other);
      if (othTag == argsTag) {
        othTag = objectTag;
      } else if (othTag != objectTag) {
        othIsArr = isTypedArray(other);
      }
    }
    var objIsObj = objTag == objectTag,
        othIsObj = othTag == objectTag,
        isSameTag = objTag == othTag;

    if (isSameTag && !(objIsArr || objIsObj)) {
      return equalByTag(object, other, objTag);
    }
    if (!isLoose) {
      var valWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
          othWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

      if (valWrapped || othWrapped) {
        return equalFunc(valWrapped ? object.value() : object, othWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
      }
    }
    if (!isSameTag) {
      return false;
    }
    stackA || (stackA = []);
    stackB || (stackB = []);

    var length = stackA.length;
    while (length--) {
      if (stackA[length] == object) {
        return stackB[length] == other;
      }
    }
    stackA.push(object);
    stackB.push(other);

    var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);

    stackA.pop();
    stackB.pop();

    return result;
  }

  function baseIsMatch(object, props, values, strictCompareFlags, customizer) {
    var index = -1,
        length = props.length,
        noCustomizer = !customizer;

    while (++index < length) {
      if ((noCustomizer && strictCompareFlags[index])
            ? values[index] !== object[props[index]]
            : !(props[index] in object)
          ) {
        return false;
      }
    }
    index = -1;
    while (++index < length) {
      var key = props[index],
          objValue = object[key],
          srcValue = values[index];

      if (noCustomizer && strictCompareFlags[index]) {
        var result = objValue !== undefined || (key in object);
      } else {
        result = customizer ? customizer(objValue, srcValue, key) : undefined;
        if (result === undefined) {
          result = baseIsEqual(srcValue, objValue, customizer, true);
        }
      }
      if (!result) {
        return false;
      }
    }
    return true;
  }

  function baseMatches(source) {
    var props = keys(source),
        length = props.length;

    if (!length) {
      return constant(true);
    }
    if (length == 1) {
      var key = props[0],
          value = source[key];

      if (isStrictComparable(value)) {
        return function(object) {
          if (object == null) {
            return false;
          }
          return object[key] === value && (value !== undefined || (key in toObject(object)));
        };
      }
    }
    var values = Array(length),
        strictCompareFlags = Array(length);

    while (length--) {
      value = source[props[length]];
      values[length] = value;
      strictCompareFlags[length] = isStrictComparable(value);
    }
    return function(object) {
      return object != null && baseIsMatch(toObject(object), props, values, strictCompareFlags);
    };
  }

  function baseMatchesProperty(path, value) {
    var isArr = isArray(path),
        isCommon = isKey(path) && isStrictComparable(value),
        pathKey = (path + '');

    path = toPath(path);
    return function(object) {
      if (object == null) {
        return false;
      }
      var key = pathKey;
      object = toObject(object);
      if ((isArr || !isCommon) && !(key in object)) {
        object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
        if (object == null) {
          return false;
        }
        key = last(path);
        object = toObject(object);
      }
      return object[key] === value
        ? (value !== undefined || (key in object))
        : baseIsEqual(value, object[key], null, true);
    };
  }

  function baseMerge(object, source, customizer, stackA, stackB) {
    if (!isObject(object)) {
      return object;
    }
    var isSrcArr = isLength(source.length) && (isArray(source) || isTypedArray(source));
    if (!isSrcArr) {
      var props = keys(source);
      push.apply(props, getSymbols(source));
    }
    arrayEach(props || source, function(srcValue, key) {
      if (props) {
        key = srcValue;
        srcValue = source[key];
      }
      if (isObjectLike(srcValue)) {
        stackA || (stackA = []);
        stackB || (stackB = []);
        baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);
      }
      else {
        var value = object[key],
            result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
            isCommon = result === undefined;

        if (isCommon) {
          result = srcValue;
        }
        if ((isSrcArr || result !== undefined) &&
            (isCommon || (result === result ? (result !== value) : (value === value)))) {
          object[key] = result;
        }
      }
    });
    return object;
  }

  function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
    var length = stackA.length,
        srcValue = source[key];

    while (length--) {
      if (stackA[length] == srcValue) {
        object[key] = stackB[length];
        return;
      }
    }
    var value = object[key],
        result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
        isCommon = result === undefined;

    if (isCommon) {
      result = srcValue;
      if (isLength(srcValue.length) && (isArray(srcValue) || isTypedArray(srcValue))) {
        result = isArray(value)
          ? value
          : (getLength(value) ? arrayCopy(value) : []);
      }
      else if (isPlainObject(srcValue) || isArguments(srcValue)) {
        result = isArguments(value)
          ? toPlainObject(value)
          : (isPlainObject(value) ? value : {});
      }
      else {
        isCommon = false;
      }
    }
    stackA.push(srcValue);
    stackB.push(result);

    if (isCommon) {
      object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);
    } else if (result === result ? (result !== value) : (value === value)) {
      object[key] = result;
    }
  }

  function baseProperty(key) {
    return function(object) {
      return object == null ? undefined : object[key];
    };
  }

  function basePropertyDeep(path) {
    var pathKey = (path + '');
    path = toPath(path);
    return function(object) {
      return baseGet(object, path, pathKey);
    };
  }

  function baseSlice(array, start, end) {
    var index = -1,
        length = array.length;

    start = start == null ? 0 : (+start || 0);
    if (start < 0) {
      start = -start > length ? 0 : (length + start);
    }
    end = (end === undefined || end > length) ? length : (+end || 0);
    if (end < 0) {
      end += length;
    }
    length = start > end ? 0 : ((end - start) >>> 0);
    start >>>= 0;

    var result = Array(length);
    while (++index < length) {
      result[index] = array[index + start];
    }
    return result;
  }

  function baseSome(collection, predicate) {
    var result;

    baseEach(collection, function(value, index, collection) {
      result = predicate(value, index, collection);
      return !result;
    });
    return !!result;
  }

  function baseValues(object, props) {
    var index = -1,
        length = props.length,
        result = Array(length);

    while (++index < length) {
      result[index] = object[props[index]];
    }
    return result;
  }

  function binaryIndex(array, value, retHighest) {
    var low = 0,
        high = array ? array.length : low;

    if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
      while (low < high) {
        var mid = (low + high) >>> 1,
            computed = array[mid];

        if (retHighest ? (computed <= value) : (computed < value)) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      return high;
    }
    return binaryIndexBy(array, value, identity, retHighest);
  }

  function binaryIndexBy(array, value, iteratee, retHighest) {
    value = iteratee(value);

    var low = 0,
        high = array ? array.length : 0,
        valIsNaN = value !== value,
        valIsUndef = value === undefined;

    while (low < high) {
      var mid = floor((low + high) / 2),
          computed = iteratee(array[mid]),
          isReflexive = computed === computed;

      if (valIsNaN) {
        var setLow = isReflexive || retHighest;
      } else if (valIsUndef) {
        setLow = isReflexive && (retHighest || computed !== undefined);
      } else {
        setLow = retHighest ? (computed <= value) : (computed < value);
      }
      if (setLow) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return nativeMin(high, MAX_ARRAY_INDEX);
  }

  function bindCallback(func, thisArg, argCount) {
    if (typeof func != 'function') {
      return identity;
    }
    if (thisArg === undefined) {
      return func;
    }
    switch (argCount) {
      case 1: return function(value) {
        return func.call(thisArg, value);
      };
      case 3: return function(value, index, collection) {
        return func.call(thisArg, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(thisArg, accumulator, value, index, collection);
      };
      case 5: return function(value, other, key, object, source) {
        return func.call(thisArg, value, other, key, object, source);
      };
    }
    return function() {
      return func.apply(thisArg, arguments);
    };
  }

  function bufferClone(buffer) {
    return bufferSlice.call(buffer, 0);
  }
  if (!bufferSlice) {
    bufferClone = !(ArrayBuffer && Uint8Array) ? constant(null) : function(buffer) {
      var byteLength = buffer.byteLength,
          floatLength = Float64Array ? floor(byteLength / FLOAT64_BYTES_PER_ELEMENT) : 0,
          offset = floatLength * FLOAT64_BYTES_PER_ELEMENT,
          result = new ArrayBuffer(byteLength);

      if (floatLength) {
        var view = new Float64Array(result, 0, floatLength);
        view.set(new Float64Array(buffer, 0, floatLength));
      }
      if (byteLength != offset) {
        view = new Uint8Array(result, offset);
        view.set(new Uint8Array(buffer, offset));
      }
      return result;
    };
  }

  function createAssigner(assigner) {
    return restParam(function(object, sources) {
      var index = -1,
          length = object == null ? 0 : sources.length,
          customizer = length > 2 && sources[length - 2],
          guard = length > 2 && sources[2],
          thisArg = length > 1 && sources[length - 1];

      if (typeof customizer == 'function') {
        customizer = bindCallback(customizer, thisArg, 5);
        length -= 2;
      } else {
        customizer = typeof thisArg == 'function' ? thisArg : null;
        length -= (customizer ? 1 : 0);
      }
      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        customizer = length < 3 ? null : customizer;
        length = 1;
      }
      while (++index < length) {
        var source = sources[index];
        if (source) {
          assigner(object, source, customizer);
        }
      }
      return object;
    });
  }

  function createBaseEach(eachFunc, fromRight) {
    return function(collection, iteratee) {
      var length = collection ? getLength(collection) : 0;
      if (!isLength(length)) {
        return eachFunc(collection, iteratee);
      }
      var index = fromRight ? length : -1,
          iterable = toObject(collection);

      while ((fromRight ? index-- : ++index < length)) {
        if (iteratee(iterable[index], index, iterable) === false) {
          break;
        }
      }
      return collection;
    };
  }

  function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
      var iterable = toObject(object),
          props = keysFunc(object),
          length = props.length,
          index = fromRight ? length : -1;

      while ((fromRight ? index-- : ++index < length)) {
        var key = props[index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }

  function createFindIndex(fromRight) {
    return function(array, predicate, thisArg) {
      if (!(array && array.length)) {
        return -1;
      }
      predicate = getCallback(predicate, thisArg, 3);
      return baseFindIndex(array, predicate, fromRight);
    };
  }

  function createForEach(arrayFunc, eachFunc) {
    return function(collection, iteratee, thisArg) {
      return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
        ? arrayFunc(collection, iteratee)
        : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
    };
  }

  function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
    var index = -1,
        arrLength = array.length,
        othLength = other.length,
        result = true;

    if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
      return false;
    }
    while (result && ++index < arrLength) {
      var arrValue = array[index],
          othValue = other[index];

      result = undefined;
      if (customizer) {
        result = isLoose
          ? customizer(othValue, arrValue, index)
          : customizer(arrValue, othValue, index);
      }
      if (result === undefined) {
        if (isLoose) {
          var othIndex = othLength;
          while (othIndex--) {
            othValue = other[othIndex];
            result = (arrValue && arrValue === othValue) || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
            if (result) {
              break;
            }
          }
        } else {
          result = (arrValue && arrValue === othValue) || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
        }
      }
    }
    return !!result;
  }

  function equalByTag(object, other, tag) {
    switch (tag) {
      case boolTag:
      case dateTag:
        return +object == +other;

      case errorTag:
        return object.name == other.name && object.message == other.message;

      case numberTag:
        return (object != +object)
          ? other != +other
          : (object == 0 ? ((1 / object) == (1 / other)) : object == +other);

      case regexpTag:
      case stringTag:
        return object == (other + '');
    }
    return false;
  }

  function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
    var objProps = keys(object),
        objLength = objProps.length,
        othProps = keys(other),
        othLength = othProps.length;

    if (objLength != othLength && !isLoose) {
      return false;
    }
    var skipCtor = isLoose,
        index = -1;

    while (++index < objLength) {
      var key = objProps[index],
          result = isLoose ? key in other : hasOwnProperty.call(other, key);

      if (result) {
        var objValue = object[key],
            othValue = other[key];

        result = undefined;
        if (customizer) {
          result = isLoose
            ? customizer(othValue, objValue, key)
            : customizer(objValue, othValue, key);
        }
        if (result === undefined) {
          result = (objValue && objValue === othValue) || equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB);
        }
      }
      if (!result) {
        return false;
      }
      skipCtor || (skipCtor = key == 'constructor');
    }
    if (!skipCtor) {
      var objCtor = object.constructor,
          othCtor = other.constructor;

      if (objCtor != othCtor &&
          ('constructor' in object && 'constructor' in other) &&
          !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
            typeof othCtor == 'function' && othCtor instanceof othCtor)) {
        return false;
      }
    }
    return true;
  }

  function getCallback(func, thisArg, argCount) {
    var result = lodash.callback || callback;
    result = result === callback ? baseCallback : result;
    return argCount ? result(func, thisArg, argCount) : result;
  }

  function getIndexOf(collection, target, fromIndex) {
    var result = lodash.indexOf || indexOf;
    result = result === indexOf ? baseIndexOf : result;
    return collection ? result(collection, target, fromIndex) : result;
  }

  var getLength = baseProperty('length');

  var getSymbols = !getOwnPropertySymbols ? constant([]) : function(object) {
    return getOwnPropertySymbols(toObject(object));
  };

  function initCloneArray(array) {
    var length = array.length,
        result = new array.constructor(length);

    if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }

  function initCloneObject(object) {
    var Ctor = object.constructor;
    if (!(typeof Ctor == 'function' && Ctor instanceof Ctor)) {
      Ctor = Object;
    }
    return new Ctor;
  }

  function initCloneByTag(object, tag, isDeep) {
    var Ctor = object.constructor;
    switch (tag) {
      case arrayBufferTag:
        return bufferClone(object);

      case boolTag:
      case dateTag:
        return new Ctor(+object);

      case float32Tag: case float64Tag:
      case int8Tag: case int16Tag: case int32Tag:
      case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
        var buffer = object.buffer;
        return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);

      case numberTag:
      case stringTag:
        return new Ctor(object);

      case regexpTag:
        var result = new Ctor(object.source, reFlags.exec(object));
        result.lastIndex = object.lastIndex;
    }
    return result;
  }

  function isIndex(value, length) {
    value = +value;
    length = length == null ? MAX_SAFE_INTEGER : length;
    return value > -1 && value % 1 == 0 && value < length;
  }

  function isIterateeCall(value, index, object) {
    if (!isObject(object)) {
      return false;
    }
    var type = typeof index;
    if (type == 'number') {
      var length = getLength(object),
          prereq = isLength(length) && isIndex(index, length);
    } else {
      prereq = type == 'string' && index in object;
    }
    if (prereq) {
      var other = object[index];
      return value === value ? (value === other) : (other !== other);
    }
    return false;
  }

  function isKey(value, object) {
    var type = typeof value;
    if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
      return true;
    }
    if (isArray(value)) {
      return false;
    }
    var result = !reIsDeepProp.test(value);
    return result || (object != null && value in toObject(object));
  }

  function isLength(value) {
    return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  function isStrictComparable(value) {
    return value === value && (value === 0 ? ((1 / value) > 0) : !isObject(value));
  }

  function shimIsPlainObject(value) {
    var Ctor,
        support = lodash.support;

    if (!(isObjectLike(value) && objToString.call(value) == objectTag) ||
        (!hasOwnProperty.call(value, 'constructor') &&
          (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {
      return false;
    }
    var result;
    baseForIn(value, function(subValue, key) {
      result = key;
    });
    return result === undefined || hasOwnProperty.call(value, result);
  }

  function shimKeys(object) {
    var props = keysIn(object),
        propsLength = props.length,
        length = propsLength && object.length,
        support = lodash.support;

    var allowIndexes = length && isLength(length) &&
      (isArray(object) || (support.nonEnumArgs && isArguments(object)));

    var index = -1,
        result = [];

    while (++index < propsLength) {
      var key = props[index];
      if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
        result.push(key);
      }
    }
    return result;
  }

  function toObject(value) {
    return isObject(value) ? value : Object(value);
  }

  function toPath(value) {
    if (isArray(value)) {
      return value;
    }
    var result = [];
    baseToString(value).replace(rePropName, function(match, number, quote, string) {
      result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
    });
    return result;
  }

  var findLastIndex = createFindIndex(true);

  function indexOf(array, value, fromIndex) {
    var length = array ? array.length : 0;
    if (!length) {
      return -1;
    }
    if (typeof fromIndex == 'number') {
      fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : fromIndex;
    } else if (fromIndex) {
      var index = binaryIndex(array, value),
          other = array[index];

      if (value === value ? (value === other) : (other !== other)) {
        return index;
      }
      return -1;
    }
    return baseIndexOf(array, value, fromIndex || 0);
  }

  function last(array) {
    var length = array ? array.length : 0;
    return length ? array[length - 1] : undefined;
  }

  function slice(array, start, end) {
    var length = array ? array.length : 0;
    if (!length) {
      return [];
    }
    if (end && typeof end != 'number' && isIterateeCall(array, start, end)) {
      start = 0;
      end = length;
    }
    return baseSlice(array, start, end);
  }

  function unzip(array) {
    var index = -1,
        length = (array && array.length && arrayMax(arrayMap(array, getLength))) >>> 0,
        result = Array(length);

    while (++index < length) {
      result[index] = arrayMap(array, baseProperty(index));
    }
    return result;
  }

  var zip = restParam(unzip);

  var forEach = createForEach(arrayEach, baseEach);

  function includes(collection, target, fromIndex, guard) {
    var length = collection ? getLength(collection) : 0;
    if (!isLength(length)) {
      collection = values(collection);
      length = collection.length;
    }
    if (!length) {
      return false;
    }
    if (typeof fromIndex != 'number' || (guard && isIterateeCall(target, fromIndex, guard))) {
      fromIndex = 0;
    } else {
      fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : (fromIndex || 0);
    }
    return (typeof collection == 'string' || !isArray(collection) && isString(collection))
      ? (fromIndex < length && collection.indexOf(target, fromIndex) > -1)
      : (getIndexOf(collection, target, fromIndex) > -1);
  }

  function reject(collection, predicate, thisArg) {
    var func = isArray(collection) ? arrayFilter : baseFilter;
    predicate = getCallback(predicate, thisArg, 3);
    return func(collection, function(value, index, collection) {
      return !predicate(value, index, collection);
    });
  }

  function some(collection, predicate, thisArg) {
    var func = isArray(collection) ? arraySome : baseSome;
    if (thisArg && isIterateeCall(collection, predicate, thisArg)) {
      predicate = null;
    }
    if (typeof predicate != 'function' || thisArg !== undefined) {
      predicate = getCallback(predicate, thisArg, 3);
    }
    return func(collection, predicate);
  }

  function restParam(func, start) {
    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
    return function() {
      var args = arguments,
          index = -1,
          length = nativeMax(args.length - start, 0),
          rest = Array(length);

      while (++index < length) {
        rest[index] = args[start + index];
      }
      switch (start) {
        case 0: return func.call(this, rest);
        case 1: return func.call(this, args[0], rest);
        case 2: return func.call(this, args[0], args[1], rest);
      }
      var otherArgs = Array(start + 1);
      index = -1;
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = rest;
      return func.apply(this, otherArgs);
    };
  }

  function clone(value, isDeep, customizer, thisArg) {
    if (isDeep && typeof isDeep != 'boolean' && isIterateeCall(value, isDeep, customizer)) {
      isDeep = false;
    }
    else if (typeof isDeep == 'function') {
      thisArg = customizer;
      customizer = isDeep;
      isDeep = false;
    }
    customizer = typeof customizer == 'function' && bindCallback(customizer, thisArg, 1);
    return baseClone(value, isDeep, customizer);
  }

  function isArguments(value) {
    var length = isObjectLike(value) ? value.length : undefined;
    return isLength(length) && objToString.call(value) == argsTag;
  }

  var isArray = nativeIsArray || function(value) {
    return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
  };

  function isEmpty(value) {
    if (value == null) {
      return true;
    }
    var length = getLength(value);
    if (isLength(length) && (isArray(value) || isString(value) || isArguments(value) ||
        (isObjectLike(value) && isFunction(value.splice)))) {
      return !length;
    }
    return !keys(value).length;
  }

  var isFunction = !(baseIsFunction(/x/) || (Uint8Array && !baseIsFunction(Uint8Array))) ? baseIsFunction : function(value) {
    return objToString.call(value) == funcTag;
  };

  function isObject(value) {
    var type = typeof value;
    return type == 'function' || (!!value && type == 'object');
  }

  function isNative(value) {
    if (value == null) {
      return false;
    }
    if (objToString.call(value) == funcTag) {
      return reIsNative.test(fnToString.call(value));
    }
    return isObjectLike(value) && reIsHostCtor.test(value);
  }

  function isNumber(value) {
    return typeof value == 'number' || (isObjectLike(value) && objToString.call(value) == numberTag);
  }

  var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
    if (!(value && objToString.call(value) == objectTag)) {
      return false;
    }
    var valueOf = value.valueOf,
        objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

    return objProto
      ? (value == objProto || getPrototypeOf(value) == objProto)
      : shimIsPlainObject(value);
  };

  function isString(value) {
    return typeof value == 'string' || (isObjectLike(value) && objToString.call(value) == stringTag);
  }

  function isTypedArray(value) {
    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
  }

  function toPlainObject(value) {
    return baseCopy(value, keysIn(value));
  }

  var assign = createAssigner(function(object, source, customizer) {
    return customizer
      ? assignWith(object, source, customizer)
      : baseAssign(object, source);
  });

  function has(object, path) {
    if (object == null) {
      return false;
    }
    var result = hasOwnProperty.call(object, path);
    if (!result && !isKey(path)) {
      path = toPath(path);
      object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
      path = last(path);
      result = object != null && hasOwnProperty.call(object, path);
    }
    return result;
  }

  var keys = !nativeKeys ? shimKeys : function(object) {
    if (object) {
      var Ctor = object.constructor,
          length = object.length;
    }
    if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
        (typeof object != 'function' && isLength(length))) {
      return shimKeys(object);
    }
    return isObject(object) ? nativeKeys(object) : [];
  };

  function keysIn(object) {
    if (object == null) {
      return [];
    }
    if (!isObject(object)) {
      object = Object(object);
    }
    var length = object.length;
    length = (length && isLength(length) &&
      (isArray(object) || (support.nonEnumArgs && isArguments(object))) && length) || 0;

    var Ctor = object.constructor,
        index = -1,
        isProto = typeof Ctor == 'function' && Ctor.prototype === object,
        result = Array(length),
        skipIndexes = length > 0;

    while (++index < length) {
      result[index] = (index + '');
    }
    for (var key in object) {
      if (!(skipIndexes && isIndex(key, length)) &&
          !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }

  var merge = createAssigner(baseMerge);

  function values(object) {
    return baseValues(object, keys(object));
  }

  function escapeRegExp(string) {
    string = baseToString(string);
    return (string && reHasRegExpChars.test(string))
      ? string.replace(reRegExpChars, '\\$&')
      : string;
  }

  function callback(func, thisArg, guard) {
    if (guard && isIterateeCall(func, thisArg, guard)) {
      thisArg = null;
    }
    return baseCallback(func, thisArg);
  }

  function constant(value) {
    return function() {
      return value;
    };
  }

  function identity(value) {
    return value;
  }

  function property(path) {
    return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
  }
  lodash.assign = assign;
  lodash.callback = callback;
  lodash.constant = constant;
  lodash.forEach = forEach;
  lodash.keys = keys;
  lodash.keysIn = keysIn;
  lodash.merge = merge;
  lodash.property = property;
  lodash.reject = reject;
  lodash.restParam = restParam;
  lodash.slice = slice;
  lodash.toPlainObject = toPlainObject;
  lodash.unzip = unzip;
  lodash.values = values;
  lodash.zip = zip;

  lodash.each = forEach;
  lodash.extend = assign;
  lodash.iteratee = callback;
  lodash.clone = clone;
  lodash.escapeRegExp = escapeRegExp;
  lodash.findLastIndex = findLastIndex;
  lodash.has = has;
  lodash.identity = identity;
  lodash.includes = includes;
  lodash.indexOf = indexOf;
  lodash.isArguments = isArguments;
  lodash.isArray = isArray;
  lodash.isEmpty = isEmpty;
  lodash.isFunction = isFunction;
  lodash.isNative = isNative;
  lodash.isNumber = isNumber;
  lodash.isObject = isObject;
  lodash.isPlainObject = isPlainObject;
  lodash.isString = isString;
  lodash.isTypedArray = isTypedArray;
  lodash.last = last;
  lodash.some = some;

  lodash.any = some;
  lodash.contains = includes;
  lodash.include = includes;

  lodash.VERSION = VERSION;
  if (freeExports && freeModule) {
    if (moduleExports) {
      (freeModule.exports = lodash)._ = lodash;
    }
    else {
      freeExports._ = lodash;
    }
  }
  else {
    root._ = lodash;
  }
}.call(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/node_modules/jshint/src/jshint.js":[function(_dereq_,module,exports){

var _            = _dereq_("../lodash");
var events       = _dereq_("events");
var vars         = _dereq_("./vars.js");
var messages     = _dereq_("./messages.js");
var Lexer        = _dereq_("./lex.js").Lexer;
var reg          = _dereq_("./reg.js");
var state        = _dereq_("./state.js").state;
var style        = _dereq_("./style.js");
var options      = _dereq_("./options.js");
var scopeManager = _dereq_("./scope-manager.js");

var JSHINT = (function() {
  "use strict";

  var api, // Extension API
    bang = {
      "<"  : true,
      "<=" : true,
      "==" : true,
      "===": true,
      "!==": true,
      "!=" : true,
      ">"  : true,
      ">=" : true,
      "+"  : true,
      "-"  : true,
      "*"  : true,
      "/"  : true,
      "%"  : true
    },

    declared, // Globals that were declared using /*global ... */ syntax.

    functionicity = [
      "closure", "exception", "global", "label",
      "outer", "unused", "var"
    ],

    functions, // All of the functions

    inblock,
    indent,
    lookahead,
    lex,
    member,
    membersOnly,
    predefined,    // Global variables defined by option

    stack,
    urls,

    extraModules = [],
    emitter = new events.EventEmitter();

  function checkOption(name, t) {
    name = name.trim();

    if (/^[+-]W\d{3}$/g.test(name)) {
      return true;
    }

    if (options.validNames.indexOf(name) === -1) {
      if (t.type !== "jslint" && !_.has(options.removed, name)) {
        error("E001", t, name);
        return false;
      }
    }

    return true;
  }

  function isString(obj) {
    return Object.prototype.toString.call(obj) === "[object String]";
  }

  function isIdentifier(tkn, value) {
    if (!tkn)
      return false;

    if (!tkn.identifier || tkn.value !== value)
      return false;

    return true;
  }

  function isReserved(token) {
    if (!token.reserved) {
      return false;
    }
    var meta = token.meta;

    if (meta && meta.isFutureReservedWord && state.inES5()) {
      if (!meta.es5) {
        return false;
      }
      if (meta.strictOnly) {
        if (!state.option.strict && !state.isStrict()) {
          return false;
        }
      }

      if (token.isProperty) {
        return false;
      }
    }

    return true;
  }

  function supplant(str, data) {
    return str.replace(/\{([^{}]*)\}/g, function(a, b) {
      var r = data[b];
      return typeof r === "string" || typeof r === "number" ? r : a;
    });
  }

  function combine(dest, src) {
    Object.keys(src).forEach(function(name) {
      if (_.has(JSHINT.blacklist, name)) return;
      dest[name] = src[name];
    });
  }

  function processenforceall() {
    if (state.option.enforceall) {
      for (var enforceopt in options.bool.enforcing) {
        if (state.option[enforceopt] === undefined &&
            !options.noenforceall[enforceopt]) {
          state.option[enforceopt] = true;
        }
      }
      for (var relaxopt in options.bool.relaxing) {
        if (state.option[relaxopt] === undefined) {
          state.option[relaxopt] = false;
        }
      }
    }
  }

  function assume() {
    processenforceall();
    if (!state.option.esversion && !state.option.moz) {
      if (state.option.es3) {
        state.option.esversion = 3;
      } else if (state.option.esnext) {
        state.option.esversion = 6;
      } else {
        state.option.esversion = 5;
      }
    }

    if (state.inES5()) {
      combine(predefined, vars.ecmaIdentifiers[5]);
    }

    if (state.inES6()) {
      combine(predefined, vars.ecmaIdentifiers[6]);
    }

    if (state.option.module) {
      if (state.option.strict === true) {
        state.option.strict = "global";
      }
      if (!state.inES6()) {
        warning("W134", state.tokens.next, "module", 6);
      }
    }

    if (state.option.couch) {
      combine(predefined, vars.couch);
    }

    if (state.option.qunit) {
      combine(predefined, vars.qunit);
    }

    if (state.option.rhino) {
      combine(predefined, vars.rhino);
    }

    if (state.option.shelljs) {
      combine(predefined, vars.shelljs);
      combine(predefined, vars.node);
    }
    if (state.option.typed) {
      combine(predefined, vars.typed);
    }

    if (state.option.phantom) {
      combine(predefined, vars.phantom);
      if (state.option.strict === true) {
        state.option.strict = "global";
      }
    }

    if (state.option.prototypejs) {
      combine(predefined, vars.prototypejs);
    }

    if (state.option.node) {
      combine(predefined, vars.node);
      combine(predefined, vars.typed);
      if (state.option.strict === true) {
        state.option.strict = "global";
      }
    }

    if (state.option.devel) {
      combine(predefined, vars.devel);
    }

    if (state.option.dojo) {
      combine(predefined, vars.dojo);
    }

    if (state.option.browser) {
      combine(predefined, vars.browser);
      combine(predefined, vars.typed);
    }

    if (state.option.browserify) {
      combine(predefined, vars.browser);
      combine(predefined, vars.typed);
      combine(predefined, vars.browserify);
      if (state.option.strict === true) {
        state.option.strict = "global";
      }
    }

    if (state.option.nonstandard) {
      combine(predefined, vars.nonstandard);
    }

    if (state.option.jasmine) {
      combine(predefined, vars.jasmine);
    }

    if (state.option.jquery) {
      combine(predefined, vars.jquery);
    }

    if (state.option.mootools) {
      combine(predefined, vars.mootools);
    }

    if (state.option.worker) {
      combine(predefined, vars.worker);
    }

    if (state.option.wsh) {
      combine(predefined, vars.wsh);
    }

    if (state.option.globalstrict && state.option.strict !== false) {
      state.option.strict = "global";
    }

    if (state.option.yui) {
      combine(predefined, vars.yui);
    }

    if (state.option.mocha) {
      combine(predefined, vars.mocha);
    }
  }
  function quit(code, line, chr) {
    var percentage = Math.floor((line / state.lines.length) * 100);
    var message = messages.errors[code].desc;

    throw {
      name: "JSHintError",
      line: line,
      character: chr,
      message: message + " (" + percentage + "% scanned).",
      raw: message,
      code: code
    };
  }

  function removeIgnoredMessages() {
    var ignored = state.ignoredLines;

    if (_.isEmpty(ignored)) return;
    JSHINT.errors = _.reject(JSHINT.errors, function(err) { return ignored[err.line] });
  }

  function warning(code, t, a, b, c, d) {
    var ch, l, w, msg;

    if (/^W\d{3}$/.test(code)) {
      if (state.ignored[code])
        return;

      msg = messages.warnings[code];
    } else if (/E\d{3}/.test(code)) {
      msg = messages.errors[code];
    } else if (/I\d{3}/.test(code)) {
      msg = messages.info[code];
    }

    t = t || state.tokens.next || {};
    if (t.id === "(end)") {  // `~
      t = state.tokens.curr;
    }

    l = t.line || 0;
    ch = t.from || 0;

    w = {
      id: "(error)",
      raw: msg.desc,
      code: msg.code,
      evidence: state.lines[l - 1] || "",
      line: l,
      character: ch,
      scope: JSHINT.scope,
      a: a,
      b: b,
      c: c,
      d: d
    };

    w.reason = supplant(msg.desc, w);
    JSHINT.errors.push(w);

    removeIgnoredMessages();

    if (JSHINT.errors.length >= state.option.maxerr)
      quit("E043", l, ch);

    return w;
  }

  function warningAt(m, l, ch, a, b, c, d) {
    return warning(m, {
      line: l,
      from: ch
    }, a, b, c, d);
  }

  function error(m, t, a, b, c, d) {
    warning(m, t, a, b, c, d);
  }

  function errorAt(m, l, ch, a, b, c, d) {
    return error(m, {
      line: l,
      from: ch
    }, a, b, c, d);
  }
  function addInternalSrc(elem, src) {
    var i;
    i = {
      id: "(internal)",
      elem: elem,
      value: src
    };
    JSHINT.internals.push(i);
    return i;
  }

  function doOption() {
    var nt = state.tokens.next;
    var body = nt.body.match(/(-\s+)?[^\s,:]+(?:\s*:\s*(-\s+)?[^\s,]+)?/g) || [];

    var predef = {};
    if (nt.type === "globals") {
      body.forEach(function(g, idx) {
        g = g.split(":");
        var key = (g[0] || "").trim();
        var val = (g[1] || "").trim();

        if (key === "-" || !key.length) {
          if (idx > 0 && idx === body.length - 1) {
            return;
          }
          error("E002", nt);
          return;
        }

        if (key.charAt(0) === "-") {
          key = key.slice(1);
          val = false;

          JSHINT.blacklist[key] = key;
          delete predefined[key];
        } else {
          predef[key] = (val === "true");
        }
      });

      combine(predefined, predef);

      for (var key in predef) {
        if (_.has(predef, key)) {
          declared[key] = nt;
        }
      }
    }

    if (nt.type === "exported") {
      body.forEach(function(e, idx) {
        if (!e.length) {
          if (idx > 0 && idx === body.length - 1) {
            return;
          }
          error("E002", nt);
          return;
        }

        state.funct["(scope)"].addExported(e);
      });
    }

    if (nt.type === "members") {
      membersOnly = membersOnly || {};

      body.forEach(function(m) {
        var ch1 = m.charAt(0);
        var ch2 = m.charAt(m.length - 1);

        if (ch1 === ch2 && (ch1 === "\"" || ch1 === "'")) {
          m = m
            .substr(1, m.length - 2)
            .replace("\\\"", "\"");
        }

        membersOnly[m] = false;
      });
    }

    var numvals = [
      "maxstatements",
      "maxparams",
      "maxdepth",
      "maxcomplexity",
      "maxerr",
      "maxlen",
      "indent"
    ];

    if (nt.type === "jshint" || nt.type === "jslint") {
      body.forEach(function(g) {
        g = g.split(":");
        var key = (g[0] || "").trim();
        var val = (g[1] || "").trim();

        if (!checkOption(key, nt)) {
          return;
        }

        if (numvals.indexOf(key) >= 0) {
          if (val !== "false") {
            val = +val;

            if (typeof val !== "number" || !isFinite(val) || val <= 0 || Math.floor(val) !== val) {
              error("E032", nt, g[1].trim());
              return;
            }

            state.option[key] = val;
          } else {
            state.option[key] = key === "indent" ? 4 : false;
          }

          return;
        }

        if (key === "validthis") {

          if (state.funct["(global)"])
            return void error("E009");

          if (val !== "true" && val !== "false")
            return void error("E002", nt);

          state.option.validthis = (val === "true");
          return;
        }

        if (key === "quotmark") {
          switch (val) {
          case "true":
          case "false":
            state.option.quotmark = (val === "true");
            break;
          case "double":
          case "single":
            state.option.quotmark = val;
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        if (key === "shadow") {
          switch (val) {
          case "true":
            state.option.shadow = true;
            break;
          case "outer":
            state.option.shadow = "outer";
            break;
          case "false":
          case "inner":
            state.option.shadow = "inner";
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        if (key === "unused") {
          switch (val) {
          case "true":
            state.option.unused = true;
            break;
          case "false":
            state.option.unused = false;
            break;
          case "vars":
          case "strict":
            state.option.unused = val;
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        if (key === "latedef") {
          switch (val) {
          case "true":
            state.option.latedef = true;
            break;
          case "false":
            state.option.latedef = false;
            break;
          case "nofunc":
            state.option.latedef = "nofunc";
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        if (key === "ignore") {
          switch (val) {
          case "line":
            state.ignoredLines[nt.line] = true;
            removeIgnoredMessages();
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        if (key === "strict") {
          switch (val) {
          case "true":
            state.option.strict = true;
            break;
          case "false":
            state.option.strict = false;
            break;
          case "func":
          case "global":
          case "implied":
            state.option.strict = val;
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        if (key === "module") {
          if (!hasParsedCode(state.funct)) {
            error("E055", state.tokens.next, "module");
          }
        }
        var esversions = {
          es3   : 3,
          es5   : 5,
          esnext: 6
        };
        if (_.has(esversions, key)) {
          switch (val) {
          case "true":
            state.option.moz = false;
            state.option.esversion = esversions[key];
            break;
          case "false":
            if (!state.option.moz) {
              state.option.esversion = 5;
            }
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        if (key === "esversion") {
          switch (val) {
          case "5":
            if (state.inES5(true)) {
              warning("I003");
            }
          case "3":
          case "6":
            state.option.moz = false;
            state.option.esversion = +val;
            break;
          case "2015":
            state.option.moz = false;
            state.option.esversion = 6;
            break;
          default:
            error("E002", nt);
          }
          if (!hasParsedCode(state.funct)) {
            error("E055", state.tokens.next, "esversion");
          }
          return;
        }

        var match = /^([+-])(W\d{3})$/g.exec(key);
        if (match) {
          state.ignored[match[2]] = (match[1] === "-");
          return;
        }

        var tn;
        if (val === "true" || val === "false") {
          if (nt.type === "jslint") {
            tn = options.renamed[key] || key;
            state.option[tn] = (val === "true");

            if (options.inverted[tn] !== undefined) {
              state.option[tn] = !state.option[tn];
            }
          } else {
            state.option[key] = (val === "true");
          }

          if (key === "newcap") {
            state.option["(explicitNewcap)"] = true;
          }
          return;
        }

        error("E002", nt);
      });

      assume();
    }
  }

  function peek(p) {
    var i = p || 0, j = lookahead.length, t;

    if (i < j) {
      return lookahead[i];
    }

    while (j <= i) {
      t = lookahead[j];
      if (!t) {
        t = lookahead[j] = lex.token();
      }
      j += 1;
    }
    if (!t && state.tokens.next.id === "(end)") {
      return state.tokens.next;
    }

    return t;
  }

  function peekIgnoreEOL() {
    var i = 0;
    var t;
    do {
      t = peek(i++);
    } while (t.id === "(endline)");
    return t;
  }

  function advance(id, t) {

    switch (state.tokens.curr.id) {
    case "(number)":
      if (state.tokens.next.id === ".") {
        warning("W005", state.tokens.curr);
      }
      break;
    case "-":
      if (state.tokens.next.id === "-" || state.tokens.next.id === "--") {
        warning("W006");
      }
      break;
    case "+":
      if (state.tokens.next.id === "+" || state.tokens.next.id === "++") {
        warning("W007");
      }
      break;
    }

    if (id && state.tokens.next.id !== id) {
      if (t) {
        if (state.tokens.next.id === "(end)") {
          error("E019", t, t.id);
        } else {
          error("E020", state.tokens.next, id, t.id, t.line, state.tokens.next.value);
        }
      } else if (state.tokens.next.type !== "(identifier)" || state.tokens.next.value !== id) {
        warning("W116", state.tokens.next, id, state.tokens.next.value);
      }
    }

    state.tokens.prev = state.tokens.curr;
    state.tokens.curr = state.tokens.next;
    for (;;) {
      state.tokens.next = lookahead.shift() || lex.token();

      if (!state.tokens.next) { // No more tokens left, give up
        quit("E041", state.tokens.curr.line);
      }

      if (state.tokens.next.id === "(end)" || state.tokens.next.id === "(error)") {
        return;
      }

      if (state.tokens.next.check) {
        state.tokens.next.check();
      }

      if (state.tokens.next.isSpecial) {
        if (state.tokens.next.type === "falls through") {
          state.tokens.curr.caseFallsThrough = true;
        } else {
          doOption();
        }
      } else {
        if (state.tokens.next.id !== "(endline)") {
          break;
        }
      }
    }
  }

  function isInfix(token) {
    return token.infix || (!token.identifier && !token.template && !!token.led);
  }

  function isEndOfExpr() {
    var curr = state.tokens.curr;
    var next = state.tokens.next;
    if (next.id === ";" || next.id === "}" || next.id === ":") {
      return true;
    }
    if (isInfix(next) === isInfix(curr) || (curr.id === "yield" && state.inMoz())) {
      return curr.line !== startLine(next);
    }
    return false;
  }

  function isBeginOfExpr(prev) {
    return !prev.left && prev.arity !== "unary";
  }

  function expression(rbp, initial) {
    var left, isArray = false, isObject = false, isLetExpr = false;

    state.nameStack.push();
    if (!initial && state.tokens.next.value === "let" && peek(0).value === "(") {
      if (!state.inMoz()) {
        warning("W118", state.tokens.next, "let expressions");
      }
      isLetExpr = true;
      state.funct["(scope)"].stack();
      advance("let");
      advance("(");
      state.tokens.prev.fud();
      advance(")");
    }

    if (state.tokens.next.id === "(end)")
      error("E006", state.tokens.curr);

    var isDangerous =
      state.option.asi &&
      state.tokens.prev.line !== startLine(state.tokens.curr) &&
      _.contains(["]", ")"], state.tokens.prev.id) &&
      _.contains(["[", "("], state.tokens.curr.id);

    if (isDangerous)
      warning("W014", state.tokens.curr, state.tokens.curr.id);

    advance();

    if (initial) {
      state.funct["(verb)"] = state.tokens.curr.value;
      state.tokens.curr.beginsStmt = true;
    }

    if (initial === true && state.tokens.curr.fud) {
      left = state.tokens.curr.fud();
    } else {
      if (state.tokens.curr.nud) {
        left = state.tokens.curr.nud();
      } else {
        error("E030", state.tokens.curr, state.tokens.curr.id);
      }
      while ((rbp < state.tokens.next.lbp || state.tokens.next.type === "(template)") &&
              !isEndOfExpr()) {
        isArray = state.tokens.curr.value === "Array";
        isObject = state.tokens.curr.value === "Object";
        if (left && (left.value || (left.first && left.first.value))) {
          if (left.value !== "new" ||
            (left.first && left.first.value && left.first.value === ".")) {
            isArray = false;
            if (left.value !== state.tokens.curr.value) {
              isObject = false;
            }
          }
        }

        advance();

        if (isArray && state.tokens.curr.id === "(" && state.tokens.next.id === ")") {
          warning("W009", state.tokens.curr);
        }

        if (isObject && state.tokens.curr.id === "(" && state.tokens.next.id === ")") {
          warning("W010", state.tokens.curr);
        }

        if (left && state.tokens.curr.led) {
          left = state.tokens.curr.led(left);
        } else {
          error("E033", state.tokens.curr, state.tokens.curr.id);
        }
      }
    }
    if (isLetExpr) {
      state.funct["(scope)"].unstack();
    }

    state.nameStack.pop();

    return left;
  }

  function startLine(token) {
    return token.startLine || token.line;
  }

  function nobreaknonadjacent(left, right) {
    left = left || state.tokens.curr;
    right = right || state.tokens.next;
    if (!state.option.laxbreak && left.line !== startLine(right)) {
      warning("W014", right, right.value);
    }
  }

  function nolinebreak(t) {
    t = t || state.tokens.curr;
    if (t.line !== startLine(state.tokens.next)) {
      warning("E022", t, t.value);
    }
  }

  function nobreakcomma(left, right) {
    if (left.line !== startLine(right)) {
      if (!state.option.laxcomma) {
        if (comma.first) {
          warning("I001");
          comma.first = false;
        }
        warning("W014", left, right.value);
      }
    }
  }

  function comma(opts) {
    opts = opts || {};

    if (!opts.peek) {
      nobreakcomma(state.tokens.curr, state.tokens.next);
      advance(",");
    } else {
      nobreakcomma(state.tokens.prev, state.tokens.curr);
    }

    if (state.tokens.next.identifier && !(opts.property && state.inES5())) {
      switch (state.tokens.next.value) {
      case "break":
      case "case":
      case "catch":
      case "continue":
      case "default":
      case "do":
      case "else":
      case "finally":
      case "for":
      case "if":
      case "in":
      case "instanceof":
      case "return":
      case "switch":
      case "throw":
      case "try":
      case "var":
      case "let":
      case "while":
      case "with":
        error("E024", state.tokens.next, state.tokens.next.value);
        return false;
      }
    }

    if (state.tokens.next.type === "(punctuator)") {
      switch (state.tokens.next.value) {
      case "}":
      case "]":
      case ",":
        if (opts.allowTrailing) {
          return true;
        }
      case ")":
        error("E024", state.tokens.next, state.tokens.next.value);
        return false;
      }
    }
    return true;
  }

  function symbol(s, p) {
    var x = state.syntax[s];
    if (!x || typeof x !== "object") {
      state.syntax[s] = x = {
        id: s,
        lbp: p,
        value: s
      };
    }
    return x;
  }

  function delim(s) {
    var x = symbol(s, 0);
    x.delim = true;
    return x;
  }

  function stmt(s, f) {
    var x = delim(s);
    x.identifier = x.reserved = true;
    x.fud = f;
    return x;
  }

  function blockstmt(s, f) {
    var x = stmt(s, f);
    x.block = true;
    return x;
  }

  function reserveName(x) {
    var c = x.id.charAt(0);
    if ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z")) {
      x.identifier = x.reserved = true;
    }
    return x;
  }

  function prefix(s, f) {
    var x = symbol(s, 150);
    reserveName(x);

    x.nud = (typeof f === "function") ? f : function() {
      this.arity = "unary";
      this.right = expression(150);

      if (this.id === "++" || this.id === "--") {
        if (state.option.plusplus) {
          warning("W016", this, this.id);
        } else if (this.right && (!this.right.identifier || isReserved(this.right)) &&
            this.right.id !== "." && this.right.id !== "[") {
          warning("W017", this);
        }

        if (this.right && this.right.isMetaProperty) {
          error("E031", this);
        } else if (this.right && this.right.identifier) {
          state.funct["(scope)"].block.modify(this.right.value, this);
        }
      }

      return this;
    };

    return x;
  }

  function type(s, f) {
    var x = delim(s);
    x.type = s;
    x.nud = f;
    return x;
  }

  function reserve(name, func) {
    var x = type(name, func);
    x.identifier = true;
    x.reserved = true;
    return x;
  }

  function FutureReservedWord(name, meta) {
    var x = type(name, (meta && meta.nud) || function() {
      return this;
    });

    meta = meta || {};
    meta.isFutureReservedWord = true;

    x.value = name;
    x.identifier = true;
    x.reserved = true;
    x.meta = meta;

    return x;
  }

  function reservevar(s, v) {
    return reserve(s, function() {
      if (typeof v === "function") {
        v(this);
      }
      return this;
    });
  }

  function infix(s, f, p, w) {
    var x = symbol(s, p);
    reserveName(x);
    x.infix = true;
    x.led = function(left) {
      if (!w) {
        nobreaknonadjacent(state.tokens.prev, state.tokens.curr);
      }
      if ((s === "in" || s === "instanceof") && left.id === "!") {
        warning("W018", left, "!");
      }
      if (typeof f === "function") {
        return f(left, this);
      } else {
        this.left = left;
        this.right = expression(p);
        return this;
      }
    };
    return x;
  }

  function application(s) {
    var x = symbol(s, 42);

    x.led = function(left) {
      nobreaknonadjacent(state.tokens.prev, state.tokens.curr);

      this.left = left;
      this.right = doFunction({ type: "arrow", loneArg: left });
      return this;
    };
    return x;
  }

  function relation(s, f) {
    var x = symbol(s, 100);

    x.led = function(left) {
      nobreaknonadjacent(state.tokens.prev, state.tokens.curr);
      this.left = left;
      var right = this.right = expression(100);

      if (isIdentifier(left, "NaN") || isIdentifier(right, "NaN")) {
        warning("W019", this);
      } else if (f) {
        f.apply(this, [left, right]);
      }

      if (!left || !right) {
        quit("E041", state.tokens.curr.line);
      }

      if (left.id === "!") {
        warning("W018", left, "!");
      }

      if (right.id === "!") {
        warning("W018", right, "!");
      }

      return this;
    };
    return x;
  }

  function isPoorRelation(node) {
    return node &&
        ((node.type === "(number)" && +node.value === 0) ||
         (node.type === "(string)" && node.value === "") ||
         (node.type === "null" && !state.option.eqnull) ||
        node.type === "true" ||
        node.type === "false" ||
        node.type === "undefined");
  }

  var typeofValues = {};
  typeofValues.legacy = [
    "xml",
    "unknown"
  ];
  typeofValues.es3 = [
    "undefined", "boolean", "number", "string", "function", "object",
  ];
  typeofValues.es3 = typeofValues.es3.concat(typeofValues.legacy);
  typeofValues.es6 = typeofValues.es3.concat("symbol");
  function isTypoTypeof(left, right, state) {
    var values;

    if (state.option.notypeof)
      return false;

    if (!left || !right)
      return false;

    values = state.inES6() ? typeofValues.es6 : typeofValues.es3;

    if (right.type === "(identifier)" && right.value === "typeof" && left.type === "(string)")
      return !_.contains(values, left.value);

    return false;
  }

  function isGlobalEval(left, state) {
    var isGlobal = false;
    if (left.type === "this" && state.funct["(context)"] === null) {
      isGlobal = true;
    }
    else if (left.type === "(identifier)") {
      if (state.option.node && left.value === "global") {
        isGlobal = true;
      }

      else if (state.option.browser && (left.value === "window" || left.value === "document")) {
        isGlobal = true;
      }
    }

    return isGlobal;
  }

  function findNativePrototype(left) {
    var natives = [
      "Array", "ArrayBuffer", "Boolean", "Collator", "DataView", "Date",
      "DateTimeFormat", "Error", "EvalError", "Float32Array", "Float64Array",
      "Function", "Infinity", "Intl", "Int16Array", "Int32Array", "Int8Array",
      "Iterator", "Number", "NumberFormat", "Object", "RangeError",
      "ReferenceError", "RegExp", "StopIteration", "String", "SyntaxError",
      "TypeError", "Uint16Array", "Uint32Array", "Uint8Array", "Uint8ClampedArray",
      "URIError"
    ];

    function walkPrototype(obj) {
      if (typeof obj !== "object") return;
      return obj.right === "prototype" ? obj : walkPrototype(obj.left);
    }

    function walkNative(obj) {
      while (!obj.identifier && typeof obj.left === "object")
        obj = obj.left;

      if (obj.identifier && natives.indexOf(obj.value) >= 0)
        return obj.value;
    }

    var prototype = walkPrototype(left);
    if (prototype) return walkNative(prototype);
  }
  function checkLeftSideAssign(left, assignToken, options) {

    var allowDestructuring = options && options.allowDestructuring;

    assignToken = assignToken || left;

    if (state.option.freeze) {
      var nativeObject = findNativePrototype(left);
      if (nativeObject)
        warning("W121", left, nativeObject);
    }

    if (left.identifier && !left.isMetaProperty) {
      state.funct["(scope)"].block.reassign(left.value, left);
    }

    if (left.id === ".") {
      if (!left.left || left.left.value === "arguments" && !state.isStrict()) {
        warning("E031", assignToken);
      }

      state.nameStack.set(state.tokens.prev);
      return true;
    } else if (left.id === "{" || left.id === "[") {
      if (allowDestructuring && state.tokens.curr.left.destructAssign) {
        state.tokens.curr.left.destructAssign.forEach(function(t) {
          if (t.id) {
            state.funct["(scope)"].block.modify(t.id, t.token);
          }
        });
      } else {
        if (left.id === "{" || !left.left) {
          warning("E031", assignToken);
        } else if (left.left.value === "arguments" && !state.isStrict()) {
          warning("E031", assignToken);
        }
      }

      if (left.id === "[") {
        state.nameStack.set(left.right);
      }

      return true;
    } else if (left.isMetaProperty) {
      error("E031", assignToken);
      return true;
    } else if (left.identifier && !isReserved(left)) {
      if (state.funct["(scope)"].labeltype(left.value) === "exception") {
        warning("W022", left);
      }
      state.nameStack.set(left);
      return true;
    }

    if (left === state.syntax["function"]) {
      warning("W023", state.tokens.curr);
    }

    return false;
  }

  function assignop(s, f, p) {
    var x = infix(s, typeof f === "function" ? f : function(left, that) {
      that.left = left;

      if (left && checkLeftSideAssign(left, that, { allowDestructuring: true })) {
        that.right = expression(10);
        return that;
      }

      error("E031", that);
    }, p);

    x.exps = true;
    x.assign = true;
    return x;
  }


  function bitwise(s, f, p) {
    var x = symbol(s, p);
    reserveName(x);
    x.led = (typeof f === "function") ? f : function(left) {
      if (state.option.bitwise) {
        warning("W016", this, this.id);
      }
      this.left = left;
      this.right = expression(p);
      return this;
    };
    return x;
  }

  function bitwiseassignop(s) {
    return assignop(s, function(left, that) {
      if (state.option.bitwise) {
        warning("W016", that, that.id);
      }

      if (left && checkLeftSideAssign(left, that)) {
        that.right = expression(10);
        return that;
      }
      error("E031", that);
    }, 20);
  }

  function suffix(s) {
    var x = symbol(s, 150);

    x.led = function(left) {
      if (state.option.plusplus) {
        warning("W016", this, this.id);
      } else if ((!left.identifier || isReserved(left)) && left.id !== "." && left.id !== "[") {
        warning("W017", this);
      }

      if (left.isMetaProperty) {
        error("E031", this);
      } else if (left && left.identifier) {
        state.funct["(scope)"].block.modify(left.value, left);
      }

      this.left = left;
      return this;
    };
    return x;
  }

  function optionalidentifier(fnparam, prop, preserve) {
    if (!state.tokens.next.identifier) {
      return;
    }

    if (!preserve) {
      advance();
    }

    var curr = state.tokens.curr;
    var val  = state.tokens.curr.value;

    if (!isReserved(curr)) {
      return val;
    }

    if (prop) {
      if (state.inES5()) {
        return val;
      }
    }

    if (fnparam && val === "undefined") {
      return val;
    }

    warning("W024", state.tokens.curr, state.tokens.curr.id);
    return val;
  }
  function identifier(fnparam, prop) {
    var i = optionalidentifier(fnparam, prop, false);
    if (i) {
      return i;
    }
    if (state.tokens.next.value === "...") {
      if (!state.inES6(true)) {
        warning("W119", state.tokens.next, "spread/rest operator", "6");
      }
      advance();

      if (checkPunctuator(state.tokens.next, "...")) {
        warning("E024", state.tokens.next, "...");
        while (checkPunctuator(state.tokens.next, "...")) {
          advance();
        }
      }

      if (!state.tokens.next.identifier) {
        warning("E024", state.tokens.curr, "...");
        return;
      }

      return identifier(fnparam, prop);
    } else {
      error("E030", state.tokens.next, state.tokens.next.value);
      if (state.tokens.next.id !== ";") {
        advance();
      }
    }
  }


  function reachable(controlToken) {
    var i = 0, t;
    if (state.tokens.next.id !== ";" || controlToken.inBracelessBlock) {
      return;
    }
    for (;;) {
      do {
        t = peek(i);
        i += 1;
      } while (t.id !== "(end)" && t.id === "(comment)");

      if (t.reach) {
        return;
      }
      if (t.id !== "(endline)") {
        if (t.id === "function") {
          if (state.option.latedef === true) {
            warning("W026", t);
          }
          break;
        }

        warning("W027", t, t.value, controlToken.value);
        break;
      }
    }
  }

  function parseFinalSemicolon() {
    if (state.tokens.next.id !== ";") {
      if (state.tokens.next.isUnclosed) return advance();

      var sameLine = startLine(state.tokens.next) === state.tokens.curr.line &&
                     state.tokens.next.id !== "(end)";
      var blockEnd = checkPunctuator(state.tokens.next, "}");

      if (sameLine && !blockEnd) {
        errorAt("E058", state.tokens.curr.line, state.tokens.curr.character);
      } else if (!state.option.asi) {
        if ((blockEnd && !state.option.lastsemic) || !sameLine) {
          warningAt("W033", state.tokens.curr.line, state.tokens.curr.character);
        }
      }
    } else {
      advance(";");
    }
  }

  function statement() {
    var i = indent, r, t = state.tokens.next, hasOwnScope = false;

    if (t.id === ";") {
      advance(";");
      return;
    }
    var res = isReserved(t);

    if (res && t.meta && t.meta.isFutureReservedWord && peek().id === ":") {
      warning("W024", t, t.id);
      res = false;
    }

    if (t.identifier && !res && peek().id === ":") {
      advance();
      advance(":");

      hasOwnScope = true;
      state.funct["(scope)"].stack();
      state.funct["(scope)"].block.addBreakLabel(t.value, { token: state.tokens.curr });

      if (!state.tokens.next.labelled && state.tokens.next.value !== "{") {
        warning("W028", state.tokens.next, t.value, state.tokens.next.value);
      }

      state.tokens.next.label = t.value;
      t = state.tokens.next;
    }

    if (t.id === "{") {
      var iscase = (state.funct["(verb)"] === "case" && state.tokens.curr.value === ":");
      block(true, true, false, false, iscase);
      return;
    }

    r = expression(0, true);

    if (r && !(r.identifier && r.value === "function") &&
        !(r.type === "(punctuator)" && r.left &&
          r.left.identifier && r.left.value === "function")) {
      if (!state.isStrict() &&
          state.option.strict === "global") {
        warning("E007");
      }
    }

    if (!t.block) {
      if (!state.option.expr && (!r || !r.exps)) {
        warning("W030", state.tokens.curr);
      } else if (state.option.nonew && r && r.left && r.id === "(" && r.left.id === "new") {
        warning("W031", t);
      }
      parseFinalSemicolon();
    }

    indent = i;
    if (hasOwnScope) {
      state.funct["(scope)"].unstack();
    }
    return r;
  }


  function statements() {
    var a = [], p;

    while (!state.tokens.next.reach && state.tokens.next.id !== "(end)") {
      if (state.tokens.next.id === ";") {
        p = peek();

        if (!p || (p.id !== "(" && p.id !== "[")) {
          warning("W032");
        }

        advance(";");
      } else {
        a.push(statement());
      }
    }
    return a;
  }
  function directives() {
    var i, p, pn;

    while (state.tokens.next.id === "(string)") {
      p = peek(0);
      if (p.id === "(endline)") {
        i = 1;
        do {
          pn = peek(i++);
        } while (pn.id === "(endline)");
        if (pn.id === ";") {
          p = pn;
        } else if (pn.value === "[" || pn.value === ".") {
          break;
        } else if (!state.option.asi || pn.value === "(") {
          warning("W033", state.tokens.next);
        }
      } else if (p.id === "." || p.id === "[") {
        break;
      } else if (p.id !== ";") {
        warning("W033", p);
      }

      advance();
      var directive = state.tokens.curr.value;
      if (state.directive[directive] ||
          (directive === "use strict" && state.option.strict === "implied")) {
        warning("W034", state.tokens.curr, directive);
      }
      state.directive[directive] = true;

      if (p.id === ";") {
        advance(";");
      }
    }

    if (state.isStrict()) {
      if (!state.option["(explicitNewcap)"]) {
        state.option.newcap = true;
      }
      state.option.undef = true;
    }
  }
  function block(ordinary, stmt, isfunc, isfatarrow, iscase) {
    var a,
      b = inblock,
      old_indent = indent,
      m,
      t,
      line,
      d;

    inblock = ordinary;

    t = state.tokens.next;

    var metrics = state.funct["(metrics)"];
    metrics.nestedBlockDepth += 1;
    metrics.verifyMaxNestedBlockDepthPerFunction();

    if (state.tokens.next.id === "{") {
      advance("{");
      state.funct["(scope)"].stack();

      line = state.tokens.curr.line;
      if (state.tokens.next.id !== "}") {
        indent += state.option.indent;
        while (!ordinary && state.tokens.next.from > indent) {
          indent += state.option.indent;
        }

        if (isfunc) {
          m = {};
          for (d in state.directive) {
            if (_.has(state.directive, d)) {
              m[d] = state.directive[d];
            }
          }
          directives();

          if (state.option.strict && state.funct["(context)"]["(global)"]) {
            if (!m["use strict"] && !state.isStrict()) {
              warning("E007");
            }
          }
        }

        a = statements();

        metrics.statementCount += a.length;

        indent -= state.option.indent;
      }

      advance("}", t);

      if (isfunc) {
        state.funct["(scope)"].validateParams();
        if (m) {
          state.directive = m;
        }
      }

      state.funct["(scope)"].unstack();

      indent = old_indent;
    } else if (!ordinary) {
      if (isfunc) {
        state.funct["(scope)"].stack();

        m = {};
        if (stmt && !isfatarrow && !state.inMoz()) {
          error("W118", state.tokens.curr, "function closure expressions");
        }

        if (!stmt) {
          for (d in state.directive) {
            if (_.has(state.directive, d)) {
              m[d] = state.directive[d];
            }
          }
        }
        expression(10);

        if (state.option.strict && state.funct["(context)"]["(global)"]) {
          if (!m["use strict"] && !state.isStrict()) {
            warning("E007");
          }
        }

        state.funct["(scope)"].unstack();
      } else {
        error("E021", state.tokens.next, "{", state.tokens.next.value);
      }
    } else {
      state.funct["(noblockscopedvar)"] = state.tokens.next.id !== "for";
      state.funct["(scope)"].stack();

      if (!stmt || state.option.curly) {
        warning("W116", state.tokens.next, "{", state.tokens.next.value);
      }

      state.tokens.next.inBracelessBlock = true;
      indent += state.option.indent;
      a = [statement()];
      indent -= state.option.indent;

      state.funct["(scope)"].unstack();
      delete state.funct["(noblockscopedvar)"];
    }
    switch (state.funct["(verb)"]) {
    case "break":
    case "continue":
    case "return":
    case "throw":
      if (iscase) {
        break;
      }
    default:
      state.funct["(verb)"] = null;
    }

    inblock = b;
    if (ordinary && state.option.noempty && (!a || a.length === 0)) {
      warning("W035", state.tokens.prev);
    }
    metrics.nestedBlockDepth -= 1;
    return a;
  }


  function countMember(m) {
    if (membersOnly && typeof membersOnly[m] !== "boolean") {
      warning("W036", state.tokens.curr, m);
    }
    if (typeof member[m] === "number") {
      member[m] += 1;
    } else {
      member[m] = 1;
    }
  }

  type("(number)", function() {
    return this;
  });

  type("(string)", function() {
    return this;
  });

  state.syntax["(identifier)"] = {
    type: "(identifier)",
    lbp: 0,
    identifier: true,

    nud: function() {
      var v = this.value;
      if (state.tokens.next.id === "=>") {
        return this;
      }

      if (!state.funct["(comparray)"].check(v)) {
        state.funct["(scope)"].block.use(v, state.tokens.curr);
      }
      return this;
    },

    led: function() {
      error("E033", state.tokens.next, state.tokens.next.value);
    }
  };

  var baseTemplateSyntax = {
    lbp: 0,
    identifier: false,
    template: true,
  };
  state.syntax["(template)"] = _.extend({
    type: "(template)",
    nud: doTemplateLiteral,
    led: doTemplateLiteral,
    noSubst: false
  }, baseTemplateSyntax);

  state.syntax["(template middle)"] = _.extend({
    type: "(template middle)",
    middle: true,
    noSubst: false
  }, baseTemplateSyntax);

  state.syntax["(template tail)"] = _.extend({
    type: "(template tail)",
    tail: true,
    noSubst: false
  }, baseTemplateSyntax);

  state.syntax["(no subst template)"] = _.extend({
    type: "(template)",
    nud: doTemplateLiteral,
    led: doTemplateLiteral,
    noSubst: true,
    tail: true // mark as tail, since it's always the last component
  }, baseTemplateSyntax);

  type("(regexp)", function() {
    return this;
  });

  delim("(endline)");
  delim("(begin)");
  delim("(end)").reach = true;
  delim("(error)").reach = true;
  delim("}").reach = true;
  delim(")");
  delim("]");
  delim("\"").reach = true;
  delim("'").reach = true;
  delim(";");
  delim(":").reach = true;
  delim("#");

  reserve("else");
  reserve("case").reach = true;
  reserve("catch");
  reserve("default").reach = true;
  reserve("finally");
  reservevar("arguments", function(x) {
    if (state.isStrict() && state.funct["(global)"]) {
      warning("E008", x);
    }
  });
  reservevar("eval");
  reservevar("false");
  reservevar("Infinity");
  reservevar("null");
  reservevar("this", function(x) {
    if (state.isStrict() && !isMethod() &&
        !state.option.validthis && ((state.funct["(statement)"] &&
        state.funct["(name)"].charAt(0) > "Z") || state.funct["(global)"])) {
      warning("W040", x);
    }
  });
  reservevar("true");
  reservevar("undefined");

  assignop("=", "assign", 20);
  assignop("+=", "assignadd", 20);
  assignop("-=", "assignsub", 20);
  assignop("*=", "assignmult", 20);
  assignop("/=", "assigndiv", 20).nud = function() {
    error("E014");
  };
  assignop("%=", "assignmod", 20);

  bitwiseassignop("&=");
  bitwiseassignop("|=");
  bitwiseassignop("^=");
  bitwiseassignop("<<=");
  bitwiseassignop(">>=");
  bitwiseassignop(">>>=");
  infix(",", function(left, that) {
    var expr;
    that.exprs = [left];

    if (state.option.nocomma) {
      warning("W127");
    }

    if (!comma({ peek: true })) {
      return that;
    }
    while (true) {
      if (!(expr = expression(10))) {
        break;
      }
      that.exprs.push(expr);
      if (state.tokens.next.value !== "," || !comma()) {
        break;
      }
    }
    return that;
  }, 10, true);

  infix("?", function(left, that) {
    increaseComplexityCount();
    that.left = left;
    that.right = expression(10);
    advance(":");
    that["else"] = expression(10);
    return that;
  }, 30);

  var orPrecendence = 40;
  infix("||", function(left, that) {
    increaseComplexityCount();
    that.left = left;
    that.right = expression(orPrecendence);
    return that;
  }, orPrecendence);
  infix("&&", "and", 50);
  bitwise("|", "bitor", 70);
  bitwise("^", "bitxor", 80);
  bitwise("&", "bitand", 90);
  relation("==", function(left, right) {
    var eqnull = state.option.eqnull &&
      ((left && left.value) === "null" || (right && right.value) === "null");

    switch (true) {
      case !eqnull && state.option.eqeqeq:
        this.from = this.character;
        warning("W116", this, "===", "==");
        break;
      case isPoorRelation(left):
        warning("W041", this, "===", left.value);
        break;
      case isPoorRelation(right):
        warning("W041", this, "===", right.value);
        break;
      case isTypoTypeof(right, left, state):
        warning("W122", this, right.value);
        break;
      case isTypoTypeof(left, right, state):
        warning("W122", this, left.value);
        break;
    }

    return this;
  });
  relation("===", function(left, right) {
    if (isTypoTypeof(right, left, state)) {
      warning("W122", this, right.value);
    } else if (isTypoTypeof(left, right, state)) {
      warning("W122", this, left.value);
    }
    return this;
  });
  relation("!=", function(left, right) {
    var eqnull = state.option.eqnull &&
        ((left && left.value) === "null" || (right && right.value) === "null");

    if (!eqnull && state.option.eqeqeq) {
      this.from = this.character;
      warning("W116", this, "!==", "!=");
    } else if (isPoorRelation(left)) {
      warning("W041", this, "!==", left.value);
    } else if (isPoorRelation(right)) {
      warning("W041", this, "!==", right.value);
    } else if (isTypoTypeof(right, left, state)) {
      warning("W122", this, right.value);
    } else if (isTypoTypeof(left, right, state)) {
      warning("W122", this, left.value);
    }
    return this;
  });
  relation("!==", function(left, right) {
    if (isTypoTypeof(right, left, state)) {
      warning("W122", this, right.value);
    } else if (isTypoTypeof(left, right, state)) {
      warning("W122", this, left.value);
    }
    return this;
  });
  relation("<");
  relation(">");
  relation("<=");
  relation(">=");
  bitwise("<<", "shiftleft", 120);
  bitwise(">>", "shiftright", 120);
  bitwise(">>>", "shiftrightunsigned", 120);
  infix("in", "in", 120);
  infix("instanceof", "instanceof", 120);
  infix("+", function(left, that) {
    var right;
    that.left = left;
    that.right = right = expression(130);

    if (left && right && left.id === "(string)" && right.id === "(string)") {
      left.value += right.value;
      left.character = right.character;
      if (!state.option.scripturl && reg.javascriptURL.test(left.value)) {
        warning("W050", left);
      }
      return left;
    }

    return that;
  }, 130);
  prefix("+", "num");
  prefix("+++", function() {
    warning("W007");
    this.arity = "unary";
    this.right = expression(150);
    return this;
  });
  infix("+++", function(left) {
    warning("W007");
    this.left = left;
    this.right = expression(130);
    return this;
  }, 130);
  infix("-", "sub", 130);
  prefix("-", "neg");
  prefix("---", function() {
    warning("W006");
    this.arity = "unary";
    this.right = expression(150);
    return this;
  });
  infix("---", function(left) {
    warning("W006");
    this.left = left;
    this.right = expression(130);
    return this;
  }, 130);
  infix("*", "mult", 140);
  infix("/", "div", 140);
  infix("%", "mod", 140);

  suffix("++");
  prefix("++", "preinc");
  state.syntax["++"].exps = true;

  suffix("--");
  prefix("--", "predec");
  state.syntax["--"].exps = true;
  prefix("delete", function() {
    var p = expression(10);
    if (!p) {
      return this;
    }

    if (p.id !== "." && p.id !== "[") {
      warning("W051");
    }
    this.first = p;
    if (p.identifier && !state.isStrict()) {
      p.forgiveUndef = true;
    }
    return this;
  }).exps = true;

  prefix("~", function() {
    if (state.option.bitwise) {
      warning("W016", this, "~");
    }
    this.arity = "unary";
    this.right = expression(150);
    return this;
  });

  prefix("...", function() {
    if (!state.inES6(true)) {
      warning("W119", this, "spread/rest operator", "6");
    }
    if (!state.tokens.next.identifier &&
        state.tokens.next.type !== "(string)" &&
          !checkPunctuators(state.tokens.next, ["[", "("])) {

      error("E030", state.tokens.next, state.tokens.next.value);
    }
    expression(150);
    return this;
  });

  prefix("!", function() {
    this.arity = "unary";
    this.right = expression(150);

    if (!this.right) { // '!' followed by nothing? Give up.
      quit("E041", this.line || 0);
    }

    if (bang[this.right.id] === true) {
      warning("W018", this, "!");
    }
    return this;
  });

  prefix("typeof", (function() {
    var p = expression(150);
    this.first = this.right = p;

    if (!p) { // 'typeof' followed by nothing? Give up.
      quit("E041", this.line || 0, this.character || 0);
    }
    if (p.identifier) {
      p.forgiveUndef = true;
    }
    return this;
  }));
  prefix("new", function() {
    var mp = metaProperty("target", function() {
      if (!state.inES6(true)) {
        warning("W119", state.tokens.prev, "new.target", "6");
      }
      var inFunction, c = state.funct;
      while (c) {
        inFunction = !c["(global)"];
        if (!c["(arrow)"]) { break; }
        c = c["(context)"];
      }
      if (!inFunction) {
        warning("W136", state.tokens.prev, "new.target");
      }
    });
    if (mp) { return mp; }

    var c = expression(155), i;
    if (c && c.id !== "function") {
      if (c.identifier) {
        c["new"] = true;
        switch (c.value) {
        case "Number":
        case "String":
        case "Boolean":
        case "Math":
        case "JSON":
          warning("W053", state.tokens.prev, c.value);
          break;
        case "Symbol":
          if (state.inES6()) {
            warning("W053", state.tokens.prev, c.value);
          }
          break;
        case "Function":
          if (!state.option.evil) {
            warning("W054");
          }
          break;
        case "Date":
        case "RegExp":
        case "this":
          break;
        default:
          if (c.id !== "function") {
            i = c.value.substr(0, 1);
            if (state.option.newcap && (i < "A" || i > "Z") &&
              !state.funct["(scope)"].isPredefined(c.value)) {
              warning("W055", state.tokens.curr);
            }
          }
        }
      } else {
        if (c.id !== "." && c.id !== "[" && c.id !== "(") {
          warning("W056", state.tokens.curr);
        }
      }
    } else {
      if (!state.option.supernew)
        warning("W057", this);
    }
    if (state.tokens.next.id !== "(" && !state.option.supernew) {
      warning("W058", state.tokens.curr, state.tokens.curr.value);
    }
    this.first = this.right = c;
    return this;
  });
  state.syntax["new"].exps = true;

  prefix("void").exps = true;

  infix(".", function(left, that) {
    var m = identifier(false, true);

    if (typeof m === "string") {
      countMember(m);
    }

    that.left = left;
    that.right = m;

    if (m && m === "hasOwnProperty" && state.tokens.next.value === "=") {
      warning("W001");
    }

    if (left && left.value === "arguments" && (m === "callee" || m === "caller")) {
      if (state.option.noarg)
        warning("W059", left, m);
      else if (state.isStrict())
        error("E008");
    } else if (!state.option.evil && left && left.value === "document" &&
        (m === "write" || m === "writeln")) {
      warning("W060", left);
    }

    if (!state.option.evil && (m === "eval" || m === "execScript")) {
      if (isGlobalEval(left, state)) {
        warning("W061");
      }
    }

    return that;
  }, 160, true);

  infix("(", function(left, that) {
    if (state.option.immed && left && !left.immed && left.id === "function") {
      warning("W062");
    }

    var n = 0;
    var p = [];

    if (left) {
      if (left.type === "(identifier)") {
        if (left.value.match(/^[A-Z]([A-Z0-9_$]*[a-z][A-Za-z0-9_$]*)?$/)) {
          if ("Array Number String Boolean Date Object Error Symbol".indexOf(left.value) === -1) {
            if (left.value === "Math") {
              warning("W063", left);
            } else if (state.option.newcap) {
              warning("W064", left);
            }
          }
        }
      }
    }

    if (state.tokens.next.id !== ")") {
      for (;;) {
        p[p.length] = expression(10);
        n += 1;
        if (state.tokens.next.id !== ",") {
          break;
        }
        comma();
      }
    }

    advance(")");

    if (typeof left === "object") {
      if (!state.inES5() && left.value === "parseInt" && n === 1) {
        warning("W065", state.tokens.curr);
      }
      if (!state.option.evil) {
        if (left.value === "eval" || left.value === "Function" ||
            left.value === "execScript") {
          warning("W061", left);

          if (p[0] && [0].id === "(string)") {
            addInternalSrc(left, p[0].value);
          }
        } else if (p[0] && p[0].id === "(string)" &&
             (left.value === "setTimeout" ||
            left.value === "setInterval")) {
          warning("W066", left);
          addInternalSrc(left, p[0].value);
        } else if (p[0] && p[0].id === "(string)" &&
             left.value === "." &&
             left.left.value === "window" &&
             (left.right === "setTimeout" ||
            left.right === "setInterval")) {
          warning("W066", left);
          addInternalSrc(left, p[0].value);
        }
      }
      if (!left.identifier && left.id !== "." && left.id !== "[" && left.id !== "=>" &&
          left.id !== "(" && left.id !== "&&" && left.id !== "||" && left.id !== "?" &&
          !(state.inES6() && left["(name)"])) {
        warning("W067", that);
      }
    }

    that.left = left;
    return that;
  }, 155, true).exps = true;

  prefix("(", function() {
    var pn = state.tokens.next, pn1, i = -1;
    var ret, triggerFnExpr, first, last;
    var parens = 1;
    var opening = state.tokens.curr;
    var preceeding = state.tokens.prev;
    var isNecessary = !state.option.singleGroups;

    do {
      if (pn.value === "(") {
        parens += 1;
      } else if (pn.value === ")") {
        parens -= 1;
      }

      i += 1;
      pn1 = pn;
      pn = peek(i);
    } while (!(parens === 0 && pn1.value === ")") && pn.value !== ";" && pn.type !== "(end)");

    if (state.tokens.next.id === "function") {
      triggerFnExpr = state.tokens.next.immed = true;
    }
    if (pn.value === "=>") {
      return doFunction({ type: "arrow", parsedOpening: true });
    }

    var exprs = [];

    if (state.tokens.next.id !== ")") {
      for (;;) {
        exprs.push(expression(10));

        if (state.tokens.next.id !== ",") {
          break;
        }

        if (state.option.nocomma) {
          warning("W127");
        }

        comma();
      }
    }

    advance(")", this);
    if (state.option.immed && exprs[0] && exprs[0].id === "function") {
      if (state.tokens.next.id !== "(" &&
        state.tokens.next.id !== "." && state.tokens.next.id !== "[") {
        warning("W068", this);
      }
    }

    if (!exprs.length) {
      return;
    }
    if (exprs.length > 1) {
      ret = Object.create(state.syntax[","]);
      ret.exprs = exprs;

      first = exprs[0];
      last = exprs[exprs.length - 1];

      if (!isNecessary) {
        isNecessary = preceeding.assign || preceeding.delim;
      }
    } else {
      ret = first = last = exprs[0];

      if (!isNecessary) {
        isNecessary =
          (opening.beginsStmt && (ret.id === "{" || triggerFnExpr || isFunctor(ret))) ||
          (triggerFnExpr &&
            (!isEndOfExpr() || state.tokens.prev.id !== "}")) ||
          (isFunctor(ret) && !isEndOfExpr()) ||
          (ret.id === "{" && preceeding.id === "=>") ||
          (ret.type === "(number)" &&
            checkPunctuator(pn, ".") && /^\d+$/.test(ret.value));
      }
    }

    if (ret) {
      if (!isNecessary && (first.left || first.right || ret.exprs)) {
        isNecessary =
          (!isBeginOfExpr(preceeding) && first.lbp <= preceeding.lbp) ||
          (!isEndOfExpr() && last.lbp < state.tokens.next.lbp);
      }

      if (!isNecessary) {
        warning("W126", opening);
      }

      ret.paren = true;
    }

    return ret;
  });

  application("=>");

  infix("[", function(left, that) {
    var e = expression(10), s;
    if (e && e.type === "(string)") {
      if (!state.option.evil && (e.value === "eval" || e.value === "execScript")) {
        if (isGlobalEval(left, state)) {
          warning("W061");
        }
      }

      countMember(e.value);
      if (!state.option.sub && reg.identifier.test(e.value)) {
        s = state.syntax[e.value];
        if (!s || !isReserved(s)) {
          warning("W069", state.tokens.prev, e.value);
        }
      }
    }
    advance("]", that);

    if (e && e.value === "hasOwnProperty" && state.tokens.next.value === "=") {
      warning("W001");
    }

    that.left = left;
    that.right = e;
    return that;
  }, 160, true);

  function comprehensiveArrayExpression() {
    var res = {};
    res.exps = true;
    state.funct["(comparray)"].stack();
    var reversed = false;
    if (state.tokens.next.value !== "for") {
      reversed = true;
      if (!state.inMoz()) {
        warning("W116", state.tokens.next, "for", state.tokens.next.value);
      }
      state.funct["(comparray)"].setState("use");
      res.right = expression(10);
    }

    advance("for");
    if (state.tokens.next.value === "each") {
      advance("each");
      if (!state.inMoz()) {
        warning("W118", state.tokens.curr, "for each");
      }
    }
    advance("(");
    state.funct["(comparray)"].setState("define");
    res.left = expression(130);
    if (_.contains(["in", "of"], state.tokens.next.value)) {
      advance();
    } else {
      error("E045", state.tokens.curr);
    }
    state.funct["(comparray)"].setState("generate");
    expression(10);

    advance(")");
    if (state.tokens.next.value === "if") {
      advance("if");
      advance("(");
      state.funct["(comparray)"].setState("filter");
      res.filter = expression(10);
      advance(")");
    }

    if (!reversed) {
      state.funct["(comparray)"].setState("use");
      res.right = expression(10);
    }

    advance("]");
    state.funct["(comparray)"].unstack();
    return res;
  }

  prefix("[", function() {
    var blocktype = lookupBlockType();
    if (blocktype.isCompArray) {
      if (!state.option.esnext && !state.inMoz()) {
        warning("W118", state.tokens.curr, "array comprehension");
      }
      return comprehensiveArrayExpression();
    } else if (blocktype.isDestAssign) {
      this.destructAssign = destructuringPattern({ openingParsed: true, assignment: true });
      return this;
    }
    var b = state.tokens.curr.line !== startLine(state.tokens.next);
    this.first = [];
    if (b) {
      indent += state.option.indent;
      if (state.tokens.next.from === indent + state.option.indent) {
        indent += state.option.indent;
      }
    }
    while (state.tokens.next.id !== "(end)") {
      while (state.tokens.next.id === ",") {
        if (!state.option.elision) {
          if (!state.inES5()) {
            warning("W070");
          } else {
            warning("W128");
            do {
              advance(",");
            } while (state.tokens.next.id === ",");
            continue;
          }
        }
        advance(",");
      }

      if (state.tokens.next.id === "]") {
        break;
      }

      this.first.push(expression(10));
      if (state.tokens.next.id === ",") {
        comma({ allowTrailing: true });
        if (state.tokens.next.id === "]" && !state.inES5()) {
          warning("W070", state.tokens.curr);
          break;
        }
      } else {
        break;
      }
    }
    if (b) {
      indent -= state.option.indent;
    }
    advance("]", this);
    return this;
  });


  function isMethod() {
    return state.funct["(statement)"] && state.funct["(statement)"].type === "class" ||
           state.funct["(context)"] && state.funct["(context)"]["(verb)"] === "class";
  }


  function isPropertyName(token) {
    return token.identifier || token.id === "(string)" || token.id === "(number)";
  }


  function propertyName(preserveOrToken) {
    var id;
    var preserve = true;
    if (typeof preserveOrToken === "object") {
      id = preserveOrToken;
    } else {
      preserve = preserveOrToken;
      id = optionalidentifier(false, true, preserve);
    }

    if (!id) {
      if (state.tokens.next.id === "(string)") {
        id = state.tokens.next.value;
        if (!preserve) {
          advance();
        }
      } else if (state.tokens.next.id === "(number)") {
        id = state.tokens.next.value.toString();
        if (!preserve) {
          advance();
        }
      }
    } else if (typeof id === "object") {
      if (id.id === "(string)" || id.id === "(identifier)") id = id.value;
      else if (id.id === "(number)") id = id.value.toString();
    }

    if (id === "hasOwnProperty") {
      warning("W001");
    }

    return id;
  }
  function functionparams(options) {
    var next;
    var paramsIds = [];
    var ident;
    var tokens = [];
    var t;
    var pastDefault = false;
    var pastRest = false;
    var arity = 0;
    var loneArg = options && options.loneArg;

    if (loneArg && loneArg.identifier === true) {
      state.funct["(scope)"].addParam(loneArg.value, loneArg);
      return { arity: 1, params: [ loneArg.value ] };
    }

    next = state.tokens.next;

    if (!options || !options.parsedOpening) {
      advance("(");
    }

    if (state.tokens.next.id === ")") {
      advance(")");
      return;
    }

    function addParam(addParamArgs) {
      state.funct["(scope)"].addParam.apply(state.funct["(scope)"], addParamArgs);
    }

    for (;;) {
      arity++;
      var currentParams = [];

      if (_.contains(["{", "["], state.tokens.next.id)) {
        tokens = destructuringPattern();
        for (t in tokens) {
          t = tokens[t];
          if (t.id) {
            paramsIds.push(t.id);
            currentParams.push([t.id, t.token]);
          }
        }
      } else {
        if (checkPunctuator(state.tokens.next, "...")) pastRest = true;
        ident = identifier(true);
        if (ident) {
          paramsIds.push(ident);
          currentParams.push([ident, state.tokens.curr]);
        } else {
          while (!checkPunctuators(state.tokens.next, [",", ")"])) advance();
        }
      }
      if (pastDefault) {
        if (state.tokens.next.id !== "=") {
          error("W138", state.tokens.current);
        }
      }
      if (state.tokens.next.id === "=") {
        if (!state.inES6()) {
          warning("W119", state.tokens.next, "default parameters", "6");
        }
        advance("=");
        pastDefault = true;
        expression(10);
      }
      currentParams.forEach(addParam);

      if (state.tokens.next.id === ",") {
        if (pastRest) {
          warning("W131", state.tokens.next);
        }
        comma();
      } else {
        advance(")", next);
        return { arity: arity, params: paramsIds };
      }
    }
  }

  function functor(name, token, overwrites) {
    var funct = {
      "(name)"      : name,
      "(breakage)"  : 0,
      "(loopage)"   : 0,
      "(tokens)"    : {},
      "(properties)": {},

      "(catch)"     : false,
      "(global)"    : false,

      "(line)"      : null,
      "(character)" : null,
      "(metrics)"   : null,
      "(statement)" : null,
      "(context)"   : null,
      "(scope)"     : null,
      "(comparray)" : null,
      "(generator)" : null,
      "(arrow)"     : null,
      "(params)"    : null
    };

    if (token) {
      _.extend(funct, {
        "(line)"     : token.line,
        "(character)": token.character,
        "(metrics)"  : createMetrics(token)
      });
    }

    _.extend(funct, overwrites);

    if (funct["(context)"]) {
      funct["(scope)"] = funct["(context)"]["(scope)"];
      funct["(comparray)"]  = funct["(context)"]["(comparray)"];
    }

    return funct;
  }

  function isFunctor(token) {
    return "(scope)" in token;
  }
  function hasParsedCode(funct) {
    return funct["(global)"] && !funct["(verb)"];
  }

  function doTemplateLiteral(left) {
    var ctx = this.context;
    var noSubst = this.noSubst;
    var depth = this.depth;

    if (!noSubst) {
      while (!end()) {
        if (!state.tokens.next.template || state.tokens.next.depth > depth) {
          expression(0); // should probably have different rbp?
        } else {
          advance();
        }
      }
    }

    return {
      id: "(template)",
      type: "(template)",
      tag: left
    };

    function end() {
      if (state.tokens.curr.template && state.tokens.curr.tail &&
          state.tokens.curr.context === ctx) return true;
      var complete = (state.tokens.next.template && state.tokens.next.tail &&
                      state.tokens.next.context === ctx);
      if (complete) advance();
      return complete || state.tokens.next.isUnclosed;
    }
  }
  function doFunction(options) {
    var f, token, name, statement, classExprBinding, isGenerator, isArrow, ignoreLoopFunc;
    var oldOption = state.option;
    var oldIgnored = state.ignored;

    if (options) {
      name = options.name;
      statement = options.statement;
      classExprBinding = options.classExprBinding;
      isGenerator = options.type === "generator";
      isArrow = options.type === "arrow";
      ignoreLoopFunc = options.ignoreLoopFunc;
    }

    state.option = Object.create(state.option);
    state.ignored = Object.create(state.ignored);

    state.funct = functor(name || state.nameStack.infer(), state.tokens.next, {
      "(statement)": statement,
      "(context)":   state.funct,
      "(arrow)":     isArrow,
      "(generator)": isGenerator
    });

    f = state.funct;
    token = state.tokens.curr;
    token.funct = state.funct;

    functions.push(state.funct);
    state.funct["(scope)"].stack("functionouter");
    var internallyAccessibleName = name || classExprBinding;
    if (internallyAccessibleName) {
      state.funct["(scope)"].block.add(internallyAccessibleName,
        classExprBinding ? "class" : "function", state.tokens.curr, false);
    }
    state.funct["(scope)"].stack("functionparams");

    var paramsInfo = functionparams(options);

    if (paramsInfo) {
      state.funct["(params)"] = paramsInfo.params;
      state.funct["(metrics)"].arity = paramsInfo.arity;
      state.funct["(metrics)"].verifyMaxParametersPerFunction();
    } else {
      state.funct["(metrics)"].arity = 0;
    }

    if (isArrow) {
      if (!state.inES6(true)) {
        warning("W119", state.tokens.curr, "arrow function syntax (=>)", "6");
      }

      if (!options.loneArg) {
        advance("=>");
      }
    }

    block(false, true, true, isArrow);

    if (!state.option.noyield && isGenerator &&
        state.funct["(generator)"] !== "yielded") {
      warning("W124", state.tokens.curr);
    }

    state.funct["(metrics)"].verifyMaxStatementsPerFunction();
    state.funct["(metrics)"].verifyMaxComplexityPerFunction();
    state.funct["(unusedOption)"] = state.option.unused;
    state.option = oldOption;
    state.ignored = oldIgnored;
    state.funct["(last)"] = state.tokens.curr.line;
    state.funct["(lastcharacter)"] = state.tokens.curr.character;
    state.funct["(scope)"].unstack(); // also does usage and label checks
    state.funct["(scope)"].unstack();

    state.funct = state.funct["(context)"];

    if (!ignoreLoopFunc && !state.option.loopfunc && state.funct["(loopage)"]) {
      if (f["(isCapturing)"]) {
        warning("W083", token);
      }
    }

    return f;
  }

  function createMetrics(functionStartToken) {
    return {
      statementCount: 0,
      nestedBlockDepth: -1,
      ComplexityCount: 1,
      arity: 0,

      verifyMaxStatementsPerFunction: function() {
        if (state.option.maxstatements &&
          this.statementCount > state.option.maxstatements) {
          warning("W071", functionStartToken, this.statementCount);
        }
      },

      verifyMaxParametersPerFunction: function() {
        if (_.isNumber(state.option.maxparams) &&
          this.arity > state.option.maxparams) {
          warning("W072", functionStartToken, this.arity);
        }
      },

      verifyMaxNestedBlockDepthPerFunction: function() {
        if (state.option.maxdepth &&
          this.nestedBlockDepth > 0 &&
          this.nestedBlockDepth === state.option.maxdepth + 1) {
          warning("W073", null, this.nestedBlockDepth);
        }
      },

      verifyMaxComplexityPerFunction: function() {
        var max = state.option.maxcomplexity;
        var cc = this.ComplexityCount;
        if (max && cc > max) {
          warning("W074", functionStartToken, cc);
        }
      }
    };
  }

  function increaseComplexityCount() {
    state.funct["(metrics)"].ComplexityCount += 1;
  }

  function checkCondAssignment(expr) {
    var id, paren;
    if (expr) {
      id = expr.id;
      paren = expr.paren;
      if (id === "," && (expr = expr.exprs[expr.exprs.length - 1])) {
        id = expr.id;
        paren = paren || expr.paren;
      }
    }
    switch (id) {
    case "=":
    case "+=":
    case "-=":
    case "*=":
    case "%=":
    case "&=":
    case "|=":
    case "^=":
    case "/=":
      if (!paren && !state.option.boss) {
        warning("W084");
      }
    }
  }
  function checkProperties(props) {
    if (state.inES5()) {
      for (var name in props) {
        if (props[name] && props[name].setterToken && !props[name].getterToken) {
          warning("W078", props[name].setterToken);
        }
      }
    }
  }

  function metaProperty(name, c) {
    if (checkPunctuator(state.tokens.next, ".")) {
      var left = state.tokens.curr.id;
      advance(".");
      var id = identifier();
      state.tokens.curr.isMetaProperty = true;
      if (name !== id) {
        error("E057", state.tokens.prev, left, id);
      } else {
        c();
      }
      return state.tokens.curr;
    }
  }

  (function(x) {
    x.nud = function() {
      var b, f, i, p, t, isGeneratorMethod = false, nextVal;
      var props = Object.create(null); // All properties, including accessors

      b = state.tokens.curr.line !== startLine(state.tokens.next);
      if (b) {
        indent += state.option.indent;
        if (state.tokens.next.from === indent + state.option.indent) {
          indent += state.option.indent;
        }
      }

      var blocktype = lookupBlockType();
      if (blocktype.isDestAssign) {
        this.destructAssign = destructuringPattern({ openingParsed: true, assignment: true });
        return this;
      }

      for (;;) {
        if (state.tokens.next.id === "}") {
          break;
        }

        nextVal = state.tokens.next.value;
        if (state.tokens.next.identifier &&
            (peekIgnoreEOL().id === "," || peekIgnoreEOL().id === "}")) {
          if (!state.inES6()) {
            warning("W104", state.tokens.next, "object short notation", "6");
          }
          i = propertyName(true);
          saveProperty(props, i, state.tokens.next);

          expression(10);

        } else if (peek().id !== ":" && (nextVal === "get" || nextVal === "set")) {
          advance(nextVal);

          if (!state.inES5()) {
            error("E034");
          }

          i = propertyName();
          if (!i && !state.inES6()) {
            error("E035");
          }
          if (i) {
            saveAccessor(nextVal, props, i, state.tokens.curr);
          }

          t = state.tokens.next;
          f = doFunction();
          p = f["(params)"];
          if (nextVal === "get" && i && p) {
            warning("W076", t, p[0], i);
          } else if (nextVal === "set" && i && (!p || p.length !== 1)) {
            warning("W077", t, i);
          }
        } else {
          if (state.tokens.next.value === "*" && state.tokens.next.type === "(punctuator)") {
            if (!state.inES6()) {
              warning("W104", state.tokens.next, "generator functions", "6");
            }
            advance("*");
            isGeneratorMethod = true;
          } else {
            isGeneratorMethod = false;
          }

          if (state.tokens.next.id === "[") {
            i = computedPropertyName();
            state.nameStack.set(i);
          } else {
            state.nameStack.set(state.tokens.next);
            i = propertyName();
            saveProperty(props, i, state.tokens.next);

            if (typeof i !== "string") {
              break;
            }
          }

          if (state.tokens.next.value === "(") {
            if (!state.inES6()) {
              warning("W104", state.tokens.curr, "concise methods", "6");
            }
            doFunction({ type: isGeneratorMethod ? "generator" : null });
          } else {
            advance(":");
            expression(10);
          }
        }

        countMember(i);

        if (state.tokens.next.id === ",") {
          comma({ allowTrailing: true, property: true });
          if (state.tokens.next.id === ",") {
            warning("W070", state.tokens.curr);
          } else if (state.tokens.next.id === "}" && !state.inES5()) {
            warning("W070", state.tokens.curr);
          }
        } else {
          break;
        }
      }
      if (b) {
        indent -= state.option.indent;
      }
      advance("}", this);

      checkProperties(props);

      return this;
    };
    x.fud = function() {
      error("E036", state.tokens.curr);
    };
  }(delim("{")));

  function destructuringPattern(options) {
    var isAssignment = options && options.assignment;

    if (!state.inES6()) {
      warning("W104", state.tokens.curr,
        isAssignment ? "destructuring assignment" : "destructuring binding", "6");
    }

    return destructuringPatternRecursive(options);
  }

  function destructuringPatternRecursive(options) {
    var ids;
    var identifiers = [];
    var openingParsed = options && options.openingParsed;
    var isAssignment = options && options.assignment;
    var recursiveOptions = isAssignment ? { assignment: isAssignment } : null;
    var firstToken = openingParsed ? state.tokens.curr : state.tokens.next;

    var nextInnerDE = function() {
      var ident;
      if (checkPunctuators(state.tokens.next, ["[", "{"])) {
        ids = destructuringPatternRecursive(recursiveOptions);
        for (var id in ids) {
          id = ids[id];
          identifiers.push({ id: id.id, token: id.token });
        }
      } else if (checkPunctuator(state.tokens.next, ",")) {
        identifiers.push({ id: null, token: state.tokens.curr });
      } else if (checkPunctuator(state.tokens.next, "(")) {
        advance("(");
        nextInnerDE();
        advance(")");
      } else {
        var is_rest = checkPunctuator(state.tokens.next, "...");

        if (isAssignment) {
          var identifierToken = is_rest ? peek(0) : state.tokens.next;
          if (!identifierToken.identifier) {
            warning("E030", identifierToken, identifierToken.value);
          }
          var assignTarget = expression(155);
          if (assignTarget) {
            checkLeftSideAssign(assignTarget);
            if (assignTarget.identifier) {
              ident = assignTarget.value;
            }
          }
        } else {
          ident = identifier();
        }
        if (ident) {
          identifiers.push({ id: ident, token: state.tokens.curr });
        }
        return is_rest;
      }
      return false;
    };
    var assignmentProperty = function() {
      var id;
      if (checkPunctuator(state.tokens.next, "[")) {
        advance("[");
        expression(10);
        advance("]");
        advance(":");
        nextInnerDE();
      } else if (state.tokens.next.id === "(string)" ||
                 state.tokens.next.id === "(number)") {
        advance();
        advance(":");
        nextInnerDE();
      } else {
        id = identifier();
        if (checkPunctuator(state.tokens.next, ":")) {
          advance(":");
          nextInnerDE();
        } else if (id) {
          if (isAssignment) {
            checkLeftSideAssign(state.tokens.curr);
          }
          identifiers.push({ id: id, token: state.tokens.curr });
        }
      }
    };
    if (checkPunctuator(firstToken, "[")) {
      if (!openingParsed) {
        advance("[");
      }
      if (checkPunctuator(state.tokens.next, "]")) {
        warning("W137", state.tokens.curr);
      }
      var element_after_rest = false;
      while (!checkPunctuator(state.tokens.next, "]")) {
        if (nextInnerDE() && !element_after_rest &&
            checkPunctuator(state.tokens.next, ",")) {
          warning("W130", state.tokens.next);
          element_after_rest = true;
        }
        if (checkPunctuator(state.tokens.next, "=")) {
          if (checkPunctuator(state.tokens.prev, "...")) {
            advance("]");
          } else {
            advance("=");
          }
          if (state.tokens.next.id === "undefined") {
            warning("W080", state.tokens.prev, state.tokens.prev.value);
          }
          expression(10);
        }
        if (!checkPunctuator(state.tokens.next, "]")) {
          advance(",");
        }
      }
      advance("]");
    } else if (checkPunctuator(firstToken, "{")) {

      if (!openingParsed) {
        advance("{");
      }
      if (checkPunctuator(state.tokens.next, "}")) {
        warning("W137", state.tokens.curr);
      }
      while (!checkPunctuator(state.tokens.next, "}")) {
        assignmentProperty();
        if (checkPunctuator(state.tokens.next, "=")) {
          advance("=");
          if (state.tokens.next.id === "undefined") {
            warning("W080", state.tokens.prev, state.tokens.prev.value);
          }
          expression(10);
        }
        if (!checkPunctuator(state.tokens.next, "}")) {
          advance(",");
          if (checkPunctuator(state.tokens.next, "}")) {
            break;
          }
        }
      }
      advance("}");
    }
    return identifiers;
  }

  function destructuringPatternMatch(tokens, value) {
    var first = value.first;

    if (!first)
      return;

    _.zip(tokens, Array.isArray(first) ? first : [ first ]).forEach(function(val) {
      var token = val[0];
      var value = val[1];

      if (token && value)
        token.first = value;
      else if (token && token.first && !value)
        warning("W080", token.first, token.first.value);
    });
  }

  function blockVariableStatement(type, statement, context) {

    var prefix = context && context.prefix;
    var inexport = context && context.inexport;
    var isLet = type === "let";
    var isConst = type === "const";
    var tokens, lone, value, letblock;

    if (!state.inES6()) {
      warning("W104", state.tokens.curr, type, "6");
    }

    if (isLet && state.tokens.next.value === "(") {
      if (!state.inMoz()) {
        warning("W118", state.tokens.next, "let block");
      }
      advance("(");
      state.funct["(scope)"].stack();
      letblock = true;
    } else if (state.funct["(noblockscopedvar)"]) {
      error("E048", state.tokens.curr, isConst ? "Const" : "Let");
    }

    statement.first = [];
    for (;;) {
      var names = [];
      if (_.contains(["{", "["], state.tokens.next.value)) {
        tokens = destructuringPattern();
        lone = false;
      } else {
        tokens = [ { id: identifier(), token: state.tokens.curr } ];
        lone = true;
      }

      if (!prefix && isConst && state.tokens.next.id !== "=") {
        warning("E012", state.tokens.curr, state.tokens.curr.value);
      }

      for (var t in tokens) {
        if (tokens.hasOwnProperty(t)) {
          t = tokens[t];
          if (state.funct["(scope)"].block.isGlobal()) {
            if (predefined[t.id] === false) {
              warning("W079", t.token, t.id);
            }
          }
          if (t.id && !state.funct["(noblockscopedvar)"]) {
            state.funct["(scope)"].addlabel(t.id, {
              type: type,
              token: t.token });
            names.push(t.token);

            if (lone && inexport) {
              state.funct["(scope)"].setExported(t.token.value, t.token);
            }
          }
        }
      }

      if (state.tokens.next.id === "=") {
        advance("=");
        if (!prefix && state.tokens.next.id === "undefined") {
          warning("W080", state.tokens.prev, state.tokens.prev.value);
        }
        if (!prefix && peek(0).id === "=" && state.tokens.next.identifier) {
          warning("W120", state.tokens.next, state.tokens.next.value);
        }
        value = expression(prefix ? 120 : 10);
        if (lone) {
          tokens[0].first = value;
        } else {
          destructuringPatternMatch(names, value);
        }
      }

      statement.first = statement.first.concat(names);

      if (state.tokens.next.id !== ",") {
        break;
      }
      comma();
    }
    if (letblock) {
      advance(")");
      block(true, true);
      statement.block = true;
      state.funct["(scope)"].unstack();
    }

    return statement;
  }

  var conststatement = stmt("const", function(context) {
    return blockVariableStatement("const", this, context);
  });
  conststatement.exps = true;

  var letstatement = stmt("let", function(context) {
    return blockVariableStatement("let", this, context);
  });
  letstatement.exps = true;

  var varstatement = stmt("var", function(context) {
    var prefix = context && context.prefix;
    var inexport = context && context.inexport;
    var tokens, lone, value;
    var implied = context && context.implied;
    var report = !(context && context.ignore);

    this.first = [];
    for (;;) {
      var names = [];
      if (_.contains(["{", "["], state.tokens.next.value)) {
        tokens = destructuringPattern();
        lone = false;
      } else {
        tokens = [ { id: identifier(), token: state.tokens.curr } ];
        lone = true;
      }

      if (!(prefix && implied) && report && state.option.varstmt) {
        warning("W132", this);
      }

      this.first = this.first.concat(names);

      for (var t in tokens) {
        if (tokens.hasOwnProperty(t)) {
          t = tokens[t];
          if (!implied && state.funct["(global)"]) {
            if (predefined[t.id] === false) {
              warning("W079", t.token, t.id);
            } else if (state.option.futurehostile === false) {
              if ((!state.inES5() && vars.ecmaIdentifiers[5][t.id] === false) ||
                (!state.inES6() && vars.ecmaIdentifiers[6][t.id] === false)) {
                warning("W129", t.token, t.id);
              }
            }
          }
          if (t.id) {
            if (implied === "for") {

              if (!state.funct["(scope)"].has(t.id)) {
                if (report) warning("W088", t.token, t.id);
              }
              state.funct["(scope)"].block.use(t.id, t.token);
            } else {
              state.funct["(scope)"].addlabel(t.id, {
                type: "var",
                token: t.token });

              if (lone && inexport) {
                state.funct["(scope)"].setExported(t.id, t.token);
              }
            }
            names.push(t.token);
          }
        }
      }

      if (state.tokens.next.id === "=") {
        state.nameStack.set(state.tokens.curr);

        advance("=");
        if (!prefix && report && !state.funct["(loopage)"] &&
          state.tokens.next.id === "undefined") {
          warning("W080", state.tokens.prev, state.tokens.prev.value);
        }
        if (peek(0).id === "=" && state.tokens.next.identifier) {
          if (!prefix && report &&
              !state.funct["(params)"] ||
              state.funct["(params)"].indexOf(state.tokens.next.value) === -1) {
            warning("W120", state.tokens.next, state.tokens.next.value);
          }
        }
        value = expression(prefix ? 120 : 10);
        if (lone) {
          tokens[0].first = value;
        } else {
          destructuringPatternMatch(names, value);
        }
      }

      if (state.tokens.next.id !== ",") {
        break;
      }
      comma();
    }

    return this;
  });
  varstatement.exps = true;

  blockstmt("class", function() {
    return classdef.call(this, true);
  });

  function classdef(isStatement) {
    if (!state.inES6()) {
      warning("W104", state.tokens.curr, "class", "6");
    }
    if (isStatement) {
      this.name = identifier();

      state.funct["(scope)"].addlabel(this.name, {
        type: "class",
        token: state.tokens.curr });
    } else if (state.tokens.next.identifier && state.tokens.next.value !== "extends") {
      this.name = identifier();
      this.namedExpr = true;
    } else {
      this.name = state.nameStack.infer();
    }
    classtail(this);
    return this;
  }

  function classtail(c) {
    var wasInClassBody = state.inClassBody;
    if (state.tokens.next.value === "extends") {
      advance("extends");
      c.heritage = expression(10);
    }

    state.inClassBody = true;
    advance("{");
    c.body = classbody(c);
    advance("}");
    state.inClassBody = wasInClassBody;
  }

  function classbody(c) {
    var name;
    var isStatic;
    var isGenerator;
    var getset;
    var props = Object.create(null);
    var staticProps = Object.create(null);
    var computed;
    for (var i = 0; state.tokens.next.id !== "}"; ++i) {
      name = state.tokens.next;
      isStatic = false;
      isGenerator = false;
      getset = null;
      if (name.id === ";") {
        warning("W032");
        advance(";");
        continue;
      }

      if (name.id === "*") {
        isGenerator = true;
        advance("*");
        name = state.tokens.next;
      }
      if (name.id === "[") {
        name = computedPropertyName();
        computed = true;
      } else if (isPropertyName(name)) {
        advance();
        computed = false;
        if (name.identifier && name.value === "static") {
          if (checkPunctuator(state.tokens.next, "*")) {
            isGenerator = true;
            advance("*");
          }
          if (isPropertyName(state.tokens.next) || state.tokens.next.id === "[") {
            computed = state.tokens.next.id === "[";
            isStatic = true;
            name = state.tokens.next;
            if (state.tokens.next.id === "[") {
              name = computedPropertyName();
            } else advance();
          }
        }

        if (name.identifier && (name.value === "get" || name.value === "set")) {
          if (isPropertyName(state.tokens.next) || state.tokens.next.id === "[") {
            computed = state.tokens.next.id === "[";
            getset = name;
            name = state.tokens.next;
            if (state.tokens.next.id === "[") {
              name = computedPropertyName();
            } else advance();
          }
        }
      } else {
        warning("W052", state.tokens.next, state.tokens.next.value || state.tokens.next.type);
        advance();
        continue;
      }

      if (!checkPunctuator(state.tokens.next, "(")) {
        error("E054", state.tokens.next, state.tokens.next.value);
        while (state.tokens.next.id !== "}" &&
               !checkPunctuator(state.tokens.next, "(")) {
          advance();
        }
        if (state.tokens.next.value !== "(") {
          doFunction({ statement: c });
        }
      }

      if (!computed) {
        if (getset) {
          saveAccessor(
            getset.value, isStatic ? staticProps : props, name.value, name, true, isStatic);
        } else {
          if (name.value === "constructor") {
            state.nameStack.set(c);
          } else {
            state.nameStack.set(name);
          }
          saveProperty(isStatic ? staticProps : props, name.value, name, true, isStatic);
        }
      }

      if (getset && name.value === "constructor") {
        var propDesc = getset.value === "get" ? "class getter method" : "class setter method";
        error("E049", name, propDesc, "constructor");
      } else if (name.value === "prototype") {
        error("E049", name, "class method", "prototype");
      }

      propertyName(name);

      doFunction({
        statement: c,
        type: isGenerator ? "generator" : null,
        classExprBinding: c.namedExpr ? c.name : null
      });
    }

    checkProperties(props);
  }

  blockstmt("function", function(context) {
    var inexport = context && context.inexport;
    var generator = false;
    if (state.tokens.next.value === "*") {
      advance("*");
      if (state.inES6({ strict: true })) {
        generator = true;
      } else {
        warning("W119", state.tokens.curr, "function*", "6");
      }
    }
    if (inblock) {
      warning("W082", state.tokens.curr);
    }
    var i = optionalidentifier();

    state.funct["(scope)"].addlabel(i, {
      type: "function",
      token: state.tokens.curr });

    if (i === undefined) {
      warning("W025");
    } else if (inexport) {
      state.funct["(scope)"].setExported(i, state.tokens.prev);
    }

    doFunction({
      name: i,
      statement: this,
      type: generator ? "generator" : null,
      ignoreLoopFunc: inblock // a declaration may already have warned
    });
    if (state.tokens.next.id === "(" && state.tokens.next.line === state.tokens.curr.line) {
      error("E039");
    }
    return this;
  });

  prefix("function", function() {
    var generator = false;

    if (state.tokens.next.value === "*") {
      if (!state.inES6()) {
        warning("W119", state.tokens.curr, "function*", "6");
      }
      advance("*");
      generator = true;
    }

    var i = optionalidentifier();
    doFunction({ name: i, type: generator ? "generator" : null });
    return this;
  });

  blockstmt("if", function() {
    var t = state.tokens.next;
    increaseComplexityCount();
    state.condition = true;
    advance("(");
    var expr = expression(0);
    checkCondAssignment(expr);
    var forinifcheck = null;
    if (state.option.forin && state.forinifcheckneeded) {
      state.forinifcheckneeded = false; // We only need to analyze the first if inside the loop
      forinifcheck = state.forinifchecks[state.forinifchecks.length - 1];
      if (expr.type === "(punctuator)" && expr.value === "!") {
        forinifcheck.type = "(negative)";
      } else {
        forinifcheck.type = "(positive)";
      }
    }

    advance(")", t);
    state.condition = false;
    var s = block(true, true);
    if (forinifcheck && forinifcheck.type === "(negative)") {
      if (s && s[0] && s[0].type === "(identifier)" && s[0].value === "continue") {
        forinifcheck.type = "(negative-with-continue)";
      }
    }

    if (state.tokens.next.id === "else") {
      advance("else");
      if (state.tokens.next.id === "if" || state.tokens.next.id === "switch") {
        statement();
      } else {
        block(true, true);
      }
    }
    return this;
  });

  blockstmt("try", function() {
    var b;

    function doCatch() {
      advance("catch");
      advance("(");

      state.funct["(scope)"].stack("catchparams");

      if (checkPunctuators(state.tokens.next, ["[", "{"])) {
        var tokens = destructuringPattern();
        _.each(tokens, function(token) {
          if (token.id) {
            state.funct["(scope)"].addParam(token.id, token, "exception");
          }
        });
      } else if (state.tokens.next.type !== "(identifier)") {
        warning("E030", state.tokens.next, state.tokens.next.value);
      } else {
        state.funct["(scope)"].addParam(identifier(), state.tokens.curr, "exception");
      }

      if (state.tokens.next.value === "if") {
        if (!state.inMoz()) {
          warning("W118", state.tokens.curr, "catch filter");
        }
        advance("if");
        expression(0);
      }

      advance(")");

      block(false);

      state.funct["(scope)"].unstack();
    }

    block(true);

    while (state.tokens.next.id === "catch") {
      increaseComplexityCount();
      if (b && (!state.inMoz())) {
        warning("W118", state.tokens.next, "multiple catch blocks");
      }
      doCatch();
      b = true;
    }

    if (state.tokens.next.id === "finally") {
      advance("finally");
      block(true);
      return;
    }

    if (!b) {
      error("E021", state.tokens.next, "catch", state.tokens.next.value);
    }

    return this;
  });

  blockstmt("while", function() {
    var t = state.tokens.next;
    state.funct["(breakage)"] += 1;
    state.funct["(loopage)"] += 1;
    increaseComplexityCount();
    advance("(");
    checkCondAssignment(expression(0));
    advance(")", t);
    block(true, true);
    state.funct["(breakage)"] -= 1;
    state.funct["(loopage)"] -= 1;
    return this;
  }).labelled = true;

  blockstmt("with", function() {
    var t = state.tokens.next;
    if (state.isStrict()) {
      error("E010", state.tokens.curr);
    } else if (!state.option.withstmt) {
      warning("W085", state.tokens.curr);
    }

    advance("(");
    expression(0);
    advance(")", t);
    block(true, true);

    return this;
  });

  blockstmt("switch", function() {
    var t = state.tokens.next;
    var g = false;
    var noindent = false;

    state.funct["(breakage)"] += 1;
    advance("(");
    checkCondAssignment(expression(0));
    advance(")", t);
    t = state.tokens.next;
    advance("{");

    if (state.tokens.next.from === indent)
      noindent = true;

    if (!noindent)
      indent += state.option.indent;

    this.cases = [];

    for (;;) {
      switch (state.tokens.next.id) {
      case "case":
        switch (state.funct["(verb)"]) {
        case "yield":
        case "break":
        case "case":
        case "continue":
        case "return":
        case "switch":
        case "throw":
          break;
        default:
          if (!state.tokens.curr.caseFallsThrough) {
            warning("W086", state.tokens.curr, "case");
          }
        }

        advance("case");
        this.cases.push(expression(0));
        increaseComplexityCount();
        g = true;
        advance(":");
        state.funct["(verb)"] = "case";
        break;
      case "default":
        switch (state.funct["(verb)"]) {
        case "yield":
        case "break":
        case "continue":
        case "return":
        case "throw":
          break;
        default:
          if (this.cases.length) {
            if (!state.tokens.curr.caseFallsThrough) {
              warning("W086", state.tokens.curr, "default");
            }
          }
        }

        advance("default");
        g = true;
        advance(":");
        break;
      case "}":
        if (!noindent)
          indent -= state.option.indent;

        advance("}", t);
        state.funct["(breakage)"] -= 1;
        state.funct["(verb)"] = undefined;
        return;
      case "(end)":
        error("E023", state.tokens.next, "}");
        return;
      default:
        indent += state.option.indent;
        if (g) {
          switch (state.tokens.curr.id) {
          case ",":
            error("E040");
            return;
          case ":":
            g = false;
            statements();
            break;
          default:
            error("E025", state.tokens.curr);
            return;
          }
        } else {
          if (state.tokens.curr.id === ":") {
            advance(":");
            error("E024", state.tokens.curr, ":");
            statements();
          } else {
            error("E021", state.tokens.next, "case", state.tokens.next.value);
            return;
          }
        }
        indent -= state.option.indent;
      }
    }
    return this;
  }).labelled = true;

  stmt("debugger", function() {
    if (!state.option.debug) {
      warning("W087", this);
    }
    return this;
  }).exps = true;

  (function() {
    var x = stmt("do", function() {
      state.funct["(breakage)"] += 1;
      state.funct["(loopage)"] += 1;
      increaseComplexityCount();

      this.first = block(true, true);
      advance("while");
      var t = state.tokens.next;
      advance("(");
      checkCondAssignment(expression(0));
      advance(")", t);
      state.funct["(breakage)"] -= 1;
      state.funct["(loopage)"] -= 1;
      return this;
    });
    x.labelled = true;
    x.exps = true;
  }());

  blockstmt("for", function() {
    var s, t = state.tokens.next;
    var letscope = false;
    var foreachtok = null;

    if (t.value === "each") {
      foreachtok = t;
      advance("each");
      if (!state.inMoz()) {
        warning("W118", state.tokens.curr, "for each");
      }
    }

    increaseComplexityCount();
    advance("(");
    var nextop; // contains the token of the "in" or "of" operator
    var i = 0;
    var inof = ["in", "of"];
    var level = 0; // BindingPattern "level" --- level 0 === no BindingPattern
    var comma; // First comma punctuator at level 0
    var initializer; // First initializer at level 0
    if (checkPunctuators(state.tokens.next, ["{", "["])) ++level;
    do {
      nextop = peek(i);
      ++i;
      if (checkPunctuators(nextop, ["{", "["])) ++level;
      else if (checkPunctuators(nextop, ["}", "]"])) --level;
      if (level < 0) break;
      if (level === 0) {
        if (!comma && checkPunctuator(nextop, ",")) comma = nextop;
        else if (!initializer && checkPunctuator(nextop, "=")) initializer = nextop;
      }
    } while (level > 0 || !_.contains(inof, nextop.value) && nextop.value !== ";" &&
    nextop.type !== "(end)"); // Is this a JSCS bug? This looks really weird.
    if (_.contains(inof, nextop.value)) {
      if (!state.inES6() && nextop.value === "of") {
        warning("W104", nextop, "for of", "6");
      }

      var ok = !(initializer || comma);
      if (initializer) {
        error("W133", comma, nextop.value, "initializer is forbidden");
      }

      if (comma) {
        error("W133", comma, nextop.value, "more than one ForBinding");
      }

      if (state.tokens.next.id === "var") {
        advance("var");
        state.tokens.curr.fud({ prefix: true });
      } else if (state.tokens.next.id === "let" || state.tokens.next.id === "const") {
        advance(state.tokens.next.id);
        letscope = true;
        state.funct["(scope)"].stack();
        state.tokens.curr.fud({ prefix: true });
      } else {
        Object.create(varstatement).fud({ prefix: true, implied: "for", ignore: !ok });
      }
      advance(nextop.value);
      expression(20);
      advance(")", t);

      if (nextop.value === "in" && state.option.forin) {
        state.forinifcheckneeded = true;

        if (state.forinifchecks === undefined) {
          state.forinifchecks = [];
        }
        state.forinifchecks.push({
          type: "(none)"
        });
      }

      state.funct["(breakage)"] += 1;
      state.funct["(loopage)"] += 1;

      s = block(true, true);

      if (nextop.value === "in" && state.option.forin) {
        if (state.forinifchecks && state.forinifchecks.length > 0) {
          var check = state.forinifchecks.pop();

          if (// No if statement or not the first statement in loop body
              s && s.length > 0 && (typeof s[0] !== "object" || s[0].value !== "if") ||
              check.type === "(positive)" && s.length > 1 ||
              check.type === "(negative)") {
            warning("W089", this);
          }
        }
        state.forinifcheckneeded = false;
      }

      state.funct["(breakage)"] -= 1;
      state.funct["(loopage)"] -= 1;
    } else {
      if (foreachtok) {
        error("E045", foreachtok);
      }
      if (state.tokens.next.id !== ";") {
        if (state.tokens.next.id === "var") {
          advance("var");
          state.tokens.curr.fud();
        } else if (state.tokens.next.id === "let") {
          advance("let");
          letscope = true;
          state.funct["(scope)"].stack();
          state.tokens.curr.fud();
        } else {
          for (;;) {
            expression(0, "for");
            if (state.tokens.next.id !== ",") {
              break;
            }
            comma();
          }
        }
      }
      nolinebreak(state.tokens.curr);
      advance(";");
      state.funct["(loopage)"] += 1;
      if (state.tokens.next.id !== ";") {
        checkCondAssignment(expression(0));
      }
      nolinebreak(state.tokens.curr);
      advance(";");
      if (state.tokens.next.id === ";") {
        error("E021", state.tokens.next, ")", ";");
      }
      if (state.tokens.next.id !== ")") {
        for (;;) {
          expression(0, "for");
          if (state.tokens.next.id !== ",") {
            break;
          }
          comma();
        }
      }
      advance(")", t);
      state.funct["(breakage)"] += 1;
      block(true, true);
      state.funct["(breakage)"] -= 1;
      state.funct["(loopage)"] -= 1;

    }
    if (letscope) {
      state.funct["(scope)"].unstack();
    }
    return this;
  }).labelled = true;


  stmt("break", function() {
    var v = state.tokens.next.value;

    if (!state.option.asi)
      nolinebreak(this);

    if (state.tokens.next.id !== ";" && !state.tokens.next.reach &&
        state.tokens.curr.line === startLine(state.tokens.next)) {
      if (!state.funct["(scope)"].funct.hasBreakLabel(v)) {
        warning("W090", state.tokens.next, v);
      }
      this.first = state.tokens.next;
      advance();
    } else {
      if (state.funct["(breakage)"] === 0)
        warning("W052", state.tokens.next, this.value);
    }

    reachable(this);

    return this;
  }).exps = true;


  stmt("continue", function() {
    var v = state.tokens.next.value;

    if (state.funct["(breakage)"] === 0)
      warning("W052", state.tokens.next, this.value);
    if (!state.funct["(loopage)"])
      warning("W052", state.tokens.next, this.value);

    if (!state.option.asi)
      nolinebreak(this);

    if (state.tokens.next.id !== ";" && !state.tokens.next.reach) {
      if (state.tokens.curr.line === startLine(state.tokens.next)) {
        if (!state.funct["(scope)"].funct.hasBreakLabel(v)) {
          warning("W090", state.tokens.next, v);
        }
        this.first = state.tokens.next;
        advance();
      }
    }

    reachable(this);

    return this;
  }).exps = true;


  stmt("return", function() {
    if (this.line === startLine(state.tokens.next)) {
      if (state.tokens.next.id !== ";" && !state.tokens.next.reach) {
        this.first = expression(0);

        if (this.first &&
            this.first.type === "(punctuator)" && this.first.value === "=" &&
            !this.first.paren && !state.option.boss) {
          warningAt("W093", this.first.line, this.first.character);
        }
      }
    } else {
      if (state.tokens.next.type === "(punctuator)" &&
        ["[", "{", "+", "-"].indexOf(state.tokens.next.value) > -1) {
        nolinebreak(this); // always warn (Line breaking error)
      }
    }

    reachable(this);

    return this;
  }).exps = true;

  (function(x) {
    x.exps = true;
    x.lbp = 25;
  }(prefix("yield", function() {
    var prev = state.tokens.prev;
    if (state.inES6(true) && !state.funct["(generator)"]) {
      if (!("(catch)" === state.funct["(name)"] && state.funct["(context)"]["(generator)"])) {
        error("E046", state.tokens.curr, "yield");
      }
    } else if (!state.inES6()) {
      warning("W104", state.tokens.curr, "yield", "6");
    }
    state.funct["(generator)"] = "yielded";
    var delegatingYield = false;

    if (state.tokens.next.value === "*") {
      delegatingYield = true;
      advance("*");
    }

    if (this.line === startLine(state.tokens.next) || !state.inMoz()) {
      if (delegatingYield ||
          (state.tokens.next.id !== ";" && !state.option.asi &&
           !state.tokens.next.reach && state.tokens.next.nud)) {

        nobreaknonadjacent(state.tokens.curr, state.tokens.next);
        this.first = expression(10);

        if (this.first.type === "(punctuator)" && this.first.value === "=" &&
            !this.first.paren && !state.option.boss) {
          warningAt("W093", this.first.line, this.first.character);
        }
      }

      if (state.inMoz() && state.tokens.next.id !== ")" &&
          (prev.lbp > 30 || (!prev.assign && !isEndOfExpr()) || prev.id === "yield")) {
        error("E050", this);
      }
    } else if (!state.option.asi) {
      nolinebreak(this); // always warn (Line breaking error)
    }
    return this;
  })));


  stmt("throw", function() {
    nolinebreak(this);
    this.first = expression(20);

    reachable(this);

    return this;
  }).exps = true;

  stmt("import", function() {
    if (!state.inES6()) {
      warning("W119", state.tokens.curr, "import", "6");
    }

    if (state.tokens.next.type === "(string)") {
      advance("(string)");
      return this;
    }

    if (state.tokens.next.identifier) {
      this.name = identifier();
      state.funct["(scope)"].addlabel(this.name, {
        type: "const",
        token: state.tokens.curr });

      if (state.tokens.next.value === ",") {
        advance(",");
      } else {
        advance("from");
        advance("(string)");
        return this;
      }
    }

    if (state.tokens.next.id === "*") {
      advance("*");
      advance("as");
      if (state.tokens.next.identifier) {
        this.name = identifier();
        state.funct["(scope)"].addlabel(this.name, {
          type: "const",
          token: state.tokens.curr });
      }
    } else {
      advance("{");
      for (;;) {
        if (state.tokens.next.value === "}") {
          advance("}");
          break;
        }
        var importName;
        if (state.tokens.next.type === "default") {
          importName = "default";
          advance("default");
        } else {
          importName = identifier();
        }
        if (state.tokens.next.value === "as") {
          advance("as");
          importName = identifier();
        }
        state.funct["(scope)"].addlabel(importName, {
          type: "const",
          token: state.tokens.curr });

        if (state.tokens.next.value === ",") {
          advance(",");
        } else if (state.tokens.next.value === "}") {
          advance("}");
          break;
        } else {
          error("E024", state.tokens.next, state.tokens.next.value);
          break;
        }
      }
    }
    advance("from");
    advance("(string)");
    return this;
  }).exps = true;

  stmt("export", function() {
    var ok = true;
    var token;
    var identifier;

    if (!state.inES6()) {
      warning("W119", state.tokens.curr, "export", "6");
      ok = false;
    }

    if (!state.funct["(scope)"].block.isGlobal()) {
      error("E053", state.tokens.curr);
      ok = false;
    }

    if (state.tokens.next.value === "*") {
      advance("*");
      advance("from");
      advance("(string)");
      return this;
    }

    if (state.tokens.next.type === "default") {
      state.nameStack.set(state.tokens.next);
      advance("default");
      var exportType = state.tokens.next.id;
      if (exportType === "function" || exportType === "class") {
        this.block = true;
      }

      token = peek();

      expression(10);

      identifier = token.value;

      if (this.block) {
        state.funct["(scope)"].addlabel(identifier, {
          type: exportType,
          token: token });

        state.funct["(scope)"].setExported(identifier, token);
      }

      return this;
    }

    if (state.tokens.next.value === "{") {
      advance("{");
      var exportedTokens = [];
      for (;;) {
        if (!state.tokens.next.identifier) {
          error("E030", state.tokens.next, state.tokens.next.value);
        }
        advance();

        exportedTokens.push(state.tokens.curr);

        if (state.tokens.next.value === "as") {
          advance("as");
          if (!state.tokens.next.identifier) {
            error("E030", state.tokens.next, state.tokens.next.value);
          }
          advance();
        }

        if (state.tokens.next.value === ",") {
          advance(",");
        } else if (state.tokens.next.value === "}") {
          advance("}");
          break;
        } else {
          error("E024", state.tokens.next, state.tokens.next.value);
          break;
        }
      }
      if (state.tokens.next.value === "from") {
        advance("from");
        advance("(string)");
      } else if (ok) {
        exportedTokens.forEach(function(token) {
          state.funct["(scope)"].setExported(token.value, token);
        });
      }
      return this;
    }

    if (state.tokens.next.id === "var") {
      advance("var");
      state.tokens.curr.fud({ inexport:true });
    } else if (state.tokens.next.id === "let") {
      advance("let");
      state.tokens.curr.fud({ inexport:true });
    } else if (state.tokens.next.id === "const") {
      advance("const");
      state.tokens.curr.fud({ inexport:true });
    } else if (state.tokens.next.id === "function") {
      this.block = true;
      advance("function");
      state.syntax["function"].fud({ inexport:true });
    } else if (state.tokens.next.id === "class") {
      this.block = true;
      advance("class");
      var classNameToken = state.tokens.next;
      state.syntax["class"].fud();
      state.funct["(scope)"].setExported(classNameToken.value, classNameToken);
    } else {
      error("E024", state.tokens.next, state.tokens.next.value);
    }

    return this;
  }).exps = true;

  FutureReservedWord("abstract");
  FutureReservedWord("boolean");
  FutureReservedWord("byte");
  FutureReservedWord("char");
  FutureReservedWord("class", { es5: true, nud: classdef });
  FutureReservedWord("double");
  FutureReservedWord("enum", { es5: true });
  FutureReservedWord("export", { es5: true });
  FutureReservedWord("extends", { es5: true });
  FutureReservedWord("final");
  FutureReservedWord("float");
  FutureReservedWord("goto");
  FutureReservedWord("implements", { es5: true, strictOnly: true });
  FutureReservedWord("import", { es5: true });
  FutureReservedWord("int");
  FutureReservedWord("interface", { es5: true, strictOnly: true });
  FutureReservedWord("long");
  FutureReservedWord("native");
  FutureReservedWord("package", { es5: true, strictOnly: true });
  FutureReservedWord("private", { es5: true, strictOnly: true });
  FutureReservedWord("protected", { es5: true, strictOnly: true });
  FutureReservedWord("public", { es5: true, strictOnly: true });
  FutureReservedWord("short");
  FutureReservedWord("static", { es5: true, strictOnly: true });
  FutureReservedWord("super", { es5: true });
  FutureReservedWord("synchronized");
  FutureReservedWord("transient");
  FutureReservedWord("volatile");

  var lookupBlockType = function() {
    var pn, pn1, prev;
    var i = -1;
    var bracketStack = 0;
    var ret = {};
    if (checkPunctuators(state.tokens.curr, ["[", "{"])) {
      bracketStack += 1;
    }
    do {
      prev = i === -1 ? state.tokens.curr : pn;
      pn = i === -1 ? state.tokens.next : peek(i);
      pn1 = peek(i + 1);
      i = i + 1;
      if (checkPunctuators(pn, ["[", "{"])) {
        bracketStack += 1;
      } else if (checkPunctuators(pn, ["]", "}"])) {
        bracketStack -= 1;
      }
      if (bracketStack === 1 && pn.identifier && pn.value === "for" &&
          !checkPunctuator(prev, ".")) {
        ret.isCompArray = true;
        ret.notJson = true;
        break;
      }
      if (bracketStack === 0 && checkPunctuators(pn, ["}", "]"])) {
        if (pn1.value === "=") {
          ret.isDestAssign = true;
          ret.notJson = true;
          break;
        } else if (pn1.value === ".") {
          ret.notJson = true;
          break;
        }
      }
      if (checkPunctuator(pn, ";")) {
        ret.isBlock = true;
        ret.notJson = true;
      }
    } while (bracketStack > 0 && pn.id !== "(end)");
    return ret;
  };

  function saveProperty(props, name, tkn, isClass, isStatic) {
    var msg = ["key", "class method", "static class method"];
    msg = msg[(isClass || false) + (isStatic || false)];
    if (tkn.identifier) {
      name = tkn.value;
    }

    if (props[name] && name !== "__proto__") {
      warning("W075", state.tokens.next, msg, name);
    } else {
      props[name] = Object.create(null);
    }

    props[name].basic = true;
    props[name].basictkn = tkn;
  }
  function saveAccessor(accessorType, props, name, tkn, isClass, isStatic) {
    var flagName = accessorType === "get" ? "getterToken" : "setterToken";
    var msg = "";

    if (isClass) {
      if (isStatic) {
        msg += "static ";
      }
      msg += accessorType + "ter method";
    } else {
      msg = "key";
    }

    state.tokens.curr.accessorType = accessorType;
    state.nameStack.set(tkn);

    if (props[name]) {
      if ((props[name].basic || props[name][flagName]) && name !== "__proto__") {
        warning("W075", state.tokens.next, msg, name);
      }
    } else {
      props[name] = Object.create(null);
    }

    props[name][flagName] = tkn;
  }

  function computedPropertyName() {
    advance("[");
    if (!state.inES6()) {
      warning("W119", state.tokens.curr, "computed property names", "6");
    }
    var value = expression(10);
    advance("]");
    return value;
  }
  function checkPunctuators(token, values) {
    if (token.type === "(punctuator)") {
      return _.contains(values, token.value);
    }
    return false;
  }
  function checkPunctuator(token, value) {
    return token.type === "(punctuator)" && token.value === value;
  }
  function destructuringAssignOrJsonValue() {

    var block = lookupBlockType();
    if (block.notJson) {
      if (!state.inES6() && block.isDestAssign) {
        warning("W104", state.tokens.curr, "destructuring assignment", "6");
      }
      statements();
    } else {
      state.option.laxbreak = true;
      state.jsonMode = true;
      jsonValue();
    }
  }

  var arrayComprehension = function() {
    var CompArray = function() {
      this.mode = "use";
      this.variables = [];
    };
    var _carrays = [];
    var _current;
    function declare(v) {
      var l = _current.variables.filter(function(elt) {
        if (elt.value === v) {
          elt.undef = false;
          return v;
        }
      }).length;
      return l !== 0;
    }
    function use(v) {
      var l = _current.variables.filter(function(elt) {
        if (elt.value === v && !elt.undef) {
          if (elt.unused === true) {
            elt.unused = false;
          }
          return v;
        }
      }).length;
      return (l === 0);
    }
    return { stack: function() {
          _current = new CompArray();
          _carrays.push(_current);
        },
        unstack: function() {
          _current.variables.filter(function(v) {
            if (v.unused)
              warning("W098", v.token, v.raw_text || v.value);
            if (v.undef)
              state.funct["(scope)"].block.use(v.value, v.token);
          });
          _carrays.splice(-1, 1);
          _current = _carrays[_carrays.length - 1];
        },
        setState: function(s) {
          if (_.contains(["use", "define", "generate", "filter"], s))
            _current.mode = s;
        },
        check: function(v) {
          if (!_current) {
            return;
          }
          if (_current && _current.mode === "use") {
            if (use(v)) {
              _current.variables.push({
                funct: state.funct,
                token: state.tokens.curr,
                value: v,
                undef: true,
                unused: false
              });
            }
            return true;
          } else if (_current && _current.mode === "define") {
            if (!declare(v)) {
              _current.variables.push({
                funct: state.funct,
                token: state.tokens.curr,
                value: v,
                undef: false,
                unused: true
              });
            }
            return true;
          } else if (_current && _current.mode === "generate") {
            state.funct["(scope)"].block.use(v, state.tokens.curr);
            return true;
          } else if (_current && _current.mode === "filter") {
            if (use(v)) {
              state.funct["(scope)"].block.use(v, state.tokens.curr);
            }
            return true;
          }
          return false;
        }
        };
  };

  function jsonValue() {
    function jsonObject() {
      var o = {}, t = state.tokens.next;
      advance("{");
      if (state.tokens.next.id !== "}") {
        for (;;) {
          if (state.tokens.next.id === "(end)") {
            error("E026", state.tokens.next, t.line);
          } else if (state.tokens.next.id === "}") {
            warning("W094", state.tokens.curr);
            break;
          } else if (state.tokens.next.id === ",") {
            error("E028", state.tokens.next);
          } else if (state.tokens.next.id !== "(string)") {
            warning("W095", state.tokens.next, state.tokens.next.value);
          }
          if (o[state.tokens.next.value] === true) {
            warning("W075", state.tokens.next, "key", state.tokens.next.value);
          } else if ((state.tokens.next.value === "__proto__" &&
            !state.option.proto) || (state.tokens.next.value === "__iterator__" &&
            !state.option.iterator)) {
            warning("W096", state.tokens.next, state.tokens.next.value);
          } else {
            o[state.tokens.next.value] = true;
          }
          advance();
          advance(":");
          jsonValue();
          if (state.tokens.next.id !== ",") {
            break;
          }
          advance(",");
        }
      }
      advance("}");
    }

    function jsonArray() {
      var t = state.tokens.next;
      advance("[");
      if (state.tokens.next.id !== "]") {
        for (;;) {
          if (state.tokens.next.id === "(end)") {
            error("E027", state.tokens.next, t.line);
          } else if (state.tokens.next.id === "]") {
            warning("W094", state.tokens.curr);
            break;
          } else if (state.tokens.next.id === ",") {
            error("E028", state.tokens.next);
          }
          jsonValue();
          if (state.tokens.next.id !== ",") {
            break;
          }
          advance(",");
        }
      }
      advance("]");
    }

    switch (state.tokens.next.id) {
    case "{":
      jsonObject();
      break;
    case "[":
      jsonArray();
      break;
    case "true":
    case "false":
    case "null":
    case "(number)":
    case "(string)":
      advance();
      break;
    case "-":
      advance("-");
      advance("(number)");
      break;
    default:
      error("E003", state.tokens.next);
    }
  }

  var escapeRegex = function(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  };
  var itself = function(s, o, g) {
    var i, k, x, reIgnoreStr, reIgnore;
    var optionKeys;
    var newOptionObj = {};
    var newIgnoredObj = {};

    o = _.clone(o);
    state.reset();

    if (o && o.scope) {
      JSHINT.scope = o.scope;
    } else {
      JSHINT.errors = [];
      JSHINT.undefs = [];
      JSHINT.internals = [];
      JSHINT.blacklist = {};
      JSHINT.scope = "(main)";
    }

    predefined = Object.create(null);
    combine(predefined, vars.ecmaIdentifiers[3]);
    combine(predefined, vars.reservedVars);

    combine(predefined, g || {});

    declared = Object.create(null);
    var exported = Object.create(null); // Variables that live outside the current file

    function each(obj, cb) {
      if (!obj)
        return;

      if (!Array.isArray(obj) && typeof obj === "object")
        obj = Object.keys(obj);

      obj.forEach(cb);
    }

    if (o) {
      each(o.predef || null, function(item) {
        var slice, prop;

        if (item[0] === "-") {
          slice = item.slice(1);
          JSHINT.blacklist[slice] = slice;
          delete predefined[slice];
        } else {
          prop = Object.getOwnPropertyDescriptor(o.predef, item);
          predefined[item] = prop ? prop.value : false;
        }
      });

      each(o.exported || null, function(item) {
        exported[item] = true;
      });

      delete o.predef;
      delete o.exported;

      optionKeys = Object.keys(o);
      for (x = 0; x < optionKeys.length; x++) {
        if (/^-W\d{3}$/g.test(optionKeys[x])) {
          newIgnoredObj[optionKeys[x].slice(1)] = true;
        } else {
          var optionKey = optionKeys[x];
          newOptionObj[optionKey] = o[optionKey];
          if ((optionKey === "esversion" && o[optionKey] === 5) ||
              (optionKey === "es5" && o[optionKey])) {
            warning("I003");
          }

          if (optionKeys[x] === "newcap" && o[optionKey] === false)
            newOptionObj["(explicitNewcap)"] = true;
        }
      }
    }

    state.option = newOptionObj;
    state.ignored = newIgnoredObj;

    state.option.indent = state.option.indent || 4;
    state.option.maxerr = state.option.maxerr || 50;

    indent = 1;

    var scopeManagerInst = scopeManager(state, predefined, exported, declared);
    scopeManagerInst.on("warning", function(ev) {
      warning.apply(null, [ ev.code, ev.token].concat(ev.data));
    });

    scopeManagerInst.on("error", function(ev) {
      error.apply(null, [ ev.code, ev.token ].concat(ev.data));
    });

    state.funct = functor("(global)", null, {
      "(global)"    : true,
      "(scope)"     : scopeManagerInst,
      "(comparray)" : arrayComprehension(),
      "(metrics)"   : createMetrics(state.tokens.next)
    });

    functions = [state.funct];
    urls = [];
    stack = null;
    member = {};
    membersOnly = null;
    inblock = false;
    lookahead = [];

    if (!isString(s) && !Array.isArray(s)) {
      errorAt("E004", 0);
      return false;
    }

    api = {
      get isJSON() {
        return state.jsonMode;
      },

      getOption: function(name) {
        return state.option[name] || null;
      },

      getCache: function(name) {
        return state.cache[name];
      },

      setCache: function(name, value) {
        state.cache[name] = value;
      },

      warn: function(code, data) {
        warningAt.apply(null, [ code, data.line, data.char ].concat(data.data));
      },

      on: function(names, listener) {
        names.split(" ").forEach(function(name) {
          emitter.on(name, listener);
        }.bind(this));
      }
    };

    emitter.removeAllListeners();
    (extraModules || []).forEach(function(func) {
      func(api);
    });

    state.tokens.prev = state.tokens.curr = state.tokens.next = state.syntax["(begin)"];

    if (o && o.ignoreDelimiters) {

      if (!Array.isArray(o.ignoreDelimiters)) {
        o.ignoreDelimiters = [o.ignoreDelimiters];
      }

      o.ignoreDelimiters.forEach(function(delimiterPair) {
        if (!delimiterPair.start || !delimiterPair.end)
            return;

        reIgnoreStr = escapeRegex(delimiterPair.start) +
                      "[\\s\\S]*?" +
                      escapeRegex(delimiterPair.end);

        reIgnore = new RegExp(reIgnoreStr, "ig");

        s = s.replace(reIgnore, function(match) {
          return match.replace(/./g, " ");
        });
      });
    }

    lex = new Lexer(s);

    lex.on("warning", function(ev) {
      warningAt.apply(null, [ ev.code, ev.line, ev.character].concat(ev.data));
    });

    lex.on("error", function(ev) {
      errorAt.apply(null, [ ev.code, ev.line, ev.character ].concat(ev.data));
    });

    lex.on("fatal", function(ev) {
      quit("E041", ev.line, ev.from);
    });

    lex.on("Identifier", function(ev) {
      emitter.emit("Identifier", ev);
    });

    lex.on("String", function(ev) {
      emitter.emit("String", ev);
    });

    lex.on("Number", function(ev) {
      emitter.emit("Number", ev);
    });

    lex.start();
    for (var name in o) {
      if (_.has(o, name)) {
        checkOption(name, state.tokens.curr);
      }
    }

    assume();
    combine(predefined, g || {});
    comma.first = true;

    try {
      advance();
      switch (state.tokens.next.id) {
      case "{":
      case "[":
        destructuringAssignOrJsonValue();
        break;
      default:
        directives();

        if (state.directive["use strict"]) {
          if (state.option.strict !== "global") {
            warning("W097", state.tokens.prev);
          }
        }

        statements();
      }

      if (state.tokens.next.id !== "(end)") {
        quit("E041", state.tokens.curr.line);
      }

      state.funct["(scope)"].unstack();

    } catch (err) {
      if (err && err.name === "JSHintError") {
        var nt = state.tokens.next || {};
        JSHINT.errors.push({
          scope     : "(main)",
          raw       : err.raw,
          code      : err.code,
          reason    : err.message,
          line      : err.line || nt.line,
          character : err.character || nt.from
        }, null);
      } else {
        throw err;
      }
    }

    if (JSHINT.scope === "(main)") {
      o = o || {};

      for (i = 0; i < JSHINT.internals.length; i += 1) {
        k = JSHINT.internals[i];
        o.scope = k.elem;
        itself(k.value, o, g);
      }
    }

    return JSHINT.errors.length === 0;
  };
  itself.addModule = function(func) {
    extraModules.push(func);
  };

  itself.addModule(style.register);
  itself.data = function() {
    var data = {
      functions: [],
      options: state.option
    };

    var fu, f, i, j, n, globals;

    if (itself.errors.length) {
      data.errors = itself.errors;
    }

    if (state.jsonMode) {
      data.json = true;
    }

    var impliedGlobals = state.funct["(scope)"].getImpliedGlobals();
    if (impliedGlobals.length > 0) {
      data.implieds = impliedGlobals;
    }

    if (urls.length > 0) {
      data.urls = urls;
    }

    globals = state.funct["(scope)"].getUsedOrDefinedGlobals();
    if (globals.length > 0) {
      data.globals = globals;
    }

    for (i = 1; i < functions.length; i += 1) {
      f = functions[i];
      fu = {};

      for (j = 0; j < functionicity.length; j += 1) {
        fu[functionicity[j]] = [];
      }

      for (j = 0; j < functionicity.length; j += 1) {
        if (fu[functionicity[j]].length === 0) {
          delete fu[functionicity[j]];
        }
      }

      fu.name = f["(name)"];
      fu.param = f["(params)"];
      fu.line = f["(line)"];
      fu.character = f["(character)"];
      fu.last = f["(last)"];
      fu.lastcharacter = f["(lastcharacter)"];

      fu.metrics = {
        complexity: f["(metrics)"].ComplexityCount,
        parameters: f["(metrics)"].arity,
        statements: f["(metrics)"].statementCount
      };

      data.functions.push(fu);
    }

    var unuseds = state.funct["(scope)"].getUnuseds();
    if (unuseds.length > 0) {
      data.unused = unuseds;
    }

    for (n in member) {
      if (typeof member[n] === "number") {
        data.member = member;
        break;
      }
    }

    return data;
  };

  itself.jshint = itself;

  return itself;
}());
if (typeof exports === "object" && exports) {
  exports.JSHINT = JSHINT;
}

},{"../lodash":"/node_modules/jshint/lodash.js","./lex.js":"/node_modules/jshint/src/lex.js","./messages.js":"/node_modules/jshint/src/messages.js","./options.js":"/node_modules/jshint/src/options.js","./reg.js":"/node_modules/jshint/src/reg.js","./scope-manager.js":"/node_modules/jshint/src/scope-manager.js","./state.js":"/node_modules/jshint/src/state.js","./style.js":"/node_modules/jshint/src/style.js","./vars.js":"/node_modules/jshint/src/vars.js","events":"/node_modules/browserify/node_modules/events/events.js"}],"/node_modules/jshint/src/lex.js":[function(_dereq_,module,exports){

"use strict";

var _      = _dereq_("../lodash");
var events = _dereq_("events");
var reg    = _dereq_("./reg.js");
var state  = _dereq_("./state.js").state;

var unicodeData = _dereq_("../data/ascii-identifier-data.js");
var asciiIdentifierStartTable = unicodeData.asciiIdentifierStartTable;
var asciiIdentifierPartTable = unicodeData.asciiIdentifierPartTable;

var Token = {
  Identifier: 1,
  Punctuator: 2,
  NumericLiteral: 3,
  StringLiteral: 4,
  Comment: 5,
  Keyword: 6,
  NullLiteral: 7,
  BooleanLiteral: 8,
  RegExp: 9,
  TemplateHead: 10,
  TemplateMiddle: 11,
  TemplateTail: 12,
  NoSubstTemplate: 13
};

var Context = {
  Block: 1,
  Template: 2
};

function asyncTrigger() {
  var _checks = [];

  return {
    push: function(fn) {
      _checks.push(fn);
    },

    check: function() {
      for (var check = 0; check < _checks.length; ++check) {
        _checks[check]();
      }

      _checks.splice(0, _checks.length);
    }
  };
}
function Lexer(source) {
  var lines = source;

  if (typeof lines === "string") {
    lines = lines
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n");
  }

  if (lines[0] && lines[0].substr(0, 2) === "#!") {
    if (lines[0].indexOf("node") !== -1) {
      state.option.node = true;
    }
    lines[0] = "";
  }

  this.emitter = new events.EventEmitter();
  this.source = source;
  this.setLines(lines);
  this.prereg = true;

  this.line = 0;
  this.char = 1;
  this.from = 1;
  this.input = "";
  this.inComment = false;
  this.context = [];
  this.templateStarts = [];

  for (var i = 0; i < state.option.indent; i += 1) {
    state.tab += " ";
  }
  this.ignoreLinterErrors = false;
}

Lexer.prototype = {
  _lines: [],

  inContext: function(ctxType) {
    return this.context.length > 0 && this.context[this.context.length - 1].type === ctxType;
  },

  pushContext: function(ctxType) {
    this.context.push({ type: ctxType });
  },

  popContext: function() {
    return this.context.pop();
  },

  isContext: function(context) {
    return this.context.length > 0 && this.context[this.context.length - 1] === context;
  },

  currentContext: function() {
    return this.context.length > 0 && this.context[this.context.length - 1];
  },

  getLines: function() {
    this._lines = state.lines;
    return this._lines;
  },

  setLines: function(val) {
    this._lines = val;
    state.lines = this._lines;
  },
  peek: function(i) {
    return this.input.charAt(i || 0);
  },
  skip: function(i) {
    i = i || 1;
    this.char += i;
    this.input = this.input.slice(i);
  },
  on: function(names, listener) {
    names.split(" ").forEach(function(name) {
      this.emitter.on(name, listener);
    }.bind(this));
  },
  trigger: function() {
    this.emitter.emit.apply(this.emitter, Array.prototype.slice.call(arguments));
  },
  triggerAsync: function(type, args, checks, fn) {
    checks.push(function() {
      if (fn()) {
        this.trigger(type, args);
      }
    }.bind(this));
  },
  scanPunctuator: function() {
    var ch1 = this.peek();
    var ch2, ch3, ch4;

    switch (ch1) {
    case ".":
      if ((/^[0-9]$/).test(this.peek(1))) {
        return null;
      }
      if (this.peek(1) === "." && this.peek(2) === ".") {
        return {
          type: Token.Punctuator,
          value: "..."
        };
      }
    case "(":
    case ")":
    case ";":
    case ",":
    case "[":
    case "]":
    case ":":
    case "~":
    case "?":
      return {
        type: Token.Punctuator,
        value: ch1
      };
    case "{":
      this.pushContext(Context.Block);
      return {
        type: Token.Punctuator,
        value: ch1
      };
    case "}":
      if (this.inContext(Context.Block)) {
        this.popContext();
      }
      return {
        type: Token.Punctuator,
        value: ch1
      };
    case "#":
      return {
        type: Token.Punctuator,
        value: ch1
      };
    case "":
      return null;
    }

    ch2 = this.peek(1);
    ch3 = this.peek(2);
    ch4 = this.peek(3);

    if (ch1 === ">" && ch2 === ">" && ch3 === ">" && ch4 === "=") {
      return {
        type: Token.Punctuator,
        value: ">>>="
      };
    }

    if (ch1 === "=" && ch2 === "=" && ch3 === "=") {
      return {
        type: Token.Punctuator,
        value: "==="
      };
    }

    if (ch1 === "!" && ch2 === "=" && ch3 === "=") {
      return {
        type: Token.Punctuator,
        value: "!=="
      };
    }

    if (ch1 === ">" && ch2 === ">" && ch3 === ">") {
      return {
        type: Token.Punctuator,
        value: ">>>"
      };
    }

    if (ch1 === "<" && ch2 === "<" && ch3 === "=") {
      return {
        type: Token.Punctuator,
        value: "<<="
      };
    }

    if (ch1 === ">" && ch2 === ">" && ch3 === "=") {
      return {
        type: Token.Punctuator,
        value: ">>="
      };
    }
    if (ch1 === "=" && ch2 === ">") {
      return {
        type: Token.Punctuator,
        value: ch1 + ch2
      };
    }
    if (ch1 === ch2 && ("+-<>&|".indexOf(ch1) >= 0)) {
      return {
        type: Token.Punctuator,
        value: ch1 + ch2
      };
    }

    if ("<>=!+-*%&|^".indexOf(ch1) >= 0) {
      if (ch2 === "=") {
        return {
          type: Token.Punctuator,
          value: ch1 + ch2
        };
      }

      return {
        type: Token.Punctuator,
        value: ch1
      };
    }

    if (ch1 === "/") {
      if (ch2 === "=") {
        return {
          type: Token.Punctuator,
          value: "/="
        };
      }

      return {
        type: Token.Punctuator,
        value: "/"
      };
    }

    return null;
  },
  scanComments: function() {
    var ch1 = this.peek();
    var ch2 = this.peek(1);
    var rest = this.input.substr(2);
    var startLine = this.line;
    var startChar = this.char;
    var self = this;

    function commentToken(label, body, opt) {
      var special = ["jshint", "jslint", "members", "member", "globals", "global", "exported"];
      var isSpecial = false;
      var value = label + body;
      var commentType = "plain";
      opt = opt || {};

      if (opt.isMultiline) {
        value += "*/";
      }

      body = body.replace(/\n/g, " ");

      if (label === "/*" && reg.fallsThrough.test(body)) {
        isSpecial = true;
        commentType = "falls through";
      }

      special.forEach(function(str) {
        if (isSpecial) {
          return;
        }
        if (label === "//" && str !== "jshint") {
          return;
        }

        if (body.charAt(str.length) === " " && body.substr(0, str.length) === str) {
          isSpecial = true;
          label = label + str;
          body = body.substr(str.length);
        }

        if (!isSpecial && body.charAt(0) === " " && body.charAt(str.length + 1) === " " &&
          body.substr(1, str.length) === str) {
          isSpecial = true;
          label = label + " " + str;
          body = body.substr(str.length + 1);
        }

        if (!isSpecial) {
          return;
        }

        switch (str) {
        case "member":
          commentType = "members";
          break;
        case "global":
          commentType = "globals";
          break;
        default:
          var options = body.split(":").map(function(v) {
            return v.replace(/^\s+/, "").replace(/\s+$/, "");
          });

          if (options.length === 2) {
            switch (options[0]) {
            case "ignore":
              switch (options[1]) {
              case "start":
                self.ignoringLinterErrors = true;
                isSpecial = false;
                break;
              case "end":
                self.ignoringLinterErrors = false;
                isSpecial = false;
                break;
              }
            }
          }

          commentType = str;
        }
      });

      return {
        type: Token.Comment,
        commentType: commentType,
        value: value,
        body: body,
        isSpecial: isSpecial,
        isMultiline: opt.isMultiline || false,
        isMalformed: opt.isMalformed || false
      };
    }
    if (ch1 === "*" && ch2 === "/") {
      this.trigger("error", {
        code: "E018",
        line: startLine,
        character: startChar
      });

      this.skip(2);
      return null;
    }
    if (ch1 !== "/" || (ch2 !== "*" && ch2 !== "/")) {
      return null;
    }
    if (ch2 === "/") {
      this.skip(this.input.length); // Skip to the EOL.
      return commentToken("//", rest);
    }

    var body = "";
    if (ch2 === "*") {
      this.inComment = true;
      this.skip(2);

      while (this.peek() !== "*" || this.peek(1) !== "/") {
        if (this.peek() === "") { // End of Line
          body += "\n";
          if (!this.nextLine()) {
            this.trigger("error", {
              code: "E017",
              line: startLine,
              character: startChar
            });

            this.inComment = false;
            return commentToken("/*", body, {
              isMultiline: true,
              isMalformed: true
            });
          }
        } else {
          body += this.peek();
          this.skip();
        }
      }

      this.skip(2);
      this.inComment = false;
      return commentToken("/*", body, { isMultiline: true });
    }
  },
  scanKeyword: function() {
    var result = /^[a-zA-Z_$][a-zA-Z0-9_$]*/.exec(this.input);
    var keywords = [
      "if", "in", "do", "var", "for", "new",
      "try", "let", "this", "else", "case",
      "void", "with", "enum", "while", "break",
      "catch", "throw", "const", "yield", "class",
      "super", "return", "typeof", "delete",
      "switch", "export", "import", "default",
      "finally", "extends", "function", "continue",
      "debugger", "instanceof"
    ];

    if (result && keywords.indexOf(result[0]) >= 0) {
      return {
        type: Token.Keyword,
        value: result[0]
      };
    }

    return null;
  },
  scanIdentifier: function() {
    var id = "";
    var index = 0;
    var type, char;

    function isNonAsciiIdentifierStart(code) {
      return code > 256;
    }

    function isNonAsciiIdentifierPart(code) {
      return code > 256;
    }

    function isHexDigit(str) {
      return (/^[0-9a-fA-F]$/).test(str);
    }

    var readUnicodeEscapeSequence = function() {
      index += 1;

      if (this.peek(index) !== "u") {
        return null;
      }

      var ch1 = this.peek(index + 1);
      var ch2 = this.peek(index + 2);
      var ch3 = this.peek(index + 3);
      var ch4 = this.peek(index + 4);
      var code;

      if (isHexDigit(ch1) && isHexDigit(ch2) && isHexDigit(ch3) && isHexDigit(ch4)) {
        code = parseInt(ch1 + ch2 + ch3 + ch4, 16);

        if (asciiIdentifierPartTable[code] || isNonAsciiIdentifierPart(code)) {
          index += 5;
          return "\\u" + ch1 + ch2 + ch3 + ch4;
        }

        return null;
      }

      return null;
    }.bind(this);

    var getIdentifierStart = function() {
      var chr = this.peek(index);
      var code = chr.charCodeAt(0);

      if (code === 92) {
        return readUnicodeEscapeSequence();
      }

      if (code < 128) {
        if (asciiIdentifierStartTable[code]) {
          index += 1;
          return chr;
        }

        return null;
      }

      if (isNonAsciiIdentifierStart(code)) {
        index += 1;
        return chr;
      }

      return null;
    }.bind(this);

    var getIdentifierPart = function() {
      var chr = this.peek(index);
      var code = chr.charCodeAt(0);

      if (code === 92) {
        return readUnicodeEscapeSequence();
      }

      if (code < 128) {
        if (asciiIdentifierPartTable[code]) {
          index += 1;
          return chr;
        }

        return null;
      }

      if (isNonAsciiIdentifierPart(code)) {
        index += 1;
        return chr;
      }

      return null;
    }.bind(this);

    function removeEscapeSequences(id) {
      return id.replace(/\\u([0-9a-fA-F]{4})/g, function(m0, codepoint) {
        return String.fromCharCode(parseInt(codepoint, 16));
      });
    }

    char = getIdentifierStart();
    if (char === null) {
      return null;
    }

    id = char;
    for (;;) {
      char = getIdentifierPart();

      if (char === null) {
        break;
      }

      id += char;
    }

    switch (id) {
    case "true":
    case "false":
      type = Token.BooleanLiteral;
      break;
    case "null":
      type = Token.NullLiteral;
      break;
    default:
      type = Token.Identifier;
    }

    return {
      type: type,
      value: removeEscapeSequences(id),
      text: id,
      tokenLength: id.length
    };
  },
  scanNumericLiteral: function() {
    var index = 0;
    var value = "";
    var length = this.input.length;
    var char = this.peek(index);
    var bad;
    var isAllowedDigit = isDecimalDigit;
    var base = 10;
    var isLegacy = false;

    function isDecimalDigit(str) {
      return (/^[0-9]$/).test(str);
    }

    function isOctalDigit(str) {
      return (/^[0-7]$/).test(str);
    }

    function isBinaryDigit(str) {
      return (/^[01]$/).test(str);
    }

    function isHexDigit(str) {
      return (/^[0-9a-fA-F]$/).test(str);
    }

    function isIdentifierStart(ch) {
      return (ch === "$") || (ch === "_") || (ch === "\\") ||
        (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
    }

    if (char !== "." && !isDecimalDigit(char)) {
      return null;
    }

    if (char !== ".") {
      value = this.peek(index);
      index += 1;
      char = this.peek(index);

      if (value === "0") {
        if (char === "x" || char === "X") {
          isAllowedDigit = isHexDigit;
          base = 16;

          index += 1;
          value += char;
        }
        if (char === "o" || char === "O") {
          isAllowedDigit = isOctalDigit;
          base = 8;

          if (!state.inES6(true)) {
            this.trigger("warning", {
              code: "W119",
              line: this.line,
              character: this.char,
              data: [ "Octal integer literal", "6" ]
            });
          }

          index += 1;
          value += char;
        }
        if (char === "b" || char === "B") {
          isAllowedDigit = isBinaryDigit;
          base = 2;

          if (!state.inES6(true)) {
            this.trigger("warning", {
              code: "W119",
              line: this.line,
              character: this.char,
              data: [ "Binary integer literal", "6" ]
            });
          }

          index += 1;
          value += char;
        }
        if (isOctalDigit(char)) {
          isAllowedDigit = isOctalDigit;
          base = 8;
          isLegacy = true;
          bad = false;

          index += 1;
          value += char;
        }

        if (!isOctalDigit(char) && isDecimalDigit(char)) {
          index += 1;
          value += char;
        }
      }

      while (index < length) {
        char = this.peek(index);

        if (isLegacy && isDecimalDigit(char)) {
          bad = true;
        } else if (!isAllowedDigit(char)) {
          break;
        }
        value += char;
        index += 1;
      }

      if (isAllowedDigit !== isDecimalDigit) {
        if (!isLegacy && value.length <= 2) { // 0x
          return {
            type: Token.NumericLiteral,
            value: value,
            isMalformed: true
          };
        }

        if (index < length) {
          char = this.peek(index);
          if (isIdentifierStart(char)) {
            return null;
          }
        }

        return {
          type: Token.NumericLiteral,
          value: value,
          base: base,
          isLegacy: isLegacy,
          isMalformed: false
        };
      }
    }

    if (char === ".") {
      value += char;
      index += 1;

      while (index < length) {
        char = this.peek(index);
        if (!isDecimalDigit(char)) {
          break;
        }
        value += char;
        index += 1;
      }
    }

    if (char === "e" || char === "E") {
      value += char;
      index += 1;
      char = this.peek(index);

      if (char === "+" || char === "-") {
        value += this.peek(index);
        index += 1;
      }

      char = this.peek(index);
      if (isDecimalDigit(char)) {
        value += char;
        index += 1;

        while (index < length) {
          char = this.peek(index);
          if (!isDecimalDigit(char)) {
            break;
          }
          value += char;
          index += 1;
        }
      } else {
        return null;
      }
    }

    if (index < length) {
      char = this.peek(index);
      if (isIdentifierStart(char)) {
        return null;
      }
    }

    return {
      type: Token.NumericLiteral,
      value: value,
      base: base,
      isMalformed: !isFinite(value)
    };
  },
  scanEscapeSequence: function(checks) {
    var allowNewLine = false;
    var jump = 1;
    this.skip();
    var char = this.peek();

    switch (char) {
    case "'":
      this.triggerAsync("warning", {
        code: "W114",
        line: this.line,
        character: this.char,
        data: [ "\\'" ]
      }, checks, function() {return state.jsonMode; });
      break;
    case "b":
      char = "\\b";
      break;
    case "f":
      char = "\\f";
      break;
    case "n":
      char = "\\n";
      break;
    case "r":
      char = "\\r";
      break;
    case "t":
      char = "\\t";
      break;
    case "0":
      char = "\\0";
      var n = parseInt(this.peek(1), 10);
      this.triggerAsync("warning", {
        code: "W115",
        line: this.line,
        character: this.char
      }, checks,
      function() { return n >= 0 && n <= 7 && state.isStrict(); });
      break;
    case "u":
      var hexCode = this.input.substr(1, 4);
      var code = parseInt(hexCode, 16);
      if (isNaN(code)) {
        this.trigger("warning", {
          code: "W052",
          line: this.line,
          character: this.char,
          data: [ "u" + hexCode ]
        });
      }
      char = String.fromCharCode(code);
      jump = 5;
      break;
    case "v":
      this.triggerAsync("warning", {
        code: "W114",
        line: this.line,
        character: this.char,
        data: [ "\\v" ]
      }, checks, function() { return state.jsonMode; });

      char = "\v";
      break;
    case "x":
      var  x = parseInt(this.input.substr(1, 2), 16);

      this.triggerAsync("warning", {
        code: "W114",
        line: this.line,
        character: this.char,
        data: [ "\\x-" ]
      }, checks, function() { return state.jsonMode; });

      char = String.fromCharCode(x);
      jump = 3;
      break;
    case "\\":
      char = "\\\\";
      break;
    case "\"":
      char = "\\\"";
      break;
    case "/":
      break;
    case "":
      allowNewLine = true;
      char = "";
      break;
    }

    return { char: char, jump: jump, allowNewLine: allowNewLine };
  },
  scanTemplateLiteral: function(checks) {
    var tokenType;
    var value = "";
    var ch;
    var startLine = this.line;
    var startChar = this.char;
    var depth = this.templateStarts.length;

    if (!state.inES6(true)) {
      return null;
    } else if (this.peek() === "`") {
      tokenType = Token.TemplateHead;
      this.templateStarts.push({ line: this.line, char: this.char });
      depth = this.templateStarts.length;
      this.skip(1);
      this.pushContext(Context.Template);
    } else if (this.inContext(Context.Template) && this.peek() === "}") {
      tokenType = Token.TemplateMiddle;
    } else {
      return null;
    }

    while (this.peek() !== "`") {
      while ((ch = this.peek()) === "") {
        value += "\n";
        if (!this.nextLine()) {
          var startPos = this.templateStarts.pop();
          this.trigger("error", {
            code: "E052",
            line: startPos.line,
            character: startPos.char
          });
          return {
            type: tokenType,
            value: value,
            startLine: startLine,
            startChar: startChar,
            isUnclosed: true,
            depth: depth,
            context: this.popContext()
          };
        }
      }

      if (ch === '$' && this.peek(1) === '{') {
        value += '${';
        this.skip(2);
        return {
          type: tokenType,
          value: value,
          startLine: startLine,
          startChar: startChar,
          isUnclosed: false,
          depth: depth,
          context: this.currentContext()
        };
      } else if (ch === '\\') {
        var escape = this.scanEscapeSequence(checks);
        value += escape.char;
        this.skip(escape.jump);
      } else if (ch !== '`') {
        value += ch;
        this.skip(1);
      }
    }
    tokenType = tokenType === Token.TemplateHead ? Token.NoSubstTemplate : Token.TemplateTail;
    this.skip(1);
    this.templateStarts.pop();

    return {
      type: tokenType,
      value: value,
      startLine: startLine,
      startChar: startChar,
      isUnclosed: false,
      depth: depth,
      context: this.popContext()
    };
  },
  scanStringLiteral: function(checks) {
    var quote = this.peek();
    if (quote !== "\"" && quote !== "'") {
      return null;
    }
    this.triggerAsync("warning", {
      code: "W108",
      line: this.line,
      character: this.char // +1?
    }, checks, function() { return state.jsonMode && quote !== "\""; });

    var value = "";
    var startLine = this.line;
    var startChar = this.char;
    var allowNewLine = false;

    this.skip();

    while (this.peek() !== quote) {
      if (this.peek() === "") { // End Of Line

        if (!allowNewLine) {
          this.trigger("warning", {
            code: "W112",
            line: this.line,
            character: this.char
          });
        } else {
          allowNewLine = false;

          this.triggerAsync("warning", {
            code: "W043",
            line: this.line,
            character: this.char
          }, checks, function() { return !state.option.multistr; });

          this.triggerAsync("warning", {
            code: "W042",
            line: this.line,
            character: this.char
          }, checks, function() { return state.jsonMode && state.option.multistr; });
        }

        if (!this.nextLine()) {
          this.trigger("error", {
            code: "E029",
            line: startLine,
            character: startChar
          });

          return {
            type: Token.StringLiteral,
            value: value,
            startLine: startLine,
            startChar: startChar,
            isUnclosed: true,
            quote: quote
          };
        }

      } else { // Any character other than End Of Line

        allowNewLine = false;
        var char = this.peek();
        var jump = 1; // A length of a jump, after we're done

        if (char < " ") {
          this.trigger("warning", {
            code: "W113",
            line: this.line,
            character: this.char,
            data: [ "<non-printable>" ]
          });
        }
        if (char === "\\") {
          var parsed = this.scanEscapeSequence(checks);
          char = parsed.char;
          jump = parsed.jump;
          allowNewLine = parsed.allowNewLine;
        }

        value += char;
        this.skip(jump);
      }
    }

    this.skip();
    return {
      type: Token.StringLiteral,
      value: value,
      startLine: startLine,
      startChar: startChar,
      isUnclosed: false,
      quote: quote
    };
  },
  scanRegExp: function() {
    var index = 0;
    var length = this.input.length;
    var char = this.peek();
    var value = char;
    var body = "";
    var flags = [];
    var malformed = false;
    var isCharSet = false;
    var terminated;

    var scanUnexpectedChars = function() {
      if (char < " ") {
        malformed = true;
        this.trigger("warning", {
          code: "W048",
          line: this.line,
          character: this.char
        });
      }
      if (char === "<") {
        malformed = true;
        this.trigger("warning", {
          code: "W049",
          line: this.line,
          character: this.char,
          data: [ char ]
        });
      }
    }.bind(this);
    if (!this.prereg || char !== "/") {
      return null;
    }

    index += 1;
    terminated = false;

    while (index < length) {
      char = this.peek(index);
      value += char;
      body += char;

      if (isCharSet) {
        if (char === "]") {
          if (this.peek(index - 1) !== "\\" || this.peek(index - 2) === "\\") {
            isCharSet = false;
          }
        }

        if (char === "\\") {
          index += 1;
          char = this.peek(index);
          body += char;
          value += char;

          scanUnexpectedChars();
        }

        index += 1;
        continue;
      }

      if (char === "\\") {
        index += 1;
        char = this.peek(index);
        body += char;
        value += char;

        scanUnexpectedChars();

        if (char === "/") {
          index += 1;
          continue;
        }

        if (char === "[") {
          index += 1;
          continue;
        }
      }

      if (char === "[") {
        isCharSet = true;
        index += 1;
        continue;
      }

      if (char === "/") {
        body = body.substr(0, body.length - 1);
        terminated = true;
        index += 1;
        break;
      }

      index += 1;
    }

    if (!terminated) {
      this.trigger("error", {
        code: "E015",
        line: this.line,
        character: this.from
      });

      return void this.trigger("fatal", {
        line: this.line,
        from: this.from
      });
    }

    while (index < length) {
      char = this.peek(index);
      if (!/[gim]/.test(char)) {
        break;
      }
      flags.push(char);
      value += char;
      index += 1;
    }

    try {
      new RegExp(body, flags.join(""));
    } catch (err) {
      malformed = true;
      this.trigger("error", {
        code: "E016",
        line: this.line,
        character: this.char,
        data: [ err.message ] // Platform dependent!
      });
    }

    return {
      type: Token.RegExp,
      value: value,
      flags: flags,
      isMalformed: malformed
    };
  },
  scanNonBreakingSpaces: function() {
    return state.option.nonbsp ?
      this.input.search(/(\u00A0)/) : -1;
  },
  scanUnsafeChars: function() {
    return this.input.search(reg.unsafeChars);
  },
  next: function(checks) {
    this.from = this.char;
    var start;
    if (/\s/.test(this.peek())) {
      start = this.char;

      while (/\s/.test(this.peek())) {
        this.from += 1;
        this.skip();
      }
    }

    var match = this.scanComments() ||
      this.scanStringLiteral(checks) ||
      this.scanTemplateLiteral(checks);

    if (match) {
      return match;
    }

    match =
      this.scanRegExp() ||
      this.scanPunctuator() ||
      this.scanKeyword() ||
      this.scanIdentifier() ||
      this.scanNumericLiteral();

    if (match) {
      this.skip(match.tokenLength || match.value.length);
      return match;
    }

    return null;
  },
  nextLine: function() {
    var char;

    if (this.line >= this.getLines().length) {
      return false;
    }

    this.input = this.getLines()[this.line];
    this.line += 1;
    this.char = 1;
    this.from = 1;

    var inputTrimmed = this.input.trim();

    var startsWith = function() {
      return _.some(arguments, function(prefix) {
        return inputTrimmed.indexOf(prefix) === 0;
      });
    };

    var endsWith = function() {
      return _.some(arguments, function(suffix) {
        return inputTrimmed.indexOf(suffix, inputTrimmed.length - suffix.length) !== -1;
      });
    };
    if (this.ignoringLinterErrors === true) {
      if (!startsWith("/*", "//") && !(this.inComment && endsWith("*/"))) {
        this.input = "";
      }
    }

    char = this.scanNonBreakingSpaces();
    if (char >= 0) {
      this.trigger("warning", { code: "W125", line: this.line, character: char + 1 });
    }

    this.input = this.input.replace(/\t/g, state.tab);
    char = this.scanUnsafeChars();

    if (char >= 0) {
      this.trigger("warning", { code: "W100", line: this.line, character: char });
    }

    if (!this.ignoringLinterErrors && state.option.maxlen &&
      state.option.maxlen < this.input.length) {
      var inComment = this.inComment ||
        startsWith.call(inputTrimmed, "//") ||
        startsWith.call(inputTrimmed, "/*");

      var shouldTriggerError = !inComment || !reg.maxlenException.test(inputTrimmed);

      if (shouldTriggerError) {
        this.trigger("warning", { code: "W101", line: this.line, character: this.input.length });
      }
    }

    return true;
  },
  start: function() {
    this.nextLine();
  },
  token: function() {
    var checks = asyncTrigger();
    var token;


    function isReserved(token, isProperty) {
      if (!token.reserved) {
        return false;
      }
      var meta = token.meta;

      if (meta && meta.isFutureReservedWord && state.inES5()) {
        if (!meta.es5) {
          return false;
        }
        if (meta.strictOnly) {
          if (!state.option.strict && !state.isStrict()) {
            return false;
          }
        }

        if (isProperty) {
          return false;
        }
      }

      return true;
    }
    var create = function(type, value, isProperty, token) {
      var obj;

      if (type !== "(endline)" && type !== "(end)") {
        this.prereg = false;
      }

      if (type === "(punctuator)") {
        switch (value) {
        case ".":
        case ")":
        case "~":
        case "#":
        case "]":
        case "++":
        case "--":
          this.prereg = false;
          break;
        default:
          this.prereg = true;
        }

        obj = Object.create(state.syntax[value] || state.syntax["(error)"]);
      }

      if (type === "(identifier)") {
        if (value === "return" || value === "case" || value === "typeof") {
          this.prereg = true;
        }

        if (_.has(state.syntax, value)) {
          obj = Object.create(state.syntax[value] || state.syntax["(error)"]);
          if (!isReserved(obj, isProperty && type === "(identifier)")) {
            obj = null;
          }
        }
      }

      if (!obj) {
        obj = Object.create(state.syntax[type]);
      }

      obj.identifier = (type === "(identifier)");
      obj.type = obj.type || type;
      obj.value = value;
      obj.line = this.line;
      obj.character = this.char;
      obj.from = this.from;
      if (obj.identifier && token) obj.raw_text = token.text || token.value;
      if (token && token.startLine && token.startLine !== this.line) {
        obj.startLine = token.startLine;
      }
      if (token && token.context) {
        obj.context = token.context;
      }
      if (token && token.depth) {
        obj.depth = token.depth;
      }
      if (token && token.isUnclosed) {
        obj.isUnclosed = token.isUnclosed;
      }

      if (isProperty && obj.identifier) {
        obj.isProperty = isProperty;
      }

      obj.check = checks.check;

      return obj;
    }.bind(this);

    for (;;) {
      if (!this.input.length) {
        if (this.nextLine()) {
          return create("(endline)", "");
        }

        if (this.exhausted) {
          return null;
        }

        this.exhausted = true;
        return create("(end)", "");
      }

      token = this.next(checks);

      if (!token) {
        if (this.input.length) {
          this.trigger("error", {
            code: "E024",
            line: this.line,
            character: this.char,
            data: [ this.peek() ]
          });

          this.input = "";
        }

        continue;
      }

      switch (token.type) {
      case Token.StringLiteral:
        this.triggerAsync("String", {
          line: this.line,
          char: this.char,
          from: this.from,
          startLine: token.startLine,
          startChar: token.startChar,
          value: token.value,
          quote: token.quote
        }, checks, function() { return true; });

        return create("(string)", token.value, null, token);

      case Token.TemplateHead:
        this.trigger("TemplateHead", {
          line: this.line,
          char: this.char,
          from: this.from,
          startLine: token.startLine,
          startChar: token.startChar,
          value: token.value
        });
        return create("(template)", token.value, null, token);

      case Token.TemplateMiddle:
        this.trigger("TemplateMiddle", {
          line: this.line,
          char: this.char,
          from: this.from,
          startLine: token.startLine,
          startChar: token.startChar,
          value: token.value
        });
        return create("(template middle)", token.value, null, token);

      case Token.TemplateTail:
        this.trigger("TemplateTail", {
          line: this.line,
          char: this.char,
          from: this.from,
          startLine: token.startLine,
          startChar: token.startChar,
          value: token.value
        });
        return create("(template tail)", token.value, null, token);

      case Token.NoSubstTemplate:
        this.trigger("NoSubstTemplate", {
          line: this.line,
          char: this.char,
          from: this.from,
          startLine: token.startLine,
          startChar: token.startChar,
          value: token.value
        });
        return create("(no subst template)", token.value, null, token);

      case Token.Identifier:
        this.triggerAsync("Identifier", {
          line: this.line,
          char: this.char,
          from: this.form,
          name: token.value,
          raw_name: token.text,
          isProperty: state.tokens.curr.id === "."
        }, checks, function() { return true; });
      case Token.Keyword:
      case Token.NullLiteral:
      case Token.BooleanLiteral:
        return create("(identifier)", token.value, state.tokens.curr.id === ".", token);

      case Token.NumericLiteral:
        if (token.isMalformed) {
          this.trigger("warning", {
            code: "W045",
            line: this.line,
            character: this.char,
            data: [ token.value ]
          });
        }

        this.triggerAsync("warning", {
          code: "W114",
          line: this.line,
          character: this.char,
          data: [ "0x-" ]
        }, checks, function() { return token.base === 16 && state.jsonMode; });

        this.triggerAsync("warning", {
          code: "W115",
          line: this.line,
          character: this.char
        }, checks, function() {
          return state.isStrict() && token.base === 8 && token.isLegacy;
        });

        this.trigger("Number", {
          line: this.line,
          char: this.char,
          from: this.from,
          value: token.value,
          base: token.base,
          isMalformed: token.malformed
        });

        return create("(number)", token.value);

      case Token.RegExp:
        return create("(regexp)", token.value);

      case Token.Comment:
        state.tokens.curr.comment = true;

        if (token.isSpecial) {
          return {
            id: '(comment)',
            value: token.value,
            body: token.body,
            type: token.commentType,
            isSpecial: token.isSpecial,
            line: this.line,
            character: this.char,
            from: this.from
          };
        }

        break;

      case "":
        break;

      default:
        return create("(punctuator)", token.value);
      }
    }
  }
};

exports.Lexer = Lexer;
exports.Context = Context;

},{"../data/ascii-identifier-data.js":"/node_modules/jshint/data/ascii-identifier-data.js","../lodash":"/node_modules/jshint/lodash.js","./reg.js":"/node_modules/jshint/src/reg.js","./state.js":"/node_modules/jshint/src/state.js","events":"/node_modules/browserify/node_modules/events/events.js"}],"/node_modules/jshint/src/messages.js":[function(_dereq_,module,exports){
"use strict";

var _ = _dereq_("../lodash");

var errors = {
  E001: "Bad option: '{a}'.",
  E002: "Bad option value.",
  E003: "Expected a JSON value.",
  E004: "Input is neither a string nor an array of strings.",
  E005: "Input is empty.",
  E006: "Unexpected early end of program.",
  E007: "Missing \"use strict\" statement.",
  E008: "Strict violation.",
  E009: "Option 'validthis' can't be used in a global scope.",
  E010: "'with' is not allowed in strict mode.",
  E011: "'{a}' has already been declared.",
  E012: "const '{a}' is initialized to 'undefined'.",
  E013: "Attempting to override '{a}' which is a constant.",
  E014: "A regular expression literal can be confused with '/='.",
  E015: "Unclosed regular expression.",
  E016: "Invalid regular expression.",
  E017: "Unclosed comment.",
  E018: "Unbegun comment.",
  E019: "Unmatched '{a}'.",
  E020: "Expected '{a}' to match '{b}' from line {c} and instead saw '{d}'.",
  E021: "Expected '{a}' and instead saw '{b}'.",
  E022: "Line breaking error '{a}'.",
  E023: "Missing '{a}'.",
  E024: "Unexpected '{a}'.",
  E025: "Missing ':' on a case clause.",
  E026: "Missing '}' to match '{' from line {a}.",
  E027: "Missing ']' to match '[' from line {a}.",
  E028: "Illegal comma.",
  E029: "Unclosed string.",
  E030: "Expected an identifier and instead saw '{a}'.",
  E031: "Bad assignment.", // FIXME: Rephrase
  E032: "Expected a small integer or 'false' and instead saw '{a}'.",
  E033: "Expected an operator and instead saw '{a}'.",
  E034: "get/set are ES5 features.",
  E035: "Missing property name.",
  E036: "Expected to see a statement and instead saw a block.",
  E037: null,
  E038: null,
  E039: "Function declarations are not invocable. Wrap the whole function invocation in parens.",
  E040: "Each value should have its own case label.",
  E041: "Unrecoverable syntax error.",
  E042: "Stopping.",
  E043: "Too many errors.",
  E044: null,
  E045: "Invalid for each loop.",
  E046: "A yield statement shall be within a generator function (with syntax: `function*`)",
  E047: null,
  E048: "{a} declaration not directly within block.",
  E049: "A {a} cannot be named '{b}'.",
  E050: "Mozilla requires the yield expression to be parenthesized here.",
  E051: null,
  E052: "Unclosed template literal.",
  E053: "Export declaration must be in global scope.",
  E054: "Class properties must be methods. Expected '(' but instead saw '{a}'.",
  E055: "The '{a}' option cannot be set after any executable code.",
  E056: "'{a}' was used before it was declared, which is illegal for '{b}' variables.",
  E057: "Invalid meta property: '{a}.{b}'.",
  E058: "Missing semicolon."
};

var warnings = {
  W001: "'hasOwnProperty' is a really bad name.",
  W002: "Value of '{a}' may be overwritten in IE 8 and earlier.",
  W003: "'{a}' was used before it was defined.",
  W004: "'{a}' is already defined.",
  W005: "A dot following a number can be confused with a decimal point.",
  W006: "Confusing minuses.",
  W007: "Confusing plusses.",
  W008: "A leading decimal point can be confused with a dot: '{a}'.",
  W009: "The array literal notation [] is preferable.",
  W010: "The object literal notation {} is preferable.",
  W011: null,
  W012: null,
  W013: null,
  W014: "Bad line breaking before '{a}'.",
  W015: null,
  W016: "Unexpected use of '{a}'.",
  W017: "Bad operand.",
  W018: "Confusing use of '{a}'.",
  W019: "Use the isNaN function to compare with NaN.",
  W020: "Read only.",
  W021: "Reassignment of '{a}', which is is a {b}. " +
    "Use 'var' or 'let' to declare bindings that may change.",
  W022: "Do not assign to the exception parameter.",
  W023: "Expected an identifier in an assignment and instead saw a function invocation.",
  W024: "Expected an identifier and instead saw '{a}' (a reserved word).",
  W025: "Missing name in function declaration.",
  W026: "Inner functions should be listed at the top of the outer function.",
  W027: "Unreachable '{a}' after '{b}'.",
  W028: "Label '{a}' on {b} statement.",
  W030: "Expected an assignment or function call and instead saw an expression.",
  W031: "Do not use 'new' for side effects.",
  W032: "Unnecessary semicolon.",
  W033: "Missing semicolon.",
  W034: "Unnecessary directive \"{a}\".",
  W035: "Empty block.",
  W036: "Unexpected /*member '{a}'.",
  W037: "'{a}' is a statement label.",
  W038: "'{a}' used out of scope.",
  W039: "'{a}' is not allowed.",
  W040: "Possible strict violation.",
  W041: "Use '{a}' to compare with '{b}'.",
  W042: "Avoid EOL escaping.",
  W043: "Bad escaping of EOL. Use option multistr if needed.",
  W044: "Bad or unnecessary escaping.", /* TODO(caitp): remove W044 */
  W045: "Bad number '{a}'.",
  W046: "Don't use extra leading zeros '{a}'.",
  W047: "A trailing decimal point can be confused with a dot: '{a}'.",
  W048: "Unexpected control character in regular expression.",
  W049: "Unexpected escaped character '{a}' in regular expression.",
  W050: "JavaScript URL.",
  W051: "Variables should not be deleted.",
  W052: "Unexpected '{a}'.",
  W053: "Do not use {a} as a constructor.",
  W054: "The Function constructor is a form of eval.",
  W055: "A constructor name should start with an uppercase letter.",
  W056: "Bad constructor.",
  W057: "Weird construction. Is 'new' necessary?",
  W058: "Missing '()' invoking a constructor.",
  W059: "Avoid arguments.{a}.",
  W060: "document.write can be a form of eval.",
  W061: "eval can be harmful.",
  W062: "Wrap an immediate function invocation in parens " +
    "to assist the reader in understanding that the expression " +
    "is the result of a function, and not the function itself.",
  W063: "Math is not a function.",
  W064: "Missing 'new' prefix when invoking a constructor.",
  W065: "Missing radix parameter.",
  W066: "Implied eval. Consider passing a function instead of a string.",
  W067: "Bad invocation.",
  W068: "Wrapping non-IIFE function literals in parens is unnecessary.",
  W069: "['{a}'] is better written in dot notation.",
  W070: "Extra comma. (it breaks older versions of IE)",
  W071: "This function has too many statements. ({a})",
  W072: "This function has too many parameters. ({a})",
  W073: "Blocks are nested too deeply. ({a})",
  W074: "This function's cyclomatic complexity is too high. ({a})",
  W075: "Duplicate {a} '{b}'.",
  W076: "Unexpected parameter '{a}' in get {b} function.",
  W077: "Expected a single parameter in set {a} function.",
  W078: "Setter is defined without getter.",
  W079: "Redefinition of '{a}'.",
  W080: "It's not necessary to initialize '{a}' to 'undefined'.",
  W081: null,
  W082: "Function declarations should not be placed in blocks. " +
    "Use a function expression or move the statement to the top of " +
    "the outer function.",
  W083: "Don't make functions within a loop.",
  W084: "Assignment in conditional expression",
  W085: "Don't use 'with'.",
  W086: "Expected a 'break' statement before '{a}'.",
  W087: "Forgotten 'debugger' statement?",
  W088: "Creating global 'for' variable. Should be 'for (var {a} ...'.",
  W089: "The body of a for in should be wrapped in an if statement to filter " +
    "unwanted properties from the prototype.",
  W090: "'{a}' is not a statement label.",
  W091: null,
  W093: "Did you mean to return a conditional instead of an assignment?",
  W094: "Unexpected comma.",
  W095: "Expected a string and instead saw {a}.",
  W096: "The '{a}' key may produce unexpected results.",
  W097: "Use the function form of \"use strict\".",
  W098: "'{a}' is defined but never used.",
  W099: null,
  W100: "This character may get silently deleted by one or more browsers.",
  W101: "Line is too long.",
  W102: null,
  W103: "The '{a}' property is deprecated.",
  W104: "'{a}' is available in ES{b} (use 'esversion: {b}') or Mozilla JS extensions (use moz).",
  W105: "Unexpected {a} in '{b}'.",
  W106: "Identifier '{a}' is not in camel case.",
  W107: "Script URL.",
  W108: "Strings must use doublequote.",
  W109: "Strings must use singlequote.",
  W110: "Mixed double and single quotes.",
  W112: "Unclosed string.",
  W113: "Control character in string: {a}.",
  W114: "Avoid {a}.",
  W115: "Octal literals are not allowed in strict mode.",
  W116: "Expected '{a}' and instead saw '{b}'.",
  W117: "'{a}' is not defined.",
  W118: "'{a}' is only available in Mozilla JavaScript extensions (use moz option).",
  W119: "'{a}' is only available in ES{b} (use 'esversion: {b}').",
  W120: "You might be leaking a variable ({a}) here.",
  W121: "Extending prototype of native object: '{a}'.",
  W122: "Invalid typeof value '{a}'",
  W123: "'{a}' is already defined in outer scope.",
  W124: "A generator function shall contain a yield statement.",
  W125: "This line contains non-breaking spaces: http://jshint.com/doc/options/#nonbsp",
  W126: "Unnecessary grouping operator.",
  W127: "Unexpected use of a comma operator.",
  W128: "Empty array elements require elision=true.",
  W129: "'{a}' is defined in a future version of JavaScript. Use a " +
    "different variable name to avoid migration issues.",
  W130: "Invalid element after rest element.",
  W131: "Invalid parameter after rest parameter.",
  W132: "`var` declarations are forbidden. Use `let` or `const` instead.",
  W133: "Invalid for-{a} loop left-hand-side: {b}.",
  W134: "The '{a}' option is only available when linting ECMAScript {b} code.",
  W135: "{a} may not be supported by non-browser environments.",
  W136: "'{a}' must be in function scope.",
  W137: "Empty destructuring.",
  W138: "Regular parameters should not come after default parameters."
};

var info = {
  I001: "Comma warnings can be turned off with 'laxcomma'.",
  I002: null,
  I003: "ES5 option is now set per default"
};

exports.errors = {};
exports.warnings = {};
exports.info = {};

_.each(errors, function(desc, code) {
  exports.errors[code] = { code: code, desc: desc };
});

_.each(warnings, function(desc, code) {
  exports.warnings[code] = { code: code, desc: desc };
});

_.each(info, function(desc, code) {
  exports.info[code] = { code: code, desc: desc };
});

},{"../lodash":"/node_modules/jshint/lodash.js"}],"/node_modules/jshint/src/name-stack.js":[function(_dereq_,module,exports){
"use strict";

function NameStack() {
  this._stack = [];
}

Object.defineProperty(NameStack.prototype, "length", {
  get: function() {
    return this._stack.length;
  }
});
NameStack.prototype.push = function() {
  this._stack.push(null);
};
NameStack.prototype.pop = function() {
  this._stack.pop();
};
NameStack.prototype.set = function(token) {
  this._stack[this.length - 1] = token;
};
NameStack.prototype.infer = function() {
  var nameToken = this._stack[this.length - 1];
  var prefix = "";
  var type;
  if (!nameToken || nameToken.type === "class") {
    nameToken = this._stack[this.length - 2];
  }

  if (!nameToken) {
    return "(empty)";
  }

  type = nameToken.type;

  if (type !== "(string)" && type !== "(number)" && type !== "(identifier)" && type !== "default") {
    return "(expression)";
  }

  if (nameToken.accessorType) {
    prefix = nameToken.accessorType + " ";
  }

  return prefix + nameToken.value;
};

module.exports = NameStack;

},{}],"/node_modules/jshint/src/options.js":[function(_dereq_,module,exports){
"use strict";
exports.bool = {
  enforcing: {
    bitwise     : true,
    freeze      : true,
    camelcase   : true,
    curly       : true,
    eqeqeq      : true,
    futurehostile: true,
    notypeof    : true,
    es3         : true,
    es5         : true,
    forin       : true,
    funcscope   : true,
    immed       : true,
    iterator    : true,
    newcap      : true,
    noarg       : true,
    nocomma     : true,
    noempty     : true,
    nonbsp      : true,
    nonew       : true,
    undef       : true,
    singleGroups: false,
    varstmt: false,
    enforceall : false
  },
  relaxing: {
    asi         : true,
    multistr    : true,
    debug       : true,
    boss        : true,
    evil        : true,
    globalstrict: true,
    plusplus    : true,
    proto       : true,
    scripturl   : true,
    sub         : true,
    supernew    : true,
    laxbreak    : true,
    laxcomma    : true,
    validthis   : true,
    withstmt    : true,
    moz         : true,
    noyield     : true,
    eqnull      : true,
    lastsemic   : true,
    loopfunc    : true,
    expr        : true,
    esnext      : true,
    elision     : true,
  },
  environments: {
    mootools    : true,
    couch       : true,
    jasmine     : true,
    jquery      : true,
    node        : true,
    qunit       : true,
    rhino       : true,
    shelljs     : true,
    prototypejs : true,
    yui         : true,
    mocha       : true,
    module      : true,
    wsh         : true,
    worker      : true,
    nonstandard : true,
    browser     : true,
    browserify  : true,
    devel       : true,
    dojo        : true,
    typed       : true,
    phantom     : true
  },
  obsolete: {
    onecase     : true, // if one case switch statements should be allowed
    regexp      : true, // if the . should not be allowed in regexp literals
    regexdash   : true  // if unescaped first/last dash (-) inside brackets
  }
};
exports.val = {
  maxlen       : false,
  indent       : false,
  maxerr       : false,
  predef       : false,
  globals      : false,
  quotmark     : false,

  scope        : false,
  maxstatements: false,
  maxdepth     : false,
  maxparams    : false,
  maxcomplexity: false,
  shadow       : false,
  strict      : true,
  unused       : true,
  latedef      : false,

  ignore       : false, // start/end ignoring lines of code, bypassing the lexer

  ignoreDelimiters: false, // array of start/end delimiters used to ignore
  esversion: 5
};
exports.inverted = {
  bitwise : true,
  forin   : true,
  newcap  : true,
  plusplus: true,
  regexp  : true,
  undef   : true,
  eqeqeq  : true,
  strict  : true
};

exports.validNames = Object.keys(exports.val)
  .concat(Object.keys(exports.bool.relaxing))
  .concat(Object.keys(exports.bool.enforcing))
  .concat(Object.keys(exports.bool.obsolete))
  .concat(Object.keys(exports.bool.environments));
exports.renamed = {
  eqeq   : "eqeqeq",
  windows: "wsh",
  sloppy : "strict"
};

exports.removed = {
  nomen: true,
  onevar: true,
  passfail: true,
  white: true,
  gcl: true,
  smarttabs: true,
  trailing: true
};
exports.noenforceall = {
  varstmt: true,
  strict: true
};

},{}],"/node_modules/jshint/src/reg.js":[function(_dereq_,module,exports){

"use strict";
exports.unsafeString =
  /@cc|<\/?|script|\]\s*\]|<\s*!|&lt/i;
exports.unsafeChars =
  /[\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/;
exports.needEsc =
  /[\u0000-\u001f&<"\/\\\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/;

exports.needEscGlobal =
  /[\u0000-\u001f&<"\/\\\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
exports.starSlash = /\*\//;
exports.identifier = /^([a-zA-Z_$][a-zA-Z0-9_$]*)$/;
exports.javascriptURL = /^(?:javascript|jscript|ecmascript|vbscript|livescript)\s*:/i;
exports.fallsThrough = /^\s*falls?\sthrough\s*$/;
exports.maxlenException = /^(?:(?:\/\/|\/\*|\*) ?)?[^ ]+$/;

},{}],"/node_modules/jshint/src/scope-manager.js":[function(_dereq_,module,exports){
"use strict";

var _      = _dereq_("../lodash");
var events = _dereq_("events");
var marker = {};
var scopeManager = function(state, predefined, exported, declared) {

  var _current;
  var _scopeStack = [];

  function _newScope(type) {
    _current = {
      "(labels)": Object.create(null),
      "(usages)": Object.create(null),
      "(breakLabels)": Object.create(null),
      "(parent)": _current,
      "(type)": type,
      "(params)": (type === "functionparams" || type === "catchparams") ? [] : null
    };
    _scopeStack.push(_current);
  }

  _newScope("global");
  _current["(predefined)"] = predefined;

  var _currentFunctBody = _current; // this is the block after the params = function

  var usedPredefinedAndGlobals = Object.create(null);
  var impliedGlobals = Object.create(null);
  var unuseds = [];
  var emitter = new events.EventEmitter();

  function warning(code, token) {
    emitter.emit("warning", {
      code: code,
      token: token,
      data: _.slice(arguments, 2)
    });
  }

  function error(code, token) {
    emitter.emit("warning", {
      code: code,
      token: token,
      data: _.slice(arguments, 2)
    });
  }

  function _setupUsages(labelName) {
    if (!_current["(usages)"][labelName]) {
      _current["(usages)"][labelName] = {
        "(modified)": [],
        "(reassigned)": [],
        "(tokens)": []
      };
    }
  }

  var _getUnusedOption = function(unused_opt) {
    if (unused_opt === undefined) {
      unused_opt = state.option.unused;
    }

    if (unused_opt === true) {
      unused_opt = "last-param";
    }

    return unused_opt;
  };

  var _warnUnused = function(name, tkn, type, unused_opt) {
    var line = tkn.line;
    var chr  = tkn.from;
    var raw_name = tkn.raw_text || name;

    unused_opt = _getUnusedOption(unused_opt);

    var warnable_types = {
      "vars": ["var"],
      "last-param": ["var", "param"],
      "strict": ["var", "param", "last-param"]
    };

    if (unused_opt) {
      if (warnable_types[unused_opt] && warnable_types[unused_opt].indexOf(type) !== -1) {
        warning("W098", { line: line, from: chr }, raw_name);
      }
    }
    if (unused_opt || type === "var") {
      unuseds.push({
        name: name,
        line: line,
        character: chr
      });
    }
  };
  function _checkForUnused() {
    if (_current["(type)"] === "functionparams") {
      _checkParams();
      return;
    }
    var curentLabels = _current["(labels)"];
    for (var labelName in curentLabels) {
      if (curentLabels[labelName]) {
        if (curentLabels[labelName]["(type)"] !== "exception" &&
          curentLabels[labelName]["(unused)"]) {
          _warnUnused(labelName, curentLabels[labelName]["(token)"], "var");
        }
      }
    }
  }
  function _checkParams() {
    var params = _current["(params)"];

    if (!params) {
      return;
    }

    var param = params.pop();
    var unused_opt;

    while (param) {
      var label = _current["(labels)"][param];

      unused_opt = _getUnusedOption(state.funct["(unusedOption)"]);
      if (param === "undefined")
        return;

      if (label["(unused)"]) {
        _warnUnused(param, label["(token)"], "param", state.funct["(unusedOption)"]);
      } else if (unused_opt === "last-param") {
        return;
      }

      param = params.pop();
    }
  }
  function _getLabel(labelName) {
    for (var i = _scopeStack.length - 1 ; i >= 0; --i) {
      var scopeLabels = _scopeStack[i]["(labels)"];
      if (scopeLabels[labelName]) {
        return scopeLabels;
      }
    }
  }

  function usedSoFarInCurrentFunction(labelName) {
    for (var i = _scopeStack.length - 1; i >= 0; i--) {
      var current = _scopeStack[i];
      if (current["(usages)"][labelName]) {
        return current["(usages)"][labelName];
      }
      if (current === _currentFunctBody) {
        break;
      }
    }
    return false;
  }

  function _checkOuterShadow(labelName, token) {
    if (state.option.shadow !== "outer") {
      return;
    }

    var isGlobal = _currentFunctBody["(type)"] === "global",
      isNewFunction = _current["(type)"] === "functionparams";

    var outsideCurrentFunction = !isGlobal;
    for (var i = 0; i < _scopeStack.length; i++) {
      var stackItem = _scopeStack[i];

      if (!isNewFunction && _scopeStack[i + 1] === _currentFunctBody) {
        outsideCurrentFunction = false;
      }
      if (outsideCurrentFunction && stackItem["(labels)"][labelName]) {
        warning("W123", token, labelName);
      }
      if (stackItem["(breakLabels)"][labelName]) {
        warning("W123", token, labelName);
      }
    }
  }

  function _latedefWarning(type, labelName, token) {
    if (state.option.latedef) {
      if ((state.option.latedef === true && type === "function") ||
        type !== "function") {
        warning("W003", token, labelName);
      }
    }
  }

  var scopeManagerInst = {

    on: function(names, listener) {
      names.split(" ").forEach(function(name) {
        emitter.on(name, listener);
      });
    },

    isPredefined: function(labelName) {
      return !this.has(labelName) && _.has(_scopeStack[0]["(predefined)"], labelName);
    },
    stack: function(type) {
      var previousScope = _current;
      _newScope(type);

      if (!type && previousScope["(type)"] === "functionparams") {

        _current["(isFuncBody)"] = true;
        _current["(context)"] = _currentFunctBody;
        _currentFunctBody = _current;
      }
    },

    unstack: function() {
      var subScope = _scopeStack.length > 1 ? _scopeStack[_scopeStack.length - 2] : null;
      var isUnstackingFunctionBody = _current === _currentFunctBody,
        isUnstackingFunctionParams = _current["(type)"] === "functionparams",
        isUnstackingFunctionOuter = _current["(type)"] === "functionouter";

      var i, j;
      var currentUsages = _current["(usages)"];
      var currentLabels = _current["(labels)"];
      var usedLabelNameList = Object.keys(currentUsages);

      if (currentUsages.__proto__ && usedLabelNameList.indexOf("__proto__") === -1) {
        usedLabelNameList.push("__proto__");
      }

      for (i = 0; i < usedLabelNameList.length; i++) {
        var usedLabelName = usedLabelNameList[i];

        var usage = currentUsages[usedLabelName];
        var usedLabel = currentLabels[usedLabelName];
        if (usedLabel) {
          var usedLabelType = usedLabel["(type)"];

          if (usedLabel["(useOutsideOfScope)"] && !state.option.funcscope) {
            var usedTokens = usage["(tokens)"];
            if (usedTokens) {
              for (j = 0; j < usedTokens.length; j++) {
                if (usedLabel["(function)"] === usedTokens[j]["(function)"]) {
                  error("W038", usedTokens[j], usedLabelName);
                }
              }
            }
          }
          _current["(labels)"][usedLabelName]["(unused)"] = false;
          if (usedLabelType === "const" && usage["(modified)"]) {
            for (j = 0; j < usage["(modified)"].length; j++) {
              error("E013", usage["(modified)"][j], usedLabelName);
            }
          }
          if ((usedLabelType === "function" || usedLabelType === "class") &&
              usage["(reassigned)"]) {
            for (j = 0; j < usage["(reassigned)"].length; j++) {
              error("W021", usage["(reassigned)"][j], usedLabelName, usedLabelType);
            }
          }
          continue;
        }

        if (isUnstackingFunctionOuter) {
          state.funct["(isCapturing)"] = true;
        }

        if (subScope) {
          if (!subScope["(usages)"][usedLabelName]) {
            subScope["(usages)"][usedLabelName] = usage;
            if (isUnstackingFunctionBody) {
              subScope["(usages)"][usedLabelName]["(onlyUsedSubFunction)"] = true;
            }
          } else {
            var subScopeUsage = subScope["(usages)"][usedLabelName];
            subScopeUsage["(modified)"] = subScopeUsage["(modified)"].concat(usage["(modified)"]);
            subScopeUsage["(tokens)"] = subScopeUsage["(tokens)"].concat(usage["(tokens)"]);
            subScopeUsage["(reassigned)"] =
              subScopeUsage["(reassigned)"].concat(usage["(reassigned)"]);
            subScopeUsage["(onlyUsedSubFunction)"] = false;
          }
        } else {
          if (typeof _current["(predefined)"][usedLabelName] === "boolean") {
            delete declared[usedLabelName];
            usedPredefinedAndGlobals[usedLabelName] = marker;
            if (_current["(predefined)"][usedLabelName] === false && usage["(reassigned)"]) {
              for (j = 0; j < usage["(reassigned)"].length; j++) {
                warning("W020", usage["(reassigned)"][j]);
              }
            }
          }
          else {
            if (usage["(tokens)"]) {
              for (j = 0; j < usage["(tokens)"].length; j++) {
                var undefinedToken = usage["(tokens)"][j];
                if (!undefinedToken.forgiveUndef) {
                  if (state.option.undef && !undefinedToken.ignoreUndef) {
                    warning("W117", undefinedToken, usedLabelName);
                  }
                  if (impliedGlobals[usedLabelName]) {
                    impliedGlobals[usedLabelName].line.push(undefinedToken.line);
                  } else {
                    impliedGlobals[usedLabelName] = {
                      name: usedLabelName,
                      line: [undefinedToken.line]
                    };
                  }
                }
              }
            }
          }
        }
      }
      if (!subScope) {
        Object.keys(declared)
          .forEach(function(labelNotUsed) {
            _warnUnused(labelNotUsed, declared[labelNotUsed], "var");
          });
      }
      if (subScope && !isUnstackingFunctionBody &&
        !isUnstackingFunctionParams && !isUnstackingFunctionOuter) {
        var labelNames = Object.keys(currentLabels);
        for (i = 0; i < labelNames.length; i++) {

          var defLabelName = labelNames[i];
          if (!currentLabels[defLabelName]["(blockscoped)"] &&
            currentLabels[defLabelName]["(type)"] !== "exception" &&
            !this.funct.has(defLabelName, { excludeCurrent: true })) {
            subScope["(labels)"][defLabelName] = currentLabels[defLabelName];
            if (_currentFunctBody["(type)"] !== "global") {
              subScope["(labels)"][defLabelName]["(useOutsideOfScope)"] = true;
            }
            delete currentLabels[defLabelName];
          }
        }
      }

      _checkForUnused();

      _scopeStack.pop();
      if (isUnstackingFunctionBody) {
        _currentFunctBody = _scopeStack[_.findLastIndex(_scopeStack, function(scope) {
          return scope["(isFuncBody)"] || scope["(type)"] === "global";
        })];
      }

      _current = subScope;
    },
    addParam: function(labelName, token, type) {
      type = type || "param";

      if (type === "exception") {
        var previouslyDefinedLabelType = this.funct.labeltype(labelName);
        if (previouslyDefinedLabelType && previouslyDefinedLabelType !== "exception") {
          if (!state.option.node) {
            warning("W002", state.tokens.next, labelName);
          }
        }
      }
      if (_.has(_current["(labels)"], labelName)) {
        _current["(labels)"][labelName].duplicated = true;
      } else {
        _checkOuterShadow(labelName, token, type);

        _current["(labels)"][labelName] = {
          "(type)" : type,
          "(token)": token,
          "(unused)": true };

        _current["(params)"].push(labelName);
      }

      if (_.has(_current["(usages)"], labelName)) {
        var usage = _current["(usages)"][labelName];
        if (usage["(onlyUsedSubFunction)"]) {
          _latedefWarning(type, labelName, token);
        } else {
          warning("E056", token, labelName, type);
        }
      }
    },

    validateParams: function() {
      if (_currentFunctBody["(type)"] === "global") {
        return;
      }

      var isStrict = state.isStrict();
      var currentFunctParamScope = _currentFunctBody["(parent)"];

      if (!currentFunctParamScope["(params)"]) {
        return;
      }

      currentFunctParamScope["(params)"].forEach(function(labelName) {
        var label = currentFunctParamScope["(labels)"][labelName];

        if (label && label.duplicated) {
          if (isStrict) {
            warning("E011", label["(token)"], labelName);
          } else if (state.option.shadow !== true) {
            warning("W004", label["(token)"], labelName);
          }
        }
      });
    },

    getUsedOrDefinedGlobals: function() {
      var list = Object.keys(usedPredefinedAndGlobals);
      if (usedPredefinedAndGlobals.__proto__ === marker &&
        list.indexOf("__proto__") === -1) {
        list.push("__proto__");
      }

      return list;
    },
    getImpliedGlobals: function() {
      var values = _.values(impliedGlobals);
      var hasProto = false;
      if (impliedGlobals.__proto__) {
        hasProto = values.some(function(value) {
          return value.name === "__proto__";
        });

        if (!hasProto) {
          values.push(impliedGlobals.__proto__);
        }
      }

      return values;
    },
    getUnuseds: function() {
      return unuseds;
    },

    has: function(labelName) {
      return Boolean(_getLabel(labelName));
    },

    labeltype: function(labelName) {
      var scopeLabels = _getLabel(labelName);
      if (scopeLabels) {
        return scopeLabels[labelName]["(type)"];
      }
      return null;
    },
    addExported: function(labelName) {
      var globalLabels = _scopeStack[0]["(labels)"];
      if (_.has(declared, labelName)) {
        delete declared[labelName];
      } else if (_.has(globalLabels, labelName)) {
        globalLabels[labelName]["(unused)"] = false;
      } else {
        for (var i = 1; i < _scopeStack.length; i++) {
          var scope = _scopeStack[i];
          if (!scope["(type)"]) {
            if (_.has(scope["(labels)"], labelName) &&
                !scope["(labels)"][labelName]["(blockscoped)"]) {
              scope["(labels)"][labelName]["(unused)"] = false;
              return;
            }
          } else {
            break;
          }
        }
        exported[labelName] = true;
      }
    },
    setExported: function(labelName, token) {
      this.block.use(labelName, token);
    },
    addlabel: function(labelName, opts) {

      var type  = opts.type;
      var token = opts.token;
      var isblockscoped = type === "let" || type === "const" || type === "class";
      var isexported    = (isblockscoped ? _current : _currentFunctBody)["(type)"] === "global" &&
                          _.has(exported, labelName);
      _checkOuterShadow(labelName, token, type);
      if (isblockscoped) {

        var declaredInCurrentScope = _current["(labels)"][labelName];
        if (!declaredInCurrentScope && _current === _currentFunctBody &&
          _current["(type)"] !== "global") {
          declaredInCurrentScope = !!_currentFunctBody["(parent)"]["(labels)"][labelName];
        }
        if (!declaredInCurrentScope && _current["(usages)"][labelName]) {
          var usage = _current["(usages)"][labelName];
          if (usage["(onlyUsedSubFunction)"]) {
            _latedefWarning(type, labelName, token);
          } else {
            warning("E056", token, labelName, type);
          }
        }
        if (declaredInCurrentScope) {
          warning("E011", token, labelName);
        }
        else if (state.option.shadow === "outer") {
          if (scopeManagerInst.funct.has(labelName)) {
            warning("W004", token, labelName);
          }
        }

        scopeManagerInst.block.add(labelName, type, token, !isexported);

      } else {

        var declaredInCurrentFunctionScope = scopeManagerInst.funct.has(labelName);
        if (!declaredInCurrentFunctionScope && usedSoFarInCurrentFunction(labelName)) {
          _latedefWarning(type, labelName, token);
        }
        if (scopeManagerInst.funct.has(labelName, { onlyBlockscoped: true })) {
          warning("E011", token, labelName);
        } else if (state.option.shadow !== true) {
          if (declaredInCurrentFunctionScope && labelName !== "__proto__") {
            if (_currentFunctBody["(type)"] !== "global") {
              warning("W004", token, labelName);
            }
          }
        }

        scopeManagerInst.funct.add(labelName, type, token, !isexported);

        if (_currentFunctBody["(type)"] === "global") {
          usedPredefinedAndGlobals[labelName] = marker;
        }
      }
    },

    funct: {
      labeltype: function(labelName, options) {
        var onlyBlockscoped = options && options.onlyBlockscoped;
        var excludeParams = options && options.excludeParams;
        var currentScopeIndex = _scopeStack.length - (options && options.excludeCurrent ? 2 : 1);
        for (var i = currentScopeIndex; i >= 0; i--) {
          var current = _scopeStack[i];
          if (current["(labels)"][labelName] &&
            (!onlyBlockscoped || current["(labels)"][labelName]["(blockscoped)"])) {
            return current["(labels)"][labelName]["(type)"];
          }
          var scopeCheck = excludeParams ? _scopeStack[ i - 1 ] : current;
          if (scopeCheck && scopeCheck["(type)"] === "functionparams") {
            return null;
          }
        }
        return null;
      },
      hasBreakLabel: function(labelName) {
        for (var i = _scopeStack.length - 1; i >= 0; i--) {
          var current = _scopeStack[i];

          if (current["(breakLabels)"][labelName]) {
            return true;
          }
          if (current["(type)"] === "functionparams") {
            return false;
          }
        }
        return false;
      },
      has: function(labelName, options) {
        return Boolean(this.labeltype(labelName, options));
      },
      add: function(labelName, type, tok, unused) {
        _current["(labels)"][labelName] = {
          "(type)" : type,
          "(token)": tok,
          "(blockscoped)": false,
          "(function)": _currentFunctBody,
          "(unused)": unused };
      }
    },

    block: {
      isGlobal: function() {
        return _current["(type)"] === "global";
      },

      use: function(labelName, token) {
        var paramScope = _currentFunctBody["(parent)"];
        if (paramScope && paramScope["(labels)"][labelName] &&
          paramScope["(labels)"][labelName]["(type)"] === "param") {
          if (!scopeManagerInst.funct.has(labelName,
                { excludeParams: true, onlyBlockscoped: true })) {
            paramScope["(labels)"][labelName]["(unused)"] = false;
          }
        }

        if (token && (state.ignored.W117 || state.option.undef === false)) {
          token.ignoreUndef = true;
        }

        _setupUsages(labelName);

        if (token) {
          token["(function)"] = _currentFunctBody;
          _current["(usages)"][labelName]["(tokens)"].push(token);
        }
      },

      reassign: function(labelName, token) {

        this.modify(labelName, token);

        _current["(usages)"][labelName]["(reassigned)"].push(token);
      },

      modify: function(labelName, token) {

        _setupUsages(labelName);

        _current["(usages)"][labelName]["(modified)"].push(token);
      },
      add: function(labelName, type, tok, unused) {
        _current["(labels)"][labelName] = {
          "(type)" : type,
          "(token)": tok,
          "(blockscoped)": true,
          "(unused)": unused };
      },

      addBreakLabel: function(labelName, opts) {
        var token = opts.token;
        if (scopeManagerInst.funct.hasBreakLabel(labelName)) {
          warning("E011", token, labelName);
        }
        else if (state.option.shadow === "outer") {
          if (scopeManagerInst.funct.has(labelName)) {
            warning("W004", token, labelName);
          } else {
            _checkOuterShadow(labelName, token);
          }
        }
        _current["(breakLabels)"][labelName] = token;
      }
    }
  };
  return scopeManagerInst;
};

module.exports = scopeManager;

},{"../lodash":"/node_modules/jshint/lodash.js","events":"/node_modules/browserify/node_modules/events/events.js"}],"/node_modules/jshint/src/state.js":[function(_dereq_,module,exports){
"use strict";
var NameStack = _dereq_("./name-stack.js");

var state = {
  syntax: {},
  isStrict: function() {
    return this.directive["use strict"] || this.inClassBody ||
      this.option.module || this.option.strict === "implied";
  },

  inMoz: function() {
    return this.option.moz;
  },
  inES6: function() {
    return this.option.moz || this.option.esversion >= 6;
  },
  inES5: function(strict) {
    if (strict) {
      return (!this.option.esversion || this.option.esversion === 5) && !this.option.moz;
    }
    return !this.option.esversion || this.option.esversion >= 5 || this.option.moz;
  },


  reset: function() {
    this.tokens = {
      prev: null,
      next: null,
      curr: null
    };

    this.option = {};
    this.funct = null;
    this.ignored = {};
    this.directive = {};
    this.jsonMode = false;
    this.jsonWarnings = [];
    this.lines = [];
    this.tab = "";
    this.cache = {}; // Node.JS doesn't have Map. Sniff.
    this.ignoredLines = {};
    this.forinifcheckneeded = false;
    this.nameStack = new NameStack();
    this.inClassBody = false;
  }
};

exports.state = state;

},{"./name-stack.js":"/node_modules/jshint/src/name-stack.js"}],"/node_modules/jshint/src/style.js":[function(_dereq_,module,exports){
"use strict";

exports.register = function(linter) {

  linter.on("Identifier", function style_scanProto(data) {
    if (linter.getOption("proto")) {
      return;
    }

    if (data.name === "__proto__") {
      linter.warn("W103", {
        line: data.line,
        char: data.char,
        data: [ data.name, "6" ]
      });
    }
  });

  linter.on("Identifier", function style_scanIterator(data) {
    if (linter.getOption("iterator")) {
      return;
    }

    if (data.name === "__iterator__") {
      linter.warn("W103", {
        line: data.line,
        char: data.char,
        data: [ data.name ]
      });
    }
  });

  linter.on("Identifier", function style_scanCamelCase(data) {
    if (!linter.getOption("camelcase")) {
      return;
    }

    if (data.name.replace(/^_+|_+$/g, "").indexOf("_") > -1 && !data.name.match(/^[A-Z0-9_]*$/)) {
      linter.warn("W106", {
        line: data.line,
        char: data.from,
        data: [ data.name ]
      });
    }
  });

  linter.on("String", function style_scanQuotes(data) {
    var quotmark = linter.getOption("quotmark");
    var code;

    if (!quotmark) {
      return;
    }

    if (quotmark === "single" && data.quote !== "'") {
      code = "W109";
    }

    if (quotmark === "double" && data.quote !== "\"") {
      code = "W108";
    }

    if (quotmark === true) {
      if (!linter.getCache("quotmark")) {
        linter.setCache("quotmark", data.quote);
      }

      if (linter.getCache("quotmark") !== data.quote) {
        code = "W110";
      }
    }

    if (code) {
      linter.warn(code, {
        line: data.line,
        char: data.char,
      });
    }
  });

  linter.on("Number", function style_scanNumbers(data) {
    if (data.value.charAt(0) === ".") {
      linter.warn("W008", {
        line: data.line,
        char: data.char,
        data: [ data.value ]
      });
    }

    if (data.value.substr(data.value.length - 1) === ".") {
      linter.warn("W047", {
        line: data.line,
        char: data.char,
        data: [ data.value ]
      });
    }

    if (/^00+/.test(data.value)) {
      linter.warn("W046", {
        line: data.line,
        char: data.char,
        data: [ data.value ]
      });
    }
  });

  linter.on("String", function style_scanJavaScriptURLs(data) {
    var re = /^(?:javascript|jscript|ecmascript|vbscript|livescript)\s*:/i;

    if (linter.getOption("scripturl")) {
      return;
    }

    if (re.test(data.value)) {
      linter.warn("W107", {
        line: data.line,
        char: data.char
      });
    }
  });
};

},{}],"/node_modules/jshint/src/vars.js":[function(_dereq_,module,exports){

"use strict";

exports.reservedVars = {
  arguments : false,
  NaN       : false
};

exports.ecmaIdentifiers = {
  3: {
    Array              : false,
    Boolean            : false,
    Date               : false,
    decodeURI          : false,
    decodeURIComponent : false,
    encodeURI          : false,
    encodeURIComponent : false,
    Error              : false,
    "eval"             : false,
    EvalError          : false,
    Function           : false,
    hasOwnProperty     : false,
    isFinite           : false,
    isNaN              : false,
    Math               : false,
    Number             : false,
    Object             : false,
    parseInt           : false,
    parseFloat         : false,
    RangeError         : false,
    ReferenceError     : false,
    RegExp             : false,
    String             : false,
    SyntaxError        : false,
    TypeError          : false,
    URIError           : false
  },
  5: {
    JSON               : false
  },
  6: {
    Map                : false,
    Promise            : false,
    Proxy              : false,
    Reflect            : false,
    Set                : false,
    Symbol             : false,
    WeakMap            : false,
    WeakSet            : false
  }
};

exports.browser = {
  Audio                : false,
  Blob                 : false,
  addEventListener     : false,
  applicationCache     : false,
  atob                 : false,
  blur                 : false,
  btoa                 : false,
  cancelAnimationFrame : false,
  CanvasGradient       : false,
  CanvasPattern        : false,
  CanvasRenderingContext2D: false,
  CSS                  : false,
  clearInterval        : false,
  clearTimeout         : false,
  close                : false,
  closed               : false,
  Comment              : false,
  CustomEvent          : false,
  DOMParser            : false,
  defaultStatus        : false,
  Document             : false,
  document             : false,
  DocumentFragment     : false,
  Element              : false,
  ElementTimeControl   : false,
  Event                : false,
  event                : false,
  fetch                : false,
  FileReader           : false,
  FormData             : false,
  focus                : false,
  frames               : false,
  getComputedStyle     : false,
  HTMLElement          : false,
  HTMLAnchorElement    : false,
  HTMLBaseElement      : false,
  HTMLBlockquoteElement: false,
  HTMLBodyElement      : false,
  HTMLBRElement        : false,
  HTMLButtonElement    : false,
  HTMLCanvasElement    : false,
  HTMLCollection       : false,
  HTMLDirectoryElement : false,
  HTMLDivElement       : false,
  HTMLDListElement     : false,
  HTMLFieldSetElement  : false,
  HTMLFontElement      : false,
  HTMLFormElement      : false,
  HTMLFrameElement     : false,
  HTMLFrameSetElement  : false,
  HTMLHeadElement      : false,
  HTMLHeadingElement   : false,
  HTMLHRElement        : false,
  HTMLHtmlElement      : false,
  HTMLIFrameElement    : false,
  HTMLImageElement     : false,
  HTMLInputElement     : false,
  HTMLIsIndexElement   : false,
  HTMLLabelElement     : false,
  HTMLLayerElement     : false,
  HTMLLegendElement    : false,
  HTMLLIElement        : false,
  HTMLLinkElement      : false,
  HTMLMapElement       : false,
  HTMLMenuElement      : false,
  HTMLMetaElement      : false,
  HTMLModElement       : false,
  HTMLObjectElement    : false,
  HTMLOListElement     : false,
  HTMLOptGroupElement  : false,
  HTMLOptionElement    : false,
  HTMLParagraphElement : false,
  HTMLParamElement     : false,
  HTMLPreElement       : false,
  HTMLQuoteElement     : false,
  HTMLScriptElement    : false,
  HTMLSelectElement    : false,
  HTMLStyleElement     : false,
  HTMLTableCaptionElement: false,
  HTMLTableCellElement : false,
  HTMLTableColElement  : false,
  HTMLTableElement     : false,
  HTMLTableRowElement  : false,
  HTMLTableSectionElement: false,
  HTMLTemplateElement  : false,
  HTMLTextAreaElement  : false,
  HTMLTitleElement     : false,
  HTMLUListElement     : false,
  HTMLVideoElement     : false,
  history              : false,
  Image                : false,
  Intl                 : false,
  length               : false,
  localStorage         : false,
  location             : false,
  matchMedia           : false,
  MessageChannel       : false,
  MessageEvent         : false,
  MessagePort          : false,
  MouseEvent           : false,
  moveBy               : false,
  moveTo               : false,
  MutationObserver     : false,
  name                 : false,
  Node                 : false,
  NodeFilter           : false,
  NodeList             : false,
  Notification         : false,
  navigator            : false,
  onbeforeunload       : true,
  onblur               : true,
  onerror              : true,
  onfocus              : true,
  onload               : true,
  onresize             : true,
  onunload             : true,
  open                 : false,
  openDatabase         : false,
  opener               : false,
  Option               : false,
  parent               : false,
  performance          : false,
  print                : false,
  Range                : false,
  requestAnimationFrame : false,
  removeEventListener  : false,
  resizeBy             : false,
  resizeTo             : false,
  screen               : false,
  scroll               : false,
  scrollBy             : false,
  scrollTo             : false,
  sessionStorage       : false,
  setInterval          : false,
  setTimeout           : false,
  SharedWorker         : false,
  status               : false,
  SVGAElement          : false,
  SVGAltGlyphDefElement: false,
  SVGAltGlyphElement   : false,
  SVGAltGlyphItemElement: false,
  SVGAngle             : false,
  SVGAnimateColorElement: false,
  SVGAnimateElement    : false,
  SVGAnimateMotionElement: false,
  SVGAnimateTransformElement: false,
  SVGAnimatedAngle     : false,
  SVGAnimatedBoolean   : false,
  SVGAnimatedEnumeration: false,
  SVGAnimatedInteger   : false,
  SVGAnimatedLength    : false,
  SVGAnimatedLengthList: false,
  SVGAnimatedNumber    : false,
  SVGAnimatedNumberList: false,
  SVGAnimatedPathData  : false,
  SVGAnimatedPoints    : false,
  SVGAnimatedPreserveAspectRatio: false,
  SVGAnimatedRect      : false,
  SVGAnimatedString    : false,
  SVGAnimatedTransformList: false,
  SVGAnimationElement  : false,
  SVGCSSRule           : false,
  SVGCircleElement     : false,
  SVGClipPathElement   : false,
  SVGColor             : false,
  SVGColorProfileElement: false,
  SVGColorProfileRule  : false,
  SVGComponentTransferFunctionElement: false,
  SVGCursorElement     : false,
  SVGDefsElement       : false,
  SVGDescElement       : false,
  SVGDocument          : false,
  SVGElement           : false,
  SVGElementInstance   : false,
  SVGElementInstanceList: false,
  SVGEllipseElement    : false,
  SVGExternalResourcesRequired: false,
  SVGFEBlendElement    : false,
  SVGFEColorMatrixElement: false,
  SVGFEComponentTransferElement: false,
  SVGFECompositeElement: false,
  SVGFEConvolveMatrixElement: false,
  SVGFEDiffuseLightingElement: false,
  SVGFEDisplacementMapElement: false,
  SVGFEDistantLightElement: false,
  SVGFEFloodElement    : false,
  SVGFEFuncAElement    : false,
  SVGFEFuncBElement    : false,
  SVGFEFuncGElement    : false,
  SVGFEFuncRElement    : false,
  SVGFEGaussianBlurElement: false,
  SVGFEImageElement    : false,
  SVGFEMergeElement    : false,
  SVGFEMergeNodeElement: false,
  SVGFEMorphologyElement: false,
  SVGFEOffsetElement   : false,
  SVGFEPointLightElement: false,
  SVGFESpecularLightingElement: false,
  SVGFESpotLightElement: false,
  SVGFETileElement     : false,
  SVGFETurbulenceElement: false,
  SVGFilterElement     : false,
  SVGFilterPrimitiveStandardAttributes: false,
  SVGFitToViewBox      : false,
  SVGFontElement       : false,
  SVGFontFaceElement   : false,
  SVGFontFaceFormatElement: false,
  SVGFontFaceNameElement: false,
  SVGFontFaceSrcElement: false,
  SVGFontFaceUriElement: false,
  SVGForeignObjectElement: false,
  SVGGElement          : false,
  SVGGlyphElement      : false,
  SVGGlyphRefElement   : false,
  SVGGradientElement   : false,
  SVGHKernElement      : false,
  SVGICCColor          : false,
  SVGImageElement      : false,
  SVGLangSpace         : false,
  SVGLength            : false,
  SVGLengthList        : false,
  SVGLineElement       : false,
  SVGLinearGradientElement: false,
  SVGLocatable         : false,
  SVGMPathElement      : false,
  SVGMarkerElement     : false,
  SVGMaskElement       : false,
  SVGMatrix            : false,
  SVGMetadataElement   : false,
  SVGMissingGlyphElement: false,
  SVGNumber            : false,
  SVGNumberList        : false,
  SVGPaint             : false,
  SVGPathElement       : false,
  SVGPathSeg           : false,
  SVGPathSegArcAbs     : false,
  SVGPathSegArcRel     : false,
  SVGPathSegClosePath  : false,
  SVGPathSegCurvetoCubicAbs: false,
  SVGPathSegCurvetoCubicRel: false,
  SVGPathSegCurvetoCubicSmoothAbs: false,
  SVGPathSegCurvetoCubicSmoothRel: false,
  SVGPathSegCurvetoQuadraticAbs: false,
  SVGPathSegCurvetoQuadraticRel: false,
  SVGPathSegCurvetoQuadraticSmoothAbs: false,
  SVGPathSegCurvetoQuadraticSmoothRel: false,
  SVGPathSegLinetoAbs  : false,
  SVGPathSegLinetoHorizontalAbs: false,
  SVGPathSegLinetoHorizontalRel: false,
  SVGPathSegLinetoRel  : false,
  SVGPathSegLinetoVerticalAbs: false,
  SVGPathSegLinetoVerticalRel: false,
  SVGPathSegList       : false,
  SVGPathSegMovetoAbs  : false,
  SVGPathSegMovetoRel  : false,
  SVGPatternElement    : false,
  SVGPoint             : false,
  SVGPointList         : false,
  SVGPolygonElement    : false,
  SVGPolylineElement   : false,
  SVGPreserveAspectRatio: false,
  SVGRadialGradientElement: false,
  SVGRect              : false,
  SVGRectElement       : false,
  SVGRenderingIntent   : false,
  SVGSVGElement        : false,
  SVGScriptElement     : false,
  SVGSetElement        : false,
  SVGStopElement       : false,
  SVGStringList        : false,
  SVGStylable          : false,
  SVGStyleElement      : false,
  SVGSwitchElement     : false,
  SVGSymbolElement     : false,
  SVGTRefElement       : false,
  SVGTSpanElement      : false,
  SVGTests             : false,
  SVGTextContentElement: false,
  SVGTextElement       : false,
  SVGTextPathElement   : false,
  SVGTextPositioningElement: false,
  SVGTitleElement      : false,
  SVGTransform         : false,
  SVGTransformList     : false,
  SVGTransformable     : false,
  SVGURIReference      : false,
  SVGUnitTypes         : false,
  SVGUseElement        : false,
  SVGVKernElement      : false,
  SVGViewElement       : false,
  SVGViewSpec          : false,
  SVGZoomAndPan        : false,
  Text                 : false,
  TextDecoder          : false,
  TextEncoder          : false,
  TimeEvent            : false,
  top                  : false,
  URL                  : false,
  WebGLActiveInfo      : false,
  WebGLBuffer          : false,
  WebGLContextEvent    : false,
  WebGLFramebuffer     : false,
  WebGLProgram         : false,
  WebGLRenderbuffer    : false,
  WebGLRenderingContext: false,
  WebGLShader          : false,
  WebGLShaderPrecisionFormat: false,
  WebGLTexture         : false,
  WebGLUniformLocation : false,
  WebSocket            : false,
  window               : false,
  Window               : false,
  Worker               : false,
  XDomainRequest       : false,
  XMLHttpRequest       : false,
  XMLSerializer        : false,
  XPathEvaluator       : false,
  XPathException       : false,
  XPathExpression      : false,
  XPathNamespace       : false,
  XPathNSResolver      : false,
  XPathResult          : false
};

exports.devel = {
  alert  : false,
  confirm: false,
  console: false,
  Debug  : false,
  opera  : false,
  prompt : false
};

exports.worker = {
  importScripts  : true,
  postMessage    : true,
  self           : true,
  FileReaderSync : true
};
exports.nonstandard = {
  escape  : false,
  unescape: false
};

exports.couch = {
  "require" : false,
  respond   : false,
  getRow    : false,
  emit      : false,
  send      : false,
  start     : false,
  sum       : false,
  log       : false,
  exports   : false,
  module    : false,
  provides  : false
};

exports.node = {
  __filename    : false,
  __dirname     : false,
  GLOBAL        : false,
  global        : false,
  module        : false,
  require       : false,

  Buffer        : true,
  console       : true,
  exports       : true,
  process       : true,
  setTimeout    : true,
  clearTimeout  : true,
  setInterval   : true,
  clearInterval : true,
  setImmediate  : true, // v0.9.1+
  clearImmediate: true  // v0.9.1+
};

exports.browserify = {
  __filename    : false,
  __dirname     : false,
  global        : false,
  module        : false,
  require       : false,
  Buffer        : true,
  exports       : true,
  process       : true
};

exports.phantom = {
  phantom      : true,
  require      : true,
  WebPage      : true,
  console      : true, // in examples, but undocumented
  exports      : true  // v1.7+
};

exports.qunit = {
  asyncTest      : false,
  deepEqual      : false,
  equal          : false,
  expect         : false,
  module         : false,
  notDeepEqual   : false,
  notEqual       : false,
  notPropEqual   : false,
  notStrictEqual : false,
  ok             : false,
  propEqual      : false,
  QUnit          : false,
  raises         : false,
  start          : false,
  stop           : false,
  strictEqual    : false,
  test           : false,
  "throws"       : false
};

exports.rhino = {
  defineClass  : false,
  deserialize  : false,
  gc           : false,
  help         : false,
  importClass  : false,
  importPackage: false,
  "java"       : false,
  load         : false,
  loadClass    : false,
  Packages     : false,
  print        : false,
  quit         : false,
  readFile     : false,
  readUrl      : false,
  runCommand   : false,
  seal         : false,
  serialize    : false,
  spawn        : false,
  sync         : false,
  toint32      : false,
  version      : false
};

exports.shelljs = {
  target       : false,
  echo         : false,
  exit         : false,
  cd           : false,
  pwd          : false,
  ls           : false,
  find         : false,
  cp           : false,
  rm           : false,
  mv           : false,
  mkdir        : false,
  test         : false,
  cat          : false,
  sed          : false,
  grep         : false,
  which        : false,
  dirs         : false,
  pushd        : false,
  popd         : false,
  env          : false,
  exec         : false,
  chmod        : false,
  config       : false,
  error        : false,
  tempdir      : false
};

exports.typed = {
  ArrayBuffer         : false,
  ArrayBufferView     : false,
  DataView            : false,
  Float32Array        : false,
  Float64Array        : false,
  Int16Array          : false,
  Int32Array          : false,
  Int8Array           : false,
  Uint16Array         : false,
  Uint32Array         : false,
  Uint8Array          : false,
  Uint8ClampedArray   : false
};

exports.wsh = {
  ActiveXObject            : true,
  Enumerator               : true,
  GetObject                : true,
  ScriptEngine             : true,
  ScriptEngineBuildVersion : true,
  ScriptEngineMajorVersion : true,
  ScriptEngineMinorVersion : true,
  VBArray                  : true,
  WSH                      : true,
  WScript                  : true,
  XDomainRequest           : true
};

exports.dojo = {
  dojo     : false,
  dijit    : false,
  dojox    : false,
  define   : false,
  "require": false
};

exports.jquery = {
  "$"    : false,
  jQuery : false
};

exports.mootools = {
  "$"           : false,
  "$$"          : false,
  Asset         : false,
  Browser       : false,
  Chain         : false,
  Class         : false,
  Color         : false,
  Cookie        : false,
  Core          : false,
  Document      : false,
  DomReady      : false,
  DOMEvent      : false,
  DOMReady      : false,
  Drag          : false,
  Element       : false,
  Elements      : false,
  Event         : false,
  Events        : false,
  Fx            : false,
  Group         : false,
  Hash          : false,
  HtmlTable     : false,
  IFrame        : false,
  IframeShim    : false,
  InputValidator: false,
  instanceOf    : false,
  Keyboard      : false,
  Locale        : false,
  Mask          : false,
  MooTools      : false,
  Native        : false,
  Options       : false,
  OverText      : false,
  Request       : false,
  Scroller      : false,
  Slick         : false,
  Slider        : false,
  Sortables     : false,
  Spinner       : false,
  Swiff         : false,
  Tips          : false,
  Type          : false,
  typeOf        : false,
  URI           : false,
  Window        : false
};

exports.prototypejs = {
  "$"               : false,
  "$$"              : false,
  "$A"              : false,
  "$F"              : false,
  "$H"              : false,
  "$R"              : false,
  "$break"          : false,
  "$continue"       : false,
  "$w"              : false,
  Abstract          : false,
  Ajax              : false,
  Class             : false,
  Enumerable        : false,
  Element           : false,
  Event             : false,
  Field             : false,
  Form              : false,
  Hash              : false,
  Insertion         : false,
  ObjectRange       : false,
  PeriodicalExecuter: false,
  Position          : false,
  Prototype         : false,
  Selector          : false,
  Template          : false,
  Toggle            : false,
  Try               : false,
  Autocompleter     : false,
  Builder           : false,
  Control           : false,
  Draggable         : false,
  Draggables        : false,
  Droppables        : false,
  Effect            : false,
  Sortable          : false,
  SortableObserver  : false,
  Sound             : false,
  Scriptaculous     : false
};

exports.yui = {
  YUI       : false,
  Y         : false,
  YUI_config: false
};

exports.mocha = {
  mocha       : false,
  describe    : false,
  xdescribe   : false,
  it          : false,
  xit         : false,
  context     : false,
  xcontext    : false,
  before      : false,
  after       : false,
  beforeEach  : false,
  afterEach   : false,
  suite         : false,
  test          : false,
  setup         : false,
  teardown      : false,
  suiteSetup    : false,
  suiteTeardown : false
};

exports.jasmine = {
  jasmine     : false,
  describe    : false,
  xdescribe   : false,
  it          : false,
  xit         : false,
  beforeEach  : false,
  afterEach   : false,
  setFixtures : false,
  loadFixtures: false,
  spyOn       : false,
  expect      : false,
  runs        : false,
  waitsFor    : false,
  waits       : false,
  beforeAll   : false,
  afterAll    : false,
  fail        : false,
  fdescribe   : false,
  fit         : false,
  pending     : false
};

},{}]},{},["/node_modules/jshint/src/jshint.js"]);

});

/**
 * Modificaitons:
 * changed:
 *      ace.define("ace/mode/javascript_worker" to ace.define("ace/mode/html_worker"
 * changed: (to match html worker syntax)
 *      var JavaScriptWorker = exports.JavaScriptWorker to var JavaScriptWorker = exports.Worker
 * changed: (to match html worker)
 *      this.sender.emit("annotate", errors); to this.sender.emit("error", errors);
 *
 * added line inside of this.onUpdate: value = GetJsFromMixedHtml(value);
 *
 */
 ace.define("ace/mode/html_worker",["require","exports","module","ace/lib/oop","ace/worker/mirror","ace/mode/javascript/jshint"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var Mirror = require("../worker/mirror").Mirror;
var lint = require("./javascript/jshint").JSHINT;

function startRegex(arr) {
    return RegExp("^(" + arr.join("|") + ")");
}

var disabledWarningsRe = startRegex([
    "Bad for in variable '(.+)'.",
    'Missing "use strict"'
]);
var errorsRe = startRegex([
    "Unexpected",
    "Expected ",
    "Confusing (plus|minus)",
    "\\{a\\} unterminated regular expression",
    "Unclosed ",
    "Unmatched ",
    "Unbegun comment",
    "Bad invocation",
    "Missing space after",
    "Missing operator at"
]);
var infoRe = startRegex([
    "Expected an assignment",
    "Bad escapement of EOL",
    "Unexpected comma",
    "Unexpected space",
    "Missing radix parameter.",
    "A leading decimal point can",
    "\\['{a}'\\] is better written in dot notation.",
    "'{a}' used out of scope"
]);

var JavaScriptWorker = exports.Worker = function(sender) {
    Mirror.call(this, sender);
    this.setTimeout(500);
    this.setOptions();
};

oop.inherits(JavaScriptWorker, Mirror);

(function() {
    this.setOptions = function(options) {
        this.options = options || {
            esnext: true,
            moz: true,
            devel: true,
            browser: true,
            node: true,
            laxcomma: true,
            laxbreak: true,
            lastsemic: true,
            onevar: false,
            passfail: false,
            maxerr: 100,
            expr: true,
            multistr: true,
            globalstrict: true
        };
        this.doc.getValue() && this.deferredUpdate.schedule(100);
    };

    this.changeOptions = function(newOptions) {
        oop.mixin(this.options, newOptions);
        this.doc.getValue() && this.deferredUpdate.schedule(100);
    };

    this.isValidJS = function(str) {
        try {
            eval("throw 0;" + str);
        } catch(e) {
            if (e === 0)
                return true;
        }
        return false
    };

    this.onUpdate = function() {
        var value = this.doc.getValue();
        value = GetJsFromMixedHtml(value);
        value = value.replace(/^#!.*\n/, "\n");
        if (!value)
            return this.sender.emit("error", []);

        var errors = [];
        var maxErrorLevel = this.isValidJS(value) ? "warning" : "error";
        lint(value, this.options, this.options.globals);
        var results = lint.errors;

        var errorAdded = false
        for (var i = 0; i < results.length; i++) {
            var error = results[i];
            if (!error)
                continue;
            var raw = error.raw;
            var type = "warning";

            if (raw == "Missing semicolon.") {
                var str = error.evidence.substr(error.character);
                str = str.charAt(str.search(/\S/));
                if (maxErrorLevel == "error" && str && /[\w\d{(['"]/.test(str)) {
                    error.reason = 'Missing ";" before statement';
                    type = "error";
                } else {
                    type = "info";
                }
            }
            else if (disabledWarningsRe.test(raw)) {
                continue;
            }
            else if (infoRe.test(raw)) {
                type = "info"
            }
            else if (errorsRe.test(raw)) {
                errorAdded  = true;
                type = maxErrorLevel;
            }
            else if (raw == "'{a}' is not defined.") {
                type = "warning";
            }
            else if (raw == "'{a}' is defined but never used.") {
                type = "info";
            }

            errors.push({
                row: error.line-1,
                column: error.character-1,
                text: error.reason,
                type: type,
                raw: raw
            });

            if (errorAdded) {
            }
        }

        this.sender.emit("error", errors);
    };

}).call(JavaScriptWorker.prototype);

});

/**
 * custom method to extract javscript from html and keep line numbers
 * @param {string} s
 * @param {bool} [debug] true to log debug info
 */
function GetJsFromMixedHtml(s, debug) {
    var r = ''
    d = '',
        inScript = false,
        lines = s.split('\n');

    for (var i = 0; i < lines.length; i++) {
        var l = lines[i];
        if (debug) d += '\n inScript=' + inScript + '; ' + i + '. ' + l;
        if (inScript) {
            if (l.match(/\s*\/script/)) {
                inScript = false;
                r += "\n";
                continue;
            }
            r += "\n" + l;
        }
        else {
            if (l.match(/\s*<script/)) {
                if (!l.match(/src="/)) { //dont add <scirpt src lines
                    inScript = true;
                }
            }
            r += "\n";
        }
        if (i === 0) {
            r = r.replace("\n", ""); //dont add break for first line
        }
    }
    if (debug) console.log('GetJsFromMixedHtml debug', d);
    return r;
}
 
