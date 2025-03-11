const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 5000 });

// Liste pour garder une trace de toutes les connexions
let clients = [];

server.on('connection', (ws) => {
  console.log('Client connecté');

  // Ajouter le client à la liste
  clients.push(ws);

  // Gestion des messages reçus d'un client
  ws.on('message', (message) => {
    console.log(`Données reçues: ${message}`);
    
    // Envoyer le message reçu à tous les clients connectés
    clients.forEach(client => {
      // Eviter d'envoyer à soi-même (celui qui a envoyé le message)
      if (client !== ws) {
        client.send(`${message}`);
      }
    });
    
    // Envoyer une confirmation au client qui a envoyé le message
    ws.send(`Message reçu: ${message}`);
  });

  // Supprimer le client de la liste quand il se déconnecte
  ws.on('close', () => {
    console.log('Client déconnecté');
    clients = clients.filter(client => client !== ws);  // Retirer le client de la liste
  });
});
