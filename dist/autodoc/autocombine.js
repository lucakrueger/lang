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
exports.AutodocCombine = exports.AutodocFormat = void 0;
const fs = __importStar(require("fs"));
const groupBy = require('group-by');
function AutodocFormat() {
    if (!checkFileExistsSync('autodoc.json')) {
        return;
    }
    var config = JSON.parse(fs.readFileSync('autodoc.json', { encoding: 'utf-8' }));
    if (config.combine == false || config.active == false) {
        return;
    }
    // go over json file
    // format
    var temp = JSON.parse(fs.readFileSync(config.path + config.out.name, { encoding: 'utf-8' }));
    switch (config.out.format) {
        case 'wiki':
            var groups = groupBy(temp.docs, 'module');
            var lines = [];
            // go over groups
            // go over each function
            // add to string
            Object.entries(groups).forEach(([key, value]) => {
                var entry = groups[key];
                lines.push(...[
                    ``,
                    `## ${key}`,
                    ``
                ]);
                for (var fun of entry) {
                    lines.push(...[
                        '',
                        `### ${fun.name}`,
                        ``,
                        '> ```',
                    ]);
                    var returns = '';
                    for (var r of fun.returns[0]) {
                        returns += r + ' | ';
                    }
                    returns = returns.slice(0, -3);
                    if (fun.args.length == 0) {
                        lines.push(`> ${fun.name} => ${returns}`);
                    }
                    else {
                        var paramStr = '';
                        for (var paramx of fun.args) {
                            paramStr += " " + paramx[0];
                        }
                        lines.push(`> ${fun.name} ->${paramStr} => ${returns}`);
                    }
                    lines.push('> ```');
                    lines.push('>');
                    for (var des of fun.description) {
                        lines.push(`> ${des}`);
                    }
                    lines.push('>');
                    for (var paramVal of fun.args) {
                        lines.push(`>- \`${paramVal[0]}\` ${paramVal[1]}`);
                    }
                    lines.push('>');
                    lines.push(`> **Returns** \`${returns}\``);
                }
            });
            fs.writeFileSync(config.path + config.out.name, lines.join("\n"));
            break;
    }
}
exports.AutodocFormat = AutodocFormat;
function AutodocCombine() {
    if (!checkFileExistsSync('autodoc.json')) {
        return;
    }
    var config = JSON.parse(fs.readFileSync('autodoc.json', { encoding: 'utf-8' }));
    if (config.combine == false || config.active == false) {
        return;
    }
    var combined = { docs: [] };
    // go over all files in out (whre name is not equals to out name)
    for (var elem of fs.readdirSync(config.path)) {
        if (elem == config.out.name) {
            // out name -> ignore
            continue;
        }
        combined.docs.push(...JSON.parse(fs.readFileSync(config.path + elem, { encoding: 'utf-8' })).docs);
        fs.unlinkSync(config.path + elem);
    }
    fs.writeFileSync(config.path + config.out.name, JSON.stringify(combined, null, 4));
}
exports.AutodocCombine = AutodocCombine;
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
