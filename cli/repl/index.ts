import { Environment } from "lang/runtime/env";
import stdlib from "lang/libs/stdlib";
import { LanguageError, NonexistentReplCommandError } from "../../lang/error";
import { runLine } from "../../lang/runtime/run";
import { TwilightFormatter } from "../../lang/formatter";
import * as readline from "node:readline";
import chalk from "chalk";
import type { Library } from "lang/libs";

export const replCommands = {
	clear: () => {
		console.clear();
	},
	help: () => {
		console.log(`${chalk.bold.magenta("Twilight REPL v0.1")}
${chalk.white("Commands")}:
.help     Show this help message
.exit     Leave the REPL (Ctrl+C)
.clear    Clear the screen
.env      Print the current environment`);
	},
	exit: () => {
		console.log();
		process.exit(0);
	},
	env: (env: Environment, libraries: Library[]) => {
		if (
			Object.keys(env.static).length === 0 &&
			env.includedModules.length === 0
		) {
			console.log(`${chalk.white("Empty environment")}`);
			return;
		}

		if (Object.keys(env.static).length > 0) {
			console.log(
				`${chalk.white("Variables")} ${chalk.grey(
					`(${Object.keys(env.static).length} vars)`
				)}:`
			);
			for (const [key, value] of Object.entries(env.static)) {
				console.log(
					`  - ${chalk.white(key)}: ${value.toString(new TwilightFormatter())}`
				);
			}

			if (env.includedModules.length > 0) console.log();
		}

		if (env.includedModules.length > 0) {
			console.log(
				`${chalk.white("Modules")} ${chalk.grey(
					`(${Object.keys(env.includedModules).length} imported)`
				)}:`
			);

			let allModules = {};

			for (const library of libraries) {
				allModules = { ...allModules, ...library };
			}

			for (const module of env.includedModules) {
				console.log(
					`  - ${chalk.white(module)} ${chalk.gray(
						`(${Object.keys(allModules[module].static || {}).length} static, ${
							Object.keys(allModules[module].dynamic || {}).length
						} dynamic, ${(allModules[module].patterns || []).length} patterns)`
					)}`
				);
			}
		}
	},
};

export default () => {
	const env = new Environment();
	const libraries = [stdlib];

	console.log(
		`Twilight REPL v${require("../../package.json")
			.version.split(".")
			.slice(0, 2)
			.join(".")}`
	);

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	rl.setPrompt("> ");

	rl.on("line", (input) => {
		try {
			if (input[0] === ".") {
				if (replCommands[input.slice(1)]) {
					replCommands[input.slice(1)](env, libraries);
				} else {
					throw new NonexistentReplCommandError({ command: input.slice(1) });
				}
			} else {
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
