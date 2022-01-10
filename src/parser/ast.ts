const parser = require('../../parser/parser.js')
import fs from 'fs'

export class AST {
    public tree = []

    constructor(public input: string) {
        var data = fs.readFileSync(input, 'utf-8')
        this.tree = parser.parse(data)
    }
}