import { VMError, ThrowError, NativeErrors } from "../logger/logger";

export function CheckParameterCount(functionName: string, paramCount: number, requiredCount: number): (VMError | undefined) {
    if(paramCount > requiredCount) { // check for too many args
        return ThrowError(NativeErrors.RANGE, `Too many arguments provided. ${functionName} requires only one parameter`)
    } else if(paramCount < requiredCount) { // check for not enough args
        return ThrowError(NativeErrors.RANGE, `Not enough arguments provided. ${functionName} requires only one parameter`)
    }
    return undefined // no error
}