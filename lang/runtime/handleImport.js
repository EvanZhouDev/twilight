import path from "path";
import stdlib from "lang/runtime/stdlib";
import fs from "fs";
import run from "cli/run";
import deBrujinFlatten from "lang/stdout/deBrujinFlatten";

const importFile = ({
	path: importPath,
	env = {
		static: {},
		dynamic: {},
		varLookup: {},
	},
	importHistory,
}) => {
	if (importPath.split(".").at(-1) === "twi") {
		const filePath = path.resolve(
			path.dirname(importHistory.at(-1)),
			importPath,
		);

		if (!fs.existsSync(filePath)) {
			throw new Error(`The file ${filePath} imported doesn't exist.`);
		}

		if (importHistory.includes(filePath)) {
			throw new Error(
				`Cyclical import detected. You are importing ${filePath} from ${importHistory.at(
					-1,
				)}, but it has already been imported from ${
					importHistory[importHistory.indexOf(filePath) - 1]
				}`,
			);
		}

		run({
			source: fs.readFileSync(filePath, "utf-8"),
			env,
			importHistory: [...importHistory, filePath],
		});
	} else {
		// Check static libraries before accessing dynamic
		if (stdlib.static[importPath]) {
			env.static = { ...env.static, ...stdlib.static[importPath] };

			for (const key in stdlib.static[importPath]) {
				if (!env.varLookup[deBrujinFlatten(stdlib.static[importPath][key])]) {
					env.varLookup[deBrujinFlatten(stdlib.static[importPath][key])] = [];
				}
				if (
					!env.varLookup[
						deBrujinFlatten(stdlib.static[importPath][key])
					].includes(key)
				) {
					env.varLookup[deBrujinFlatten(stdlib.static[importPath][key])].push(
						key,
					);
				}
			}
		} else if (stdlib.dynamic[importPath]) {
			env.dynamic = { ...env.dynamic, ...stdlib.dynamic[importPath] };
		} else {
			throw new Error(`No import ${importPath} found in standard library.`);
		}
	}
};

export default importFile;
