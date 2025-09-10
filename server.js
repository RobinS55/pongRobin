const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let gameState = {
  players: {}, // { socketId: { y, ready, score } }
  ball: { x: 250, y: 250, vx: 3, vy: 3, moving: false }
};

io.on("connection", (socket) => {
  console.log("Nieuwe speler verbonden:", socket.id);
  gameState.players[socket.id] = { y: 200, ready: false, score: 0 };
  socket.emit("init", { id: socket.id, state: gameState });

  socket.on("move", (dir) => {
    const player = gameState.players[socket.id];
    if (!player) return;
    if (dir === "up") player.y -= 10;
    if (dir === "down") player.y += 10;
    if (player.y < 0) player.y = 0;
    if (player.y > 400) player.y = 400;
  });

  socket.on("ready", () => {
    if (gameState.players[socket.id]) gameState.players[socket.id].ready = true;
    const playersArray = Object.values(gameState.players);
    if (playersArray.length === 2 && playersArray.every(p => p.ready)) {
      gameState.ball.moving = true;
    }
  });

  socket.on("disconnect", () => {
    delete gameState.players[socket.id];
    if (Object.keys(gameState.players).length < 2) gameState.ball.moving = false;
  });
});

function resetBall() {
  gameState.ball.x = 250;
  gameState.ball.y = 250;
  gameState.ball.vx = 3 * (Math.random() > 0.5 ? 1 : -1);
  gameState.ball.vy = 3 * (Math.random() > 0.5 ? 1 : -1);
  gameState.ball.moving = false;
  for (let id in gameState.players) gameState.players[id].ready = false;
}

setInterval(() => {
  if (!gameState.ball.moving) return;

  gameState.ball.x += gameState.ball.vx;
  gameState.ball.y += gameState.ball.vy;

  // Boven/onder botsing
  if (gameState.ball.y < 0 || gameState.ball.y > 490) gameState.ball.vy *= -1;

  // Paddle botsing
  const keys = Object.keys(gameState.players);
  keys.forEach((id, idx) => {
    const player = gameState.players[id];
    const x = idx === 0 ? 10 : 480;
    if (
      gameState.ball.x + 10 >= x &&
      gameState.ball.x <= x + 10 &&
      gameState.ball.y + 10 >= player.y &&
      gameState.ball.y <= player.y + 100
    ) {
      gameState.ball.vx *= -1;
    }
  });

  // Score check
  if (gameState.ball.x < 0) {
    if (keys[1]) gameState.players[keys[1]].score += 1;
    resetBall();
  }
  if (gameState.ball.x > 500) {
    if (keys[0]) gameState.players[keys[0]].score += 1;
    resetBall();
  }

  io.emit("update", gameState);
}, 50);

http.listen(PORT, () => console.log(`Server draait op poort ${PORT}`));
