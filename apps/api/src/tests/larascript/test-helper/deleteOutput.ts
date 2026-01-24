import fs from "fs";
import { getOutputPath } from "./getOutputPath.js";

export const deleteOutput = () => {
  fs.rmSync(getOutputPath(), { recursive: true, force: true });
};
