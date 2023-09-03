import * as tf from "@tensorflow/tfjs-node-gpu";
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

export class DqlAgent {
  private training = false;
  private model: tf.Sequential;
  private memories: ReplayMemory[] = [];
  private maxMemories = 20000;
  private epsilon = 1; // Exploration rate
  private epsilonDecay = 0.999;
  private epsilonMin = 0.001;
  private gamma = 0.95; // Discount rate
  private learningRate = 0.01;
  private batchSize = 32;
  private episode = 1;
  private maxScore = 0;

  constructor(
    box: blessed.Widgets.BoxElement,
    private env: GameEnvironment,
    private renderer: Renderer
  ) {
    renderer.render(env);

    this.model = tf.sequential();
    this.model.add(
      tf.layers.dense({
        units: 500,
        inputShape: [WIDTH * HEIGHT]
      })
    );
    this.model.add(tf.layers.leakyReLU({ alpha: 0.3 }));
    this.model.add(tf.layers.dense({ units: 500 }));
    this.model.add(tf.layers.leakyReLU({ alpha: 0.3 }));
    this.model.add(tf.layers.dense({ units: 500 }));
    this.model.add(tf.layers.leakyReLU({ alpha: 0.3 }));
    this.model.add(tf.layers.dense({ units: 24 }));
    this.model.add(tf.layers.leakyReLU({ alpha: 0.3 }));
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
    void this.train();
  }

  stop() {
    this.training = false;
  }

  private act(state: number[]) {
    let action: number;
    if (Math.random() < this.epsilon) {
      action = Math.floor(Math.random() * 4);
    } else {
      action = tf.tidy(() => {
        const prediction = this.model.predict(
          tf.tensor2d([state])
        ) as tf.Tensor2D;
        return (prediction.argMax(1) as tf.Tensor1D).arraySync()[0];
      });
    }
    return action as Direction;
  }

  private remember(memory: ReplayMemory) {
    if (this.memories.length == this.maxMemories) {
      this.memories.shift();
    }
    this.memories.push(memory);
  }

  private async replay() {
    tf.util.shuffle(this.memories);
    const batch = this.memories.slice(0, this.batchSize);

    const states = tf.tensor2d(batch.map(({ state }) => state));
    const nextStates = tf.tensor2d(batch.map(({ nextState }) => nextState));

    const qValues = this.model.predict(states) as tf.Tensor2D;
    const nextQValues = this.model.predict(nextStates) as tf.Tensor2D;

    const targets = qValues.arraySync();
    const nextTargets = nextQValues.arraySync();

    for (let i = 0; i < batch.length; i++) {
      const { action, reward, done } = batch[i];
      if (done) {
        targets[i][action] = reward;
      } else {
        targets[i][action] = reward + this.gamma * Math.max(...nextTargets[i]);
      }
    }

    const targetTensor = tf.tensor2d(targets);

    await this.model.fit(states, targetTensor, {
      epochs: 1,
      verbose: 0
    });

    tf.dispose([states, nextStates, qValues, nextQValues, targetTensor]);
  }

  private async train() {
    let state = this.env.getState();
    while (this.training) {
      const action = this.act(state);
      const reward = this.env.act(action);
      const nextState = this.env.getState();
      const done = this.env.done;

      this.remember({ state, action, reward, nextState, done });

      const score = this.env.getScore();
      if (score > this.maxScore) {
        this.maxScore = score;
      }

      this.renderer.render(this.env, [
        `Epsilon: ${this.epsilon.toFixed(5)}`,
        `Memories: ${this.memories.length}`,
        `Tensors: ${tf.memory().numTensors}`,
        `Episode: ${this.episode}`,
        `Max score: ${this.maxScore}`
      ]);

      if (this.memories.length >= this.batchSize) {
        await this.replay();
      }

      if (!this.env.done) {
        state = nextState;
      } else {
        this.episode++;
        this.env.reset();
        state = this.env.getState();
        if (this.epsilon > this.epsilonMin) {
          this.epsilon *= this.epsilonDecay;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}
