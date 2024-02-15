import { spawn } from "child_process"


async function compile(){
    const process = spawn('sh', ['/home/X/ui-server/compile.sh'])
    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`)
    })
    process.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`)
        if(data.includes('Compilation done')) {
        res.send('Compilation done')
        }
    })
}