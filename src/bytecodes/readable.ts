import { Instruction, InstructionsMapper, Instruct } from "../core/bytecode";
import * as fs from 'fs'
import { json } from "stream/consumers";
import { Bytecode, FunctionDescription } from "./bytecode";
import { Preprocessor } from "./preprocessor";

export class ReadableBytecode extends Bytecode{

    public descriptions: {descriptions: FunctionDescription[]} = {descriptions: []}
    public module: string = ''
    public imports: string[] = []

    constructor(private functionDescriptorPath: string) {
        super()
        /*fs.readFile(functionDescriptorPath, 'utf-8', (err, data) => {
            if(err) {
                console.log(err)
                return
            }
            let obj: {descriptions: FunctionDescription[]} = JSON.parse(data)
            this.descriptions = obj
        })*/

        var data = fs.readFileSync(functionDescriptorPath, 'utf-8')
        this.descriptions = JSON.parse(data)
    }

    public getDescriptions(): { descriptions: FunctionDescription[]; } {
        return this.descriptions
    }

    public addDescription(value: FunctionDescription) {
        this.descriptions.descriptions.push(value)
    }

    public getModule(): string {
        return this.module
    }

    public getImports(): string[] {
        return this.imports
    }

    public importModules(preprocessor: Preprocessor) {
        return
    }
    
}

export function MapInstructions(data: string[]): Instruct[] {
    var mapper = InstructionsMapper

    var lines = data
    var instructions: Instruct[] = []
    for(var line of lines) {
        if(line == '') {
            continue
        }

        var parts = line.split(' ')
        var inss = mapper.get(parts[0])
        if(inss == undefined) {
            inss = Instruction.NONE
        }

        if(inss == Instruction.PUSHL) {
            // literal, push whole line, so no string is lost
            instructions.push({
                ins: inss,
                args: [parts.splice(1).join(' ')]
            })
            continue
        }

        instructions.push({
            ins: inss,
            args: parts.splice(1)
        })
    }

    return instructions
}