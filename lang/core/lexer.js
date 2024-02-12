import Token from "./token.js";

export default class Lexer {
	constructor(input) {
		this.input = input;
		this.pos = 0;
	}

	next() {
		const tokenMap = {
			λ: Token.LAMBDA,
			"\\": Token.LAMBDA,
			".": Token.PERIOD,
			"(": Token.LPAREN,
			")": Token.RPAREN,
			"=": Token.EQUALS,
			"\n": Token.EOL,
		};

		const reservedTokens = Object.keys(tokenMap).concat(" ");

		while (this.pos < this.input.length && this.input[this.pos] === " ") {
			this.pos++;
		}

		if (this.pos >= this.input.length) {
			return new Token(Token.EOF);
		}

		const ch = this.input[this.pos++];

		if (!reservedTokens.includes(ch)) {
			let name = ch;
			while (
				this.pos < this.input.length &&
				!reservedTokens.includes(this.input[this.pos])
			) {
				name += this.input[this.pos++];
			}
			return new Token(Token.VAR, name);
		}

		if (tokenMap[ch] === undefined) {
			throw new Error(`Unexpected character: ${ch}`);
		}
		return new Token(tokenMap[ch]);
	}

	peek() {
		const savedPos = this.pos;
		const token = this.next();
		this.pos = savedPos;
		return token;
	}
}
