import fs from "fs";

// Types

export enum Mode {
  Play = "play",
  TrainDQL = "train_DQL"
}

export enum Direction {
  Up = "up",
  Right = "right",
  Down = "down",
  Left = "left"
}

export enum Turn {
  Straight = "straight",
  Right = "right",
  Left = "left"
}

export interface Point {
  x: number;
  y: number;
}

export interface ReplayMemory {
  state: number[];
  actionIndex: number;
  reward: number;
  nextState: number[];
  done: boolean;
}

// Constants

export const MODE: Mode = Mode.TrainDQL;
export const FPS = 10;
export const WIDTH = 50;
export const HEIGHT = 20;

// Utility functions

fs.writeFileSync("./log.txt", "");

export function log(...args: any[]) {
  fs.appendFileSync("./log.txt", args.join(" ") + "\n");
}
