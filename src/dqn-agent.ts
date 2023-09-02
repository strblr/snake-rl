import * as tf from "@tensorflow/tfjs-node";
import blessed from "blessed";
import { GameEnvironment } from "./environment.ts";
import { Renderer } from "./renderer.ts";
import {
  Direction,
  DOWN,
  HEIGHT,
  LEFT,
  ReplayMemory,
  RIGHT,
  UP,
  WIDTH
} from "./utils.ts";

/*class GameEnvironment {
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
}*/

export class DQNAgent {
  private training = false;
  private model: tf.Sequential;
  private memories: ReplayMemory[] = [];
  private maxMemories = 10000;
  private epsilon = 1; // Exploration rate
  private epsilonDecay = 0.995;
  private epsilonMin = 0.001;
  private gamma = 0.95; // Discount rate
  private learningRate = 0.001;
  private batchSize = 64;

  constructor(
    box: blessed.Widgets.BoxElement,
    private env: GameEnvironment,
    private renderer: Renderer
  ) {
    renderer.render(env);

    this.model = tf.sequential();
    this.model.add(
      tf.layers.dense({
        units: 128,
        inputShape: [WIDTH * HEIGHT],
        activation: "relu"
      })
    );
    this.model.add(tf.layers.dense({ units: 92, activation: "relu" }));
    this.model.add(tf.layers.dense({ units: 24, activation: "relu" }));
    this.model.add(
      tf.layers.dense({
        units: [UP, DOWN, LEFT, RIGHT].length,
        activation: "linear"
      })
    );
    this.model.compile({
      loss: "meanSquaredError",
      optimizer: tf.train.adam(this.learningRate)
    });

    box.on("keypress", (_, key) => {
      switch (key.name) {
        case "escape":
          return process.exit(0);
        case "space":
          this.training ? this.stop() : this.start();
          break;
      }
    });
  }

  start() {
    this.training = true;
    this.train();
  }

  stop() {
    this.training = false;
  }

  act() {
    let action: number;
    if (Math.random() < this.epsilon) {
      action = Math.floor(Math.random() * 4);
    } else {
      const state = this.env.getState();
      const prediction = this.model.predict(
        tf.tensor([state.flat()]).reshape([1, WIDTH * HEIGHT])
      ) as tf.Tensor2D;
      action = (prediction.argMax(1) as tf.Tensor1D).arraySync()[0];
    }
    return action as Direction;
  }

  remember(memory: ReplayMemory) {
    if (this.memories.length == this.maxMemories) {
      this.memories.shift();
    }
    this.memories.push(memory);
  }

  private train() {}
}
