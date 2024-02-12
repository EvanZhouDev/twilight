import Lexer from "../core/lexer.js";
import Parser from "../core/parser.js";
import normalize from "./normalize.js";
import AST from "../core/ast.js";

// \\z.((\\g h.g) z)
// (λn f x.n (λg h.h (g f)) (λu.x) (λu.u)) (\\s z.s (s z))
const source = `
0 = \\s z.z
1 = \\s z.s z
2 = \\s z.s (s z)
3 = \\s z.s (s (s z))
4 = \\s z.s (s (s (s z)))
5 = \\s z.s (s (s (s (s z))))
5 = \\s z.s (s (s (s (s (s (s (s (s z))))))))

T = \\x y.x
F = \\x y.y

S = \\w y x.y (w y x)

¬ = λx.x F T

Φ = λp z.z (S (p T)) (p T)

P = λn.n Φ (λz.z 0 0) F

Z = λn.n F ¬ F

Y = (λy.(λx.y (x x)) (λx.y (x x)))

R = λr n.Z n 1 (Z (P n) 1 ((r (P n)) S (r (P (P n)))))

fib = λn.Y R n

fib 5
`
	// # So we can write recursion
	// Y = (λy.(λx.y (x x)) (λx.y (x x)))

	// # Twilight employs Normal-Order evaluation, meaning that your recursive functions safely evaluate and exit!
	// R = λr n.Z n 1 (Z (P n) 1 ((r (P n)) S (r (P (P n)))))

	// # here's the fibonnaci!
	// fib = λn.Y R n

	// # and call...
	// fib 3
	.split("\n")
	.filter((x) => x !== "")
	.join("\n");

const lexer = new Lexer(source);

const env = {};
const parser = new Parser(lexer, env);

while (true) {
	if (parser.end()) break;
	const line = parser.parseLine();

	if (line instanceof AST.Assignment) {
		env[line.name] = line.expr;
	}

	// console.log(line.toString());
	if (line instanceof AST.Abstraction || line instanceof AST.Application) {
		console.log(normalize(line).toString());
	}
}

// ! INCORRECT
// (λf x.(λz.(λh.(h0 ((λh.(h0 (z1 f4))) f3)))))
// (λf x.(λz.(λh.(h0 (f3 (z0 f3))))))

// ! CORRECT
// (λf x.(λz.(λh.(h0 ((λh.(h0 (z2 f4))) f3)))))
// (λf x.(λz.(λh.(h0 (f3 (z1 f3))))))
