const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware pour analyser les données JSON
app.use(express.json());

// Route de test pour vérifier le fonctionnement
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Lorsqu'un client se connecte via WebSocket
io.on("connection", (socket) => {
  console.log("New client connected");

  // Écouter les messages envoyés par le client
  socket.on("light-intensity", (data) => {
    console.log("Received light intensity data: ", data);

    // Traiter les données reçues
    const { lux, ampoule } = data;
    console.log(`Intensité lumineuse : ${lux} lux`);
    console.log(`Intensité de l'ampoule : ${ampoule}%`);

    // Envoyer une réponse au client (optionnel)
    socket.emit("response", { message: "Data received successfully!" });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Lancer le serveur sur un port
server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});