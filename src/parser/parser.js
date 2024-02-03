import AST from "./ast.js";
import Token from "./token.js";

export default class Parser {
	constructor(lexer) {
		this.lexer = lexer;
		this.lookahead = this.lexer.next();
	}

	match(type) {
		if (this.lookahead.type === type) {
			this.lookahead = this.lexer.next();
		} else {
			throw new Error(`Unexpected token: ${this.lookahead.type}`);
		}
	}

	binders() {
		const binders = [];
		while (this.lookahead.type === Token.VAR) {
			binders.push(this.lookahead.value);
			this.match(Token.VAR);
		}
		return binders;
	}

	parse() {
		const expressions = [];
		while (this.lookahead.type !== Token.EOF) {
			if (this.lookahead.type === Token.EOL) {
				this.match(Token.EOL);
			} else if (
				this.lookahead.type === Token.VAR &&
				this.lexer.peek().type === Token.EQUALS
			) {
				expressions.push(this.assignment());
			} else {
				expressions.push(this.expression());
			}
		}
		return expressions;
	}

	assignment() {
		const name = this.lookahead.value;
		this.match(Token.VAR);
		this.match(Token.EQUALS);
		const expr = this.expression();
		return new AST.Assignment(name, expr);
	}

	expression() {
		if (this.lookahead.type === Token.LAMBDA) {
			this.match(Token.LAMBDA);

			const binders = this.binders();

			this.match(Token.PERIOD);

			const expr = this.expression();

			return new AST.Abstraction(binders, expr);
		}

		return this.application();
	}

	atom() {
		if (this.lookahead.type === Token.VAR) {
			const name = this.lookahead.value;
			this.match(Token.VAR);
			return new AST.Variable(name);
		}
		if (this.lookahead.type === Token.LPAREN) {
			this.match(Token.LPAREN);
			const expr = this.expression();
			this.match(Token.RPAREN);
			return expr;
		}
		throw new Error(`Unexpected token: ${this.lookahead.type}`);
	}

	application() {
		let expression = this.atom();
		while (
			this.lookahead.type === Token.VAR ||
			this.lookahead.type === Token.LPAREN
		) {
			expression = new AST.Application(expression, this.atom());
		}
		return expression;
	}
}
