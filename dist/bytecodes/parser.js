"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserBytecode = void 0;
const bytecode_1 = require("./bytecode");
const ast_1 = require("../parser/ast");
const bytecodeGenerator_1 = require("../parser/bytecodeGenerator");
class ParserBytecode extends bytecode_1.Bytecode {
    constructor(module, imports) {
        super();
        this.module = "";
        this.imports = [];
        this.descriptions = { descriptions: [] };
        this.module = module;
        this.imports = imports;
    }
    addDescription(value) {
        this.descriptions.descriptions.push(value);
    }
    addDescriptions(values) {
        this.descriptions.descriptions.push(...values);
    }
    print(name) {
        for (var elem of this.descriptions.descriptions) {
            if (elem.name == name) {
                console.log(name);
                for (var e of elem.implementations) {
                    console.log(e.index);
                    for (var line of e.bytecode) {
                        console.log(line);
                    }
                    console.log('');
                }
                console.log('');
            }
        }
    }
    getDescriptions() {
        return this.descriptions;
    }
    getModule() {
        return this.module;
    }
    getImports() {
        return this.imports;
    }
    importModules(preprocessor) {
        /*
            Get imports
            Check if imports are already imported
            Add their definitions to definitions
                If they imported modules, add them to imported
        */
        for (var elem of this.imports) {
            if (preprocessor.import(elem) == false) {
                // not imported yet
                var ast = new ast_1.AST(elem);
                var generator = new bytecodeGenerator_1.BytecodeGenerator(ast);
                var bytecode = generator.generateBytecode();
                preprocessor.descr.push(...bytecode.getDescriptions().descriptions);
                bytecode.importModules(preprocessor);
            }
        }
    }
}
exports.ParserBytecode = ParserBytecode;
