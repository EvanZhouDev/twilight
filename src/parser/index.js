import Lexer from "./lexer.js";
import Parser from "./parser.js";

const parseSource = (source) => {
	const lexer = new Lexer(source);
	const parser = new Parser(lexer);
	const ast = parser.parse();

	return ast;
};

const parseLine = (line) => {
	return parseSource(line)[0];
};

export { parseLine, parseSource };
