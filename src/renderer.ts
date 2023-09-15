import blessed from "blessed";
import { GameEnvironment } from "./environment.ts";

// The renderer that displays the game

export class Renderer {
  constructor(
    private box: blessed.Widgets.BoxElement,
    private score: blessed.Widgets.BoxElement,
    private logs: blessed.Widgets.BoxElement
  ) {}

  render(env: GameEnvironment, logs: string[] = []) {
    this.box.setContent(env.getDisplayState());
    const statusText = `Score: ${env.getScore()}${
      env.done ? " | Game Over!" : ""
    }`;
    this.score.setContent(statusText);
    this.logs.setContent(logs.join("\n"));
    this.box.screen.render();
  }
}
