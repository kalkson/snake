const snake = {
  length: 4,
  size: 25,
  speed: 150,
  direction: null,
  currentPosition: {
    x: 200,
    y: 200,
  },
  positionMap: [],
  applePoint: {},
  drawSnake: drawSnake(),
  eraseNail: eraseNail(),
  bombApple: bombApple(),
  hasEatenSameself: hasEatenSameself(),
  hasEatenApple: hasEatenApple(),
};

const game = {
  score: 0,
  highestScor: 0,
  resetGame: resetGame(),
};

const zone = {};

window.addEventListener('load', function () {
  const canvas = document.querySelector('#snake-canv');
  const ctx = canvas.getContext('2d');

  zone.height = canvas.height;
  zone.width = canvas.width;

  let {
    currentPosition: { x, y },
    size,
  } = snake;

  ctx.fillStyle = 'lime';
  // ctx.strokeStyle = 'purple';

  for (let i = 0, startingX = x; i < snake.length; i++) {
    snake.positionMap.push({ x: startingX - 25 * i, y });
    ctx.fillRect(startingX - 25 * i, y, size - 2, size - 2);
  }

  snake.bombApple();

  let interval = null;

  document.addEventListener('keydown', (e) => {
    e.preventDefault();

    const keyName = e.key.slice(5, e.key.length).toUpperCase();

    if (
      (snake.direction === 'LEFT' && keyName === 'RIGHT') ||
      (snake.direction === 'RIGHT' && keyName === 'LEFT') ||
      (snake.direction === 'DOWN' && keyName === 'UP') ||
      (snake.direction === 'UP' && keyName === 'DOWN') ||
      (!snake.direction && keyName === 'LEFT')
    )
      return;

    snake.direction = keyName;

    snake.drawSnake(snake.direction, keyName, ctx);
    interval = !interval ? setInterval(() => snake.drawSnake(snake.direction, keyName, ctx), snake.speed) : interval;
    game.interval = interval;
  });
});

function eraseNail() {
  return function (ctx) {
    snake.positionMap.unshift({
      x: snake.currentPosition['x'],
      y: snake.currentPosition['y'],
    });

    ctx.clearRect(snake.positionMap[this.length]['x'], snake.positionMap[this.length]['y'], snake.size, snake.size);

    snake.positionMap.pop();
  };
}

function hasEatenApple() {
  return function () {
    if (JSON.stringify(this.currentPosition) === JSON.stringify(this.applePoint)) {
      const ctx_Apple = document.querySelector('#apple-canv').getContext('2d');
      ctx_Apple.clearRect(this.applePoint.x, this.applePoint.y, this.size, this.size);

      this.bombApple();
      this.length++;

      snake.positionMap.unshift({
        x: snake.currentPosition['x'],
        y: snake.currentPosition['y'],
      });
    }
  };
}

function hasEatenSameself() {
  return function () {
    if (this.positionMap.some((element) => JSON.stringify(element) === JSON.stringify(this.currentPosition))) {
      game.resetGame();
    }
  };
}

function bombApple() {
  return function () {
    const point = {
      x: Math.floor(Math.random() * (zone.width / this.size)) * this.size,
      y: Math.floor(Math.random() * (zone.height / this.size)) * this.size,
    };

    const ctx_Apple = document.querySelector('#apple-canv').getContext('2d');

    if (this.positionMap.some((element) => JSON.stringify(element) === JSON.stringify(point))) {
      this.bombApple();
    } else {
      ctx_Apple.fillStyle = 'red';
      this.applePoint = point;
      ctx_Apple.fillRect(point['x'], point['y'], this.size - 2, this.size - 2);
    }
  };
}

function drawSnake() {
  return function (direction, keyName, ctx) {
    switch (direction) {
      case 'LEFT': {
        this.currentPosition['x'] =
          snake.currentPosition['x'] - snake.size <= -25 ? zone.width - 25 : this.currentPosition['x'] - snake.size;
        break;
      }
      case 'UP': {
        this.currentPosition['y'] =
          this.currentPosition['y'] - snake.size <= -25 ? zone.height - 25 : this.currentPosition['y'] - snake.size;
        break;
      }
      case 'RIGHT': {
        this.currentPosition['x'] =
          this.currentPosition['x'] + snake.size >= zone.width ? 0 : this.currentPosition['x'] + snake.size;
        break;
      }
      case 'DOWN': {
        this.currentPosition['y'] =
          this.currentPosition['y'] + snake.size >= zone.height ? 0 : this.currentPosition['y'] + snake.size;
        break;
      }
      default: {
        return;
      }
    }

    this.hasEatenSameself();
    this.hasEatenApple();

    ctx.fillRect(snake.currentPosition['x'], snake.currentPosition['y'], snake.size - 2, snake.size - 2);
    this.eraseNail(ctx);
  };
}

function resetGame() {
  return function () {
    console.log('asd');
    const modal = document.querySelector('#game-over-modal');
    modal.style.display = 'flex';
    console.log(modal);

    document.querySelector('#new-game-button').addEventListener('click', () => {
      modal.style.display = modal.style.display === 'flex' ? 'none' : null;
    });

    window.addEventListener('keydown', (e) => {
      e.keyCode === 13 || e.keyCode === 32 ? document.querySelector('#new-game-button').click() : null;
    });

    clearInterval(game.interval);
  };
}
