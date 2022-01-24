import { ParserBytecode } from "../bytecodes/parser";

export class Optimizer {
    constructor(public bytecode: ParserBytecode) {}

    public optimize(): ParserBytecode {
        return this.bytecode
    }

}