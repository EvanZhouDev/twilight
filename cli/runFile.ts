import * as fs from "node:fs";
import { TwilightFormatter } from "lang/formatter";
import { runLine } from "lang/runtime/run";
import stdlib from "lang/libs/stdlib";
import { LanguageError, NonexistentFileError } from "lang/error";
import type { Library } from "lang/libs/stdlib";
import { Environment } from "lang/runtime/env";
import { run } from "lang/runtime/run";

export default (path: string, libraries: Library[] = [stdlib]) => {
	try {
		if (!fs.existsSync(path)) {
			throw new NonexistentFileError({ fileName: path });
		}
		const env = new Environment();
		run({
			source: fs.readFileSync(path, "utf-8"),
			importHistory: [path],
			formatter: new TwilightFormatter(),
			libraries,
			env,
		});
	} catch (e) {
		if (e instanceof LanguageError) {
			console.log(e.toString());
		} else {
			console.error(e);
		}
	}
};
