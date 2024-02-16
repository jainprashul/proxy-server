import { exec, spawn } from "child_process"

export async function killChildProcessRecursive(pid : string) {
    let pids : string[] = []
    try {
      const children = spawn('pgrep', ['-P', pid])
      children.stdout.on('data', (data) => {
        const childPids = data.toString().split('\n').filter(Boolean)
        pids = pids.concat(childPids)
        childPids.forEach((childPid : any) => killChildProcessRecursive(childPid))
      })
      children.on('close', () => {
        console.log(`Killing child process: ${pid}`)
        exec(`kill -9 ${pid}`)
      })
    } catch (error) {
      console.error(`Error killing child process: ${error}`)
    }
  }


// // get pid from args 
// const pid = process.argv[2]
// console.log(`Killing process: ${pid}`)
// killChildProcessRecursive(pid)

