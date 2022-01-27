export abstract class ParserExtension {
    constructor(public identifier: string) {}

    public abstract onStart(): void
    public abstract onEnd(): void
    public abstract invoke(comment: string): void
}

export class ParserExtensionManager {
    private extensions: Map<string, ParserExtension> = new Map<string, ParserExtension>([])

    constructor(public module: string) {}

    public register(extension: ParserExtension) {
        this.extensions.set(extension.identifier, extension)
        this.extensions.get(extension.identifier)?.onStart()
    }

    public invoke(comment: string) {
        var lines: string[] = comment.split('\n')
        if(lines[0].includes('@')) {
            // invoked
            var pos = lines[0].search('@') + 1
            var extName = lines[0].slice(pos)
            this.extensions.get(extName)?.invoke(comment)
        }
    }

    public end() {
        for(var elem of this.extensions) {
            elem[1].onEnd()
        }
    }
}