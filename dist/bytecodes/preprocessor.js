"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Preprocessor = void 0;
class Preprocessor {
    constructor() {
        this.imports = [];
        this.descr = [];
    }
    /**
     * Check if module is already imported
     * @param name - name of module
     * @returns boolean - whether module is already imported or not
     */
    import(name) {
        var incl = this.imports.includes(name);
        if (!incl) {
            this.imports.push(name);
        }
        return incl;
    }
}
exports.Preprocessor = Preprocessor;
