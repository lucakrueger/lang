"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserExtensionManager = exports.ParserExtension = void 0;
class ParserExtension {
    constructor(identifier) {
        this.identifier = identifier;
    }
}
exports.ParserExtension = ParserExtension;
class ParserExtensionManager {
    constructor(module) {
        this.module = module;
        this.extensions = new Map([]);
    }
    register(extension) {
        var _a;
        this.extensions.set(extension.identifier, extension);
        (_a = this.extensions.get(extension.identifier)) === null || _a === void 0 ? void 0 : _a.onStart();
    }
    invoke(comment) {
        var _a;
        var lines = comment.split('\n');
        if (lines[0].includes('@')) {
            // invoked
            var pos = lines[0].search('@') + 1;
            var extName = lines[0].slice(pos);
            (_a = this.extensions.get(extName)) === null || _a === void 0 ? void 0 : _a.invoke(comment);
        }
    }
    end() {
        for (var elem of this.extensions) {
            elem[1].onEnd();
        }
    }
}
exports.ParserExtensionManager = ParserExtensionManager;
