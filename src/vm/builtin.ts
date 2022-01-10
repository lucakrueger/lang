import { NativeErrors, ThrowError, VMError } from "../logger/logger"
import { CheckParameterCount } from "./builtinHelper"
import { ProcessManager } from "./processManager"
import { Atom, VMDatatype } from "./structs"

const proto = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('name', args.length, 2)
    if(err != undefined) {
        return err
    }

    /*
    * Function code
    */

    return []
}

const BuiltinPrint = (args: any[], processManager: ProcessManager): (any | VMError) => {
    // check for correct parameter count
    var err = CheckParameterCount('print', args.length, 1)
    if(err != undefined) {
        return err
    }
    // print value
    var value = args[0]
    var printedValue: any = value
    // compare types
    // if type = vmDatatype, print toString() representation
    if(value instanceof VMDatatype) {
        // value is a custom datatype
        printedValue = value.toString() // get string representation
    }
    // print value
    console.log(printedValue)
    // return :ok atom
    return new Atom('ok')
}

const ArrayNew = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('array_new', args.length, 0)
    if(err != undefined) {
        return err
    }

    return []
}

// takes: array, element; returns: array
const ArrayPush = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('array_new', args.length, 2)
    if(err != undefined) {
        return err
    }

    var arr: any[] = args[0]
    var elem: any = args[1]

    arr.push(elem)

    return arr
}

// takes: array, index; returns: array
const ArrayGet = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('array_new', args.length, 2)
    if(err != undefined) {
        return err
    }

    var arr: any[] = args[0]
    var index: number = Number(args[1])

    return arr[index]
}

// takes: array, start, end -> array
const ArraySplice = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('array_splice', args.length, 3)
    if(err != undefined) {
        return err
    }

    // splice 1, 5 -> start: 1, 5-1 -> 1 - 4
    // array[1:5] -> 1, 2, 3, 4
    // array[10:(86-10+1)] -> 10, ..., 

    var arr: any[] = args[0]
    var start: number = args[1]
    var end: number = args[2]

    if(end >= arr.length) {
        end = arr.length
    } else if(end == -1) {
        end = arr.length
    }

    return arr.splice(start, end - start)
}

// takes: function, array -> any
const Call = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('call', args.length, 2)
    if(err != undefined) {
        return err
    }
    
    return processManager.executeFunction(args[0], args[1])
}

// redefines result
// takes: array, function(elem, index, array, result) -> array
const ForEach = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('foreach', args.length, 2)
    if(err != undefined) {
        return err
    }
    
    var result: any
    var array: any[] = args[0]
    var fun: Atom = args[1]
    var funName: string = fun.getValue()

    var index = 0
    for(var elem of array) {
        result = processManager.executeFunction(funName, [elem, index, array, result])
        index++
    }

    return result
}

// redefines result
// takes: array, function(elem, index, array, result), firstResult -> array
const ForEachSpec = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('foreach', args.length, 3)
    if(err != undefined) {
        return err
    }
    
    var result: any = args[2]
    var array: any[] = args[0]
    var fun: Atom = args[1]
    var funName: string = fun.getValue()

    var index = 0
    for(var elem of array) {
        result = processManager.executeFunction(funName, [elem, index, array, result])
        index++
    }

    return result
}

// pushes result into list
// takes: array, function(elem, index, array) -> array
const ForEachLs = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('foreachls', args.length, 2)
    if(err != undefined) {
        return err
    }
    
    var result: any[] = []
    var array: any[] = args[0]
    var fun: Atom = args[1]
    var funName: string = fun.getValue()

    var index = 0
    for(var elem of array) {
        result.push(processManager.executeFunction(funName, [elem, index, array]))
        index++
    }

    return result
}

// TODO: implement native range operator (min ... max)
// standard integer range from min to max
// takes: min, max -> array
const Range = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('range', args.length, 2)
    if(err != undefined) {
        return err
    }

    var min: number = args[0]
    var max: number = args[1]
    
    if(min >= max) {
        return ThrowError(NativeErrors.RANGE, `Range function requires: min < max. ${min} >= ${max}`)
    }

    var result: number[] = []
    for(var i = min; i < max; i++) result.push(i)

    return result
}

const Len = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('len', args.length, 1)
    if(err != undefined) {
        return err
    }

    if(Array.isArray(args[0]) == false) {
        // no array
        return new Atom('false')
    }

    var arr: any[] = args[0]
    return arr.length
}

// takes: array -> boolean
const Identical = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('identical', args.length, 1)
    if(err != undefined) {
        return err
    }

    var arr: any[] = args[0]
    var result: boolean = true
    var last: any = undefined

    var index = 0
    for(var elem of arr) {
        if(index == 0) {
            last = elem
            index++
            continue
        }
        if(elem instanceof VMDatatype && last instanceof VMDatatype) {
            if(elem.getValue() != last.getValue()) {
                result = false
                break
            } else {
                last = elem
                index++
                continue
            }
        }

        if(elem != last) {
            result = false
            break
        }

        last = elem
        index++
    }

    return result
}

// takes: string, function -> function(url, args)
const route = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('name', args.length, 2)
    if(err != undefined) {
        return err
    }

    var url: string = args[0]
    var f: Atom = args[1]

    return processManager.executeFunction(f.getValue(), [url, url.split('/')])
}

export const Builtin = new Map<string, (args: any[], processManager: ProcessManager) => any>([
    ['print', BuiltinPrint],
    ['array_new', ArrayNew],
    ['array_push', ArrayPush],
    ['array_get', ArrayGet],
    ['splice', ArraySplice],
    ['call', Call],
    ['foreach', ForEach],
    ['foreachls', ForEachLs],
    ['foreachspec', ForEachSpec],
    ['range', Range],
    ['len', Len],
    ['identical', Identical],
    ['route', route]
])