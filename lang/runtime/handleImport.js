import path from "path";
import stdlib from "lang/runtime/stdlib";
import fs from "fs";
import run from "cli/run";
import deBrujinFlatten from "lang/stdout/deBrujinFlatten";
import {
	throwCyclicalImport,
	throwNonexistentImportedFile,
	throwNonexistentImport,
} from "lang/stdout/error";

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
			throwNonexistentImportedFile(filePath, importHistory);
		}

		if (importHistory.includes(filePath)) {
			throwCyclicalImport(filePath, importHistory);
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
			throwNonexistentImport(importPath, importHistory);
		}
	}
};

export default importFile;
