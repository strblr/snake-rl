import blessed from "blessed";
import { GameEnvironment } from "./environment.ts";
import { Renderer } from "./renderer.ts";
import { KeyboardAgent } from "./keyboard-agent.ts";
import { DqlAgent } from "./dql-agent.ts";
import { HEIGHT, Mode, MODE, WIDTH } from "./utils.ts";

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
    style: { fg: "green" }
  });

  const logs = blessed.box({
    top: HEIGHT + 5,
    width: WIDTH + 2,
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

  screen.append(box);
  screen.append(score);
  screen.append(logs);
  box.focus();

  return { box, score, logs };
}

const { box, score, logs } = createGameBox();
const renderer = new Renderer(box, score, logs);
const env = new GameEnvironment();

if (MODE === Mode.Play) {
  new KeyboardAgent(box, env, renderer);
} else {
  new DqlAgent(box, env, renderer);
}
