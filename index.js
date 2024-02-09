import express from 'express'
import * as path from 'path'
import bodyParser from 'body-parser'
import cors from 'cors'
import apiRouter from './api.js'
const app = express()
const port = 80

const uiPath = '/home/X/ui-server/ui/build'


app.use(bodyParser.json())
app.use(cors())
app.use('/api', apiRouter)
app.use(express.static(uiPath))

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(uiPath, 'index.html')
})

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})