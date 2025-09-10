const socket = io();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let playerId;
let gameState;

socket.on("init", (data) => {
  playerId = data.id;
  gameState = data.state;
});

socket.on("update", (state) => {
  gameState = state;
  draw();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") socket.emit("move", "up");
  if (e.key === "ArrowDown") socket.emit("move", "down");
});

document.getElementById("upBtn").addEventListener("click", () => {
  socket.emit("move", "up");
});
document.getElementById("downBtn").addEventListener("click", () => {
  socket.emit("move", "down");
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "red";
  ctx.fillRect(gameState.ball.x, gameState.ball.y, 10, 10);
  ctx.fillStyle = "blue";
  for (let id in gameState.players) {
    let player = gameState.players[id];
    let x = id === playerId ? 10 : 480;
    ctx.fillRect(x, player.y, 10, 100);
  }
}
