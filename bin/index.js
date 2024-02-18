#!/usr/bin/env bun

import run from "cli";
import startRepl from "repl/index.js";
import chalk from "chalk";

const args = process.argv.slice(2);

if (!args[0]) {
	startRepl();
} else if (args[0] === "--help") {
	console.log(`${chalk.magentaBright.bold("Twilight")} is a lambda calculus runtime and REPL.

${chalk.magentaBright("Execute a file")}: twilight <file> [...flags]
${chalk.blueBright("Start the REPL")}: twilight [...flags]

Flags:
${chalk.yellowBright("--help")}      Print this help message.
`);
} else {
	run(args[0]);
}
