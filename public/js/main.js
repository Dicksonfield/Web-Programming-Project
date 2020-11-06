const socket = io();
const canvas = document.getElementById('canvas');
let direction = null;
const styleCanvas = getComputedStyle(canvas);
let id = "";

socket.emit('joinGame', { name: "Jason" });

socket.on('updatePlayers', ({ players }) => {
    outputPlayers(players)
})

socket.on('movePlayer', ({ direction, id }) => {
    outputMove(direction, id);
})

const outputPlayers = players => {
    for(i=0; i<players.length; i++) {
        let snake = document.createElement("div");
        snake.id = "snake";
        snake.setAttribute('data-id', players[i].id);
        snake.style.left = players[i].left;
        snake.style.top = players[i].top;
        canvas.appendChild(snake)
    }
}

document.addEventListener("keydown", (e) => {
    if(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.code)) {
        direction = e.code;
    }
});

setInterval(() => { 
    if(direction != null) {
        socket.emit('movePlayer', {direction})
    }
}, 100);

const resetSnake = (snake) => {
    snake.style.top = "50%";
    snake.style.left = "50%";
}

const outputMove = (direction, id) => {
    console.log(direction, id)
    let snake = document.querySelector(`[data-id='${id}']`)
    let style = getComputedStyle(snake);
    const left = parseInt(style.left);
    const top = parseInt(style.top);
    switch(direction) {
        case "ArrowLeft":
            snake.style.left = `${left - 5}px`;
          break;
        case "ArrowRight":
            snake.style.left = `${left + 5}px`;
          break;
        case "ArrowUp":
            snake.style.top = `${top - 5}px`;
            break;
        case "ArrowDown":
            snake.style.top = `${top + 5}px`;
        default:
            break;
      }

    if (left < 10 || left > (parseInt(styleCanvas.width)-10) || top < 10 || top > (parseInt(styleCanvas.height)-10)) {
        alert("Game over");
        resetSnake(snake);
    } 
}