import { Environment } from ".";

export class DemoEnvironment extends Environment {
  private state: number[] = [0, 0];
  private i = 0;

  constructor() {
    super(
      {
        class: "Discrete",
        n: 4
      },
      {
        shape: [2],
        dtype: "float32"
      }
    );
  }

  async step(action: number) {
    switch (action) {
      case 0:
        this.state[1] -= 0.01;
        break;
      case 1:
        this.state[1] += 0.01;
        break;
      case 2:
        this.state[0] -= 0.01;
        break;
      case 3:
        this.state[0] += 0.01;
        break;
    }
    this.i += 1;
    const reward = -Math.sqrt(
      this.state[0] * this.state[0] + this.state[1] * this.state[1]
    );
    console.log("Reward", reward);
    const done = reward > -0.01;
    if (done) {
      console.log("Goal reached:", this.state);
    }
    return [this.state.slice(0), reward, done] as const;
  }

  reset() {
    console.log("Resetting");
    this.state = [Math.random() - 0.5, Math.random() - 0.5];
    this.i = 0;
    return this.state.slice(0);
  }
}
