import { DataType, Shape } from "@tensorflow/tfjs-node-gpu";

export type ActionSpace = DiscreteActionSpace | BoxActionSpace;

export interface DiscreteActionSpace {
  class: "Discrete";
  n: number;
  dtype?: DataType;
}

export interface BoxActionSpace {
  class: "Box";
  shape: Shape;
  low: number;
  high: number;
  dtype?: DataType;
}

export interface ObservationSpace {
  shape: Shape;
  dtype: DataType;
}

export type StepResult = readonly [number[], number, boolean];

export abstract class Environment {
  protected constructor(
    public actionSpace: ActionSpace,
    public observationSpace: ObservationSpace
  ) {}

  abstract step(action: number): StepResult | Promise<StepResult>;

  abstract reset(): number[];
}
