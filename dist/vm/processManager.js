"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessManager = void 0;
const logger_1 = require("../logger/logger");
const builtin_1 = require("./builtin");
const process_1 = require("./process");
class ProcessManager {
    constructor(bytecode) {
        this.bytecode = bytecode;
    }
    start(fun, args) {
        /*
            Execute main function
                Initialize main process
            Print returning value
        */
        var returning = this.executeFunction(fun, args);
        console.log(returning);
    }
    executeFunction(name, args) {
        const func = this.bytecode.getFunction(name);
        // check if function is builtin
        var builtinFunc = builtin_1.Builtin.get(name); // get builtin
        if (builtinFunc !== undefined) {
            // spawn new process
            return this.spawnProcess(new process_1.BuiltinProcess(builtinFunc, args, this));
        }
        // check if function exists in definitions
        if (func === undefined) {
            return (0, logger_1.ThrowError)(logger_1.NativeErrors.REFERENCE, `Function '${name}' not found`); // throw error if it doesnt exist
        }
        // function is not builtin and exists in definition
        const description = this.bytecode.getDescriptions().descriptions[func]; // get function description
        // spawn new process
        return this.spawnProcess(new process_1.VMProcess(description, args, this)); // spawn vm process
    }
    spawnProcess(process) {
        return process.start();
    }
}
exports.ProcessManager = ProcessManager;
