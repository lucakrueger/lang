import { InstructionsMapper, Instruction } from "./core/bytecode";
import { ReadableBytecode } from "./bytecodes/readable";
import { ProcessManager } from "./vm/processManager";
import { AST } from "./parser/ast";
import { BytecodeGenerator } from "./parser/bytecodeGenerator";
import { openStdin } from "process";
import * as fs from 'fs'
import { Atom } from "./vm/structs";
import { Preprocessor } from "./bytecodes/preprocessor";
import { NativeErrors, ThrowError } from "./logger/logger";
import { ThreadManager } from "./thread/threadtest";

var threadManager = new ThreadManager()
var res = threadManager.start((arg: any) => {
    return (arg*2)
}, [1, 2, 3, 4, 5, 6, 7], -1)

process.exit()

var file: string = ''
var fun: string = 'main'
var args: string[] = []


if(process.argv.length >= 3) {
    // only file is given
    file = process.argv[2]
}
if(process.argv.length == 4) {
    // function is given
    fun = process.argv[3]
}
if(process.argv.length > 4) args = process.argv.splice(4)

var ast = new AST(file)
var generator = new BytecodeGenerator(ast)
var bytecode = generator.generateBytecode()
var preprocessor = new Preprocessor()
bytecode.addImports([
    'lib/Std.lang'
])
bytecode.importModules(preprocessor)
bytecode.addDescriptions(preprocessor.descr)
/*for(var elem of bytecode.getDescriptions().descriptions) {
    bytecode.print(elem.name)
}*/
//fs.writeFileSync('./tests/dump.json', JSON.stringify(bytecode.getDescriptions(), null, 4))
//var bytecode = new ReadableBytecode('tests/dump.json')
var processManager = new ProcessManager(bytecode)
processManager.start(fun, args)