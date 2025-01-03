import stdlib from "lang/libs/stdlib";
import type { Library, Module } from "lang/libs";
import { Environment } from "./env";
import * as path from "node:path";
import * as fs from "node:fs";
import {
	CyclicalImportError,
	NonexistentImportedFileError,
	NonexistentImportError,
} from "lang/error";
import { TwilightFormatter } from "lang/formatter";
import { run } from "lang/runtime/run";

export default ({
	location,
	env = new Environment(),
	libraries = [stdlib],
	importHistory,
	onOutput = console.log,
}: {
	location: string;
	importHistory: string[];
	env?: Environment;
	libraries?: Library[];
	onOutput?: (output: string) => void;
}): Module => {
	if (location.split(".").at(-1) === "twi") {
		// If the location is another Twilight file
		const filePath = path.resolve(path.dirname(importHistory.at(-1)), location);

		if (!fs.existsSync(filePath)) {
			throw new NonexistentImportedFileError({
				importName: filePath,
				importHistory,
			});
		}

		if (importHistory.includes(filePath)) {
			throw new CyclicalImportError({ importPath: filePath, importHistory });
		}

		run({
			source: fs.readFileSync(filePath, "utf-8"),
			env,
			importHistory: [...importHistory, filePath],
			formatter: new TwilightFormatter(),
			libraries: [stdlib],
			onOutput,
		});
		return env;
	}

	let included: Module;
	for (const lib of libraries) {
		if (lib[location]) {
			env.merge(lib[location]);
			included = lib[location];
			env.includedModules.push(location);
			return lib[location];
		}
	}

	if (!included) {
		throw new NonexistentImportError({
			importName: location,
			importHistory,
			libraries,
		});
	}
};
