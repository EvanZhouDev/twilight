import Token from "lang/core/token";
import chalk from "chalk";
import path from "path";

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
	const fileLocation = importHistory === undefined
		? "REPL"
		: path.basename(importHistory);


	console.log(`${" ".repeat(
		String(lineCount).length,
	)} ╭─${chalk.bold.blueBright(fileLocation)}:${lineCount}:${linePositionStart}
${chalk.gray(lineCount)} │ ${line}
${" ".repeat(String(lineCount).length)} ╰${`${"─".repeat(
		linePositionStart,
	)}${chalk
		.magentaBright("^")
		.repeat(linePositionEnd - linePositionStart + 1)}`}${"─".repeat(
		fileLocation.length +
			1 +
			String(lineCount).length +
			1 +
			String(linePositionStart).length -
			linePositionEnd,
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

	throw new Error(`Expected ${expected}, but got ${token}.`);
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

	throw new Error(`Expression expected, but got ${token}.`);
};

export const throwUnboundVariable = (name, text, position, importHistory) => {
	const { line, linePosition, lineCount } = getLineAndPosition(text, position);

	console.log(
		`${chalk.redBright("×")} ${chalk.red(
			`Unbound variable "${chalk.white(
				name,
			)}". Try assigning it to a value, then using it.`,
		)}`,
	);

	generateFilePreview(
		line,
		lineCount,
		linePosition,
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
	throw new Error("Illegal import detected.");
};
