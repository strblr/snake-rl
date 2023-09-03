import blessed from "blessed";
import { GameEnvironment } from "./environment.ts";
import { HEIGHT, WIDTH } from "./utils.ts";

// The renderer that displays the game

export class Renderer {
  constructor(
    private box: blessed.Widgets.BoxElement,
    private score: blessed.Widgets.BoxElement,
    private logs: blessed.Widgets.BoxElement
  ) {}

  render(env: GameEnvironment, logs: string[] = []) {
    const state: number[] = env.getState();
    let displayState = "";
    for (let i = 0; i < HEIGHT; i++) {
      displayState += state.slice(i * WIDTH, (i + 1) * WIDTH).join("") + "\n";
    }
    displayState = displayState
      .replaceAll("0", " ")
      .replaceAll("1", "█")
      .replaceAll("2", "▒")
      .replaceAll("3", "◉");
    this.box.setContent(displayState);
    const statusText = `Score: ${env.getScore()}${
      env.done ? " | Game Over!" : ""
    }`;
    this.score.setContent(statusText);
    this.logs.setContent(logs.join("\n"));
    this.box.screen.render();
  }
}
