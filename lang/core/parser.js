import AST from "lang/core/ast";
import Token from "lang/core/token";
import {
	throwUnexpectedToken,
	throwExpectedExpression,
	throwUnboundVariable,
	throwIllegalImport,
} from "lang/stdout/error";

export default class Parser {
	constructor(lexer, env, importHistory) {
		this.lexer = lexer;
		this.env = env;
		this.lookahead = this.lexer.next();
		this.importHistory = importHistory;
	}

	match(type) {
		if (this.lookahead.type === type) {
			this.lookahead = this.lexer.next();
		} else {
			throwUnexpectedToken(
				this.lookahead.type,
				type,
				this.lexer.input,
				this.lexer.pos,
				this.importHistory,
			);
		}
	}

	end() {
		return this.lookahead.type === Token.EOF;
	}

	binders() {
		const binders = [];
		while (this.lookahead.type === Token.VAR) {
			if (this.lookahead.value === "import") {
				throwIllegalImport(
					this.lexer.input,
					this.lexer.pos,
					this.importHistory,
				);
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

	expression(context = []) {
		if (this.lookahead.type === Token.LAMBDA) {
			this.match(Token.LAMBDA);

			const binders = this.binders();

			this.match(Token.PERIOD);
			const expr = this.expression([...context, ...binders]);

			return new AST.Abstraction(binders, expr);
		}
		return this.application([...context]);
	}

	atom(context = []) {
		if (this.lookahead.type === Token.VAR) {
			const name = this.lookahead.value;
			if (name === "import") {
				throwIllegalImport(
					this.lexer.input,
					this.lexer.pos,
					this.importHistory,
				);
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

				throwUnboundVariable(
					name,
					[...context, ...Object.keys(this.env.static)],
					this.lexer.input,
					this.lexer.pos,
					this.importHistory,
				);
			}
			return new AST.Variable(
				name,
				context.length - 1 - context.lastIndexOf(name),
			);
		}
		if (this.lookahead.type === Token.LPAREN) {
			this.match(Token.LPAREN);
			const expr = this.expression([...context]);
			this.match(Token.RPAREN);
			return expr;
		}
		throwExpectedExpression(
			this.lookahead.type,
			this.lexer.input,
			this.lexer.pos,
			this.importHistory,
		);
	}

	application(context = []) {
		let expression = this.atom([...context]);
		while (
			this.lookahead.type === Token.VAR ||
			this.lookahead.type === Token.LPAREN
		) {
			expression = new AST.Application(expression, this.atom([...context]));
		}
		return expression;
	}
}
