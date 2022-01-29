"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printValue = exports.makeid = exports.CheckParameterCount = void 0;
const logger_1 = require("../logger/logger");
const structs_1 = require("./structs");
function CheckParameterCount(functionName, paramCount, requiredCount) {
    if (paramCount > requiredCount) { // check for too many args
        return (0, logger_1.ThrowError)(logger_1.NativeErrors.RANGE, `Too many arguments provided (${paramCount}). ${functionName} requires ${requiredCount} parameter(s)`);
    }
    else if (paramCount < requiredCount) { // check for not enough args
        return (0, logger_1.ThrowError)(logger_1.NativeErrors.RANGE, `Not enough arguments provided (${paramCount}). ${functionName} requires ${requiredCount} parameter(s)`);
    }
    return undefined; // no error
}
exports.CheckParameterCount = CheckParameterCount;
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}
exports.makeid = makeid;
function printValue(a) {
    if (a instanceof structs_1.VMDatatype) {
        console.log(':' + a.getValue());
    }
    else {
        console.log(a);
    }
}
exports.printValue = printValue;
