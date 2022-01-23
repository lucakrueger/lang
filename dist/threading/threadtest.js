"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreadManager = void 0;
const structs_1 = require("../vm/structs");
class ThreadManager {
    constructor() { }
    start(f, values, threads) {
        return __awaiter(this, void 0, void 0, function* () {
            if (threads == -1) {
                // dynamically choose threads
                if (values.length % 2 != 0) {
                    // odd number of values -> adding :thread_ignore
                    values.push(new structs_1.Atom('thread_ignore'));
                }
                // even number of values
                // chunk size ≈ 8
                // values.length / threads ≈ 8
                // threads ≈ values.length / 8
                threads = Math.ceil(values.length / 8);
                if (threads > values.length) {
                    threads = values.length;
                }
            }
            else if (threads > values.length) {
                threads = values.length;
            }
            //console.log(this.sliceIntoChunks(values, values.length/threads))
            // create chunks
            var chunks = this.sliceIntoChunks(values, values.length / threads);
            var promises = [];
            for (var chunk of chunks) {
                for (var elem of chunk) {
                    if (elem instanceof structs_1.Atom && elem.getValue() == 'thread_ignore')
                        continue;
                    promises.push(f(elem));
                }
            }
            var result = [];
            var res = Promise.all(promises);
            for (var elem of yield res) {
                result.push(elem);
            }
            return Promise.resolve(result);
        });
    }
    sliceIntoChunks(arr, chunkSize) {
        const res = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            const chunk = arr.slice(i, i + chunkSize);
            res.push(chunk);
        }
        return res;
    }
}
exports.ThreadManager = ThreadManager;
