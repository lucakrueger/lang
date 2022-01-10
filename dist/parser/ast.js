"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AST = void 0;
const parser = require('../../parser/parser.js');
const fs_1 = __importDefault(require("fs"));
class AST {
    constructor(input) {
        this.input = input;
        this.tree = [];
        var data = fs_1.default.readFileSync(input, 'utf-8');
        this.tree = parser.parse(data);
    }
}
exports.AST = AST;
