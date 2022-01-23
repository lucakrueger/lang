import { threadId } from "worker_threads";
import { NativeErrors, ThrowError } from "../logger/logger";
import { Atom } from "../vm/structs";

export class ThreadManager {
    constructor() {}

    public async start(f: (arg: any) => any, values: any[], threads: number) {

        if(threads == -1) {
            // dynamically choose threads
            if(values.length % 2 != 0) {
                // odd number of values -> adding :thread_ignore
                values.push(new Atom('thread_ignore'))
            }

            // even number of values
            // chunk size ≈ 8
            // values.length / threads ≈ 8
            // threads ≈ values.length / 8
            threads = Math.ceil(values.length / 8)
            if(threads > values.length) {
                threads = values.length
            }
        } else if(threads > values.length) {
            threads = values.length
        }

        //console.log(this.sliceIntoChunks(values, values.length/threads))
        // create chunks
        var chunks = this.sliceIntoChunks(values, values.length/threads)

        this.executeThreads(f, chunks).then((value) => {
            console.log(value)
            return value
        })

        return null

    }

    private async executeThreads(f: (arg: any) => any, chunks: any[][]) {
        const resultPool: Promise<any>[] = []
        for(var chunk of chunks) {
            resultPool.push(this.processChunk(f, chunk))
        }

        try {
            const result = await Promise.all(resultPool)
            return Promise.resolve(result)
        } catch(err) {
            ThrowError(NativeErrors.INTERNAL, `Threading error. ${err}`)
        }
    }

    private async processChunk(f: (arg: any) => any, chunk: any[]): Promise<any> {
        var results: any[] = []
        for(var elem of chunk) {
            results.push(f(elem))
        }
        return Promise.resolve(results)
    }

    private sliceIntoChunks(arr: any[], chunkSize: number): any[][] {
        const res = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            const chunk = arr.slice(i, i + chunkSize);
            res.push(chunk);
        }
        return res;
    }
    
}