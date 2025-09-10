// server.js
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;

// Serve static files uit de "public" map
app.use(express.static("public"));

// Houd de game state bij
let gameState = {
  players: {},
  ball: { x: 250, y: 250, vx: 3, vy: 3 },
};

// Als een speler verbinding maakt
io.on("connection", (socket) => {
  console.log("Nieuwe speler verbonden:", socket.id);

  // Voeg speler toe
  gameState.players[socket.id] = { y: 200, score: 0 };

  // Stuur de huidige state naar de nieuwe speler
  socket.emit("init", { id: socket.id, state: gameState });

  // Luister naar beweging van speler
  socket.on("move", (direction) => {
    const player = gameState.players[socket.id];
    if (!player) return;
    if (direction === "up") player.y -= 10;
    if (direction === "down") player.y += 10;
    if (player.y < 0) player.y = 0;
    if (player.y > 400) player.y = 400; // canvas height - paddle height
  });

  // Speler weg als disconnect
  socket.on("disconnect", () => {
    console.log("Speler verbroken:", socket.id);
    delete gameState.players[socket.id];
  });
});

// Simpele ball update
setInterval(() => {
  gameState.ball.x += gameState.ball.vx;
  gameState.ball.y += gameState.ball.vy;

  // Botsing met boven/onder
  if (gameState.ball.y < 0 || gameState.ball.y > 500) gameState.ball.vy *= -1;

  // Stuur gameState naar alle clients
  io.emit("update", gameState);
}, 50); // 20 updates per seconde

// Start de server
http.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
