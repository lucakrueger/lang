import { AST } from "./ast";
import { Bytecode, FunctionArgumentRule, FunctionDescription } from '../bytecodes/bytecode'
import { ReadableBytecode } from "../bytecodes/readable";
import { NativeErrors, ThrowError } from "../logger/logger";
import { ParserBytecode } from "../bytecodes/parser";
const groupBy = require('group-by')

export class BytecodeGenerator {
    private module: string = ""
    private imports: string[] = []

    /*
        Process Functions change the classes fields, no return
        Handle Functions return bytecode
        Get Functions return values or structs
    */

    constructor(public ast: AST) {}

    public generateBytecode(): ParserBytecode {
        var funs: IntermediateFunction[] = []
        this.ast.tree.forEach((element: any[]) => {
            element.forEach(element => {
                var temp = this.walk(element)
                if(temp != undefined) {
                    funs.push(temp)
                }
            });
        })
        return this.convertIntermediate(funs)
    }

    public convertIntermediate(funs: IntermediateFunction[]): ParserBytecode {
        var bytecode = new ParserBytecode(this.module, this.imports)
        
        /*
            Group and sort all functions by name 
            Go over all functions -> create their own description
            Add description to bytecode
        */

        var groups: any = groupBy(funs, 'name') // grouped functions by name [{GroupName, Functions[]}]
        
        Object.entries(groups).forEach(([key, value]) => {
            var entry: IntermediateFunction[] = groups[key] // group, all implementations for a function
            
            var generatedFunctionData = this.generateFunction(entry)

            var newFunction: FunctionDescription = {
                name: key,
                definitions: generatedFunctionData[0],
                implementations: generatedFunctionData[1]
            }

            bytecode.addDescription(newFunction)
        })

        return bytecode
    }

    generateFunction(funs: IntermediateFunction[]): [any[], any[]] {
        var definitions: any[] = []
        var implementations: any[] = []

        for(var fun of funs) {
            if(fun.typedef == true) {
                // add new definition
                var argNames: string[] = []
                fun.args.forEach((value) => {
                    if(value[0] != undefined) {
                        argNames.push(value[0]) // add value to names
                    }
                })
                definitions.push({
                    args: argNames,
                    arglength: argNames.length,
                    similar: this.determineSimilar(argNames),
                    rules: []
                })
            } else {
                // No type definition, normal function
                // every function has own implementation and rules, they get insered into rules
                // find correct implementation, if not found create new one
                var argNames: string[] = []
                var argRules: IntermediateRule[] = []
                fun.args.forEach((value) => {
                    if(value[0] != undefined) {
                        argNames.push(value[0]) // add value to names
                    }
                    argRules.push(value[1])
                })

                var definitionIndex = -1 // index of correspodning definition

                // find definition based on arg length
                var index = 0
                for(var def of definitions) {
                    if(def.arglength == argNames.length) {
                        // found correct definition
                        definitionIndex = index
                        break
                    }
                    index++
                }

                // no definition
                if(definitionIndex == -1) {
                    // no definition found, create new one
                    definitions.push({
                        args: argNames,
                        arglength: argNames.length,
                        similar: this.determineSimilar(argNames),
                        rules: []
                    })
                    // set index
                    definitionIndex = definitions.length-1
                }

                // process function, create implementations
                var implementationID = implementations.length
                var argRule: FunctionArgumentRule = {
                    implementation: implementationID,
                    args: []
                }

                // go over args, add their corresponding rule
                var i = 0
                for(var arg of argNames) {
                    argRule.args.push({
                        index: i,
                        name: arg,
                        rule: argRules[i].rule,
                        value: argRules[i].value
                    })

                    i++
                }

                // change definition names, to match with real arg names
                definitions[definitionIndex].args = argNames

                definitions[definitionIndex].rules.push(argRule) // add rule

                // add implementation
                implementations.push({
                    index: implementationID,
                    bytecode: fun.bytecode
                })
            }
        }

        return [definitions,implementations]
    }

    public testSimilar(s: string[]) {
        console.log(this.determineSimilar(s))
    }

    determineSimilar(names: string[]): number[][] {
        var result: number[][] = []
        var cached: [string, number][] = []

        names.forEach((value, index) => {
            // check if same char is already cached
            var succ = false
            cached.forEach((block, i) => {
                if(succ == true) {
                    return
                }
                if(block[0] == value) {
                    // already cached
                    result[block[1]].push(index)
                    succ = true
                }
            })
            if(succ == false) {
                // not cached
                var cachedIndex = result.length
                result.push([index]) // push index to result
                cached.push([value, cachedIndex]) // cache result
            }
        })

        return result
    }

    walk(expr: any): IntermediateFunction | undefined {
        if(expr == null || expr == undefined) {
            return undefined
        }

        var fun: IntermediateFunction | undefined = undefined

        switch(expr.ident) {
            case 'definition':
                this.processDefinition(expr)
                break
            case 'function_def':
                fun = this.processFunction(expr)
                break
            case 'function_type':
                fun = this.processFunctionType(expr)
                break
        }

        return fun
    }

    // collect all bytecode for function
    handleExpr(expr: any): string[] {
        var bytecode: string[] = []
        switch(expr.ident) {
            case 'name':
                bytecode.push(...this.handleName(expr))
                break
            case 'number':
                bytecode.push(...this.handleNumber(expr))
                break
            case 'string':
                bytecode.push(...this.handleString(expr))
                break
            case 'atom':
                bytecode.push(...this.handleAtom(expr))
                break
            case 'array':
                bytecode.push(...this.handleArray(expr))
                break
            case 'array_index':
                bytecode.push(...this.handleArrayIndex(expr))
                break
            case 'call':
                bytecode.push(...this.handleCall(expr))
                break
            case 'operation':
                bytecode.push(...this.handleOperation(expr))
                break
        }
        return bytecode
    }

    /*
        Handle
    */

    // returns bytecode
    handleName(expr: any): string[] {
        return [`push ${expr.value}`]
    }

    handleNumber(expr: any): string[] {
        return [`pushl ${expr.value}`]
    }

    handleString(expr: any): string[] {
        return [`pushl ${expr.value}`]
    }

    handleAtom(expr: any): string[] {
        return [`pushl :${expr.value.value}`]
    }

    handleArrayIndex(expr: any): string[] {
        return [
            `push ${this.getName(expr.array)}`,
            ...this.handleExpr(expr.value),
            `call array_get 2`  // internal function to get value from array
        ]
    }

    handleArray(expr: any): string[] {
        var empty = (expr.value[0] == null)
        if(empty) {
            return [
                'call array_new 0' // internal function
            ]
        }

        // not empty
        var lines: string[] = []
        lines.push('call array_new 0')
        lines.push(...this.handleExpr(expr.value[0]))
        lines.push('call array_push 2')

        for(var child of expr.value[1][1]) {
            lines.push(...this.handleExpr(child[2]))
            lines.push('call array_push 2')
        }

        return lines
    }

    handleOperation(expr: any): string[] {
        var op = expr.op
        var lines: string[] = []

        lines.push(...this.handleExpr(expr.value[0]))
        lines.push(...this.handleExpr(expr.value[1]))

        lines.push(`operation ${op}`)

        return lines
    }

    handleCall(expr: any): string[] {
        var callName = this.getName(expr.name)
        if(callName == undefined) {
            ThrowError(NativeErrors.REFERENCE, `Function ${callName} not found`)
            return []
        }
        var lines: string[] = []
        // process args
        var callArgs = this.handleCallArgs(expr.args)
        lines.push(...callArgs[0])

        lines.push(`call ${callName} ${callArgs[1]}`) // call function

        return lines
    }

    handleCallArgs(expr: any[]): [string[], number] {
        var length = 0
        if(expr.length == 0) {
            return [[], 0]
        }
        if(expr[0].length == 1) {
            length = 1
        } else if(expr[0].length > 1) {
            length = expr[0][1].length + 1
        }

        var lines: string[] = []

        // handle first expr
        lines.push(...this.handleExpr(expr[0][0][2]))

        if(expr[0].length >= 2) {
            for(var ex of expr[0][1]) {
                lines.push(...this.handleExpr(ex[2]))
            }
        }

        return [lines, length]
    }

    /*
        Process
    */

    processFunctionType(expr: any): IntermediateFunction {
        var im: IntermediateFunction = {
            name: this.getName(expr.name),
            typedef: true,
            args: [],
            bytecode: []
        }

        for(var type of expr.types) {
            var temp: [string | undefined, IntermediateRule] = [undefined, {rule: "", value: ""}]
            temp[0] = this.getType(type[1])
            im.args.push(temp)
        }

        return im
    }

    processFunction(expr: any): IntermediateFunction {
        var im: IntermediateFunction = {
            name: this.getName(expr.name),
            typedef: false,
            args: [],
            bytecode: []
        }

        // define args
        for(var arg of expr.args) {
            var temp: [string | undefined, IntermediateRule] = [undefined, {rule: "", value: ""}]
            temp[0] = this.getName(arg[1])
            if(arg[3] != null) {
                // rule exists
                temp[1] = this.getRule(arg[3])
            }

            im.args.push(temp)
        }

        // define bytecode
        im.bytecode = this.handleExpr(expr.result)

        return im
    }

    processDefinition(expr: any) {
        switch(this.getName(expr.value[0])) {
            case 'module':  
                var value = this.getName(expr.value[1])
                if(value !== undefined) {
                    this.module = value
                }
                break
            case 'import':
                /*
                    Either array or name
                    Name -> search in libs
                    [Name, Name, ...] -> search in libs
                    [Path, Name, Name, ...] -> search in path
                */
               if(expr.value[1].ident == 'array') {
                    var arr = this.getArray(expr.value[1])
                    // format path
                    var prefix = ''
                    var start = 0
                    if(arr[0][0] == '.' || arr[0][0] == '/') {
                        // path is first
                        start = 1
                        var path: string = arr[0]
                        prefix = path
                        if(path[path.length-1] != '/') {
                            prefix += '/'
                        }
                    } else {
                        // standard path for libs
                        prefix = './lib/'
                    }
                    for(var i = start; i < arr.length; i++){
                        this.imports.push(prefix+arr[i]+'.lang')
                    }
               } else {
                   this.imports.push('./lib/'+this.getValue(expr.value[1])+'.lang')
               }
               break
        }
    }

    
    /*
        Get
    */

    getRule(expr: any): IntermediateRule {
        return {rule: expr.rule, value: this.getValue(expr.value)}
    }

    getValue(expr: any): string {
        if(expr.ident == 'atom') {
            return `:${expr.value.value}`
        }
        return `${expr.value}`
    }

    getName(expr: {ident: string, value: string}): string | undefined {
        if(expr.ident != 'name') {
            return undefined
        }
        return expr.value
    }

    getType(expr: any): string {
        switch(expr.ident) {
            case 'atom':
                return `${expr.value.value}`
        }
        return this.getValue(expr)
    }

    getArray(expr: any): any[] {
        var result: any[] = []

        var empty = (expr.value[0] == null)
        if(empty) {
            return []
        }

        // not empty
        result.push(this.getValue(expr.value[0]))

        for(var child of expr.value[1][1]) {
            result.push(this.getValue(child[2]))
        }

        return result
    }
}

export interface IntermediateFunction {
    name: string | undefined,
    typedef: boolean | undefined, // set true if it is type defition -> then last element of args is return type
    args: [string | undefined, IntermediateRule][],
    bytecode: string[]
}

export interface IntermediateRule {
    rule: string,
    value: string
}