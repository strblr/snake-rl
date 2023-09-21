import blessed from "blessed";

export interface RendererOptions {
  width: number;
  height: number;
  onKey?: Record<string, () => void>;
}

export class Renderer {
  screen: blessed.Widgets.Screen;
  box: blessed.Widgets.BoxElement;
  score: blessed.Widgets.BoxElement;
  logs: blessed.Widgets.BoxElement;

  constructor({ width, height, onKey }: RendererOptions) {
    this.screen = blessed.screen({
      smartCSR: true
    });

    this.box = blessed.box({
      width: width + 2,
      height: height + 2,
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

    this.score = blessed.box({
      top: height + 2,
      width: 30,
      height: 3,
      style: { fg: "green" }
    });

    this.logs = blessed.box({
      top: height + 5,
      width: width + 2,
      height: 12,
      scrollable: true,
      border: {
        type: "line"
      },
      style: {
        fg: "green",
        border: {
          fg: "green"
        }
      }
    });

    this.screen.append(this.box);
    this.screen.append(this.score);
    this.screen.append(this.logs);
    this.box.focus();

    onKey &&
      this.box.on("keypress", (_, key) => {
        const handler = onKey[key.name];
        handler && handler();
      });
  }

  render(env: string, score?: string, logs?: string[]) {
    this.box.setContent(env);
    score && this.score.setContent(score);
    logs && this.logs.setContent(logs.join("\n"));
    this.screen.render();
  }
}
