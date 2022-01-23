"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Builtin = void 0;
const logger_1 = require("../logger/logger");
const builtinHelper_1 = require("./builtinHelper");
const structs_1 = require("./structs");
const proto = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('name', args.length, 2);
    if (err != undefined) {
        return err;
    }
    /*
    * Function code
    */
    return [];
};
const BuiltinPrint = (args, processManager) => {
    // check for correct parameter count
    var err = (0, builtinHelper_1.CheckParameterCount)('print', args.length, 1);
    if (err != undefined) {
        return err;
    }
    // print value
    var value = args[0];
    var printedValue = value;
    // compare types
    // if type = vmDatatype, print toString() representation
    if (value instanceof structs_1.VMDatatype) {
        // value is a custom datatype
        printedValue = value.toString(); // get string representation
    }
    // print value
    console.log(printedValue);
    // return :ok atom
    return value;
};
const ArrayNew = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('array_new', args.length, 0);
    if (err != undefined) {
        return err;
    }
    return [];
};
// takes: array, element; returns: array
const ArrayPush = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('array_new', args.length, 2);
    if (err != undefined) {
        return err;
    }
    var arr = args[0];
    var elem = args[1];
    arr.push(elem);
    return arr;
};
// takes: array, index; returns: array
const ArrayGet = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('array_new', args.length, 2);
    if (err != undefined) {
        return err;
    }
    var arr = args[0];
    var index = Number(args[1]);
    if (!Array.isArray(arr)) { // check if is array, if not, return the value
        return arr;
    }
    //console.log(arr[index])
    return arr[index];
};
// takes: array, start, end -> array
const ArraySplice = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('array_splice', args.length, 3);
    if (err != undefined) {
        return err;
    }
    // splice 1, 5 -> start: 1, 5-1 -> 1 - 4
    // array[1:5] -> 1, 2, 3, 4
    // array[10:(86-10+1)] -> 10, ..., 
    var arr = args[0];
    var start = args[1];
    var end = args[2];
    if (!Array.isArray(arr)) { // check if it is array
        // not an array
        return arr;
    }
    if (end >= arr.length) {
        end = arr.length;
    }
    else if (end == -1) {
        end = arr.length;
    }
    //return arr.splice(start, end - start)
    return arr.slice(start, end);
};
// takes: array -> array
const ArrayClean = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('array_clean', args.length, 1);
    if (err != undefined) {
        return err;
    }
    var arr = args[0];
    if (!Array.isArray(arr)) {
        return arr;
    }
    if (arr.length == 1) {
        return arr[0];
    }
    return arr;
};
// takes: array -> array
const ArrayShuffle = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('shuffle', args.length, 1);
    if (err != undefined) {
        return err;
    }
    var arr = args[0];
    if (!Array.isArray(arr)) {
        return arr;
    }
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
};
// takes: function, array -> any
const Call = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('call', args.length, 2);
    if (err != undefined) {
        return err;
    }
    return processManager.executeFunction(args[0], args[1]);
};
// redefines result
// takes: array, function(elem, index, array, result) -> value
const ForEach = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('foreach', args.length, 2);
    if (err != undefined) {
        return err;
    }
    var result = new structs_1.Atom('none');
    var array = args[0];
    var fun = args[1];
    var funName = fun.getValue();
    var index = 0;
    for (var elem of array) {
        result = processManager.executeFunction(funName, [elem, index, array, result]);
        index++;
    }
    return result;
};
// redefines result
// takes: array, function(elem, index, array, result), firstResult -> value
const ForEachSpec = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('foreach', args.length, 3);
    if (err != undefined) {
        return err;
    }
    var result = args[2];
    var array = args[0];
    var fun = args[1];
    var funName = fun.getValue();
    var index = 0;
    for (var elem of array) {
        result = processManager.executeFunction(funName, [elem, index, array, result]);
        index++;
    }
    return result;
};
// pushes result into list
// takes: array, function(elem, index, array) -> array
const ForEachLs = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('foreachls', args.length, 2);
    if (err != undefined) {
        return err;
    }
    var result = [];
    var array = args[0];
    var fun = args[1];
    var funName = fun.getValue();
    var index = 0;
    for (var elem of array) {
        //result.push(processManager.executeFunction(funName, [elem, index, array]))
        var res = processManager.executeFunction(funName, [elem, index, array, result]);
        if ((res instanceof structs_1.Atom && res.getValue() == 'none') == false) {
            result.push(res);
        }
        index++;
    }
    return result;
};
// TODO: implement native range operator (min ... max)
// standard integer range from min to max
// takes: min, max -> array
const Range = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('range', args.length, 2);
    if (err != undefined) {
        return err;
    }
    var min = args[0];
    var max = args[1];
    if (min >= max) {
        return (0, logger_1.ThrowError)(logger_1.NativeErrors.RANGE, `Range function requires: min < max. ${min} >= ${max}`);
    }
    var result = [];
    for (var i = min; i < max; i++)
        result.push(i);
    return result;
};
const Len = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('len', args.length, 1);
    if (err != undefined) {
        return err;
    }
    if (Array.isArray(args[0]) == false) {
        // no array
        return new structs_1.Atom('false');
    }
    var arr = args[0];
    return arr.length;
};
// takes: array -> boolean
// also: by doing (:true ++ array), you can check if all elements are equal to this specific value
const Identical = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('identical', args.length, 1);
    if (err != undefined) {
        return err;
    }
    var arr = args[0];
    var result = true;
    var last = undefined;
    var index = 0;
    for (var elem of arr) {
        if (index == 0) {
            last = elem;
            index++;
            continue;
        }
        if (elem instanceof structs_1.VMDatatype && last instanceof structs_1.VMDatatype) {
            if (elem.getValue() != last.getValue()) {
                result = false;
                break;
            }
            else {
                last = elem;
                index++;
                continue;
            }
        }
        if (elem != last) {
            result = false;
            break;
        }
        last = elem;
        index++;
    }
    switch (result) {
        case true:
            return new structs_1.Atom('true');
        case false:
            return new structs_1.Atom('false');
    }
    return result;
};
// takes: string, function -> function(url, args)
const route = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('route', args.length, 2);
    if (err != undefined) {
        return err;
    }
    var url = args[0];
    var f = args[1];
    return processManager.executeFunction(f.getValue(), [url, url.split('/')]);
};
// takes: function (args) array -> array
const Performance = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('performance', args.length, 2);
    if (err != undefined) {
        return err;
    }
    var fun = args[0];
    var arr = args[1];
    var id = fun.getValue();
    console.time(id);
    processManager.executeFunction(fun.getValue(), arr);
    console.timeEnd(id);
    return [];
};
// takes: min, max -> number
const Random = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('random', args.length, 2);
    if (err != undefined) {
        return err;
    }
    var min = Math.floor(args[0]);
    var max = Math.ceil(args[1]);
    return Math.floor(Math.random() * (max - min) + min);
};
// takes: array (2d) -> [array, array]
const separate = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('separate', args.length, 1);
    if (err != undefined) {
        return err;
    }
    var arr = args[0];
    // go over arr
    // check if 2 dimensional, if not, second value is :none
    // split into two seperate arrays
    // return new array containing both
    var arr0 = [];
    var arr1 = [];
    for (var elem of arr) {
        var first = '';
        var second = '';
        if (Array.isArray(elem) && elem.length > 2) {
            // length is at least two
            first = elem[0];
            second = elem.slice(1);
            arr0.push(first);
            arr1.push(second);
            continue;
        }
        else if (Array.isArray(elem) && elem.length == 2) {
            // length is at least two
            first = elem[0];
            second = elem[1];
            arr0.push(first);
            arr1.push(second);
            continue;
        }
        else if (Array.isArray(elem) && elem.length == 1) {
            // length is one
            first = elem[0];
            second = new structs_1.Atom('none');
            arr0.push(first);
            arr1.push(second);
            continue;
        }
        else {
            first = elem;
            second = new structs_1.Atom('none');
            arr0.push(first);
            arr1.push(second);
            continue;
        }
    }
    return [arr0, arr1];
};
exports.Builtin = new Map([
    ['print', BuiltinPrint],
    ['array_new', ArrayNew],
    ['array_push', ArrayPush],
    ['array_get', ArrayGet],
    ['array_clean', ArrayClean],
    ['splice', ArraySplice],
    ['shuffle', ArrayShuffle],
    ['call', Call],
    ['foreach', ForEach],
    ['foreachls', ForEachLs],
    ['foreachspec', ForEachSpec],
    ['range', Range],
    ['len', Len],
    ['identical', Identical],
    ['route', route],
    ['performance', Performance],
    ['random', Random],
    ['separate', separate]
]);
