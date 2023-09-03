import fs from "fs";

// Constants

export const MODE: "play" | "train" = "train";
export const FPS = 16;
export const WIDTH = 25;
export const HEIGHT = 10;
export const UP = 0;
export const DOWN = 1;
export const LEFT = 2;
export const RIGHT = 3;

// Types

export interface Point {
  x: number;
  y: number;
}

export type Direction = typeof UP | typeof DOWN | typeof LEFT | typeof RIGHT;

export interface ReplayMemory {
  state: number[];
  action: Direction;
  reward: number;
  nextState: number[];
  done: boolean;
}

// Utility functions

fs.writeFileSync("./log.txt", "");

export function log(...args: any[]) {
  fs.appendFileSync("./log.txt", args.join(" ") + "\n");
}
