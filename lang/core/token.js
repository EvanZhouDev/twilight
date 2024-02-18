export default class Token {
	static LAMBDA = "λ";
	static VAR = "var";
	static PERIOD = ".";
	static LPAREN = "(";
	static RPAREN = ")";
	static EOL = "eol";
	static EOF = "eof";
	static EQUALS = "=";

	constructor(type, value) {
		this.type = type;
		this.value = value;
	}
}
