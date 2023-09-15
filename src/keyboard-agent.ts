import blessed from "blessed";
import { GameEnvironment } from "./environment.ts";
import { Renderer } from "./renderer.ts";
import { Direction, FPS } from "./utils.ts";

// The agent that plays the game

export class KeyboardAgent {
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
          this.buffer.push(Direction.Up);
          break;
        case "down":
          this.buffer.push(Direction.Down);
          break;
        case "left":
          this.buffer.push(Direction.Left);
          break;
        case "right":
          this.buffer.push(Direction.Right);
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
      this.env.act(action ?? this.env.direction);
      this.renderer.render(this.env);
    }, 1000 / FPS);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = undefined;
  }
}
