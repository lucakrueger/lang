import { FunctionArgumentRule, FunctionDescription } from "../bytecodes/bytecode";
import { MapInstructions } from "../bytecodes/readable";
import { Instruct, Instruction } from "../core/bytecode";
import { Stack } from "../internal/stack";
import { NativeErrors, ThrowError, VMError } from "../logger/logger";
import { ProcessManager } from "./processManager";
import { Atom, VMDatatype } from "./structs";

export abstract class Process {
    constructor(public processManager: ProcessManager, public args: any[]) {}
    /*
        Start() starts the process and returns the returning value
    */
    abstract start(): any
}

/*
    VM process executes bytecode
*/
export class VMProcess extends Process {
    /*  
        Later:
        - Optimize bytecode, dont use strings as names anymore, but ids
    */

    private stack: Stack = new Stack(2048)  // stack
    private memory: Map<string, any> = new Map<string, any>([
        ['/', '']
    ])
    private bytecode: Instruct[] = []
    private definitition: number = -1

    constructor(public description: FunctionDescription, args: any[], public processManager: ProcessManager) {
        super(processManager, args)

        var def = this.determineDefinition(args)
        if(def != undefined) { // check for error
            return // return
        }

        // add args to memory
        this.initializeArgs(description.definitions[this.definitition].args, args)
    }

    public start(): any {
        return this.executeBytecode()
    }

    public executeBytecode(): any {
        for(var instruction of this.bytecode) {
            var args = instruction.args
            switch(instruction.ins) {
                case Instruction.NONE:
                    continue
                case Instruction.LABEL:
                    continue
                case Instruction.LOCAL:
                    this.addLocal(args[0], new Atom('none'))
                    break
                case Instruction.PUSH:
                    var pushed = this.memory.get(args[0])
                    this.stack.push(pushed)
                    break
                case Instruction.CALL:
                    // get pushed vars
                    var callArgs = []
                    for(var i = 0; i < Number(args[1]); i++) {
                        callArgs.push(this.stack.pop())
                    }
                    callArgs = callArgs.reverse() // reverse
                    // spawn process
                    this.stack.push(this.processManager.executeFunction(args[0], callArgs))
                    break
                case Instruction.OPERATION:
                    var b = this.stack.pop()
                    var a = this.stack.pop()
                    switch(args[0]) {
                        case '+':
                            this.stack.push(a+b)
                            break
                        case '-':
                            this.stack.push(a-b)
                            break
                        case '*':
                            this.stack.push(a*b)
                            break
                        case '/':
                            this.stack.push(a/b)
                            break
                        case '<=':
                            this.stack.push(new Atom(a <= b))
                            break
                        case '>=':
                            this.stack.push(new Atom(a >= b))
                            break
                        case '/=':
                            //this.stack.push(new Atom(a != b))
                            if(a instanceof VMDatatype && b instanceof VMDatatype) {
                                this.stack.push(new Atom(a.getValue() != b.getValue()))
                            } else if(Array.isArray(a) && Array.isArray(b)) {
                                this.stack.push(new Atom(!this.arraysEqual(a, b)))
                            } else {
                                this.stack.push(new Atom(a != b))
                            }
                            break
                        case '<':
                            this.stack.push(new Atom(a < b))
                            break
                        case '>':
                            this.stack.push(new Atom(a > b))
                            break
                        case '=':
                            //this.stack.push(new Atom(a == b))
                            if(a instanceof VMDatatype && b instanceof VMDatatype) {
                                this.stack.push(new Atom(a.getValue() == b.getValue()))
                            } else if(Array.isArray(a) && Array.isArray(b)) {
                                this.stack.push(new Atom(this.arraysEqual(a, b)))
                            } else {
                                this.stack.push(new Atom(a == b))
                            }
                            break
                        case 'e':
                            if(Array.isArray(b) && !Array.isArray(a)) {
                                this.stack.push(new Atom(b.includes(a)))
                            } else {
                                this.stack.push(new Atom('false'))
                            }
                            break
                        case '\\':
                            if(Array.isArray(b) && !Array.isArray(a)) {
                                this.stack.push(new Atom(!b.includes(a)))
                            } else if(Array.isArray(a)){
                                // [5, 6, 7] \ [1, 2, 3]
                                var arr: any[] = []
                                for(var elem of a) {
                                    var found = false
                                    for(var elemb of b) {
                                        if(elem == elemb) {
                                            found = true
                                        }
                                    }
                                    if(found == false) {
                                        arr.push(elem)
                                    }
                                }
                                this.stack.push(arr)
                            } else {
                                this.stack.push(new Atom('true'))
                            }
                            break
                        case '++':
                            if(Array.isArray(a) && Array.isArray(b)) {
                                a.push(...b)
                                this.stack.push(a)
                            } else if(Array.isArray(a) && !Array.isArray(b)) {
                                a.push(b)
                                this.stack.push(a)
                            } else if(!Array.isArray(a) && Array.isArray(b)) {
                                var arr = []
                                arr.push(a)
                                arr.push(...b)
                                this.stack.push(arr)
                            } else {
                                this.stack.push([a, b])
                            }
                            break
                        case '--':
                            if(Array.isArray(a) && Array.isArray(b)) {
                                // both a and b are arrays
                                // check a for each element of b, when found, remove it
                                var arr = []
                                for(var elem of a) {
                                    var found = false
                                    for(var elemb of b) {
                                        if(elem == elemb) {
                                            found = true
                                        }
                                    }
                                    if(found == false) {
                                        arr.push(elem)
                                    }
                                }
                                this.stack.push(arr)
                            } else if(Array.isArray(a) && !Array.isArray(b)) {
                                // a is array, b is value
                                var arr = []
                                for(var elem of a) {
                                    if(elem != b) {
                                        arr.push(elem)
                                    }
                                }

                                this.stack.push(arr)
                            } else {
                                this.stack.push(a)
                            }
                            break
                        case '**':
                            this.stack.push(Math.pow(a, b))
                            break
                        case 'root':
                            this.stack.push(Math.pow(a, 1/b))
                            break
                    }
                    break
                case Instruction.ADD:
                    var b = this.stack.pop()
                    var a = this.stack.pop()
                    this.stack.push(a+b)
                    break
                case Instruction.SUBTRACT:
                    var b = this.stack.pop()
                    var a = this.stack.pop()
                    this.stack.push(a-b)
                    break
                case Instruction.MULTIPLY:
                    var b = this.stack.pop()
                    var a = this.stack.pop()
                    this.stack.push(a*b)
                    break
                case Instruction.DIVIDE:
                    var b = this.stack.pop()
                    var a = this.stack.pop()
                    this.stack.push(a/b)
                    break
                case Instruction.DONE:
                    return
                case Instruction.PULL: // pull a
                    var a = this.stack.pop()
                    this.memory.set(args[0], a)
                    break
                case Instruction.PUSHL:
                    this.stack.push(this.convertLiteral(args[0]))
                    break
                case Instruction.PRINT:
                    console.log(this.memory.get(args[0]))
                    this.stack.push(new Atom('ok'))
                    break
                case Instruction.COMP:
                    var b = this.stack.pop()
                    var a = this.stack.pop()
                    if(a instanceof VMDatatype && b instanceof VMDatatype) {
                        this.stack.push(a.getValue() == b.getValue())
                    } else {
                        this.stack.push((a == b))
                    }
                    break
            }
        }
        return this.stack.pop()
    }

    private convertLiteral(value: any): string | number | boolean | Atom | any[] | VMDatatype {
        // check for atom
        /*if(value.indexOf(':')) {
            return new Atom(value.replace(':', ''))
        }*/

        // check for boolean
        /*if(value == 'true' || value == 'false') {
            return Boolean(value)
        }*/

        if(value instanceof VMDatatype) {
            return value
        }

        // check if is array
        if(Array.isArray(value)) {
            return value
        }

        value = String(value)

        // check for number
        if(isNaN(Number(value)) == false) {
            return Number(value)
        }

        if(value.charAt(0) == ':') {
            return new Atom(value.replace(':', ''))
        }

        return value
    }

    private getAtom(s: string): Atom | undefined {
        if(s.charAt(0) == ':') {
            return new Atom(s.replace(':', ''))
        }
        return undefined
    }
    
    /**
     * Determine correct definition based on rules and given args
     * Modifies bytecode when successful
     * @returns boolean | VMError - Returns undefined when successful or Error
     */
    private determineDefinition(args: any[]): undefined | VMError {
        // potential matches
        var matches: number[] = []

        // step 1: check arg length
        var arglength = args.length
        var index = 0 // counter
        this.description.definitions.forEach(element => {
            if(element.arglength == arglength) {
                matches.push(index) // push index if successful
            }
            index++
        })

        // if no matches are found already, throw error
        if(matches.length == 0) {
            return ThrowError(NativeErrors.INTERNAL, `No matching implementations for '${this.description.name}'. Different arg lengths`)
        }

        // step 2: evaluate datatypes
        var mat = matches
        matches = []
        mat.forEach(element => {
            // go through each definition
            var similar = this.description.definitions[element].similar
            if(similar.length == 0) { // check if type definitions are even there
                matches.push(element) // no type requirement, add to matches
                return // exit function
            }

            // check for datatypes
            // go over all similars, compare datatypes of args
            var validTypes: boolean = true
            similar.forEach(sim => {
                if(validTypes == false) { // types are already invalid
                    return // abort
                }
                
                //go over sub-array, it holds all indices
                if(this.sameType(args, sim) == false) { // check if same types
                    // no valid types
                    validTypes = false
                    return
                }
            })
            // check for valid types
            if(validTypes) {
                matches.push(element) // add to matches
                return
            }
        })

        if(matches.length == 0) {
            //console.log(this.description.definitions)
            return ThrowError(NativeErrors.INTERNAL, `No matching implementations for '${this.description.name}'. Datatype rules not matching`)
        }

        // step 3: evaluate rules
        mat = matches
        matches = []
        var implementation: number | undefined = undefined
        mat.forEach(element => {
            if(implementation !== undefined) { // check if implementation was already found
                return
            } 
            var rules = this.description.definitions[element].rules // rules
            for(var rule of rules) {
                var isMatch = this.evaluateRule(args, rule) // evaluate rule
                if(isMatch !== undefined) {
                    implementation = isMatch // rule match, implementation chosen
                    this.definitition = element
                }
            }
        })

        if(implementation == undefined) {
            return ThrowError(NativeErrors.INTERNAL, `No matching implementations for '${this.description.name}'. Value rules not matching`)
        }

        // modify bytecode, set to correct one
        this.bytecode = MapInstructions(this.description.implementations[implementation].bytecode)

        return undefined
    }

    private evaluateRule(values: any[], rule: FunctionArgumentRule): number | undefined {
        var match = true
        for(var ruleArg of rule.args) {
            if(this.evaluateArgument(values[ruleArg.index], ruleArg.rule, ruleArg.value) == false) {
                match = false
            }
        }
        if(match) {
            return rule.implementation
        }
        return undefined
    }

    private evaluateArgument(arg: any, rule: string, value: any): boolean {
        if(rule == '') {
            return true
        }
        switch(rule) {
            case '<':
                if(Array.isArray(arg) && Array.isArray(value)) {
                    // both arrays
                    return (arg.length < value.length)
                } else if(Array.isArray(arg) && !Array.isArray(value)) {
                    // only arg is array
                    return (arg.length < value)
                }
                return (Number(arg) < Number(value))
            case '>':
                if(Array.isArray(arg) && Array.isArray(value)) {
                    // both arrays
                    return (arg.length > value.length)
                } else if(Array.isArray(arg) && !Array.isArray(value)) {
                    // only arg is array
                    return (arg.length > value)
                }
                return (Number(arg) > Number(value))
            case '<=':
                if(Array.isArray(arg) && Array.isArray(value)) {
                    // both arrays
                    return (arg.length <= value.length)
                } else if(Array.isArray(arg) && !Array.isArray(value)) {
                    // only arg is array
                    return (arg.length <= value)
                }
                return (Number(arg) <= Number(value))
            case '>=':
                if(Array.isArray(arg) && Array.isArray(value)) {
                    // both arrays
                    return (arg.length >= value.length)
                } else if(Array.isArray(arg) && !Array.isArray(value)) {
                    // only arg is array
                    return (arg.length >= value)
                }
                return (Number(arg) >= Number(value))
            case '=':
                var converted: VMDatatype | any = this.convertLiteral(value)
                if(arg instanceof VMDatatype && converted instanceof VMDatatype) {
                    return (arg.getValue() == converted.getValue())
                } else if(Array.isArray(arg) && Array.isArray(converted)) {
                    // both arrays
                    //console.log(arg, converted)
                    return this.arraysEqual(arg, converted)
                } else if(Array.isArray(arg) && typeof converted == 'number') {
                    // arg is array, value is number
                    return (arg.length == converted)
                }
                return (arg == value)
            case '/=':
                return (arg != value)
            case 'head':
                if(!Array.isArray(arg)) {
                    return false
                }
                var arr: any[] = arg
                var atom = this.getAtom(value)
                if(atom != undefined && arr[0] instanceof Atom) {
                    return (arr[0].getValue() == atom.getValue())
                }
                return (arr[0] == value)
            case 'url':
                // evaluate url
                // arg: supplied url
                // value: wanted format
                // evaluate if url matches with format
                var url: string = arg
                if(url[url.length-1] == '/') {
                    url = url.slice(0, -1)
                }
                if(value[value.length-1] == '/') {
                    value = value.slice(0, -1)
                }
                var urlParts: string[] = url.split('/')
                var suppliedParts: string[] = value.split('/')
                if(urlParts.length != suppliedParts.length) {
                    return false // not same length -> cant be the same
                }
                // go over parts
                // if part = variable, continue
                // if part does not math -> false
                var match = true
                var index = 0
                for(var elem of urlParts) {
                    if(suppliedParts[index][0] == ':') {
                        // variable
                        index++
                        continue
                    }
                    if(suppliedParts[index] != elem) {
                        match = false
                    }

                    index++
                }
                return match
        }
        ThrowError(NativeErrors.INTERNAL, `Unknown comparison rule ${rule}`)
        return false
    }

    private sameType(args: any[], arr: number[]): boolean {
        return true
        // dirty code, but it works (hopefully)
        if(args.length == 0) {
            return true
        }
        var match = true
        var type = typeof args[0]

        for(var index of arr) {
            if(index == -1) {
                continue
            }
            if(typeof args[index] != type) {
                match = false
            }
        }

        return match
    }

    /**
     * Initialize a local variable
     * @param  {string} name - Variable name
     * @param  {any} value - Variable value
     */
    private addLocal(name: string, value: any) {
        this.memory.set(name, value)
    }

    private initializeArgs(names: string[], args: any[]) {
        var index = 0
        for(var name of names) {
            this.addLocal(name, args[index])
            index++
        }
    }

    private arraysEqual(a: any[], b: any[]) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length !== b.length) return false;
      
        // If you don't care about the order of the elements inside
        // the array, you should sort both arrays here.
        // Please note that calling sort on an array will modify that array.
        // you might want to clone your array first.

        for (var i = 0; i < a.length; ++i) {
            var alit = this.convertLiteral(a[i])
            var blit = this.convertLiteral(b[i])
            if(alit instanceof VMDatatype) {
                alit = alit.getValue()
            }
            if(blit instanceof VMDatatype) {
                blit = blit.getValue()
            }
          //if (this.convertLiteral(a[i]) != this.convertLiteral(b[i])) return false;
            if(alit != blit) return false
        }
        return true;
      }
}

/*
    Builtin process calls internal, builtin functions written in JS/TS
*/
export class BuiltinProcess extends Process {
    constructor(public functionImplementation: (args: any[], processManager: ProcessManager) => any, args: any[], public processManager: ProcessManager) {
        super(processManager, args)
    }

    public start(): any {
        return this.functionImplementation(this.args, this.processManager)
    }
} 
  