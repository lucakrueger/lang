"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugError = exports.VMError = exports.ThrowDebugError = exports.ThrowError = exports.NativeErrors = void 0;
var NativeErrors;
(function (NativeErrors) {
    NativeErrors["REFERENCE"] = "Reference";
    NativeErrors["INTERNAL"] = "Internal";
    NativeErrors["RANGE"] = "Range";
})(NativeErrors = exports.NativeErrors || (exports.NativeErrors = {}));
function ThrowError(area, message) {
    console.log(`${area} error. ${message}.`);
    return new VMError(area, message);
}
exports.ThrowError = ThrowError;
function ThrowDebugError(area, message, stack, process) {
    var err = new DebugError(area, message, stack, process);
    err.throwDebug();
}
exports.ThrowDebugError = ThrowDebugError;
class VMError {
    constructor(area, message) {
        this.area = area;
        this.message = message;
    }
    throw() {
        console.log(`${this.area} error. ${this.message}.`);
    }
}
exports.VMError = VMError;
/*
    Debug Error
    Is essentially the same as a regular error, but keeps various debug informations and program state
*/
class DebugError extends VMError {
    constructor(area, message, stack, process) {
        super(area, message);
        this.stack = stack;
        this.process = process;
    }
    throwDebug() {
        this.throw();
        console.log(this.process);
        console.log(this.stack);
    }
}
exports.DebugError = DebugError;
