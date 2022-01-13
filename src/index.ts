import { InstructionsMapper, Instruction } from "./core/bytecode";
import { ReadableBytecode } from "./bytecodes/readable";
import { ProcessManager } from "./vm/processManager";
import { AST } from "./parser/ast";
import { BytecodeGenerator } from "./parser/bytecodeGenerator";
import { openStdin } from "process";
import * as fs from 'fs'
import { Atom } from "./vm/structs";
import { Preprocessor } from "./bytecodes/preprocessor";

var ast = new AST('tests/test.lang')
var generator = new BytecodeGenerator(ast)
var bytecode = generator.generateBytecode()
var preprocessor = new Preprocessor()
bytecode.importModules(preprocessor)
bytecode.addDescriptions(preprocessor.descr)
//fs.writeFileSync('./tests/dump.json', JSON.stringify(bytecode.getDescriptions(), null, 4))
//var bytecode = new ReadableBytecode('tests/dump.json')
var processManager = new ProcessManager(bytecode)
processManager.start()