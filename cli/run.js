import Lexer from "lang/core/lexer";
import Parser from "lang/core/parser";
import simplify from "lang/runtime/simplify";
import AST from "lang/core/ast.js";
import preprocess from "lang/runtime/preprocess";
import importFile from "lang/runtime/handleImport";
import flatten from "../lang/stdout/format";

const run = ({
	source: rawSource,
	env = {
		static: {},
		dynamic: {},
	},
	importHistory = [],
}) => {
	let source = preprocess(rawSource).split("\n");

	while (source.length) {
		if (source[0].split(" ")[0] === "import") {
			const line = source.shift();
			for (const importString of line.split(" ").slice(1)) {
				importFile({
					path: importString,
					env,
					// If for some reason importHistory was not populated, it would pull from the directory in which run was called. However, this shouldn't occur.
					importHistory: importHistory.length
						? importHistory
						: [`${__dirname}/.`],
				});
			}
		} else {
			break;
		}
	}

	source = source.join("\n");

	const lexer = new Lexer(source);

	const parser = new Parser(lexer, env);

	while (true) {
		if (parser.end()) break;
		const line = parser.parseLine();

		if (line instanceof AST.Assignment) {
			env.static[line.name] = line.expr;
			console.log(flatten(line));
		}

		if (line instanceof AST.Abstraction || line instanceof AST.Application) {
			console.log(flatten(simplify(line)));
		}
	}

	return { env, importHistory };
};

export default run;
