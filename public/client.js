const socket = io();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let playerId;
let gameState;

socket.on("init", (data) => {
  playerId = data.id;
  gameState = data.state;
  draw();
});

socket.on("update", (state) => {
  gameState = state;
  draw();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") socket.emit("move", "up");
  if (e.key === "ArrowDown") socket.emit("move", "down");
});

document.getElementById("upBtn").addEventListener("click", () => socket.emit("move", "up"));
document.getElementById("downBtn").addEventListener("click", () => socket.emit("move", "down"));
document.getElementById("readyBtn").addEventListener("click", () => socket.emit("ready"));

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Scores boven het canvas
  const keys = Object.keys(gameState.players);
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  if (keys.length >= 1) ctx.fillText(gameState.players[keys[0]].score, 200, 30);
  if (keys.length >= 2) ctx.fillText(gameState.players[keys[1]].score, 280, 30);

  // Bal
  ctx.fillStyle = "red";
  ctx.fillRect(gameState.ball.x, gameState.ball.y, 10, 10);

  // Paddles
  ctx.fillStyle = "blue";
  keys.forEach((id, idx) => {
    const player = gameState.players[id];
    const x = id === playerId ? 10 : 480;
    ctx.fillRect(x, player.y, 10, 100);
  });
}
