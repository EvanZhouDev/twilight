import AST from "lang/core/ast";
import Token, { type TokenType } from "lang/core/token";
import {
	UnexpectedTokenError,
	ExpectedExpressionError,
	MissingBinderError,
	UnboundVariableError,
	IllegalImportError,
} from "lang/error";
import type Lexer from "lang/core/lexer";
import type { Environment } from "lang/runtime/env";

export default class Parser {
	public lexer: Lexer;
	public env: Environment;
	public lookahead: Token;
	public importHistory: string[] | undefined;
	public lineNumber: number;

	constructor(
		lexer: Lexer,
		{
			env,
			importHistory,
			lineNumber = 1,
		}: { env: Environment; importHistory?: string[]; lineNumber?: number }
	) {
		this.lexer = lexer;
		this.env = env;
		this.lookahead = this.lexer.next();
		this.importHistory = importHistory;
		this.lineNumber = lineNumber;
	}

	match(type: TokenType) {
		if (this.lookahead.type === type) {
			this.lookahead = this.lexer.next();
		} else {
			throw new UnexpectedTokenError({
				token: this.lookahead.type,
				expected: type,
				parser: this,
			});
		}
	}

	end() {
		return this.lookahead.type === Token.EOF;
	}

	binders() {
		const binders = [];
		if (this.lookahead.type !== Token.VAR) {
			throw new MissingBinderError({
				token: this.lookahead.type,
				parser: this,
			});
		}
		while (this.lookahead.type === Token.VAR) {
			if (this.lookahead.value === "import") {
				throw new IllegalImportError({
					parser: this,
				});
			}
			binders.push(this.lookahead.value);
			this.match(Token.VAR);
		}
		return binders;
	}

	parseLine() {
		while (this.lookahead.type === Token.EOL) {
			this.match(Token.EOL);
		}
		if (
			this.lookahead.type === Token.VAR &&
			this.lexer.peek().type === Token.EQUALS
		) {
			return this.assignment();
		}

		return this.expression();
	}

	// Assignment must be a top-level expression, and cannot have a context
	assignment() {
		const name = this.lookahead.value;
		this.match(Token.VAR);
		this.match(Token.EQUALS);
		const expr = this.expression();
		return new AST.Assignment(name, expr);
	}

	expression(context: string[] = []) {
		if (this.lookahead.type === Token.LAMBDA) {
			this.match(Token.LAMBDA);

			const binders = this.binders();

			this.match(Token.PERIOD);
			const expr = this.expression([...context, ...binders]);

			return new AST.Abstraction(binders, expr);
		}
		return this.application([...context]);
	}

	atom(context: string[] = []) {
		if (this.lookahead.type === Token.VAR) {
			const name = this.lookahead.value;
			if (name === "import") {
				throw new IllegalImportError({
					parser: this,
				});
			}
			this.match(Token.VAR);

			if (!context.includes(name)) {
				if (this.env.static[name]) {
					return this.env.static[name];
				}

				for (const regexKey in this.env.dynamic) {
					if (new RegExp(regexKey, "g").test(name)) {
						return this.env.dynamic[regexKey](name);
					}
				}
				throw new UnboundVariableError({
					name,
					boundVariables: [...context, ...Object.keys(this.env.static)],
					parser: this,
				});
			}
			return new AST.Variable(
				name,
				context.length - 1 - context.lastIndexOf(name)
			);
		}
		if (this.lookahead.type === Token.LPAREN) {
			this.match(Token.LPAREN);
			const expr = this.expression([...context]);
			this.match(Token.RPAREN);
			return expr;
		}

		throw new ExpectedExpressionError({
			token: this.lookahead.type,
			parser: this,
		});
	}

	application(context: string[] = []) {
		let expression = this.atom([...context]);
		while (
			this.lookahead.type !== Token.EOF &&
			this.lookahead.type !== Token.EOL
		) {
			if (this.lookahead.type === Token.LAMBDA) {
				expression = new AST.Application(
					expression,
					this.expression([...context])
				);
			} else {
				expression = new AST.Application(expression, this.atom([...context]));
			}
		}
		return expression;
	}
}
