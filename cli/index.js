import run from "./run.js";
import fs from "fs";

export default (path) => {
	if (!fs.readFileSync(path)) {
		throw new Error("This path does not exist.");
	}
	try {
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
