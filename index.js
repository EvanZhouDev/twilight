import fs from "fs";
import run from "#src/runtime/index.js";
import { parseError } from "#log/error.js";

try {
	run(`
0 = \\s z.z
1 = \\s z.s z
2 = \\s z.s (s z)
3 = \\s z.s (s (s z))
4 = \\s z.s (s (s (s z)))
5 = \\s z.s (s (s (s (s z))))

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
`, "/");
} catch (e) {
	console.log(parseError(e.toString().slice(7) /* removes "Error: " */));
}
