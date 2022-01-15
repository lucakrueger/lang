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

/*
    TODO:
    - implement empty calls (completed)
    - implement empty definitions (completed)
    - implement chained definitions (completed)
    - implement empty chained definitions (completed)
    - implement sets
    - implement chained operations (completed)
*/

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
    'lib/Api.lang',
    'lib/List.lang',
    'lib/Maths.lang',
    'lib/Std.lang',
    'lib/Test.lang',
    'lib/Vector.lang'
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