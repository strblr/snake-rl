import * as tf from "@tensorflow/tfjs-node-gpu";
import blessed from "blessed";
import { GameEnvironment } from "./environment.ts";
import { Renderer } from "./renderer.ts";
import { ReplayMemory, Turn } from "./utils.ts";

const Actions = [Turn.Straight, Turn.Right, Turn.Left];

export class DqlAgent {
  private training = false;

  // Model attributes
  private model: tf.Sequential;
  private targetModel: tf.Sequential;
  private memories: ReplayMemory[] = [];
  private maxMemories = 10000;
  private epsilon = 1; // Exploration rate
  private epsilonDecay = 0.995;
  private epsilonMin = 0.001;
  private gamma = 0.95; // Discount rate
  private learningRate = 0.05;
  private batchSize = 64;
  private commitInterval = 10;

  // Display attributes
  private episode = 1;
  private maxScore = 0;
  private currentLoss = 0;

  constructor(
    box: blessed.Widgets.BoxElement,
    private env: GameEnvironment,
    private renderer: Renderer
  ) {
    renderer.render(env);

    this.model = this.createModel();
    this.targetModel = this.createModel();
    this.commitModel();

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

  private createModel() {
    const model = tf.sequential();
    model.add(
      tf.layers.dense({
        units: 256,
        inputShape: [11],
        activation: "relu"
      })
    );
    model.add(tf.layers.dense({ units: 64, activation: "relu" }));
    model.add(
      tf.layers.dense({
        units: Actions.length,
        activation: "linear"
      })
    );

    model.compile({
      loss: "meanSquaredError",
      optimizer: tf.train.adam(this.learningRate)
    });
    return model;
  }

  private commitModel() {
    this.targetModel.setWeights(this.model.getWeights());
  }

  private act(state: number[]) {
    let actionIndex: number;
    if (Math.random() < this.epsilon) {
      actionIndex = Math.floor(Math.random() * Actions.length);
    } else {
      actionIndex = tf.tidy(() => {
        const prediction = this.model.predict(
          tf.tensor2d([state])
        ) as tf.Tensor2D;
        return (prediction.argMax(1) as tf.Tensor1D).arraySync()[0];
      });
    }
    return actionIndex;
  }

  private remember(memory: ReplayMemory) {
    if (this.memories.length == this.maxMemories) {
      this.memories.shift();
    }
    this.memories.push(memory);
  }

  private async replayMemory({
    actionIndex,
    reward,
    done,
    ...memory
  }: ReplayMemory) {
    const state = tf.tensor2d([memory.state]);
    const nextState = tf.tensor2d([memory.nextState]);
    const qValues = this.model.predict(state) as tf.Tensor2D;
    const nextQValues = this.targetModel.predict(nextState) as tf.Tensor2D;

    const target = qValues.arraySync()[0];
    const nextTarget = nextQValues.arraySync()[0];

    if (done) {
      target[actionIndex] = reward;
    } else {
      target[actionIndex] = reward + this.gamma * Math.max(...nextTarget);
    }

    const targetTensor = tf.tensor2d([target]);

    const history = await this.model.fit(state, targetTensor, {
      epochs: 1,
      verbose: 0
    });
    this.currentLoss = history.history.loss[0] as number;

    if (this.episode % this.commitInterval === 0) {
      this.commitModel();
    }

    tf.dispose([state, nextState, qValues, nextQValues, targetTensor]);
  }

  private async replayBatch() {
    tf.util.shuffle(this.memories);
    const batch = this.memories.slice(0, this.batchSize);

    const states = tf.tensor2d(batch.map(({ state }) => state));
    const nextStates = tf.tensor2d(batch.map(({ nextState }) => nextState));
    const qValues = this.model.predict(states) as tf.Tensor2D;
    const nextQValues = this.targetModel.predict(nextStates) as tf.Tensor2D;

    const targets = qValues.arraySync();
    const nextTargets = nextQValues.arraySync();

    for (let i = 0; i < batch.length; i++) {
      const { actionIndex, reward, done } = batch[i];
      if (done) {
        targets[i][actionIndex] = reward;
      } else {
        targets[i][actionIndex] =
          reward + this.gamma * Math.max(...nextTargets[i]);
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
      const actionIndex = this.act(state);
      const reward = this.env.act(Actions[actionIndex], true);
      const nextState = this.env.getState();
      const done = this.env.done;

      const memory: ReplayMemory = {
        state,
        actionIndex,
        reward,
        nextState,
        done
      };
      this.remember(memory);
      await this.replayMemory(memory);
      if (this.memories.length >= this.batchSize) {
        await this.replayBatch();
      }

      const score = this.env.getScore();
      if (score > this.maxScore) {
        this.maxScore = score;
      }

      this.renderer.render(this.env, [
        `Epsilon: ${this.epsilon.toFixed(5)}`,
        `Memories: ${this.memories.length}`,
        `Tensors: ${tf.memory().numTensors}`,
        `Episode: ${this.episode}`,
        `Max score: ${this.maxScore}`,
        `Loss: ${this.currentLoss.toFixed(5)}`
      ]);

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
