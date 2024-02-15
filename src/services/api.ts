import { Router } from "express"
import { compile, getCurrentProcess, getLogFiles, getProcesses, startProxy, stopProxy } from "../helpers/helpers"

const apiRouter = Router()

apiRouter.get('/start-compile', async (req, res) => {
  try {
    await compile();
    res.status(201).send('Compiling')
  } catch (error) {
    console.error(`Error executing script: ${error}`)
    return res.status(500).send('Internal Server Error')
  }
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

apiRouter.get('/process', async (req, res) => {
  const process = await getCurrentProcess();
  return res.send(process)
})

apiRouter.get('/processes', (req, res) => {
  getProcesses(res)
})

apiRouter.get('/logs', (req, res) => {
    getLogFiles(res)
})


export default apiRouter