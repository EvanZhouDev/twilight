import fs from "fs";
import run from "#src/runtime/index.js";
import path from "path";

const fileToRun = "./demo/index.twl";
const source = fs.readFileSync(fileToRun, "utf-8");
run(source, path.dirname(fileToRun));
