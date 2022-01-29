"use strict";
/*
    This file describes all the special datatypes you can use in the language
    All default datatypes such as string, number, char, etc are supported to make js/ts interfacing easier
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Atom = exports.VMDatatype = void 0;
class VMDatatype {
    constructor(ident) {
        this.ident = ident;
    }
    getIdent() {
        return this.ident;
    }
}
exports.VMDatatype = VMDatatype;
/*
    Erlang/Elixir inspired datatype of the atom, stores a raw name/symbol
*/
class Atom extends VMDatatype {
    constructor(value) {
        super('atom');
        this.value = '';
        this.value = String(value);
    }
    getValue() {
        return this.value;
    }
    toString() {
        return this.value;
    }
}
exports.Atom = Atom;
