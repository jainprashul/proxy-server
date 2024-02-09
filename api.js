import { Router } from "express"
import { exec, spawn } from 'child_process'
import cron from "node-cron"

const apiRouter = Router()

let initPort = 4173

let scriptProcess;

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

apiRouter.post('/start-proxy', (req, res) => {
  const payload = req.body
  const url = payload.url
  console.log("Proxy URL : ", url)

  scriptProcess = exec(`/home/X/ui-server/run_preview.sh ${url}`, (error, stdout, stderr) => {
    scriptProcess = null
    if (error) {
      console.error(`Error executing script: ${error}`)
      return res.status(500).send('Internal Server Error')
    }
    console.log(`Script output: ${stdout}`)
    return res.send({ output: stdout })
  })

  res.send({
    processID: scriptProcess.pid,
    proxy_url: scriptProcess.spawnargs[2].split(' ')[1],
    url: `http://ui-tester.h9.pentagonlab.com:${initPort}`
  })
})

apiRouter.get('/stop-proxy', (req, res) => {
  // Check if the script is running
  if (!scriptProcess) {
    return res.status(400).send('Script is not running')
  }

  // Terminate the script process
  scriptProcess.kill()
  exec('pkill -f orch-ui', (error , stdout, stderr) => {
    if(error) {
      console.error(`Error stopping script: ${error}`)
      return res.status(500).send('Internal Server Error')
    }
    console.log(`Script Stopped.`)
  })
  

  return res.status(201).send('Script stopped');
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
apiRouter.get('/process', (req, res) => {
  res.send([
    {
      processID: scriptProcess?.pid,
      proxy_url: scriptProcess?.spawnargs[2].split(' ')[1],
      url: scriptProcess?.pid ?  `http://ui-tester.h9.pentagonlab.com:${initPort}` : null
    }
  ])
})

cron.schedule("0 12,17,20 * * *", (x) => {
    console.log('Scheduled Compile at', x , Date())
    exec('/home/X/ui-server/compile.sh >> /home/X/ui-server/compile.log 2>&1')
}, {
  timezone : "Asia/Kolkata"
});



export default apiRouter