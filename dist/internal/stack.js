"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stack = void 0;
const logger_1 = require("../logger/logger");
class Stack {
    constructor(max = 1024) {
        this.max = max;
        this.items = [];
    }
    push(item) {
        if (this.size() >= this.max) { // check if stack is full
            //ThrowDebugError(NativeErrors.INTERNAL, 'Stack is full', this.items, 'Stack')
            (0, logger_1.ThrowError)(logger_1.NativeErrors.INTERNAL, 'Stack is full'); // Throw error
            process.exit(1);
        }
        this.items.push(item); // push item
    }
    pop() {
        return this.items.pop();
    }
    clear() {
        this.items = [];
    }
    size() {
        return this.items.length;
    }
}
exports.Stack = Stack;
