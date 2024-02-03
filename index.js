import { parseSource } from "#src/parser/index.js";
import preprocess from "./src/runtime/preprocess/index.js";
import run from "#src/runtime/index.js";
import fs from "fs";

let source = fs.readFileSync("./testFile.twl", "utf-8")
run(source);