import {
  Direction,
  DOWN,
  HEIGHT,
  LEFT,
  Point,
  RIGHT,
  UP,
  WIDTH
} from "./utils.ts";

// Game class to manage the snake state

export class GameEnvironment {
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

  getDistance() {
    const head = this.snake[this.snake.length - 1];
    return Math.sqrt(
      Math.pow(head.x - this.apple.x, 2) + Math.pow(head.y - this.apple.y, 2)
    );
  }

  getState() {
    const state: number[] = Array(WIDTH * HEIGHT).fill(0);
    for (const { x, y } of this.snake) {
      state[y * WIDTH + x] = 2;
    }
    const head = this.snake[this.snake.length - 1];
    state[head.y * WIDTH + head.x] = 1;
    state[this.apple.y * WIDTH + this.apple.x] = 3;
    return state;
  }
}
