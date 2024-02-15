import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const wsPort = process.env.WS_PORT || 3001;

export const wss = new WebSocket.Server({ port: +wsPort });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log(`Received message => ${message}`);
    });

    ws.send('Connected to the server');
});


export function websocketSend(message: any, type = 'message') {
    wss.clients.forEach((client) => {
        const data = JSON.stringify({ data: message, type });
        client.send(data);
    });
}