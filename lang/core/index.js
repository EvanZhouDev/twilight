import Parser from "lang/core/parser";
import Lexer from "lang/core/lexer";

export default (line, env) => {
	const lexer = new Lexer(line);
	const parser = new Parser(lexer, env);
	return parser.parseLine();
};
