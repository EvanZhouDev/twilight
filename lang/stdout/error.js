import Token from "lang/core/token";
import chalk from "chalk";
import path from "path";
import levenshtein from "fast-levenshtein";

const findMostSimilarTerm = (name, potential) => {
	let minDistance = 2;
	let mostSimilarTerm = null;
	for (const term of potential) {
		const distance = levenshtein.get(name, term);
		if (distance < minDistance) {
			minDistance = distance;
			mostSimilarTerm = term;
		}
	}
	return mostSimilarTerm;
};

const getLineAndPosition = (text, position) => {
	const lines = text.split("\n");
	let lineCount = 0;
	let totalLength = 0;
	for (let i = 0; i < lines.length; i++) {
		lineCount++;
		// Add 1 for the newline character that was removed by split
		totalLength += lines[i].length + 1;
		if (position <= totalLength) {
			// The position is in this line
			const linePosition = position - (totalLength - lines[i].length) + 1;
			return { line: lines[i], linePosition, lineCount };
		}
	}
	// Position is beyond the end of the text
	return { line: "", linePosition: 0 };
};

const generateFilePreview = (
	line,
	lineCount,
	linePositionStart,
	linePositionEnd,
	importHistory,
) => {
	const fileLocation =
		importHistory === undefined ? "REPL" : path.basename(importHistory);
	console.log(`${" ".repeat(
		String(lineCount).length,
	)} ╭─${chalk.bold.blueBright(fileLocation)}:${lineCount}:${linePositionStart}
${chalk.gray(lineCount)} │ ${line}
${" ".repeat(String(lineCount).length)} ╰${`${"─".repeat(
		linePositionStart,
	)}${chalk
		.magentaBright("^")
		.repeat(linePositionEnd - linePositionStart + 1)}`}${"─".repeat(
		Math.max(
			fileLocation.length +
				1 +
				String(lineCount).length +
				1 +
				String(linePositionStart).length -
				linePositionEnd,
			0,
		),
	)}`);
};

export const throwUnexpectedToken = (
	token,
	expected,
	text,
	position,
	importHistory,
) => {
	const { line, linePosition, lineCount } = getLineAndPosition(text, position);

	if (token === Token.EOF || token === Token.EOL) {
		console.log(
			`${chalk.redBright("×")} ${chalk.red(
				`Expected "${chalk.white.bold(expected)}" but instead, the line ended.`,
			)}`,
		);
		generateFilePreview(
			line,
			lineCount,
			linePosition + 1,
			linePosition + 1,
			importHistory,
		);
	} else {
		console.log(
			`${chalk.redBright("×")} ${chalk.red(
				`Expected "${chalk.white.bold(
					expected,
				)}" but instead, recieved "${chalk.bold(chalk.white(token))}"`,
			)}`,
		);
		generateFilePreview(
			line,
			lineCount,
			linePosition,
			linePosition,
			importHistory,
		);
	}

	throw new Error(`TwilightLangError: Expected ${expected}, but got ${token}.`);
};

export const throwExpectedExpression = (
	token,
	text,
	position,
	importHistory,
) => {
	const { line, linePosition, lineCount } = getLineAndPosition(text, position);

	if (token === Token.EOF || token === Token.EOL) {
		console.log(`${chalk.redBright("×")} ${chalk.red("Expression expected.")}`);
		generateFilePreview(
			line,
			lineCount,
			linePosition + 1,
			linePosition + 1,
			importHistory,
		);
	} else {
		console.log(
			`${chalk.redBright("×")} ${chalk.red(
				`Expression expected. Instead, recieved "${chalk.bold(
					chalk.white(token),
				)}"`,
			)}`,
		);
		generateFilePreview(
			line,
			lineCount,
			linePosition,
			linePosition,
			importHistory,
		);
	}

	throw new Error(`TwilightLangError: Expression expected, but got ${token}.`);
};

export const throwUnboundVariable = (
	name,
	potential,
	text,
	position,
	importHistory,
) => {
	const { line, linePosition, lineCount } = getLineAndPosition(text, position);

	const mostSimilarTerm = findMostSimilarTerm(name, potential);

	console.log(
		`${chalk.redBright("×")} ${chalk.red(
			`Unbound variable "${chalk.white(name)}". ${
				mostSimilarTerm !== null
					? `Did you mean: "${chalk.white(mostSimilarTerm)}"?`
					: "Try assigning it to a value, then using it."
			} `,
		)}`,
	);

	generateFilePreview(
		line,
		lineCount,
		linePosition - name.length + 1,
		linePosition,
		importHistory,
	);
	throw new Error(`Unbound variable ${name}`);
};

export const throwIllegalImport = (text, position, importHistory) => {
	const { line, linePosition, lineCount } = getLineAndPosition(text, position);

	console.log(
		`${chalk.redBright("×")} ${chalk.red(
			`"${chalk.white(
				"import",
			)}" cannot be used as a variable. If you are attempting to import something, put it at the top of the file.`,
		)}`,
	);

	generateFilePreview(
		line,
		lineCount,
		linePosition - 5,
		linePosition,
		importHistory,
	);
	throw new Error("TwilightLangError: Illegal import detected.");
};

export const throwNonexistentImport = (importName, importHistory) => {
	const fileImported =
		path.basename(importHistory.at(-1)) !== "."
			? path.basename(importHistory.at(-1))
			: "Twilight REPL";
	console.log(
		`${chalk.redBright("×")} ${chalk.red(
			`"${chalk.white(importName)}" imported from ${chalk.white(
				fileImported,
			)} is not in the standard library. If you are attempting to import a file, ensure that it ends in .twi`,
		)}`,
	);
	throw new Error(
		`TwilightLangError: No import ${importName} found in standard library.`,
	);
};

export const throwNonexistentFile = (importName, importHistory) => {
	const fileImported =
		path.basename(importHistory.at(-1)) !== "."
			? path.basename(importHistory.at(-1))
			: "Twilight REPL";
	console.log(
		`${chalk.redBright("×")} ${chalk.red(
			`File ${chalk.white(importName)} imported from ${chalk.white(
				fileImported,
			)} does not exist.`,
		)}`,
	);
	throw new Error(
		`TwilightLangError: The file ${importName} imported doesn't exist.`,
	);
};

export const throwNonexistentReplCommand = (command) => {
	console.log(
		`${chalk.redBright("×")} ${chalk.red(
			`REPL command ${chalk.white(
				`.${command}`,
			)} does not exist. Try running ${chalk.white(
				".help",
			)} for available commands.`,
		)}`,
	);
	throw new Error(
		`TwilightLangError: The REPL command ${command} doesn't exist.`,
	);
};

export const throwCyclicalImport = (importPath, importHistory) => {
	console.log(
		`${chalk.redBright("×")} ${chalk.red(
			`Cyclical import detected. You are importing ${chalk.white(
				path.basename(importPath),
			)} from ${chalk.white(
				path.basename(importHistory.at(-1)),
			)}, but it has already been imported from ${chalk.white(
				path.basename(importHistory[importHistory.indexOf(importPath) - 1]) ===
					"."
					? "Twilight REPL"
					: path.basename(importHistory[importHistory.indexOf(importPath) - 1]),
			)}`,
		)}`,
	);
	throw new Error(
		`TwilightLangError: Cyclical import detected. You are importing ${path.basename(
			importPath,
		)} from ${path.basename(
			importHistory.at(-1),
		)}, but it has already been imported from ${path.basename(
			importHistory[importHistory.indexOf(importPath) - 1],
		)}`,
	);
};
