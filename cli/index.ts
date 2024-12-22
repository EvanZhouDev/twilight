import run from "cli/runFile";
import startRepl from "cli/repl";
import chalk from "chalk";
import stdlib from "lang/libs/stdlib";

const args = process.argv.slice(2);

if (!args[0]) {
	startRepl();
} else if (args[0] === "--help" || args[0] === "-h") {
	console.log(`${chalk.magentaBright.bold(
		"Twilight"
	)} is a lambda calculus runtime and REPL.

${chalk.magentaBright("Execute a file")}: twilight <file> [...flags]
${chalk.blueBright("Start the REPL")}: twilight [...flags]

Flags:
${chalk.yellowBright("--help")}      Print this help message.
`);
} else if (args[0] === "--version" || args[0] === "-v") {
	// TODO: make this directly tap from package.json
	console.log(require("../package.json").version);
} else {
	run(args[0], [stdlib]);
}
