import Lexer from "lang/core/lexer";
import Parser from "lang/core/parser";
import normalize from "lang/runtime/normalize";
import AST from "lang/core/ast.js";
import preprocess from "lang/runtime/preprocess";

const rawSource = `
import booleans numerals

S = \\w y x.y (w y x)

¬ = λx.x F T

Φ = λp z.z (S (p T)) (p T)

P = λn.n Φ (λz.z 0 0) F

Z = λn.n F ¬ F

Y = (λy.(λx.y (x x)) (λx.y (x x)))

R = λr n.Z n 1 (Z (P n) 1 ((r (P n)) S (r (P (P n)))))

fib = λn.Y R n

fib 1
`;

const { env, source } = preprocess(rawSource);

console.log(source);

const lexer = new Lexer(source);

const parser = new Parser(lexer, env);

while (true) {
	if (parser.end()) break;
	const line = parser.parseLine();

	if (line instanceof AST.Assignment) {
		env.static[line.name] = line.expr;
	}

	if (line instanceof AST.Abstraction || line instanceof AST.Application) {
		console.log(normalize(line).toString());
	}
}
