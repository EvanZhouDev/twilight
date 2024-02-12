export default class Token {
	static LAMBDA = "lambda";
	static VAR = "var";
	static PERIOD = "period";
	static LPAREN = "lparen";
	static RPAREN = "rparen";
	static EOL = "eol";
	static EOF = "eof";
	static EQUALS = "equal";

	constructor(type, value) {
		this.type = type;
		this.value = value;
	}
}