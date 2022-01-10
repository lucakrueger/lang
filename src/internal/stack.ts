import { NativeErrors, ThrowDebugError, ThrowError, VMError } from "../logger/logger"

export class Stack {
    private items: any[] = []

    constructor(public max: number = 1024) {}

    public push(item: any): any | VMError {
        if(this.size() >= this.max) { // check if stack is full
            //ThrowDebugError(NativeErrors.INTERNAL, 'Stack is full', this.items, 'Stack')
            ThrowError(NativeErrors.INTERNAL, 'Stack is full') // Throw error
            process.exit(1)
        }

        this.items.push(item) // push item
    }

    public pop(): any | undefined {
        return this.items.pop()
    }

    public clear() {
        this.items = []
    }

    public size(): number {
        return this.items.length
    }
}