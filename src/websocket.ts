import WebSocket from 'ws';

const wsPort = process.env.WS_PORT || 3001;

export const wss = new WebSocket.Server({ port: +wsPort });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log(`Received message => ${message}`);
    });

    ws.send('Hello! Message From Server!!');
});

wss.on('listening', () => {
    console.log(`Websocket server is running on port ${wsPort}`);
});


export function websocketSend(message: any) {
    wss.clients.forEach((client) => {
        const data = JSON.stringify({ message });
        client.send(data);
    });
}