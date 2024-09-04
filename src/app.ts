import express from 'express';
import apiRouter from './services/api';
import cors from 'cors';

const uiPath = '/home/X/ui-server/ui/build';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/api' , apiRouter);
app.use(express.static(uiPath));


// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(uiPath + '/index.html');
})

export default app;