"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testParserExt = void 0;
const parserExtension_1 = require("../parser/parserExtension");
function testParserExt() {
    var comment = '/*, ,,@,,a,,u,,t,,o,,d,,o,,c,,\n' +
        ',, ,, ,, ,, ,,@,,d,,e,,s,,c,,r,,i,,p,,t,,i,,o,,n,, ,,S,,p,,l,,i,,t,,s,, ,,a,, ,,s,,t,,r,,i,,n,,g,, ,,i,,n,,t,,o,, ,,i,,t,,s,, ,,c,,h,,a,,r,,a,,c,,t,,e,,r,,s,,\n' +
        ',, ,, ,, ,, ,,@,,a,,r,,g,, ,,s,, ,,A,,n,,y,, ,,s,,t,,r,,i,,n,,g,,\n' +
        ',, ,, ,, ,, ,,@,,r,,e,,t,,u,,r,,n,,s,, ,,l,,i,,s,,t,,\n' +
        '*/';
    comment = comment.split(',').join('');
    var manager = new parserExtension_1.ParserExtensionManager('');
    manager.register(new autodoctest());
    manager.invoke(comment);
}
exports.testParserExt = testParserExt;
class autodoctest extends parserExtension_1.ParserExtension {
    constructor() {
        super('autodoc');
    }
    onStart() {
    }
    onEnd() {
    }
    invoke(comment) {
        console.log(comment);
    }
}
