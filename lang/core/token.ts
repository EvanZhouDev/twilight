export type TokenType = "λ" | "var" | "." | "(" | ")" | "eol" | "eof" | "=";

export default class Token {
	static readonly LAMBDA: TokenType = "λ";
	static readonly VAR: TokenType = "var";
	static readonly PERIOD: TokenType = ".";
	static readonly LPAREN: TokenType = "(";
	static readonly RPAREN: TokenType = ")";
	static readonly EOL: TokenType = "eol";
	static readonly EOF: TokenType = "eof";
	static readonly EQUALS: TokenType = "=";

	public readonly type: TokenType;
	public value: any;

	constructor(type: TokenType, value: any) {
		this.type = type;
		this.value = value;
	}
}
