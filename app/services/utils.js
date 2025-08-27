import { existsSync, mkdirSync } from "fs";

export const ensureDirExists = (dirPath) => {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
};
