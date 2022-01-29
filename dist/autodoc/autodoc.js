"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFileExistsSync = exports.Autodoc = void 0;
const parserExtension_1 = require("../parser/parserExtension");
const parser = require('../../parser/autodoc.js');
const fs = __importStar(require("fs"));
class Autodoc extends parserExtension_1.ParserExtension {
    constructor() {
        super('autodoc');
        this.functions = [];
        this.config = {
            path: './',
            active: false,
            combine: false,
            out: {
                format: 'json',
                name: 'autodoc.json'
            }
        };
    }
    onStart() {
        // check for autodoc config
        if (checkFileExistsSync('autodoc.json')) {
            this.config = JSON.parse(fs.readFileSync('autodoc.json', { encoding: 'utf-8' }));
        }
    }
    onEnd() {
        // open temp.json
        // get content
        // append new content
        // override out file, parsed
        if (this.functions.length == 0) {
            return;
        }
        if (this.config.active == false) {
            return;
        }
        //var file: any = JSON.parse(fs.readFileSync(this.config.path + this.config.out.name, {encoding: 'utf-8'}))
        //var newFile = {...file, ...this.functions}
        //fs.writeFileSync(this.config.path + this.config.out.name, JSON.stringify(newFile, null, 4))
        fs.writeFileSync(this.config.path + this.makeid(4).toString() + this.config.out.name, JSON.stringify({ docs: this.functions }, null, 4));
    }
    invoke(comment) {
        comment = comment.slice(2, -2);
        var fields = parser.parse(comment);
        var temp = {
            name: '',
            args: [],
            description: [],
            returns: [],
            module: ''
        };
        for (var elem of fields) {
            // go over fields, process
            switch (elem.name) {
                case 'name':
                    temp.name = elem.joined;
                    break;
                case 'arg':
                    temp.args.push([elem.values[0], elem.values.slice(1).join(" ")]);
                    break;
                case 'description':
                    temp.description.push(elem.joined);
                    break;
                case 'returns':
                    temp.returns.push(elem.values);
                    break;
                case 'module':
                    temp.module = elem.joined;
                    break;
            }
        }
        this.functions.push(temp);
    }
    makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }
}
exports.Autodoc = Autodoc;
function checkFileExistsSync(filepath) {
    let flag = true;
    try {
        fs.accessSync(filepath, fs.constants.F_OK);
    }
    catch (e) {
        flag = false;
    }
    return flag;
}
exports.checkFileExistsSync = checkFileExistsSync;
