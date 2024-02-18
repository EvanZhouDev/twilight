import simplify from "lang/runtime/simplify";
import AST from "lang/core/ast.js";
import preprocess from "lang/runtime/preprocess";
import importFile from "lang/runtime/handleImport";
import readline from "readline";
import parseLine from "lang/core";
import process from "process";
import print from "lang/stdout/print";
import assign from "lang/runtime/assign";

const env = {
	static: {},
	dynamic: {},
	reverse: {},
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
			assign(env, line.name, line.expr);
			console.log(print(line, env.reverse));
		}

		if (line instanceof AST.Abstraction || line instanceof AST.Application) {
			console.log(print(simplify(line), env.reverse));
		}
	}
	rl.prompt();
});

rl.on("close", () => {
	console.log("");
	process.exit(0);
});

rl.prompt();
