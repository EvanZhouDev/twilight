import stdlib from "lang/runtime/stdlib";

const removeEmptyLines = (rawSource) => {
	return rawSource
		.split("\n")
		.filter((x) => x !== "")
		.map((x) => x.trim())
		.join("\n");
};

const removeComments = (rawSource) => {
	return rawSource.replaceAll(/\#.*/g, "");
};

const handleImports = (rawSource) => {
	const env = {
		dynamic: {},
		static: {},
	};

	const source = rawSource.split("\n");

	console.log(source);
	while (source.length) {
		if (source[0].split(" ")[0] === "import") {
			const line = source.shift();
			for (const importString of line.split(" ").slice(1)) {
				if (importString.split(".").at(-1) === "twi") {
					// HANDLE OTHER FILES/PATHS LATER
				} else {
					// Check static libraries before accessing dynamic
					if (stdlib.static[importString]) {
						env.static = { ...env.static, ...stdlib.static[importString] };
					} else if (stdlib.dynamic[importString]) {
						env.dynamic = { ...env.dynamic, ...stdlib.dynamic[importString] };
					} else {
						throw new Error(
							`No import ${importString} found in standard library.`,
						);
					}
				}
			}
		} else {
			break;
		}
	}

	return {
		source: source.join("\n"),
		env,
	};
};

export default (rawSource) => {
	let source = removeComments(rawSource);
	source = removeEmptyLines(source);
	return handleImports(source);
};
