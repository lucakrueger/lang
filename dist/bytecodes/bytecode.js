"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bytecode = void 0;
class Bytecode {
    /**
     * Search for specific function by name
     * @param  {string} name - Function name
     * @returns number | undefined - Index of function description
     */
    getFunction(name) {
        var index = 0;
        for (var descr of this.getDescriptions().descriptions) {
            if (descr.name == name) {
                return index;
            }
            index++;
        }
        return undefined;
    }
}
exports.Bytecode = Bytecode;
