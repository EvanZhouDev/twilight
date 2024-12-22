import Parser from "lang/core/parser";
import Lexer from "lang/core/lexer";
import { Environment } from "lang/runtime/env";

const parse = (line: string, env: Environment = new Environment()) => {
	const lexer = new Lexer(line);
	const parser = new Parser(lexer, { env });
	return parser.parseLine();
};

export default parse;
