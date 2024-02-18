import run from "./run.js";
import fs from "fs";
import { throwNonexistentFile } from "lang/stdout/error.js";

export default (path) => {
	try {
		if (!fs.existsSync(path)) {
			throwNonexistentFile(path);
		}
		run({
			source: fs.readFileSync(path, "utf-8"),
			importHistory: [path],
		});
	} catch (e) {
		if (!e.toString().includes("TwilightLangError")) {
			console.log(e);
		}
	}
};
