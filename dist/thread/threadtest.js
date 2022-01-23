"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreadManager = void 0;
const structs_1 = require("../vm/structs");
const threadpool = require('threadpool-js/dist/threadpool.js');
class ThreadManager {
    constructor() { }
    start(f, values, threads) {
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
        var results = [];
        var pool = new threadpool.ThreadPool();
        for (var chunk of chunks) {
            pool.run(this.processChunk, [f, chunk]).done((result) => {
                results.push(...result);
            });
        }
        pool.allDone(() => {
            return results;
        });
        return results;
    }
    process(param, done) {
        done(this.processChunk(param[0], param[1]));
    }
    processChunk(f, chunk) {
        var results = [];
        for (var elem of chunk) {
            results.push(f(elem));
        }
        return results;
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
