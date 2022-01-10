/*
    This file describes all the special datatypes you can use in the language
    All default datatypes such as string, number, char, etc are supported to make js/ts interfacing easier
*/

export abstract class VMDatatype {
    constructor() {}
    abstract toString(): string // string respresentation of datatype
    abstract getValue(): any // returns raw value
    // TODO: maybe implement custom operator overloading, no need for it at the moment though
}

/*
    Erlang/Elixir inspired datatype of the atom, stores a raw name/symbol
*/
export class Atom extends VMDatatype {
    private value: string = ''

    constructor(value: any) {
        super()
        this.value = String(value)
    }

    getValue() {
        return this.value
    }

    toString(): string {
        return this.value
    }
}