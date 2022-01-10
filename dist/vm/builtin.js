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
    return new structs_1.Atom('ok');
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
    return arr[index];
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
// takes: array, function(elem, index, array, result) -> array
const ForEach = (args, processManager) => {
    var err = (0, builtinHelper_1.CheckParameterCount)('foreach', args.length, 2);
    if (err != undefined) {
        return err;
    }
    var result;
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
// takes: array, function(elem, index, array, result), firstResult -> array
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
        result.push(processManager.executeFunction(funName, [elem, index, array]));
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
    return result;
};
exports.Builtin = new Map([
    ['print', BuiltinPrint],
    ['array_new', ArrayNew],
    ['array_push', ArrayPush],
    ['array_get', ArrayGet],
    ['call', Call],
    ['foreach', ForEach],
    ['foreachls', ForEachLs],
    ['foreachspec', ForEachSpec],
    ['range', Range],
    ['len', Len],
    ['identical', Identical]
]);
