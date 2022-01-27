import * as fs from 'fs'
import { Autodoc, AutodocFunction } from './autodoc'
const groupBy = require('group-by')

export function AutodocFormat() {
    if(!checkFileExistsSync('autodoc.json')) {
        return
    }
    var config = JSON.parse(fs.readFileSync('autodoc.json', {encoding: 'utf-8'}))
    if(config.combine == false || config.active == false) {
        return
    }

    // go over json file
    // format
    var temp: {docs: AutodocFunction[]} = JSON.parse(fs.readFileSync(config.path + config.out.name, {encoding: 'utf-8'}))
    switch(config.out.format) {
        case 'wiki':
            var groups = groupBy(temp.docs, 'module')
            var lines: string[] = []
            // go over groups
            // go over each function
            // add to string
            Object.entries(groups).forEach(([key, value]) => {
                var entry: AutodocFunction[] = groups[key]
                lines.push(...[
                    ``,
                    `## ${key}`,
                    ``
                ])
                for(var fun of entry) {
                    lines.push(...[
                        '',
                        `### ${fun.name}`,
                        ``,
                        '> ```',
                    ])

                    var returns = ''
                    for(var r of fun.returns[0]) {
                        returns += r + ' | '
                    }
                    returns = returns.slice(0, -3)

                    if(fun.args.length == 0) {
                        lines.push(`> ${fun.name} => ${returns}`)
                    } else {
                        var paramStr = ''
                        for(var paramx of fun.args) {
                            paramStr += " " + paramx[0]
                        }
                        lines.push(`> ${fun.name} ->${paramStr} => ${returns}`)
                    }

                    lines.push('> ```')
                    lines.push('>')

                    for(var des of fun.description) {
                        lines.push(`> ${des}`)
                    }

                    lines.push('>')

                    for(var paramVal of fun.args) {
                        lines.push(`>- \`${paramVal[0]}\` ${paramVal[1]}`)
                    }

                    lines.push('>')

                    lines.push(`> **Returns** \`${returns}\``)
                }
            })
            fs.writeFileSync(config.path + config.out.name, lines.join("\n"))
            break
    }
}

export function AutodocCombine() {
    if(!checkFileExistsSync('autodoc.json')) {
        return
    }
    var config = JSON.parse(fs.readFileSync('autodoc.json', {encoding: 'utf-8'}))
    if(config.combine == false || config.active == false) {
        return
    }

    var combined: any = {docs: []}

    // go over all files in out (whre name is not equals to out name)
    for(var elem of fs.readdirSync(config.path)) {
        if(elem == config.out.name) {
            // out name -> ignore
            continue
        }

        combined.docs.push(...JSON.parse(fs.readFileSync(config.path + elem, {encoding: 'utf-8'})).docs)
        fs.unlinkSync(config.path + elem)
        
    }

    fs.writeFileSync(config.path + config.out.name, JSON.stringify(combined, null, 4))
}

function checkFileExistsSync(filepath: string){
    let flag = true;
    try{
      fs.accessSync(filepath, fs.constants.F_OK);
    }catch(e){
      flag = false;
    }
    return flag;
  }