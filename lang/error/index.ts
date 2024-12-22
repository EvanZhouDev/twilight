import chalk from "chalk";
import type Parser from "lang/core/parser";
import Token, { type TokenType } from "lang/core/token";
import type { Library } from "lang/libs";
import * as path from "node:path";
import findBestMatch from "util/findBestMatch";
import { replCommands } from "cli/repl";

export class LanguageError extends Error {
	public message: string;
	public hint: string;

	constructor(message: string, hint?: string) {
		super();
		this.message = message;
		this.hint = hint;
	}

	toString(): string {
		return `${chalk.redBright("×")} ${this.message}${
			this.hint ? chalk.grey.italic(`\n  ${this.hint}`) : ""
		}`;
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
		hint,
		highlightLength = 1,
		highlightOffset = 0,
		parser,
	}: {
		message: string;
		parser: Parser;
		hint?: string;
		highlightLength?: number;
		highlightOffset?: number;
	}) {
		super(message);
		this.message = message;
		this.hint = hint;

		this.text = parser.lexer.rawInput;
		this.position = parser.lexer.pos;
		this.highlightLength = highlightLength;
		this.importHistory = parser.importHistory;
		console.log(highlightOffset, this.position);
		this.highlightOffset = highlightOffset + this.text.match(/^\s*/)[0].length;
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

			const totalLength = Math.max(
				fileLocation.length +
					1 +
					String(lineNumber).length +
					1 +
					String(startIdx).length,
				line.length
			);

			return `${" ".repeat(
				String(lineNumber).length
			)} ╭─${chalk.bold.blueBright(fileLocation)}:${lineNumber}:${startIdx}
${chalk.gray(lineNumber)} │ ${mainText}${chalk.gray(commentText)}
${" ".repeat(String(lineNumber).length)} ╰${`${"─".repeat(startIdx)}${chalk
				.magentaBright("^")
				.repeat(endIdx - startIdx + 1)}`}${"─".repeat(
				Math.max(totalLength - endIdx, 0)
			)}`;
		};
		return `${chalk.redBright("×")} ${this.message}\n${generateFilePreview({
			line: this.text,
			startIdx: this.position + this.highlightOffset,
			endIdx: this.position + this.highlightLength - 1 + this.highlightOffset,
			lineNumber: this.lineNumber,
			importHistory: this.importHistory,
		})}${this.hint ? chalk.grey.italic(`\n  ${this.hint}`) : ""}`;
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
		} else if (expected === Token.EOF || expected === Token.EOL) {
			super({
				message: chalk.red(
					`Unexpected token "${chalk.bold(chalk.white(token))}"`
				),
				parser,
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
			message: chalk.red(`Unbound variable ${chalk.white(name)}`),
			hint:
				// if in repl
				parser.importHistory === undefined &&
				Object.keys(replCommands).includes(name)
					? `Did you mean to run the REPL Command: "${chalk.white(
							`.${name}`
					  )}"?`
					: possibleTerm !== null
					? `Did you mean: ${chalk.white(possibleTerm)}?`
					: "Try assigning it to a value, then using it.",
			highlightOffset:
				-name.length +
				(parser.lookahead.type === Token.EOF ||
				parser.lookahead.type === Token.EOL
					? 1
					: -parser.lexer.rawInput
							.slice(
								0,
								parser.lexer.pos +
									parser.lexer.rawInput.match(/^\s*/)[0].length -
									1 -
									(parser.lookahead.value ? parser.lookahead.value.length : 0)
							)
							.match(/\s*$/)[0].length -
					  (parser.lookahead.value ? parser.lookahead.value.length : 0)),
			highlightLength: name.length,
			parser,
		});
	}
}
export class IllegalImportError extends FilePreviewError {
	constructor({ parser }: { parser: Parser }) {
		super({
			message: chalk.red(
				`Reserved keyword ${chalk.white("import")} cannot be used as a binder.`
			),
			hint: "To import something, put it at the start of the line.",
			highlightOffset: -5,
			highlightLength: 6,
			parser,
		});
	}
}

export class NonexistentImportError extends LanguageError {
	constructor({
		importName,
		importHistory,
		libraries,
	}: {
		importName: string;
		importHistory: string[];
		libraries: Library[];
	}) {
		const fileImported =
			path.basename(importHistory.at(-1)) !== "."
				? path.basename(importHistory.at(-1))
				: "Twilight REPL";
		const mostSimilarLibrary = findBestMatch(
			importName,
			libraries.flatMap((x) => Object.keys(x))
		);
		super(
			chalk.red(
				`${chalk.white(importName)} imported from ${chalk.white(
					fileImported
				)} is not in available libraries.\n${
					mostSimilarLibrary !== null
						? chalk.gray.italic(
								`  Did you mean to import: ${chalk.white(mostSimilarLibrary)}?`
						  )
						: chalk.gray.italic(
								"  If you are attempting to import a file, ensure that it ends in .twi"
						  )
				}`
			)
		);
	}
}

export class NonexistentFileError extends LanguageError {
	constructor({ fileName }: { fileName: string }) {
		super(chalk.red(`File ${chalk.white(fileName)} does not exist.`));
	}
}

export class NonexistentImportedFileError extends LanguageError {
	constructor({
		importName,
		importHistory,
	}: {
		importName: string;
		importHistory: string[];
	}) {
		const fileImported =
			path.basename(importHistory.at(-1)) !== "."
				? path.basename(importHistory.at(-1))
				: "Twilight REPL";

		super(
			chalk.red(
				`File ${chalk.white(importName)} imported from ${chalk.white(
					fileImported
				)} does not exist.`
			)
		);
	}
}

export class NonexistentReplCommandError extends LanguageError {
	constructor({ command }: { command: string }) {
		super(
			chalk.red(
				`REPL command ${chalk.white(
					`.${command}`
				)} does not exist. Try running ${chalk.white(
					".help"
				)} for available commands.`
			)
		);
	}
}

export class CyclicalImportError extends LanguageError {
	constructor({
		importPath,
		importHistory,
	}: {
		importPath: string;
		importHistory: string[];
	}) {
		super(
			chalk.red(
				`Cyclical import detected. You are importing ${chalk.white(
					path.basename(importPath)
				)} from ${chalk.white(
					path.basename(importHistory.at(-1))
				)}, but it has already been imported from ${chalk.white(
					path.basename(
						importHistory[importHistory.indexOf(importPath) - 1]
					) === "."
						? "Twilight REPL"
						: path.basename(
								importHistory[importHistory.indexOf(importPath) - 1]
						  )
				)}`
			)
		);
	}
}
