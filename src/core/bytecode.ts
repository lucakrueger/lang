
export enum Instruction {
    NONE,
    LABEL,
    LOCAL,
    PUSH,
    CALL,
    ADD,
    SUBTRACT,
    MULTIPLY,
    DIVIDE,
    DONE,
    PULL,
    PULL_LOCAL,
    PUSHL,
    PRINT,
    COMP,
    OPERATION // get called for operation - takes 1 arg - operation
}

export interface Instruct {
    ins: Instruction,
    args: string[]
}


export var InstructionsMapper = getInstructionsMapper()

function getInstructionsMapper(): Map<string, Instruction> {
    var insMapper = new Map<string, Instruction>([])
    for(var elem of ToArray(Instruction)) {
        if(typeof Instruction[elem] == 'string')
        insMapper.set(Instruction[elem].toLowerCase(), elem)
    }

    return insMapper
}

// Turn enum into array
export function ToArray(enumme: any) {
    return Object.keys(enumme)
        .map(key => enumme[key]);
}
