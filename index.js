import fs from "fs";
import run from "#src/runtime/index.js";

const source = fs.readFileSync("./demo/index.twl", "utf-8");
run(source, "./demo");
