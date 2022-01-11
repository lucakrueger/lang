import { Preprocessor } from "./preprocessor"

export abstract class Bytecode {
    abstract getDescriptions(): {descriptions: FunctionDescription[]}
    abstract getModule(): string
    abstract getImports(): string[]
    abstract importModules(preprocessor: Preprocessor): any
    
    /**
     * Search for specific function by name
     * @param  {string} name - Function name
     * @returns number | undefined - Index of function description
     */
    getFunction(name: string): (number | undefined) {
        var index = 0
        for(var descr of this.getDescriptions().descriptions) {
            if(descr.name == name) {
                return index
            }
            index++
        }
        return undefined
    }
}

export interface FunctionDescription {
    name: string,
    definitions: {
        args: string[], // argument names,
        arglength: number, // number of arguments
        similar: number[][], // args with the same datatype, -1 represents return value
        rules: FunctionArgumentRule[]
    }[],
    implementations: {
        index: number,
        bytecode: string[]
    }[]
}

export interface FunctionArgumentRule {
    implementation: number,
    args: {
        index: number, // argument index
        name: string, // argument name
        rule: string,  // value rule -> <,>,<=,>=,=,/=,less,greater,less-than,greater-than,equals,unequal
        value: string,
    }[]
}