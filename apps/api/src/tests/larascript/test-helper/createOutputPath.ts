import fs from "fs";
import { getOutputPath } from "./getOutputPath.js";

export const createOutputPath = (fileName?: string) => {
    fs.mkdirSync(getOutputPath(fileName), { recursive: true });
}