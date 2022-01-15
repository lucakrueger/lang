import { Bytecode } from "../bytecodes/bytecode";
import { ThrowError, VMError, NativeErrors } from "../logger/logger";
import { Builtin } from "./builtin";
import { CheckParameterCount } from "./builtinHelper";
import { BuiltinProcess, Process, VMProcess } from "./process";

export class ProcessManager {
    constructor(public bytecode: Bytecode) {}

    public start(fun: string, args: string[]) {
        /*
            Execute main function
                Initialize main process
            Print returning value
        */
       var returning = this.executeFunction(fun, args)
       console.log(returning)
    }

    public executeFunction(name: string, args: any[]): (any | VMError) {
        const func = this.bytecode.getFunction(name)

        // check if function is builtin
        var builtinFunc = Builtin.get(name) // get builtin
        if(builtinFunc !== undefined) {
            // spawn new process
            return this.spawnProcess(new BuiltinProcess(builtinFunc, args, this))
        }

        // check if function exists in definitions
        if(func === undefined) {
            return ThrowError(NativeErrors.REFERENCE, `Function '${name}' not found`) // throw error if it doesnt exist
        }

        // function is not builtin and exists in definition
        const description = this.bytecode.getDescriptions().descriptions[func] // get function description
        // spawn new process
        
        return this.spawnProcess(new VMProcess(description, args, this))  // spawn vm process
    }

    public spawnProcess(process: Process): any {
        return process.start()
    }
}