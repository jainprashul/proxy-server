import { ChildProcess, exec, spawn } from "child_process"
import { Response, Request } from "express"
import logger from "../services/logger"
import { killChildProcessRecursive } from "../scripts/kill"




async function compile(res: Response) {
    const process = spawn('sh', ['/home/X/ui-server/compile.sh'])
    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`)
    })
    process.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`)
        if (data.includes('Compilation done')) {
            res.send('Compilation done')
        }
    })
}

const proxyScript = '/home/X/ui-server/src/scripts/run_preview.sh'
let proxyProcess: ChildProcess

async function startProxy(url: string) {
    // regex to check if the url is valid 
    let regex = new RegExp('^(http|https)://', 'i')
    try {
        logger.log(`Proxy URL : ${url}`)

        if (!regex.test(url)) throw new Error('Invalid URL')

        proxyProcess = spawn('sh', [proxyScript, url])

        proxyProcess.stdout?.on('data', (data) => {
            logger.log(data)
        })
        proxyProcess.stderr?.on('data', (data) => {
            logger.error(data);
        })

        return ({
            processID: proxyProcess.pid,
            proxy_url: proxyProcess.spawnargs?.[2]?.split(' ')?.[1],
            url: `http://ui-tester.h9.pentagonlab.com:4173`
        })
    } catch (error) {
        logger.error(`Error executing script: ${error}`)
        throw new Error('Internal Server Error')
    }
}

async function stopProxy(res: Response) {
    // Check if the script is running
    if (!proxyProcess) {
        return res.status(400).send('Script is not running')
    }
    killChildProcessRecursive(proxyProcess?.pid?.toString()!)
    res.status(200).send('Script Stopped.')
}

async function getCurrentProcess() {
    let ip = '192.168.200.112'
    return [
        {
            processID: proxyProcess?.pid,
            proxy_url: proxyProcess?.spawnargs[2],
            // url: proxyProcess?.pid ? `http://ui-tester.h9.pentagonlab.com:4173` : null
            url: proxyProcess?.pid ? `http://${ip}:4173` : null
        }
    ]
}

export {
    compile,
    startProxy,
    stopProxy,
    getCurrentProcess
}