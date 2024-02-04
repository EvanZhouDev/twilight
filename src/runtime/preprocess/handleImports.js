import fs from "fs";
import run from "../index.js";
import stdlib from "../stdlib.js";
import path from "path";

const handleImports = (source, directory) => {
	const env = {
		dynamic: {},
		static: {},
	};

	let newSource = source;
	while (newSource) {
		const line = newSource.split("\n")[0];
		if (line.trim() === "" || line.trim().split(" ")[0] === "import") {
			for (const importFile of line.split(" ").slice(1)) {
				if (importFile.split(".").at(-1) === "twl") {
					if (fs.existsSync(path.resolve(directory, importFile))) {
						try {
							const fileContent = fs.readFileSync(
								path.resolve(directory, importFile),
								"utf8",
							);
							const newenv = run(
								fileContent,
								path.dirname(path.resolve(directory, importFile)),
							);
							env.static = {
								...env.static,
								...newenv.static,
							};
							env.dynamic = {
								...env.dynamic,
								...newenv.dynamic,
							};
						} catch (error) {
							throw new Error(`Error reading file: ${error.message}`);
						}
					} else {
						throw new Error(`File not found: ${importFile}`);
					}
				} else {
					if (stdlib.dynamic[importFile]) {
						for (const [key, value] of Object.entries(
							stdlib.dynamic[importFile],
						)) {
							env.dynamic[key] = value;
						}
					} else if (stdlib.static[importFile]) {
						for (const [key, value] of Object.entries(
							stdlib.static[importFile],
						)) {
							env.static[key] = value;
						}
					} else {
						throw new Error(
							`No import ${importFile} found in standard library.`,
						);
					}
				}
			}
			newSource = newSource.split("\n").slice(1).join("\n");
		} else {
			break;
		}
	}

	return [newSource, env];
};

export default handleImports;
