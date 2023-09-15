import { Direction, HEIGHT, Point, Turn, WIDTH } from "./utils.ts";

// Game class to manage the snake state

export class GameEnvironment {
  private snake: Point[] = [];
  private apple: Point = { x: 0, y: 0 };
  direction = Direction.Right;
  done = false;

  constructor() {
    this.reset();
  }

  reset() {
    this.snake = [
      { x: 10, y: 5 },
      { x: 11, y: 5 },
      { x: 12, y: 5 }
    ];
    this.generateApple();
    this.direction = Direction.Right;
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

  act(directionOrTurn: Direction | Turn, isTurn = false): number {
    if (this.done) return 0;
    this.direction = !isTurn
      ? (directionOrTurn as Direction)
      : this.getDirectionOfTurn(directionOrTurn as Turn);
    const newHead = this.getNeighbour(this.direction);
    if (this.isDangerous(newHead)) {
      this.done = true;
      return -20;
    }
    const oldHead = this.getHead();
    this.snake.push(newHead);
    if (newHead.x === this.apple.x && newHead.y === this.apple.y) {
      this.generateApple();
      return 10;
    } else {
      this.snake.shift();
      if (this.getDistanceToApple(newHead) < this.getDistanceToApple(oldHead)) {
        return 1;
      }
    }
    return -2;
  }

  getScore() {
    return this.snake.length;
  }

  getDisplayState() {
    const state: string[][] = Array.from({ length: HEIGHT }, () =>
      Array(WIDTH).fill(" ")
    );
    for (const node of this.snake) state[node.y][node.x] = "▒";
    const head = this.getHead();
    state[head.y][head.x] = "█";
    state[this.apple.y][this.apple.x] = "◉";
    return state.map(row => row.join("")).join("\n");
  }

  getState() {
    const head = this.getHead();
    return [
      this.isDangerous(
        this.getNeighbour(this.getDirectionOfTurn(Turn.Straight))
      ),
      this.isDangerous(this.getNeighbour(this.getDirectionOfTurn(Turn.Right))),
      this.isDangerous(this.getNeighbour(this.getDirectionOfTurn(Turn.Left))),
      this.direction === Direction.Up,
      this.direction === Direction.Right,
      this.direction === Direction.Down,
      this.direction === Direction.Left,
      this.apple.x < head.x,
      this.apple.x > head.x,
      this.apple.y < head.y,
      this.apple.y > head.y
    ].map(Number);
  }

  private getHead() {
    return this.snake[this.snake.length - 1];
  }

  private getDirectionOfTurn(turn: Turn): Direction {
    if (turn === Turn.Straight) return this.direction;
    switch (this.direction) {
      case Direction.Up:
        return turn === Turn.Left ? Direction.Left : Direction.Right;
      case Direction.Right:
        return turn === Turn.Left ? Direction.Up : Direction.Down;
      case Direction.Down:
        return turn === Turn.Left ? Direction.Right : Direction.Left;
      case Direction.Left:
        return turn === Turn.Left ? Direction.Down : Direction.Up;
    }
  }

  private getNeighbour(direction: Direction): Point {
    const head = this.getHead();
    switch (direction) {
      case Direction.Up:
        return { x: head.x, y: head.y - 1 };
      case Direction.Down:
        return { x: head.x, y: head.y + 1 };
      case Direction.Left:
        return { x: head.x - 1, y: head.y };
      case Direction.Right:
        return { x: head.x + 1, y: head.y };
    }
  }

  private isDangerous({ x, y }: Point) {
    return (
      x < 0 ||
      x >= WIDTH ||
      y < 0 ||
      y >= HEIGHT ||
      this.snake.some(node => node.x === x && node.y === y)
    );
  }

  private getDistanceToApple(point: Point) {
    return Math.abs(point.x - this.apple.x) + Math.abs(point.y - this.apple.y);
  }
}
