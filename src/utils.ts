import fs from "fs";

// Constants

export const FPS = 10;

// Utility functions

fs.writeFileSync("./log.txt", "");

export function log(...args: any[]) {
  fs.appendFileSync("./log.txt", args.join(" ") + "\n");
}
