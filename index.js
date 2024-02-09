import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import apiRouter from './api.js'
const app = express()
const port = 80

app.use(bodyParser.json())
app.use(cors())
app.use('/api', apiRouter)
app.use(express.static('./ui/build'))

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile('./ui/build', 'index.html')
})

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})