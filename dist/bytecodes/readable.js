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
exports.MapInstructions = exports.ReadableBytecode = void 0;
const bytecode_1 = require("../core/bytecode");
const fs = __importStar(require("fs"));
const bytecode_2 = require("./bytecode");
class ReadableBytecode extends bytecode_2.Bytecode {
    constructor(functionDescriptorPath) {
        super();
        this.functionDescriptorPath = functionDescriptorPath;
        this.descriptions = { descriptions: [] };
        this.module = '';
        this.imports = [];
        /*fs.readFile(functionDescriptorPath, 'utf-8', (err, data) => {
            if(err) {
                console.log(err)
                return
            }
            let obj: {descriptions: FunctionDescription[]} = JSON.parse(data)
            this.descriptions = obj
        })*/
        var data = fs.readFileSync(functionDescriptorPath, 'utf-8');
        this.descriptions = JSON.parse(data);
    }
    getDescriptions() {
        return this.descriptions;
    }
    addDescription(value) {
        this.descriptions.descriptions.push(value);
    }
    getModule() {
        return this.module;
    }
    getImports() {
        return this.imports;
    }
    importModules(preprocessor) {
        return;
    }
}
exports.ReadableBytecode = ReadableBytecode;
function MapInstructions(data) {
    var mapper = bytecode_1.InstructionsMapper;
    var lines = data;
    var instructions = [];
    for (var line of lines) {
        if (line == '') {
            continue;
        }
        var parts = line.split(' ');
        var inss = mapper.get(parts[0]);
        if (inss == undefined) {
            inss = bytecode_1.Instruction.NONE;
        }
        if (inss == bytecode_1.Instruction.PUSHL) {
            // literal, push whole line, so no string is lost
            instructions.push({
                ins: inss,
                args: [parts.splice(1).join(' ')]
            });
            continue;
        }
        instructions.push({
            ins: inss,
            args: parts.splice(1)
        });
    }
    return instructions;
}
exports.MapInstructions = MapInstructions;
