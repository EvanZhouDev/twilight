import chalk from "chalk";
import type Parser from "lang/core/parser";
import Token, { type TokenType } from "lang/core/token";
import * as path from "node:path";
import findBestMatch from "util/findBestMatch";

export class LanguageError extends Error {
	public message: string;

	toString(): string {
		return `${chalk.redBright("×")} ${this.message}`;
	}
}

export class FilePreviewError extends LanguageError {
	public text: string;
	public position: number;
	public highlightLength: number;
	public importHistory: string[];
	public highlightOffset: number;
	public lineNumber: number;

	constructor({
		message,
		highlightLength = 1,
		highlightOffset = 0,
		parser,
	}: {
		message: string;
		parser: Parser;
		highlightLength?: number;
		highlightOffset?: number;
	}) {
		super(message);
		this.message = message;

		this.text = parser.lexer.rawInput;
		this.position = parser.lexer.pos;
		this.highlightLength = highlightLength;
		this.importHistory = parser.importHistory;
		this.highlightOffset = highlightOffset;
		this.lineNumber = parser.lineNumber;
	}

	toString(): string {
		const generateFilePreview = ({
			line,
			lineNumber,
			startIdx,
			endIdx,
			importHistory,
		}: {
			line: string;
			lineNumber: number;
			startIdx: number;
			endIdx: number;
			importHistory: string[];
		}) => {
			const fileLocation =
				importHistory === undefined
					? "REPL"
					: path.basename(importHistory.at(-1));
			const commentIndex = line.indexOf("#");
			const mainText = commentIndex === -1 ? line : line.slice(0, commentIndex);
			const commentText = commentIndex === -1 ? "" : line.slice(commentIndex);

			return `${" ".repeat(
				String(lineNumber).length
			)} ╭─${chalk.bold.blueBright(fileLocation)}:${lineNumber}:${startIdx}
${chalk.gray(lineNumber)} │ ${mainText}${chalk.gray(commentText)}
${" ".repeat(String(lineNumber).length)} ╰${`${"─".repeat(startIdx)}${chalk
				.magentaBright("^")
				.repeat(endIdx - startIdx + 1)}`}${"─".repeat(
				Math.max(
					fileLocation.length +
						1 +
						String(lineNumber).length +
						1 +
						String(startIdx).length -
						endIdx,
					0
				)
			)}`;
		};

		// TODO: Make correction for removed lines during parsing such as comments and blank lines

		return `${chalk.redBright("×")} ${this.message}\n${generateFilePreview({
			line: this.text,
			startIdx: this.position + this.highlightOffset,
			endIdx: this.position + this.highlightLength - 1 + this.highlightOffset,
			lineNumber: this.lineNumber,
			importHistory: this.importHistory,
		})}`;
	}
}

export class UnexpectedTokenError extends FilePreviewError {
	constructor({
		token,
		expected,
		parser,
	}: {
		token: TokenType;
		expected: string;
		parser: Parser;
	}) {
		if (token === Token.EOF || token === Token.EOL) {
			super({
				message: chalk.red(
					`Expected "${chalk.white.bold(
						expected
					)}" but instead, the line ended.`
				),
				parser,
				highlightOffset: 1,
			});
		} else {
			super({
				message: chalk.red(
					`Expected "${chalk.white.bold(
						expected
					)}" but instead, recieved "${chalk.bold(chalk.white(token))}"`
				),
				parser,
			});
		}
	}
}
export class ExpectedExpressionError extends FilePreviewError {
	constructor({ token, parser }: { token: TokenType; parser: Parser }) {
		if (token === Token.EOF || token === Token.EOL) {
			super({
				message: chalk.red("Expression expected."),
				highlightOffset: 1,
				parser,
			});
		} else {
			super({
				message: chalk.red(
					`Expression expected. Instead, recieved "${chalk.bold(
						chalk.white(token)
					)}"`
				),
				parser,
			});
		}
	}
}
export class MissingBinderError extends FilePreviewError {
	constructor({ token, parser }: { token: TokenType; parser: Parser }) {
		if (token === Token.EOF || token === Token.EOL) {
			super({
				message: chalk.red("Binders expected."),
				highlightOffset: 1,
				parser,
			});
		} else {
			super({
				message: chalk.red(
					`Binders expected. Instead, recieved "${chalk.bold(
						chalk.white(token)
					)}"`
				),
				parser,
			});
		}
	}
}
export class UnboundVariableError extends FilePreviewError {
	constructor({
		name,
		boundVariables,
		parser,
	}: {
		name: string;
		boundVariables: string[];
		parser: Parser;
	}) {
		const possibleTerm = findBestMatch(name, boundVariables);
		super({
			message: chalk.red(
				`Unbound variable "${chalk.white(name)}". ${
					possibleTerm !== null
						? `Did you mean: "${chalk.white(possibleTerm)}"?`
						: "Try assigning it to a value, then using it."
				} `
			),
			highlightOffset: -name.length + 1,
			highlightLength: name.length,
			parser,
		});
	}
}

export class IllegalImportError extends FilePreviewError {
	constructor({ parser }: { parser: Parser }) {
		super({
			message: chalk.red(
				`"${chalk.white(
					"import"
				)}" cannot be used as a variable. If you are attempting to import something, put it at the top of the file.`
			),
			highlightOffset: -5,
			highlightLength: 6,
			parser,
		});
	}
}
