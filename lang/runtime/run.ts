import {
	type Formatter,
	DeBruijnFormatter,
	DefaultFormatter,
} from "lang/formatter";
import { Environment } from "./env";
import {
	Assignment,
	Abstraction,
	Application,
	type Expression,
} from "lang/core/ast";
import simplify from "./simplify";
import stdlib from "lang/libs/stdlib";
import type { Library } from "lang/libs";
import Lexer from "lang/core/lexer";
import Parser from "lang/core/parser";
import importEnv from "lang/runtime/import";
import chalk from "chalk";

export const runAST = ({
	line,
	env = new Environment(),
	formatter = new DefaultFormatter(),
}: {
	line: Expression;
	env?: Environment;
	formatter?: Formatter;
}) => {
	if (line instanceof Assignment) {
		env.addStatic(line.name, line.expr);
	}
	if (line instanceof Abstraction || line instanceof Application) {
		line = simplify(line);
	}

	let output = line.toString(formatter);

	if (line instanceof Abstraction || line instanceof Application) {
		if (env.varLookup[line.toString(new DeBruijnFormatter())]) {
			output += ` ≡ ${env.varLookup[
				line.toString(new DeBruijnFormatter())
			].join(" ≡ ")}`;
		}
		for (const pattern of env.patterns) {
			if (pattern(line).match) {
				output += ` ≡ ${pattern(line).value}`;
			}
		}
	}
	return output;
};

export const runLine = ({
	source,
	importHistory,
	env = new Environment(),
	libraries = [stdlib],
	formatter = new DefaultFormatter(),
	lineNumber = 1,
	onOutput = (out: string) => console.log(out),
}: {
	source: string;
	importHistory?: string[];
	env?: Environment;
	libraries?: Library[];
	formatter?: Formatter;
	lineNumber?: number;
	onOutput?: (out: string) => void;
}) => {
	if (source.split(" ")[0] === "import") {
		let output = "";
		for (const importString of source.split(" ").slice(1)) {
			const envChange = importEnv({
				location: importString,
				env,
				libraries,
				// If for some reason importHistory was not populated, it would pull from the directory in which run was called. However, this shouldn't occur.
				importHistory: importHistory?.length
					? importHistory
					: [`${process.cwd()}/.`],
				onOutput,
			});
			if (importString.endsWith(".twi")) {
				output += `${chalk.greenBright(
					"✔︎ Successfully imported"
				)} ${chalk.white(importString)}\n`;
			} else {
				output += `${chalk.greenBright(
					"✔︎ Successfully imported"
				)} ${chalk.white(importString)} ${chalk.gray(
					`(${Object.keys(envChange.static || {}).length} static, ${
						Object.keys(envChange.dynamic || {}).length
					} dynamic, ${(envChange.patterns || []).length} patterns)`
				)}${
					envChange.static
						? `\n  ${chalk.grey.italic("Added")} ${Object.keys(envChange.static)
								.map((x) => chalk.white.italic(x))
								.join(", ")}\n`
						: ""
				}`;
			}
		}
		return output.trim();
	}
	const lexer = new Lexer(source);
	const parser = new Parser(lexer, { env, importHistory, lineNumber });
	const parsedLine = parser.parseLine();

	return runAST({
		line: parsedLine,
		env,
		formatter,
	});
};
export const run = ({
	source,
	importHistory,
	env = new Environment(),
	libraries = [stdlib],
	formatter = new DefaultFormatter(),
	onOutput = (out: string) => console.log(out),
}: {
	source: string;
	importHistory?: string[];
	env?: Environment;
	libraries?: Library[];
	formatter?: Formatter;
	lineNumber?: number;
	onOutput?: (out: string) => void;
}) => {
	let lineNumber = 0;
	for (const line of source.split("\n")) {
		lineNumber++;
		if (line.trim() !== "" && !line.trim().startsWith("#")) {
			onOutput(
				runLine({
					source: line,
					importHistory,
					formatter,
					libraries,
					env,
					lineNumber,
					onOutput: () => {},
				})
			);
		}
	}
};
