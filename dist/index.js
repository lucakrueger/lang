"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const processManager_1 = require("./vm/processManager");
const ast_1 = require("./parser/ast");
const bytecodeGenerator_1 = require("./parser/bytecodeGenerator");
const preprocessor_1 = require("./bytecodes/preprocessor");
var ast = new ast_1.AST('tests/test.lang');
var generator = new bytecodeGenerator_1.BytecodeGenerator(ast);
var bytecode = generator.generateBytecode();
var preprocessor = new preprocessor_1.Preprocessor();
bytecode.importModules(preprocessor);
bytecode.addDescriptions(preprocessor.descr);
//console.log(bytecode.getDescriptions())
//fs.writeFileSync('./tests/dump.json', JSON.stringify(bytecode.getDescriptions(), null, 4))
//var bytecode = new ReadableBytecode('tests/dump.json')
var processManager = new processManager_1.ProcessManager(bytecode);
processManager.start();
