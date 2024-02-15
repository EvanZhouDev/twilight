import Parser from "lang/core/parser";
import Lexer from "lang/core/lexer";

export default (line) => {
	const lexer = new Lexer(line);
	const parser = new Parser(lexer);
	return parser.parseLine();
};
