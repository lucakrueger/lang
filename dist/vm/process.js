"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuiltinProcess = exports.VMProcess = exports.Process = void 0;
const readable_1 = require("../bytecodes/readable");
const bytecode_1 = require("../core/bytecode");
const stack_1 = require("../internal/stack");
const logger_1 = require("../logger/logger");
const structs_1 = require("./structs");
const crypto = __importStar(require("crypto"));
class Process {
    constructor(processManager, args) {
        this.processManager = processManager;
        this.args = args;
    }
}
exports.Process = Process;
/*
    VM process executes bytecode
*/
class VMProcess extends Process {
    constructor(description, args, processManager) {
        super(processManager, args);
        this.description = description;
        this.processManager = processManager;
        /*
            Later:
            - Optimize bytecode, dont use strings as names anymore, but ids
        */
        this.stack = new stack_1.Stack(2048); // stack
        this.memory = new Map([
            ['/', '']
        ]);
        this.bytecode = [];
        this.definitition = -1;
        var def = this.determineDefinition(args);
        if (def != undefined) { // check for error
            return; // return
        }
        // add args to memory
        this.initializeArgs(description.definitions[this.definitition].args, args);
    }
    start() {
        return this.executeBytecode();
    }
    executeBytecode() {
        for (var instruction of this.bytecode) {
            var args = instruction.args;
            switch (instruction.ins) {
                case bytecode_1.Instruction.NONE:
                    continue;
                case bytecode_1.Instruction.LABEL:
                    continue;
                case bytecode_1.Instruction.LOCAL:
                    this.addLocal(args[0], new structs_1.Atom('none'));
                    break;
                case bytecode_1.Instruction.PUSH:
                    var pushed = this.memory.get(args[0]);
                    this.stack.push(pushed);
                    break;
                case bytecode_1.Instruction.CALL:
                    // get pushed vars
                    var callArgs = [];
                    for (var i = 0; i < Number(args[1]); i++) {
                        callArgs.push(this.stack.pop());
                    }
                    callArgs = callArgs.reverse(); // reverse
                    // spawn process
                    this.stack.push(this.processManager.executeFunction(args[0], callArgs));
                    break;
                case bytecode_1.Instruction.OPERATION:
                    var b = this.stack.pop();
                    var a = this.stack.pop();
                    switch (args[0]) {
                        case '+':
                            this.stack.push(a + b);
                            break;
                        case '-':
                            this.stack.push(a - b);
                            break;
                        case '*':
                            this.stack.push(a * b);
                            break;
                        case '/':
                            this.stack.push(a / b);
                            break;
                        case '<=':
                            this.stack.push(new structs_1.Atom(a <= b));
                            break;
                        case '>=':
                            this.stack.push(new structs_1.Atom(a >= b));
                            break;
                        case '/=':
                            //this.stack.push(new Atom(a != b))
                            if (a instanceof structs_1.VMDatatype && b instanceof structs_1.VMDatatype) {
                                this.stack.push(new structs_1.Atom(a.getValue() != b.getValue()));
                            }
                            else if (Array.isArray(a) && Array.isArray(b)) {
                                this.stack.push(new structs_1.Atom(!this.arraysEqual(a, b)));
                            }
                            else {
                                this.stack.push(new structs_1.Atom(a != b));
                            }
                            break;
                        case '<':
                            this.stack.push(new structs_1.Atom(a < b));
                            break;
                        case '>':
                            this.stack.push(new structs_1.Atom(a > b));
                            break;
                        case '=':
                            //this.stack.push(new Atom(a == b))
                            if (a instanceof structs_1.VMDatatype && b instanceof structs_1.VMDatatype) {
                                this.stack.push(new structs_1.Atom(a.getValue() == b.getValue()));
                            }
                            else if (Array.isArray(a) && Array.isArray(b)) {
                                this.stack.push(new structs_1.Atom(this.arraysEqual(a, b)));
                            }
                            else {
                                this.stack.push(new structs_1.Atom(a == b));
                            }
                            break;
                        case 'e':
                            if (Array.isArray(b) && !Array.isArray(a)) {
                                this.stack.push(new structs_1.Atom(b.includes(a)));
                            }
                            else {
                                this.stack.push(new structs_1.Atom('false'));
                            }
                            break;
                        case '\\':
                            if (Array.isArray(b) && !Array.isArray(a)) {
                                this.stack.push(new structs_1.Atom(!b.includes(a)));
                            }
                            else if (Array.isArray(a)) {
                                // [5, 6, 7] \ [1, 2, 3]
                                var arr = [];
                                for (var elem of a) {
                                    var found = false;
                                    for (var elemb of b) {
                                        if (elem == elemb) {
                                            found = true;
                                        }
                                    }
                                    if (found == false) {
                                        arr.push(elem);
                                    }
                                }
                                this.stack.push(arr);
                            }
                            else {
                                this.stack.push(new structs_1.Atom('true'));
                            }
                            break;
                        case '++':
                            if (Array.isArray(a) && Array.isArray(b)) {
                                a.push(...b);
                                this.stack.push(a);
                            }
                            else if (Array.isArray(a) && !Array.isArray(b)) {
                                a.push(b);
                                this.stack.push(a);
                            }
                            else if (!Array.isArray(a) && Array.isArray(b)) {
                                var arr = [];
                                arr.push(a);
                                arr.push(...b);
                                this.stack.push(arr);
                            }
                            else {
                                this.stack.push([a, b]);
                            }
                            break;
                        case '--':
                            if (Array.isArray(a) && Array.isArray(b)) {
                                // both a and b are arrays
                                // check a for each element of b, when found, remove it
                                var arr = [];
                                for (var elem of a) {
                                    var found = false;
                                    for (var elemb of b) {
                                        if (elem == elemb) {
                                            found = true;
                                        }
                                    }
                                    if (found == false) {
                                        arr.push(elem);
                                    }
                                }
                                this.stack.push(arr);
                            }
                            else if (Array.isArray(a) && !Array.isArray(b)) {
                                // a is array, b is value
                                var arr = [];
                                for (var elem of a) {
                                    if (elem != b) {
                                        arr.push(elem);
                                    }
                                }
                                this.stack.push(arr);
                            }
                            else {
                                this.stack.push(a);
                            }
                            break;
                        case '**':
                            this.stack.push(Math.pow(a, b));
                            break;
                        case 'root':
                            this.stack.push(Math.pow(a, 1 / b));
                            break;
                        case '%':
                            this.stack.push(a % b);
                            break;
                        case '≈':
                            const tolerance = 0.015;
                            var aa = Math.round((a + Number.EPSILON) * 100) / 100;
                            var bb = Math.round((b + Number.EPSILON) * 100) / 100;
                            if ((aa <= (bb + tolerance)) && (aa >= (bb - tolerance))) {
                                this.stack.push(new structs_1.Atom('true'));
                            }
                            else {
                                this.stack.push(new structs_1.Atom('false'));
                            }
                            break;
                        case '±':
                            this.stack.push([a + b, a - b]);
                            break;
                        case '<<':
                            this.stack.push(a << b);
                            break;
                        case '>>':
                            this.stack.push(a >> b);
                            break;
                        case '#':
                            // hash operator
                            // a # 'sha256'
                            var hashed = '';
                            var algo = '';
                            if (a instanceof structs_1.VMDatatype) {
                                hashed = a.getValue();
                            }
                            else {
                                hashed = a;
                            }
                            if (b instanceof structs_1.VMDatatype) {
                                algo = b.getValue();
                            }
                            else {
                                algo = b;
                            }
                            this.stack.push(crypto.createHash(algo).update(hashed).digest('hex'));
                            break;
                        case '$':
                            break;
                        case '&':
                            if (a instanceof structs_1.VMDatatype && b instanceof structs_1.VMDatatype) {
                                this.stack.push(a.getValue() && b.getValue());
                            }
                            else if (a instanceof structs_1.VMDatatype && !(b instanceof structs_1.VMDatatype)) {
                                this.stack.push(a.getValue() && b);
                            }
                            else if (b instanceof structs_1.VMDatatype && !(a instanceof structs_1.VMDatatype)) {
                                this.stack.push(b.getValue() && a);
                            }
                            else {
                                this.stack.push(a && b);
                            }
                            break;
                        case '!':
                            if (a instanceof structs_1.VMDatatype && b instanceof structs_1.VMDatatype) {
                                this.stack.push(a.getValue() || b.getValue());
                            }
                            else if (a instanceof structs_1.VMDatatype && !(b instanceof structs_1.VMDatatype)) {
                                this.stack.push(a.getValue() || b);
                            }
                            else if (b instanceof structs_1.VMDatatype && !(a instanceof structs_1.VMDatatype)) {
                                this.stack.push(b.getValue() || a);
                            }
                            else {
                                this.stack.push(a || b);
                            }
                            break;
                        case '?':
                            break;
                        case '..':
                            var ls = [];
                            if (a < b) {
                                var stepSize = (b % 1);
                                if (stepSize == 0)
                                    stepSize = 1;
                                var ih = a;
                                while (ih <= b) {
                                    ls.push(Math.round((ih + Number.EPSILON) * 100) / 100);
                                    ih += stepSize;
                                }
                            }
                            else if (a > b) {
                                var stepSize = (b % 1);
                                if (stepSize == 0)
                                    stepSize = 1;
                                if (stepSize < 0)
                                    stepSize = stepSize * -1;
                                var ih = a;
                                while (ih >= b) {
                                    ls.push(Math.round((ih + Number.EPSILON) * 100) / 100);
                                    ih -= stepSize;
                                }
                            }
                            this.stack.push(ls);
                            break;
                        default:
                            (0, logger_1.ThrowError)(logger_1.NativeErrors.INTERNAL, `Unknown operator ${args[0]}`);
                            break;
                    }
                    break;
                case bytecode_1.Instruction.ADD:
                    var b = this.stack.pop();
                    var a = this.stack.pop();
                    this.stack.push(a + b);
                    break;
                case bytecode_1.Instruction.SUBTRACT:
                    var b = this.stack.pop();
                    var a = this.stack.pop();
                    this.stack.push(a - b);
                    break;
                case bytecode_1.Instruction.MULTIPLY:
                    var b = this.stack.pop();
                    var a = this.stack.pop();
                    this.stack.push(a * b);
                    break;
                case bytecode_1.Instruction.DIVIDE:
                    var b = this.stack.pop();
                    var a = this.stack.pop();
                    this.stack.push(a / b);
                    break;
                case bytecode_1.Instruction.DONE:
                    return;
                case bytecode_1.Instruction.PULL: // pull a
                    var a = this.stack.pop();
                    this.memory.set(args[0], a);
                    break;
                case bytecode_1.Instruction.PUSHL:
                    this.stack.push(this.convertLiteral(args[0]));
                    break;
                case bytecode_1.Instruction.PRINT:
                    console.log(this.memory.get(args[0]));
                    this.stack.push(new structs_1.Atom('ok'));
                    break;
                case bytecode_1.Instruction.COMP:
                    var b = this.stack.pop();
                    var a = this.stack.pop();
                    if (a instanceof structs_1.VMDatatype && b instanceof structs_1.VMDatatype) {
                        this.stack.push(a.getValue() == b.getValue());
                    }
                    else {
                        this.stack.push((a == b));
                    }
                    break;
            }
        }
        return this.stack.pop();
    }
    convertLiteral(value) {
        // check for atom
        /*if(value.indexOf(':')) {
            return new Atom(value.replace(':', ''))
        }*/
        // check for boolean
        /*if(value == 'true' || value == 'false') {
            return Boolean(value)
        }*/
        if (value instanceof structs_1.VMDatatype) {
            return value;
        }
        // check if is array
        if (Array.isArray(value)) {
            return value;
        }
        value = String(value);
        // check for number
        if (isNaN(Number(value)) == false) {
            return Number(value);
        }
        if (value.charAt(0) == ':') {
            return new structs_1.Atom(value.replace(':', ''));
        }
        return value;
    }
    getAtom(s) {
        if (s.charAt(0) == ':') {
            return new structs_1.Atom(s.replace(':', ''));
        }
        return undefined;
    }
    /**
     * Determine correct definition based on rules and given args
     * Modifies bytecode when successful
     * @returns boolean | VMError - Returns undefined when successful or Error
     */
    determineDefinition(args) {
        // potential matches
        var matches = [];
        // step 1: check arg length
        var arglength = args.length;
        var index = 0; // counter
        this.description.definitions.forEach(element => {
            if (element.arglength == arglength) {
                matches.push(index); // push index if successful
            }
            index++;
        });
        // if no matches are found already, throw error
        if (matches.length == 0) {
            return (0, logger_1.ThrowError)(logger_1.NativeErrors.INTERNAL, `No matching implementations for '${this.description.name}'. Different arg lengths`);
        }
        // step 2: evaluate datatypes
        var mat = matches;
        matches = [];
        mat.forEach(element => {
            // go through each definition
            var similar = this.description.definitions[element].similar;
            if (similar.length == 0) { // check if type definitions are even there
                matches.push(element); // no type requirement, add to matches
                return; // exit function
            }
            // check for datatypes
            // go over all similars, compare datatypes of args
            var validTypes = true;
            similar.forEach(sim => {
                if (validTypes == false) { // types are already invalid
                    return; // abort
                }
                //go over sub-array, it holds all indices
                if (this.sameType(args, sim) == false) { // check if same types
                    // no valid types
                    validTypes = false;
                    return;
                }
            });
            // check for valid types
            if (validTypes) {
                matches.push(element); // add to matches
                return;
            }
        });
        if (matches.length == 0) {
            //console.log(this.description.definitions)
            return (0, logger_1.ThrowError)(logger_1.NativeErrors.INTERNAL, `No matching implementations for '${this.description.name}'. Datatype rules not matching`);
        }
        // step 3: evaluate rules
        mat = matches;
        matches = [];
        var implementation = undefined;
        mat.forEach(element => {
            if (implementation !== undefined) { // check if implementation was already found
                return;
            }
            var rules = this.description.definitions[element].rules; // rules
            for (var rule of rules) {
                var isMatch = this.evaluateRule(args, rule); // evaluate rule
                if (isMatch !== undefined) {
                    implementation = isMatch; // rule match, implementation chosen
                    this.definitition = element;
                }
            }
        });
        if (implementation == undefined) {
            return (0, logger_1.ThrowError)(logger_1.NativeErrors.INTERNAL, `No matching implementations for '${this.description.name}'. Value rules not matching`);
        }
        // modify bytecode, set to correct one
        this.bytecode = (0, readable_1.MapInstructions)(this.description.implementations[implementation].bytecode);
        return undefined;
    }
    evaluateRule(values, rule) {
        var match = true;
        for (var ruleArg of rule.args) {
            if (this.evaluateArgument(values[ruleArg.index], ruleArg.rule, ruleArg.value) == false) {
                match = false;
            }
        }
        if (match) {
            return rule.implementation;
        }
        return undefined;
    }
    evaluateArgument(arg, rule, value) {
        if (rule == '') {
            return true;
        }
        switch (rule) {
            case '<':
                if (Array.isArray(arg) && Array.isArray(value)) {
                    // both arrays
                    return (arg.length < value.length);
                }
                else if (Array.isArray(arg) && !Array.isArray(value)) {
                    // only arg is array
                    return (arg.length < value);
                }
                return (Number(arg) < Number(value));
            case '>':
                if (Array.isArray(arg) && Array.isArray(value)) {
                    // both arrays
                    return (arg.length > value.length);
                }
                else if (Array.isArray(arg) && !Array.isArray(value)) {
                    // only arg is array
                    return (arg.length > value);
                }
                return (Number(arg) > Number(value));
            case '<=':
                if (Array.isArray(arg) && Array.isArray(value)) {
                    // both arrays
                    return (arg.length <= value.length);
                }
                else if (Array.isArray(arg) && !Array.isArray(value)) {
                    // only arg is array
                    return (arg.length <= value);
                }
                return (Number(arg) <= Number(value));
            case '>=':
                if (Array.isArray(arg) && Array.isArray(value)) {
                    // both arrays
                    return (arg.length >= value.length);
                }
                else if (Array.isArray(arg) && !Array.isArray(value)) {
                    // only arg is array
                    return (arg.length >= value);
                }
                return (Number(arg) >= Number(value));
            case '=':
                var converted = this.convertLiteral(value);
                if (arg instanceof structs_1.VMDatatype && converted instanceof structs_1.VMDatatype) {
                    return (arg.getValue() == converted.getValue());
                }
                else if (Array.isArray(arg) && Array.isArray(converted)) {
                    // both arrays
                    //console.log(arg, converted)
                    return this.arraysEqual(arg, converted);
                }
                else if (Array.isArray(arg) && typeof converted == 'number') {
                    // arg is array, value is number
                    return (arg.length == converted);
                }
                return (arg == value);
            case '/=':
                var converted = this.convertLiteral(value);
                if (arg instanceof structs_1.VMDatatype && converted instanceof structs_1.VMDatatype) {
                    return (arg.getValue() != converted.getValue());
                }
                else if (Array.isArray(arg) && Array.isArray(converted)) {
                    // both arrays
                    //console.log(arg, converted)
                    return !this.arraysEqual(arg, converted);
                }
                else if (Array.isArray(arg) && typeof converted == 'number') {
                    // arg is array, value is number
                    return (arg.length != converted);
                }
                return (arg != value);
            case 'tail':
                if (!Array.isArray(arg)) {
                    return false;
                }
                var arr = arg;
                var tail = value;
                return this.arraysEqual(arr.slice(1), tail);
            case 'head':
                if (!Array.isArray(arg)) {
                    return false;
                }
                var arr = arg;
                var atom = this.getAtom(value);
                if (atom != undefined && arr[0] instanceof structs_1.Atom) {
                    return (arr[0].getValue() == atom.getValue());
                }
                return (arr[0] == value);
            case 'url':
                // evaluate url
                // arg: supplied url
                // value: wanted format
                // evaluate if url matches with format
                var url = arg;
                if (url[url.length - 1] == '/') {
                    url = url.slice(0, -1);
                }
                if (value[value.length - 1] == '/') {
                    value = value.slice(0, -1);
                }
                var urlParts = url.split('/');
                var suppliedParts = value.split('/');
                if (urlParts.length != suppliedParts.length) {
                    return false; // not same length -> cant be the same
                }
                // go over parts
                // if part = variable, continue
                // if part does not math -> false
                var match = true;
                var index = 0;
                for (var elem of urlParts) {
                    if (suppliedParts[index][0] == ':') {
                        // variable
                        index++;
                        continue;
                    }
                    if (suppliedParts[index] != elem) {
                        match = false;
                    }
                    index++;
                }
                return match;
        }
        (0, logger_1.ThrowError)(logger_1.NativeErrors.INTERNAL, `Unknown comparison rule ${rule}`);
        return false;
    }
    sameType(args, arr) {
        return true;
        // dirty code, but it works (hopefully)
        if (args.length == 0) {
            return true;
        }
        var match = true;
        var type = typeof args[0];
        for (var index of arr) {
            if (index == -1) {
                continue;
            }
            if (typeof args[index] != type) {
                match = false;
            }
        }
        return match;
    }
    /**
     * Initialize a local variable
     * @param  {string} name - Variable name
     * @param  {any} value - Variable value
     */
    addLocal(name, value) {
        this.memory.set(name, value);
    }
    initializeArgs(names, args) {
        var index = 0;
        for (var name of names) {
            this.addLocal(name, args[index]);
            index++;
        }
    }
    arraysEqual(a, b) {
        if (a === b)
            return true;
        if (a == null || b == null)
            return false;
        if (a.length !== b.length)
            return false;
        // If you don't care about the order of the elements inside
        // the array, you should sort both arrays here.
        // Please note that calling sort on an array will modify that array.
        // you might want to clone your array first.
        for (var i = 0; i < a.length; ++i) {
            var alit = this.convertLiteral(a[i]);
            var blit = this.convertLiteral(b[i]);
            if (alit instanceof structs_1.VMDatatype) {
                alit = alit.getValue();
            }
            if (blit instanceof structs_1.VMDatatype) {
                blit = blit.getValue();
            }
            //if (this.convertLiteral(a[i]) != this.convertLiteral(b[i])) return false;
            if (alit != blit)
                return false;
        }
        return true;
    }
}
exports.VMProcess = VMProcess;
/*
    Builtin process calls internal, builtin functions written in JS/TS
*/
class BuiltinProcess extends Process {
    constructor(functionImplementation, args, processManager) {
        super(processManager, args);
        this.functionImplementation = functionImplementation;
        this.processManager = processManager;
    }
    start() {
        return this.functionImplementation(this.args, this.processManager);
    }
}
exports.BuiltinProcess = BuiltinProcess;
