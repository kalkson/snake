const snake = {
  length: 4,
  size: 25,
  direction: null,
  currentPosition: {
    x: 200,
    y: 200,
  },
  positionMap: [],
  applePoint: {},
  drawSnake: function (direction, ctx) {
    switch (direction) {
      case 'LEFT': {
        if (this.currentPosition['x'] - snake.size <= -25)
          this.currentPosition['x'] = zone.width - 25;
        else this.currentPosition['x'] -= snake.size;
        break;
      }
      case 'UP': {
        if (this.currentPosition['y'] - snake.size <= -25)
          this.currentPosition['y'] = zone.height - 25;
        else this.currentPosition['y'] -= snake.size;
        break;
      }
      case 'RIGHT': {
        if (this.currentPosition['x'] + snake.size >= zone.width)
          this.currentPosition['x'] = 0;
        else this.currentPosition['x'] += snake.size;
        break;
      }
      case 'DOWN': {
        if (this.currentPosition['y'] + snake.size >= zone.height)
          this.currentPosition['y'] = 0;
        else this.currentPosition['y'] += snake.size;
        break;
      }
      default: {
        return;
      }
    }

    console.log(this.positionMap);

    if (
      this.positionMap.some((element) => {
        return (
          element.x === this.currentPosition.x &&
          element.y === this.currentPosition.y
        );
      })
    ) {
      alert('game over!');
    }

    if (
      this.currentPosition.x === this.applePoint.x &&
      this.currentPosition.y === this.applePoint.y
    ) {
      const ctx_Apple = document.querySelector('#apple-canv').getContext('2d');
      ctx_Apple.clearRect(
        this.applePoint.x,
        this.applePoint.y,
        this.size,
        this.size
      );

      this.bombApple();

      console.log(this.positionMap);
      this.length++;
      snake.positionMap.unshift({
        x: snake.currentPosition['x'],
        y: snake.currentPosition['y'],
      });
    }

    snake.positionMap.unshift({
      x: snake.currentPosition['x'],
      y: snake.currentPosition['y'],
    });

    ctx.fillRect(
      snake.currentPosition['x'],
      snake.currentPosition['y'],
      snake.size,
      snake.size
    );

    this.eraseNail(ctx);
  },
  eraseNail: function (ctx) {
    ctx.clearRect(
      snake.positionMap[this.length].x,
      snake.positionMap[this.length].y,
      snake.size,
      snake.size
    );

    snake.positionMap.pop();
  },
  bombApple: function () {
    const point = {
      x: Math.floor(Math.random() * (zone.width / this.size)) * this.size,
      y: Math.floor(Math.random() * (zone.height / this.size)) * this.size,
    };

    const ctx_Apple = document.querySelector('#apple-canv').getContext('2d');

    if (
      this.positionMap.some((element) => {
        return element.x === point.x && element.y === point.y;
      })
    ) {
      this.bombApple();
    } else {
      ctx_Apple.fillStyle = 'green';
      this.applePoint = point;
      ctx_Apple.fillRect(point.x, point.y, this.size, this.size);
    }
  },
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

  ctx.fillStyle = 'red';

  for (let i = 0, startingX = x; i < snake.length; i++) {
    snake.positionMap.push({ x: startingX - 25 * i, y });
    ctx.fillRect(startingX - 25 * i, y, size, size);
  }

  let interval;

  snake.bombApple(ctx);

  document.addEventListener('keydown', (e) => {
    e.preventDefault();

    const keyName = e.key.slice(5, e.key.length).toUpperCase();
    snake.direction = keyName;

    // snake.drawSnake(snake.direction, ctx);

    interval = !interval
      ? setInterval(() => snake.drawSnake(snake.direction, ctx), 100)
      : interval;
  });
});
