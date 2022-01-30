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
const processManager_1 = require("./vm/processManager");
const ast_1 = require("./parser/ast");
const bytecodeGenerator_1 = require("./parser/bytecodeGenerator");
const fs = __importStar(require("fs"));
const preprocessor_1 = require("./bytecodes/preprocessor");
const autocombine_1 = require("./autodoc/autocombine");
var file = '';
var fun = 'main';
var args = [];
if (process.argv.length >= 3) {
    // only file is given
    file = process.argv[2];
}
if (process.argv.length == 4) {
    // function is given
    fun = process.argv[3];
}
if (process.argv.length > 4)
    args = process.argv.splice(4);
var ast = new ast_1.AST(file);
var generator = new bytecodeGenerator_1.BytecodeGenerator(ast);
var bytecode = generator.generateBytecode();
var preprocessor = new preprocessor_1.Preprocessor();
bytecode.addImports([
    'lib/Std.lang'
]);
bytecode.importModules(preprocessor);
bytecode.addDescriptions(preprocessor.descr);
/*for(var elem of bytecode.getDescriptions().descriptions) {
    bytecode.print(elem.name)
}*/
fs.writeFileSync('./tests/dump.json', JSON.stringify(bytecode.getDescriptions(), null, 4));
//var bytecode = new ReadableBytecode('tests/dump.json')
(0, autocombine_1.AutodocCombine)();
(0, autocombine_1.AutodocFormat)();
var processManager = new processManager_1.ProcessManager(bytecode);
processManager.start(fun, args);
