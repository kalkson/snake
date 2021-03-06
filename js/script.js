import { detectMobile } from '../checkMobile.js';
// console.log(detectMobile());
let mobile;

if (screen.width <= 1024) {
  const size = 800;
  document.querySelector('#snake-canv').width = size;
  document.querySelector('#snake-canv').height = size;
  document.querySelector('#apple-canv').width = size;
  document.querySelector('#apple-canv').height = size;
  document.querySelector('#snake-canv-cont').style.width = size + 'px';
  document.querySelector('#snake-canv-cont').style.height = size + 'px';
  document.querySelector('#scores').style.fontSize = '2.5rem';

  mobile = 1;
}

if (document.cookie.includes('highScore'))
  document.querySelector('#highestScore').textContent = document.cookie
    .split(';')
    .filter((cookie) => cookie.includes('highScore'))[0]
    .split('=')[1];

const snake = {
  length: 4,
  size: mobile ? 50 : 25,
  speed: mobile ? 200 : 150,
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
  highestScore: document.cookie.includes('highestScore')
    ? document.cookie
        .split(';')
        .filter((cookie) => cookie.includes('highScore'))[0]
        .split('=')[1]
    : 0,
  keyButtonsInterval: null,
  newGame: newGame(),
  resetGame: resetGame(),
  reseted: 0,
};

let zone = {};

window.addEventListener('load', function () {
  game.newGame();
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
      zone.ctx_Apple.clearRect(this.applePoint.x, this.applePoint.y, this.size, this.size);

      game.score += 10;
      document.querySelector('#score').innerHTML = game.score;
      if (game.score > game.highestScore) {
        document.querySelector('#highestScore').innerHTML = game.score;
        game.highestScore = game.score;
      }

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
      document.querySelector('#end-score').innerHTML = game.score;
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
          snake.currentPosition['x'] - snake.size <= -this.size
            ? zone.width - this.size
            : this.currentPosition['x'] - snake.size;
        break;
      }
      case 'UP': {
        this.currentPosition['y'] =
          this.currentPosition['y'] - snake.size <= -this.size
            ? zone.height - this.size
            : this.currentPosition['y'] - snake.size;
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

function newGame() {
  return function () {
    zone = {
      ctx: document.querySelector('#snake-canv').getContext('2d'),
      ctx_Apple: document.querySelector('#apple-canv').getContext('2d'),
      height: document.querySelector('#snake-canv').height,
      width: document.querySelector('#apple-canv').width,
    };

    const { ctx } = zone;

    zone.ctx.clearRect(0, 0, zone.width, zone.height);
    zone.ctx_Apple.clearRect(0, 0, zone.width, zone.height);

    let {
      currentPosition: { x, y },
      size,
    } = snake;

    ctx.fillStyle = 'lime';

    for (let i = 0, startingX = x; i < snake.length; i++) {
      snake.positionMap.push({ x: startingX - size * i, y });
      ctx.fillRect(startingX - size * i, y, size - 2, size - 2);
    }

    snake.bombApple();

    if (!game.reseted) {
      document.addEventListener('keydown', operate);
      document.addEventListener('swiped-right', () => swipeHandler('RIGHT'));
      document.addEventListener('swiped-up', () => swipeHandler('UP'));
      document.addEventListener('swiped-left', () => swipeHandler('LEFT'));
      document.addEventListener('swiped-down', () => swipeHandler('DOWN'));
    }
  };
}

function resetGame() {
  return function () {
    game.reseted = 1;
    const modal = document.querySelector('#game-over-modal');
    modal.style.display = 'flex';

    game.highestScore = game.score > game.highestScore ? game.score : game.highestScore;
    document.cookie = 'highScore=' + game.highestScore + ';expires=Thu, 18 Dec 2100 12:00:00 UTC';

    document.querySelector('#new-game-button').addEventListener('click', () => {
      modal.style.display = modal.style.display === 'flex' ? 'none' : null;
      snake.length = 4;
      snake.direction = null;
      snake.currentPosition = { x: 200, y: 200 };
      snake.positionMap = [];
      snake.applePoint = {};
      game.keyButtonsInterval = null;
      game.newGame();
      game.score = 0;

      document.querySelector('#score').innerHTML = 0;

      window.removeEventListener('keydown', listenToKey);
    });

    function listenToKey(e) {
      if (e.keyCode === 13 || e.keyCode === 32) document.querySelector('#new-game-button').click();
    }

    window.addEventListener('keydown', listenToKey);

    clearInterval(game.keyButtonsInterval);
  };
}

function swipeHandler(keyName) {
  if (
    (snake.direction === 'LEFT' && keyName === 'RIGHT') ||
    (snake.direction === 'RIGHT' && keyName === 'LEFT') ||
    (snake.direction === 'DOWN' && keyName === 'UP') ||
    (snake.direction === 'UP' && keyName === 'DOWN') ||
    (!snake.direction && keyName === 'LEFT')
  )
    return;

  snake.direction = keyName;

  const { ctx } = zone;

  snake.drawSnake(snake.direction, keyName, ctx);
  game.keyButtonsInterval = !game.keyButtonsInterval
    ? setInterval(() => snake.drawSnake(snake.direction, keyName, ctx), snake.speed)
    : game.keyButtonsInterval;
}

function operate(e) {
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

  const { ctx } = zone;

  snake.drawSnake(snake.direction, keyName, ctx);
  game.keyButtonsInterval = !game.keyButtonsInterval
    ? setInterval(() => snake.drawSnake(snake.direction, keyName, ctx), snake.speed)
    : game.keyButtonsInterval;
}
