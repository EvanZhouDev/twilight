import { Environment } from "lang/runtime/env";
import stdlib from "lang/libs/stdlib";
import { LanguageError, NonexistentReplCommandError } from "../../lang/error";
import { runLine } from "../../lang/runtime/run";
import { TwilightFormatter } from "../../lang/formatter";
import * as readline from "node:readline";
import chalk from "chalk";

export default () => {
	const env = new Environment();
	const libraries = [stdlib];

	console.log(`Twilight REPL v${require("../../package.json").version}`);

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
					throw new NonexistentReplCommandError({ command: input.slice(1) });
				}
			} else {
				if (Object.keys(replCommands).includes(input)) {
					console.log(
						chalk.grey.italic('Did you mean to run the REPL Command: "') +
							chalk.white(`.${input}`) +
							chalk.grey.italic('"?\n')
					);
				}
				const output = runLine({
					source: input,
					env,
					libraries,
					formatter: new TwilightFormatter(),
					lineNumber: 1,
					onOutput: () => {},
				});
				if (output) console.log(output);
			}
		} catch (e) {
			if (e instanceof LanguageError) {
				console.log(e.toString());
			} else {
				console.error(e);
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
