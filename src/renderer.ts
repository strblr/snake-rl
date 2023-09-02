import blessed from "blessed";
import { GameEnvironment } from "./environment.ts";

// The renderer that displays the game

export class Renderer {
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