import { VMError, ThrowError, NativeErrors } from "../logger/logger";
import { VMDatatype } from "./structs";

export function CheckParameterCount(functionName: string, paramCount: number, requiredCount: number): (VMError | undefined) {
    if(paramCount > requiredCount) { // check for too many args
        return ThrowError(NativeErrors.RANGE, `Too many arguments provided (${paramCount}). ${functionName} requires ${requiredCount} parameter(s)`)
    } else if(paramCount < requiredCount) { // check for not enough args
        return ThrowError(NativeErrors.RANGE, `Not enough arguments provided (${paramCount}). ${functionName} requires ${requiredCount} parameter(s)`)
    }
    return undefined // no error
}

export function makeid(length: number) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

export function printValue(a: any) {
    if(a instanceof VMDatatype) {
        console.log(':'+a.getValue())
    } else {
        console.log(a)
    }
}