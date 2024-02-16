import normalize from "lang/runtime/normalize";
import AST from "lang/core/ast.js";
import preprocess from "lang/runtime/preprocess";
import importFile from "lang/runtime/handleImport";
import readline from "readline";
import parseLine from "lang/core";
import process from "process";

const env = {
	static: {},
	dynamic: {},
};

console.log("Twilight REPL v0.1");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

rl.setPrompt("> ");

rl.on("line", (input) => {
	if (input.split(" ")[0] === "import") {
		for (const importString of input.split(" ").slice(1)) {
			importFile({
				path: importString,
				env,
				importHistory: [`${process.cwd()}/.`],
			});
		}
	} else {
		const line = parseLine(preprocess(input), env);

		if (line instanceof AST.Assignment) {
			env.static[line.name] = line.expr;
		}

		if (line instanceof AST.Abstraction || line instanceof AST.Application) {
			console.log(normalize(line).toString());
		}
	}
	rl.prompt();
});

rl.on("close", () => {
	console.log("");
	process.exit(0);
});

rl.prompt();
