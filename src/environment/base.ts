import * as tf from "@tensorflow/tfjs-node-gpu";

export type ActionSpace = DiscreteActionSpace | BoxActionSpace;

export interface DiscreteActionSpace {
  class: "Discrete";
  n: number;
  dtype?: tf.DataType;
}

export interface BoxActionSpace {
  class: "Box";
  shape: number[];
  low: number;
  high: number;
  dtype?: tf.DataType;
}

export interface ObservationSpace {
  shape: number[];
  dtype: tf.DataType;
}

export type StepResult = readonly [Observation, number, boolean];
export type Observation = number[];

export abstract class Environment {
  protected constructor(
    public actionSpace: ActionSpace,
    public observationSpace: ObservationSpace
  ) {}

  abstract step(action: number): StepResult | Promise<StepResult>;

  abstract reset(): number[];
}
