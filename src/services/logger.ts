// Code for Singleton Logger which will be used to log messages and errors in the application.
// Logger will send the logs to the console as well as to the file. 
// Logger will send logs to the ui via websocket.

import { websocketSend } from "../websocket";
import fs from 'fs';

class Logger {
  private static instance: Logger;
  private constructor() {
    // private constructor
  }
  public static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  public log(message: string) {
    const date = new Date(); 
    const timestamp = date.toISOString();

    const log = `${timestamp} - log - ${message} \n`;
    console.log(log);
    // send logs to the file
    fs.appendFile('logs.txt', log, (err) => {
      if (err) throw err;
    });

    // send logs to the ui via websocket
    websocketSend(log);
    
  }
  public error(message: string) {
    const date = new Date();
    const timestamp = date.toISOString();

    const log = `${timestamp} - error - ${message} \n`;

    console.error(log);

    // send logs to the file
    fs.appendFile('logs.txt', log, (err) => {
      if (err) throw err;
    });
    // send logs to the ui via websocket
    websocketSend(log);
  }
}

const logger = Logger.getInstance();
export default logger;
