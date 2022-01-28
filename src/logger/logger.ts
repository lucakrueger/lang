export enum NativeErrors {
    REFERENCE = 'Reference',    // reference missing
    INTERNAL = 'Internal',
    RANGE = 'Range'
}

export function ThrowError(area: string, message: string): VMError {
    console.log(`${area} error. ${message}.`)
    process.exit(1)
    return new VMError(area, message)
}

export function ThrowDebugError(area: string, message: string, stack: any[], process: string) {
    var err = new DebugError(area, message, stack, process)
    err.throwDebug()
}

export class VMError {
    constructor(public area: string, public message: string) {}

    public throw() {
        console.log(`${this.area} error. ${this.message}.`)
    }
}

/*
    Debug Error
    Is essentially the same as a regular error, but keeps various debug informations and program state
*/
export class DebugError extends VMError {
    constructor(area: string, message: string, public stack: any[], public process: string) {
        super(area, message)
    }
    
    public throwDebug() {
        this.throw()
        console.log(this.process)
        console.log(this.stack)
    }
}