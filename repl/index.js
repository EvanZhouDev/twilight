import simplify from "lang/runtime/simplify";
import AST from "lang/core/ast.js";
import preprocess from "lang/runtime/preprocess";
import importFile from "lang/runtime/handleImport";
import readline from "readline";
import parseLine from "lang/core";
import process from "process";
import print from "lang/stdout/print";
import assign from "lang/runtime/assign";
import { throwNonexistentReplCommand } from "lang/stdout/error";
import chalk from "chalk";

export default () => {
	const env = {
		static: {},
		dynamic: {},
		varLookup: {},
	};

	console.log("Twilight REPL v0.1");

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	rl.setPrompt("> ");

	const replCommands = {
		clear: () => {
			console.clear();
		},
		help: () => {
			console.log(`${chalk.bold.magenta("Twilight REPL v0.1")}
	${chalk.white("Commands")}:
	.help     Show this help message
	.exit     Leave the REPL (Ctrl+C)
	.clear    Clear the screen`);
		},
		exit: () => {
			console.log();
			process.exit(0);
		},
	};

	rl.on("line", (input) => {
		try {
			if (input[0] === ".") {
				if (replCommands[input.slice(1)]) {
					replCommands[input.slice(1)]();
				} else {
					throwNonexistentReplCommand(input.slice(1));
				}
			} else if (input.split(" ")[0] === "import") {
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
					console.log(print(line, env.varLookup));
				}

				if (
					line instanceof AST.Abstraction ||
					line instanceof AST.Application
				) {
					console.log(print(simplify(line), env.varLookup));
				}
			}
		} catch (e) {
			if (!e.toString().includes("TwilightLangError")) {
				console.log(e);
			}
		}
		console.log();
		rl.prompt();
	});

	rl.on("close", () => {
		console.log("");
		process.exit(0);
	});

	rl.prompt();
};
