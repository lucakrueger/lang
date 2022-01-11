import { Bytecode, FunctionDescription } from "./bytecode";
import { AST } from "../parser/ast";
import { BytecodeGenerator } from "../parser/bytecodeGenerator";
import { Preprocessor } from "./preprocessor";

export class ParserBytecode extends Bytecode {
    
    private module: string = ""
    private imports: string[] = []
    private descriptions: {descriptions: FunctionDescription[]} = {descriptions: []}

    constructor(module: string, imports: string[]) {
        super()
        this.module = module
        this.imports = imports
    }

    public addDescription(value: FunctionDescription) {
        this.descriptions.descriptions.push(value)
    }

    public addDescriptions(values: FunctionDescription[]) {
        this.descriptions.descriptions.push(...values)
    }

    getDescriptions(): { descriptions: FunctionDescription[]; } {
        return this.descriptions
    }
    getModule(): string {
        return this.module
    }
    getImports(): string[] {
        return this.imports
    }

    importModules(preprocessor: Preprocessor) {
        /*
            Get imports
            Check if imports are already imported
            Add their definitions to definitions
                If they imported modules, add them to imported
        */

        for(var elem of this.imports) {
            if(preprocessor.import(elem) == false) {
                // not imported yet
                var ast = new AST(elem)
                var generator = new BytecodeGenerator(ast)
                var bytecode = generator.generateBytecode()
                preprocessor.descr.push(...bytecode.getDescriptions().descriptions)
                bytecode.importModules(preprocessor)
            }
        }
       
    }

}