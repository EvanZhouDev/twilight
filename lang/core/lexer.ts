import Token from "lang/core/token";
import preprocess from "util/preprocess";

export default class Lexer {
	public input: string;
	public rawInput: string;

	pos = 0;

	constructor(input: string) {
		this.rawInput = input;
		this.input = preprocess(input);
	}

	next(): Token {
		const tokenMap = {
			λ: Token.LAMBDA,
			"\\": Token.LAMBDA,
			".": Token.PERIOD,
			"(": Token.LPAREN,
			")": Token.RPAREN,
			"=": Token.EQUALS,
			"\n": Token.EOL,
		};

		const reservedTokens = [...Object.keys(tokenMap), " "];

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
			// Shouldn't happen, so not included.
			throw new Error(`Unexpected character: ${ch}`);
		}
		return new Token(tokenMap[ch]);
	}

	peek(): Token {
		const savedPos = this.pos;
		const token = this.next();
		this.pos = savedPos;
		return token;
	}
}
