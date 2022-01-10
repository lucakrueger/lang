"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BytecodeGenerator = void 0;
const logger_1 = require("../logger/logger");
const parser_1 = require("../bytecodes/parser");
const groupBy = require('group-by');
class BytecodeGenerator {
    /*
        Process Functions change the classes fields, no return
        Handle Functions return bytecode
        Get Functions return values or structs
    */
    constructor(ast) {
        this.ast = ast;
        this.module = "";
        this.imports = [];
    }
    generateBytecode() {
        var funs = [];
        this.ast.tree.forEach((element) => {
            element.forEach(element => {
                var temp = this.walk(element);
                if (temp != undefined) {
                    funs.push(temp);
                }
            });
        });
        return this.convertIntermediate(funs);
    }
    convertIntermediate(funs) {
        var bytecode = new parser_1.ParserBytecode(this.module, this.imports);
        /*
            Group and sort all functions by name
            Go over all functions -> create their own description
            Add description to bytecode
        */
        var groups = groupBy(funs, 'name'); // grouped functions by name [{GroupName, Functions[]}]
        Object.entries(groups).forEach(([key, value]) => {
            var entry = groups[key]; // group, all implementations for a function
            var generatedFunctionData = this.generateFunction(entry);
            var newFunction = {
                name: key,
                definitions: generatedFunctionData[0],
                implementations: generatedFunctionData[1]
            };
            bytecode.addDescription(newFunction);
        });
        return bytecode;
    }
    generateFunction(funs) {
        var definitions = [];
        var implementations = [];
        for (var fun of funs) {
            if (fun.typedef == true) {
                // add new definition
                var argNames = [];
                fun.args.forEach((value) => {
                    if (value[0] != undefined) {
                        argNames.push(value[0]); // add value to names
                    }
                });
                definitions.push({
                    args: argNames,
                    arglength: argNames.length,
                    similar: this.determineSimilar(argNames),
                    rules: []
                });
            }
            else {
                // No type definition, normal function
                // every function has own implementation and rules, they get insered into rules
                // find correct implementation, if not found create new one
                var argNames = [];
                var argRules = [];
                fun.args.forEach((value) => {
                    if (value[0] != undefined) {
                        argNames.push(value[0]); // add value to names
                    }
                    argRules.push(value[1]);
                });
                var definitionIndex = -1; // index of correspodning definition
                // find definition based on arg length
                var index = 0;
                for (var def of definitions) {
                    if (def.arglength == argNames.length) {
                        // found correct definition
                        definitionIndex = index;
                        break;
                    }
                    index++;
                }
                // no definition
                if (definitionIndex == -1) {
                    // no definition found, create new one
                    definitions.push({
                        args: argNames,
                        arglength: argNames.length,
                        similar: this.determineSimilar(argNames),
                        rules: []
                    });
                    // set index
                    definitionIndex = definitions.length - 1;
                }
                // process function, create implementations
                var implementationID = implementations.length;
                var argRule = {
                    implementation: implementationID,
                    args: []
                };
                // go over args, add their corresponding rule
                var i = 0;
                for (var arg of argNames) {
                    argRule.args.push({
                        index: i,
                        name: arg,
                        rule: argRules[i].rule,
                        value: argRules[i].value
                    });
                    i++;
                }
                // change definition names, to match with real arg names
                definitions[definitionIndex].args = argNames;
                definitions[definitionIndex].rules.push(argRule); // add rule
                // add implementation
                implementations.push({
                    index: implementationID,
                    bytecode: fun.bytecode
                });
            }
        }
        return [definitions, implementations];
    }
    testSimilar(s) {
        console.log(this.determineSimilar(s));
    }
    determineSimilar(names) {
        var result = [];
        var cached = [];
        names.forEach((value, index) => {
            // check if same char is already cached
            var succ = false;
            cached.forEach((block, i) => {
                if (succ == true) {
                    return;
                }
                if (block[0] == value) {
                    // already cached
                    result[block[1]].push(index);
                    succ = true;
                }
            });
            if (succ == false) {
                // not cached
                var cachedIndex = result.length;
                result.push([index]); // push index to result
                cached.push([value, cachedIndex]); // cache result
            }
        });
        return result;
    }
    walk(expr) {
        if (expr == null || expr == undefined) {
            return undefined;
        }
        var fun = undefined;
        switch (expr.ident) {
            case 'definition':
                this.processDefinition(expr);
                break;
            case 'function_def':
                fun = this.processFunction(expr);
                break;
            case 'function_type':
                fun = this.processFunctionType(expr);
                break;
        }
        return fun;
    }
    // collect all bytecode for function
    handleExpr(expr) {
        var bytecode = [];
        switch (expr.ident) {
            case 'name':
                bytecode.push(...this.handleName(expr));
                break;
            case 'number':
                bytecode.push(...this.handleNumber(expr));
                break;
            case 'string':
                bytecode.push(...this.handleString(expr));
                break;
            case 'atom':
                bytecode.push(...this.handleAtom(expr));
                break;
            case 'array':
                bytecode.push(...this.handleArray(expr));
                break;
            case 'array_index':
                bytecode.push(...this.handleArrayIndex(expr));
                break;
            case 'call':
                bytecode.push(...this.handleCall(expr));
                break;
            case 'operation':
                bytecode.push(...this.handleOperation(expr));
                break;
        }
        return bytecode;
    }
    /*
        Handle
    */
    // returns bytecode
    handleName(expr) {
        return [`push ${expr.value}`];
    }
    handleNumber(expr) {
        return [`pushl ${expr.value}`];
    }
    handleString(expr) {
        return [`pushl ${expr.value}`];
    }
    handleAtom(expr) {
        return [`pushl :${expr.value.value}`];
    }
    handleArrayIndex(expr) {
        return [
            `push ${this.getName(expr.array)}`,
            ...this.handleExpr(expr.value),
            `call array_get 2` // internal function to get value from array
        ];
    }
    handleArray(expr) {
        var empty = (expr.value[0] == null);
        if (empty) {
            return [
                'call array_new 0' // internal function
            ];
        }
        // not empty
        var lines = [];
        lines.push('call array_new 0');
        lines.push(...this.handleExpr(expr.value[0]));
        lines.push('call array_push 2');
        for (var child of expr.value[1][1]) {
            lines.push(...this.handleExpr(child[2]));
            lines.push('call array_push 2');
        }
        return lines;
    }
    handleOperation(expr) {
        var op = expr.op;
        var lines = [];
        lines.push(...this.handleExpr(expr.value[0]));
        lines.push(...this.handleExpr(expr.value[1]));
        lines.push(`operation ${op}`);
        return lines;
    }
    handleCall(expr) {
        var callName = this.getName(expr.name);
        if (callName == undefined) {
            (0, logger_1.ThrowError)(logger_1.NativeErrors.REFERENCE, `Function ${callName} not found`);
            return [];
        }
        var lines = [];
        // process args
        var callArgs = this.handleCallArgs(expr.args);
        lines.push(...callArgs[0]);
        lines.push(`call ${callName} ${callArgs[1]}`); // call function
        return lines;
    }
    handleCallArgs(expr) {
        var length = 0;
        if (expr.length == 0) {
            return [[], 0];
        }
        if (expr[0].length == 1) {
            length = 1;
        }
        else if (expr[0].length > 1) {
            length = expr[0][1].length + 1;
        }
        var lines = [];
        // handle first expr
        lines.push(...this.handleExpr(expr[0][0][2]));
        if (expr[0].length >= 2) {
            for (var ex of expr[0][1]) {
                lines.push(...this.handleExpr(ex[2]));
            }
        }
        return [lines, length];
    }
    /*
        Process
    */
    processFunctionType(expr) {
        var im = {
            name: this.getName(expr.name),
            typedef: true,
            args: [],
            bytecode: []
        };
        for (var type of expr.types) {
            var temp = [undefined, { rule: "", value: "" }];
            temp[0] = this.getType(type[1]);
            im.args.push(temp);
        }
        return im;
    }
    processFunction(expr) {
        var im = {
            name: this.getName(expr.name),
            typedef: false,
            args: [],
            bytecode: []
        };
        // define args
        for (var arg of expr.args) {
            var temp = [undefined, { rule: "", value: "" }];
            temp[0] = this.getName(arg[1]);
            if (arg[3] != null) {
                // rule exists
                temp[1] = this.getRule(arg[3]);
            }
            im.args.push(temp);
        }
        // define bytecode
        im.bytecode = this.handleExpr(expr.result);
        return im;
    }
    processDefinition(expr) {
        switch (this.getName(expr.value[0])) {
            case 'module':
                var value = this.getName(expr.value[1]);
                if (value !== undefined) {
                    this.module = value;
                }
                break;
            case 'import':
                break;
        }
    }
    /*
        Get
    */
    getRule(expr) {
        return { rule: expr.rule, value: this.getValue(expr.value) };
    }
    getValue(expr) {
        if (expr.ident == 'atom') {
            return `:${expr.value.value}`;
        }
        return `${expr.value}`;
    }
    getName(expr) {
        if (expr.ident != 'name') {
            return undefined;
        }
        return expr.value;
    }
    getType(expr) {
        switch (expr.ident) {
            case 'atom':
                return `${expr.value.value}`;
        }
        return this.getValue(expr);
    }
}
exports.BytecodeGenerator = BytecodeGenerator;
