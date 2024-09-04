import { ChildProcess, exec, spawn } from "child_process"
import { Response, Request } from "express"
import logger from "../services/logger"
import { killChildProcessRecursive } from "../scripts/kill"
import { readFile, readSync } from "fs"
import { getLocalIp } from "./ip"

const proxyScript = '/home/X/ui-server/src/scripts/run_preview.sh'
let proxyProcess: ChildProcess | null;

async function startProxy(url: string) {
    let ip = getLocalIp();
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
            url: `http://${ip}:4173`
        })
    } catch (error) {
        logger.error(`Error executing script: ${error}`)
        throw new Error('Internal Server Error')
    }
}

async function stopProxy(res: Response) {
    try {
        // Check if the script is running
        if (!proxyProcess) {
            return res.status(400).send('Script is not running')
        }
        await killChildProcessRecursive(proxyProcess?.pid?.toString()!)
        proxyProcess = null;
        logger.log('Proxy Stopped.')
        res.status(200).send('Script Stopped.')
    } catch (error) {
        logger.error(`Error executing script: ${error}`)
        return res.status(500).send('Internal Server Error')
    }
}


async function getCurrentProcess() {
    let ip = getLocalIp();
    return [
        {
            processID: proxyProcess?.pid,
            proxy_url: proxyProcess?.spawnargs[2],
            // url: proxyProcess?.pid ? `http://ui-tester.h9.pentagonlab.com:4173` : null
            url: proxyProcess?.pid ? `http://${ip}:4173` : null,
            compiling: Boolean(compileProcess),
        }
    ]
}

const compileScript = '/home/X/ui-server/src/scripts/compile.sh'
let compileProcess: ChildProcess | null;

export const isCompiling = () => Boolean(compileProcess);

async function compile(force = false) {
    const args = force ? [compileScript, '-f'] : [compileScript]
    try {
        compileProcess = spawn('sh', args)
        compileProcess?.stdout?.on('data', (data) => {
            logger.log(`${data}`)
        })
        compileProcess?.stderr?.on('data', (data) => {
            logger.error(`${data}`)
        })
        compileProcess?.on('close', (code) => {
            logger.log(`Compilation done with code ${code}`)
            compileProcess = null;

            return code
        })
    } catch (error) {
        logger.error(`Error executing script: ${error}`)
        throw new Error('Error executing script');
    }
}

let switchScript = '/home/X/ui-server/src/scripts/switch_branch.sh'
let switchProcess: ChildProcess | null;

async function switchBranch(branch: string) {
    const args = [switchScript, branch]
    try {
        switchProcess = spawn('sh', args)
        switchProcess?.stdout?.on('data', (data) => {
            logger.log(`${data}`)
        })
        switchProcess?.stderr?.on('data', (data) => {
            logger.error(`${data}`)
        })
        switchProcess?.on('close', (code) => {
            logger.log(`Switch branch done with code ${code}`)
            switchProcess = null;
            return code
        })
    } catch (error) {
        logger.error(`Error executing script: ${error}`)
        throw new Error('Error executing script');
    }
}

async function getProcesses(res : Response) {
    const processes = exec('ps ux', (error, stdout, stderr) => {
        if (error) {
            logger.error(`Error retrieving processes: ${error}`)
            return res.status(500).send('Internal Server Error')
        }

        if(stderr) {
            logger.error(`Error retrieving processes: ${stderr}`)
            return res.status(500).send('Internal Server Error')
        }

        const processes = stdout.split('\n').slice(1).map(line => {
            const [user, pid, cpu, mem, vsz, rss, tty, stat, start, time, command] = line.split(/\s+/)
            return { user, pid, cpu, mem, vsz, rss, tty, stat, start, time, command }
        })
        return res.send({ processes })
    })
}

async function getLogFiles(res: Response) {
    // read the log file and send file as text r
    readFile('server.log', 'utf8', (err, data) => {
        if (err) {
            logger.error(`Error reading log file: ${err}`)
            return res.status(500).send('Internal Server Error')
        }
        return res.write(data)
    })
}

export {
    compile,
    startProxy,
    stopProxy,
    getCurrentProcess,
    getProcesses,
    getLogFiles,
    switchBranch
}