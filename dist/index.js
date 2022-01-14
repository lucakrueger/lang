"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const processManager_1 = require("./vm/processManager");
const ast_1 = require("./parser/ast");
const bytecodeGenerator_1 = require("./parser/bytecodeGenerator");
const preprocessor_1 = require("./bytecodes/preprocessor");
var file = '';
var fun = 'main';
if (process.argv.length >= 3) {
    // only file is given
    file = process.argv[2];
}
if (process.argv.length >= 4) {
    // function is given
    fun = process.argv[3];
}
var ast = new ast_1.AST(file);
var generator = new bytecodeGenerator_1.BytecodeGenerator(ast);
var bytecode = generator.generateBytecode();
var preprocessor = new preprocessor_1.Preprocessor();
bytecode.importModules(preprocessor);
bytecode.addDescriptions(preprocessor.descr);
//fs.writeFileSync('./tests/dump.json', JSON.stringify(bytecode.getDescriptions(), null, 4))
//var bytecode = new ReadableBytecode('tests/dump.json')
var processManager = new processManager_1.ProcessManager(bytecode);
processManager.start(fun);
