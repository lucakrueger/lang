import { ParserExtension, ParserExtensionManager } from "../parser/parserExtension"

export function testParserExt() {
    var comment = '/*, ,,@,,a,,u,,t,,o,,d,,o,,c,,\n' +
    ',, ,, ,, ,, ,,@,,d,,e,,s,,c,,r,,i,,p,,t,,i,,o,,n,, ,,S,,p,,l,,i,,t,,s,, ,,a,, ,,s,,t,,r,,i,,n,,g,, ,,i,,n,,t,,o,, ,,i,,t,,s,, ,,c,,h,,a,,r,,a,,c,,t,,e,,r,,s,,\n' +
    ',, ,, ,, ,, ,,@,,a,,r,,g,, ,,s,, ,,A,,n,,y,, ,,s,,t,,r,,i,,n,,g,,\n' +
    ',, ,, ,, ,, ,,@,,r,,e,,t,,u,,r,,n,,s,, ,,l,,i,,s,,t,,\n' +
    '*/'

    comment = comment.split(',').join('')

    var manager = new ParserExtensionManager('')
    manager.register(new autodoctest())

    manager.invoke(comment)
}

class autodoctest extends ParserExtension {
    constructor() {
        super('autodoc')
    }

    public onStart(): void {
        
    }

    public onEnd(): void {
        
    }

    public invoke(comment: string): void {
        console.log(comment)
    }
}
