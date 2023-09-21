import * as tf from "@tensorflow/tfjs-node-gpu";
import { PPOAgent } from "./agent";
import { SnakeEnvironment } from "./environment";
import { Renderer } from "./renderer";

const controller = { go: true };
let maxScore = 0;

const renderer = new Renderer({
  width: SnakeEnvironment.WIDTH,
  height: SnakeEnvironment.HEIGHT,
  onKey: {
    space: () => {
      controller.go = !controller.go;
    },
    escape: () => {
      process.exit();
    }
  }
});

async function onStep() {
  const score = env.getScore();
  if (score > maxScore) maxScore = score;
  renderer.render(env.toString(), `Score: ${score}`, [
    "Timestep: " + (ppo as any).numTimesteps,
    "Game: " + env.gameNumber,
    "Tensors: " + tf.memory().numTensors,
    "Max Score: " + maxScore
  ]);
  await new Promise(resolve => setTimeout(resolve, 1));
}

const env = new SnakeEnvironment(onStep);

const ppo = new PPOAgent(env, {});

await ppo.learn({
  totalTimesteps: 70000,
  logInterval: 0,
  controller
});
