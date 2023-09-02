import blessed from "blessed";

// Constants

const WIDTH = 80;
const HEIGHT = 30;
const FPS = 12;
const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

// Types

interface Point {
  x: number;
  y: number;
}

type Direction = typeof UP | typeof DOWN | typeof LEFT | typeof RIGHT;

// Game class to manage the snake state

class GameEnvironment {
  private snake: Point[] = [];
  private apple: Point = { x: 0, y: 0 };
  private direction: Direction = RIGHT;
  done = false;

  constructor() {
    this.reset();
  }

  reset() {
    this.snake = [
      { x: 10, y: 10 },
      { x: 11, y: 10 },
      { x: 12, y: 10 }
    ];
    this.generateApple();
    this.direction = RIGHT;
    this.done = false;
  }

  private generateApple() {
    do {
      this.apple = {
        x: Math.floor(Math.random() * WIDTH),
        y: Math.floor(Math.random() * HEIGHT)
      };
    } while (
      this.snake.some(
        node => node.x === this.apple.x && node.y === this.apple.y
      )
    );
  }

  act(action?: Direction) {
    if (this.done) return;
    if (action !== undefined) {
      this.direction = action;
    }
    const head = this.snake[this.snake.length - 1];
    let newHead: Point;
    switch (this.direction) {
      case UP:
        newHead = { x: head.x, y: head.y - 1 };
        break;
      case DOWN:
        newHead = { x: head.x, y: head.y + 1 };
        break;
      case LEFT:
        newHead = { x: head.x - 1, y: head.y };
        break;
      case RIGHT:
        newHead = { x: head.x + 1, y: head.y };
        break;
    }
    if (
      newHead.x < 0 ||
      newHead.x >= WIDTH ||
      newHead.y < 0 ||
      newHead.y >= HEIGHT ||
      this.snake.some(node => node.x === newHead.x && node.y === newHead.y)
    ) {
      this.done = true;
      return;
    }
    this.snake.push(newHead);
    if (newHead.x === this.apple.x && newHead.y === this.apple.y) {
      this.generateApple();
    } else {
      this.snake.shift();
    }
  }

  getScore() {
    return this.snake.length;
  }

  getState() {
    const grid: number[][] = Array.from({ length: HEIGHT }, () =>
      Array(WIDTH).fill(0)
    );
    for (const { x, y } of this.snake) {
      grid[y][x] = 2;
    }
    grid[this.snake[this.snake.length - 1].y][
      this.snake[this.snake.length - 1].x
    ] = 1;
    grid[this.apple.y][this.apple.x] = 3;
    return grid;
  }
}

// The agent that plays the game

class KeyboardAgent {
  private timer?: NodeJS.Timeout;
  private buffer: Direction[] = [];

  constructor(
    box: blessed.Widgets.BoxElement,
    private env: GameEnvironment,
    private renderer: Renderer
  ) {
    renderer.render(env);
    box.on("keypress", (_, key) => {
      switch (key.name) {
        case "escape":
          return process.exit(0);
        case "up":
          this.buffer.push(UP);
          break;
        case "down":
          this.buffer.push(DOWN);
          break;
        case "left":
          this.buffer.push(LEFT);
          break;
        case "right":
          this.buffer.push(RIGHT);
          break;
        case "space":
          this.timer ? this.stop() : this.start();
          break;
        case "r":
          this.stop();
          this.env.reset();
          this.buffer = [];
          renderer.render(env);
          break;
      }
    });
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      const action = this.buffer.shift();
      this.env.act(action);
      this.renderer.render(this.env);
    }, 1000 / FPS);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = undefined;
  }
}

// The renderer that displays the game

class Renderer {
  constructor(
    private box: blessed.Widgets.BoxElement,
    private score: blessed.Widgets.BoxElement
  ) {}

  render(env: GameEnvironment) {
    const displayState = env
      .getState()
      .map(line => line.join(""))
      .join("\n")
      .replaceAll("0", " ")
      .replaceAll("1", "█")
      .replaceAll("2", "▒")
      .replaceAll("3", "◉");
    this.box.setContent(displayState);
    const statusText = `Score: ${env.getScore()}${
      env.done ? " | Game Over!" : ""
    }`;
    this.score.setContent(statusText);
    this.box.screen.render();
  }
}

{
  // Main

  function createGameBox() {
    const screen = blessed.screen({
      smartCSR: true
    });

    const box = blessed.box({
      width: WIDTH + 2,
      height: HEIGHT + 2,
      border: {
        type: "line"
      },
      style: {
        bg: "black",
        fg: "green",
        border: {
          fg: "green"
        }
      }
    });

    const score = blessed.box({
      top: HEIGHT + 2,
      width: 30,
      height: 3,
      style: {
        fg: "green"
      }
    });

    screen.append(box);
    screen.append(score);
    box.focus();

    return { box, score };
  }

  const { box, score } = createGameBox();
  const renderer = new Renderer(box, score);
  const env = new GameEnvironment();
  new KeyboardAgent(box, env, renderer);
}
