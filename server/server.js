const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 5000 });

server.on('connection', (ws) => {
  ws.on('message', (message) => {
    ws.send(`Message reçu: ${message}`);
  });

  ws.on('close', () => {});
});
