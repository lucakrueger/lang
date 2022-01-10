"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToArray = exports.InstructionsMapper = exports.Instruction = void 0;
var Instruction;
(function (Instruction) {
    Instruction[Instruction["NONE"] = 0] = "NONE";
    Instruction[Instruction["LABEL"] = 1] = "LABEL";
    Instruction[Instruction["LOCAL"] = 2] = "LOCAL";
    Instruction[Instruction["PUSH"] = 3] = "PUSH";
    Instruction[Instruction["CALL"] = 4] = "CALL";
    Instruction[Instruction["ADD"] = 5] = "ADD";
    Instruction[Instruction["SUBTRACT"] = 6] = "SUBTRACT";
    Instruction[Instruction["MULTIPLY"] = 7] = "MULTIPLY";
    Instruction[Instruction["DIVIDE"] = 8] = "DIVIDE";
    Instruction[Instruction["DONE"] = 9] = "DONE";
    Instruction[Instruction["PULL"] = 10] = "PULL";
    Instruction[Instruction["PULL_LOCAL"] = 11] = "PULL_LOCAL";
    Instruction[Instruction["PUSHL"] = 12] = "PUSHL";
    Instruction[Instruction["PRINT"] = 13] = "PRINT";
    Instruction[Instruction["COMP"] = 14] = "COMP";
    Instruction[Instruction["OPERATION"] = 15] = "OPERATION"; // get called for operation - takes 1 arg - operation
})(Instruction = exports.Instruction || (exports.Instruction = {}));
exports.InstructionsMapper = getInstructionsMapper();
function getInstructionsMapper() {
    var insMapper = new Map([]);
    for (var elem of ToArray(Instruction)) {
        if (typeof Instruction[elem] == 'string')
            insMapper.set(Instruction[elem].toLowerCase(), elem);
    }
    return insMapper;
}
// Turn enum into array
function ToArray(enumme) {
    return Object.keys(enumme)
        .map(key => enumme[key]);
}
exports.ToArray = ToArray;
