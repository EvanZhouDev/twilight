import Lexer from "./lexer.js";
import Parser from "./parser.js";

let parseSource = (source) => {
    const lexer = new Lexer(source);
    const parser = new Parser(lexer);
    const ast = parser.parse();

    return ast;
}

let parseLine = (line) => {
    return parseSource(line)[0];
}


export { parseLine, parseSource };