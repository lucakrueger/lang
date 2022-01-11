import { FunctionDescription } from "./bytecode"
import { AST } from "../parser/ast";
import { BytecodeGenerator } from "../parser/bytecodeGenerator";

export class Preprocessor {
    public imports: string[] = []
    public descr: FunctionDescription[] = []
    constructor() {}

    /**
     * Check if module is already imported
     * @param name - name of module
     * @returns boolean - whether module is already imported or not
     */
    public import(name: string): boolean {
        var incl = this.imports.includes(name)
        if(!incl) {
            this.imports.push(name)
        }
        return incl
    }
}