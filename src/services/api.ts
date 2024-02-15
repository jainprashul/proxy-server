import { Router } from "express"
import { exec, spawn } from 'child_process'
import cron from "node-cron"
import { getCurrentProcess, startProxy, stopProxy } from "../helpers/helpers"
import { get } from "http"

const apiRouter = Router()

let initPort = 4173

let scriptProcess : any;


apiRouter.get('/start-compile' , (req , res)=>{
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

})

apiRouter.post('/start-proxy', async (req, res) => {
  const payload = req.body
  const url = payload.url
  try {
    if (!url) {
      return res.status(400).send('Invalid URL')
    }
    const data = await startProxy(url)
    return res.send(data)

  } catch (error) {
    console.error(`Error executing script: ${error}`)
    return res.status(500).send('Internal Server Error')
  }
})

apiRouter.get('/stop-proxy', async (req, res) => {
    return await stopProxy(res)
})

apiRouter.get('/processes', (req, res) => {
  exec('ps ux', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error retrieving processes: ${error}`)
      return res.status(500).send('Internal Server Error')
    }

    const processes = stdout.split('\n').slice(1).map(line => {
      const [user, pid, cpu, mem, vsz, rss, tty, stat, start, time, command] = line.split(/\s+/)
      return { user, pid, cpu, mem, vsz, rss, tty, stat, start, time, command }
    })
    return res.send({ processes })
  })
})
apiRouter.get('/process', async (req, res) => {

  const process = await getCurrentProcess();
  return res.send(process)
})

cron.schedule("0 */1 * * *", (x) => {
    console.log('Scheduled Compile at', x , Date())
    exec('/home/X/ui-server/src/scripts/compile.sh >> /home/X/logs/compile.log 2>&1')
}, {
  timezone : "Asia/Kolkata"
});



export default apiRouter