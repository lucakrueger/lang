import { Bytecode, FunctionDescription } from "./bytecode";

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

    getDescriptions(): { descriptions: FunctionDescription[]; } {
        return this.descriptions
    }
    getModule(): string {
        return this.module
    }
    getImports(): string[] {
        return this.imports
    }

}