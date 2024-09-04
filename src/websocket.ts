import { createServer } from 'http';
import WebSocket from 'ws';

export const server = createServer();



export const wss = new WebSocket.Server({
    server: server,
});

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
