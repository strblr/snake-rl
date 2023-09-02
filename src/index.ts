import blessed from "blessed";
import { GameEnvironment } from "./environment.ts";
import { Renderer } from "./renderer.ts";
import { KeyboardAgent } from "./keyboard-agent.ts";
import { DQNAgent } from "./dqn-agent.ts";
import { HEIGHT, MODE, WIDTH } from "./utils.ts";

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
    height: 10,
    style: {
      fg: "green",
      border: {
        fg: "green"
      }
    }
  });

  screen.append(box);
  screen.append(score);
  box.focus();

  return { box, score };
}

const { box, score } = createGameBox();
const renderer = new Renderer(box, score);
const env = new GameEnvironment();

if (MODE === "play") {
  new KeyboardAgent(box, env, renderer);
} else {
  new DQNAgent(box, env, renderer);
}
