import dotenv from 'dotenv';
import express from 'express';
import apiRouter from './services/api';
import cors from 'cors';
import { wss } from './websocket';
dotenv.config();

const uiPath = '/home/X/ui-server/ui/build';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/api' , apiRouter);
app.use(express.static(uiPath));

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(uiPath + '/index.html');
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 

wss.on('listening', () => {
  console.log(`Websocket server is running on port ${wss.options.port}`);
});




