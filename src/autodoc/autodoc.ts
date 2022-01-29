import { ParserExtension } from "../parser/parserExtension"
const parser = require('../../parser/autodoc.js')
import * as path from 'path'
import * as fs from 'fs'
import { consumers } from "stream"

export class Autodoc extends ParserExtension {
    private functions: AutodocFunction[] = []
    private config = {
        path: './',
        active: false,
        combine: false,
        out: {
            format: 'json',
            name: 'autodoc.json'
        }
    }

    constructor() {
        super('autodoc')
    }

    public onStart(): void {
        // check for autodoc config
        if(checkFileExistsSync('autodoc.json')) {
            this.config = JSON.parse(fs.readFileSync('autodoc.json', {encoding: 'utf-8'}))
        }
    }

    public onEnd(): void {
        // open temp.json
        // get content
        // append new content
        // override out file, parsed
        if(this.functions.length == 0) {
            return
        }
        if(this.config.active == false) {
            return
        }
        //var file: any = JSON.parse(fs.readFileSync(this.config.path + this.config.out.name, {encoding: 'utf-8'}))
        //var newFile = {...file, ...this.functions}
        //fs.writeFileSync(this.config.path + this.config.out.name, JSON.stringify(newFile, null, 4))

        fs.writeFileSync(this.config.path + this.makeid(4).toString() + this.config.out.name, JSON.stringify({docs: this.functions}, null, 4))
    }

    public invoke(comment: string): void {
        comment = comment.slice(2, -2)
        var fields = parser.parse(comment)

        var temp: AutodocFunction = {
            name: '',
            args: [],
            description: [],
            returns: [],
            module: ''
        }

        for(var elem of fields) {
            // go over fields, process
            switch(elem.name) {
                case 'name':
                    temp.name = elem.joined
                    break
                case 'arg':
                    temp.args.push(
                        [elem.values[0], elem.values.slice(1).join(" ")]
                    )
                    break
                case 'description':
                    temp.description.push(elem.joined)
                    break
                case 'returns':
                    temp.returns.push(elem.values)
                    break
                case 'module':
                    temp.module = elem.joined
                    break
            }
        }

        this.functions.push(temp)
    }

      makeid(length: number) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * 
     charactersLength));
       }
       return result;
    }
    

}

export function checkFileExistsSync(filepath: string){
    let flag = true;
    try{
      fs.accessSync(filepath, fs.constants.F_OK);
    }catch(e){
      flag = false;
    }
    return flag;
  }

export interface AutodocFunction {
    name: string,
    args: string[][],
    description: string[],
    returns: string[],
    module: string
}