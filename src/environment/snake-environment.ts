import { Environment } from ".";

export enum Direction {
  Up = 0,
  Right = 1,
  Down = 2,
  Left = 3
}

export enum Turn {
  Straight = 0,
  Right = 1,
  Left = 2
}

export interface Point {
  x: number;
  y: number;
}

export class SnakeEnvironment extends Environment {
  static readonly WIDTH = 50;
  static readonly HEIGHT = 20;

  gameNumber = 0;
  private snake: Point[] = [];
  private apple: Point = { x: 0, y: 0 };
  direction = Direction.Right;

  constructor(public onStep?: () => void | Promise<void>) {
    super(
      {
        class: "Discrete",
        n: 3
      },
      {
        shape: [11],
        dtype: "float32"
      }
    );
    this.reset();
  }

  reset() {
    this.snake = [
      { x: 10, y: 5 },
      { x: 11, y: 5 },
      { x: 12, y: 5 }
    ];
    this.generateApple();
    this.direction = Math.floor(Math.random() * 4);
    this.gameNumber++;
    return this.getState();
  }

  private generateApple() {
    do {
      this.apple = {
        x: Math.floor(Math.random() * SnakeEnvironment.WIDTH),
        y: Math.floor(Math.random() * SnakeEnvironment.HEIGHT)
      };
    } while (
      this.snake.some(
        node => node.x === this.apple.x && node.y === this.apple.y
      )
    );
  }

  async step(turn: Turn) {
    let done = false,
      reward = 0;
    this.direction = this.getDirectionOfTurn(turn);
    const newHead = this.getNeighbour(this.direction);

    if (newHead.x === this.apple.x && newHead.y === this.apple.y) {
      this.generateApple();
      reward = 10;
    } else {
      this.snake.shift();
      if (this.isDangerous(newHead)) {
        done = true;
        reward = -20;
      } else if (
        this.getDistanceToApple(newHead) <
        this.getDistanceToApple(this.getHead())
      ) {
        reward = 1;
      }
    }
    this.snake.push(newHead);
    await this.onStep?.();
    return [this.getState(), reward, done] as const;
  }

  getScore() {
    return this.snake.length;
  }

  toString() {
    const state: string[][] = Array.from(
      { length: SnakeEnvironment.HEIGHT },
      () => Array(SnakeEnvironment.WIDTH).fill(" ")
    );
    for (const node of this.snake) {
      if (
        node.x >= 0 &&
        node.x < SnakeEnvironment.WIDTH &&
        node.y >= 0 &&
        node.y < SnakeEnvironment.HEIGHT
      )
        state[node.y][node.x] = "▒";
    }
    const head = this.getHead();
    if (
      head.x >= 0 &&
      head.x < SnakeEnvironment.WIDTH &&
      head.y >= 0 &&
      head.y < SnakeEnvironment.HEIGHT
    )
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
      x >= SnakeEnvironment.WIDTH ||
      y < 0 ||
      y >= SnakeEnvironment.HEIGHT ||
      this.snake.some(node => node.x === x && node.y === y)
    );
  }

  private getDistanceToApple(point: Point) {
    return Math.abs(point.x - this.apple.x) + Math.abs(point.y - this.apple.y);
  }
}
