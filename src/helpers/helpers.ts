import { ChildProcess, exec, spawn } from "child_process"
import { Response, Request } from "express"
import logger from "../services/logger"
import { killChildProcessRecursive } from "../scripts/kill"
import { readFile, readSync } from "fs"
import { getLocalIp } from "./ip"
import { NodeProcess } from "./type"

const proxyScript = '/home/X/ui-server/src/scripts/run_preview.sh'

let processes : Record<string, NodeProcess> = {}

async function startProxy(url: string) {
    let ip = getLocalIp();
    let currentProcess : NodeProcess = {
        process: null,
        proxy_url: null,
        url: null,
        processID: '',
        compiling: Boolean(compileProcess),
    }
    // regex to check if the url is valid 
    let regex = new RegExp('^(http|https)://', 'i')
    try {
        logger.log(`Proxy URL : ${url}`)

        if (!regex.test(url)) throw new Error('Invalid URL')

        currentProcess.process = spawn('sh', [proxyScript, url])

        currentProcess.process.stdout?.on('data', (data) => {
            logger.log(data)

            // check in the logs if the proxy server logs url and port
            if (data.includes('➜  Network: http://')) {
                currentProcess.url = data.toString().split('➜  Network: ')[1].trim()
            }
        })
        currentProcess.process.stderr?.on('data', (data) => {
            logger.error(data);
        })

        // update the proxied url
        currentProcess.proxy_url = url
        currentProcess.processID = currentProcess.process?.pid?.toString()!


        // update the global process
        const pid = currentProcess.process?.pid?.toString();
        if (!pid) {
            throw new Error('Failed to start proxy process');
        }
        processes[pid] = currentProcess;

        logger.log('Proxy Started.')

        return currentProcess;
        
    } catch (error) {
        logger.error(`Error executing script: ${error}`)
        throw new Error('Internal Server Error')
    }
}

async function stopProxy(req: Request, res: Response) {
    try {
        const pid = req.query.pid as string
        if (!pid) {
            return res.status(400).send('Invalid Process ID')
        }
        // get the process id of the proxy server
        // Check if the script is running
        if (processes[pid].process === null) {
            return res.status(400).send('Script is not running')
        }
        await killChildProcessRecursive(pid);
        logger.log(`Proxy Stopped with PID: ${pid} & Proxy URL: ${processes[pid].proxy_url}`)
        delete processes[pid];
        res.status(200).send('Script Stopped.')
    } catch (error) {
        logger.error(`Error executing script: ${error}`)
        return res.status(500).send('Internal Server Error')
    }
}


async function getCurrentProcess() {
    let ip = getLocalIp();

    return Object.values(processes).map((process) => {
        return {
            processID: process.processID,
            proxy_url: process.proxy_url,
            url: process.url,
            compiling: Boolean(compileProcess),
        }
    });
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

let terminalProcess: ChildProcess | null;

async function runCommand(command: string) {
    try {
        terminalProcess = exec(command)
        terminalProcess?.stdout?.on('data', (data) => {
            logger.log(`${data}`)
        })
        terminalProcess?.stderr?.on('data', (data) => {
            logger.error(`${data}`)
        })
        terminalProcess?.on('close', (code) => {
            logger.log(`Command done with code ${code}`)
            terminalProcess = null;
            return code
        })
    } catch (error) {
        logger.error(`Error executing command: ${error}`)
        throw new Error('Error executing command');
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
    switchBranch,
    runCommand
}