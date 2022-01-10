"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserBytecode = void 0;
const bytecode_1 = require("./bytecode");
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
    getDescriptions() {
        return this.descriptions;
    }
    getModule() {
        return this.module;
    }
    getImports() {
        return this.imports;
    }
}
exports.ParserBytecode = ParserBytecode;
