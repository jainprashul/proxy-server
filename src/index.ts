import dotenv from 'dotenv';
import { server, wss } from './websocket';
import './services/cron';
import logger from './services/logger';
import app from './app';
dotenv.config();

logger.log('Server started');

const port = process.env.PORT || 3000;

server.on('request', app);

server.listen(port, () => {
  logger.log(`Server is running on port ${port}`);
});

wss.on('listening', () => {
  logger.log(`Websocket server is running on port ${JSON.stringify(wss.address())}`);
});




