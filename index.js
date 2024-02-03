import Lexer from "./src/lexer.js";
import Parser from "./src/parser.js";
import { betaReduce, convertToDeBrujin, convertToNamed, injectEnv } from "./src/debrujin.js";
import { Assignment, Variable, Abstraction, Application } from "./src/ast.js";

let source = `
# Define some Church numerals!
0 = λs z.z
1 = λs z.s z
2 = λs z.s (s z)
3 = λs z.s (s (s z))

# Define boolean
T = λx y.x # you can use \\ or λ
F = λx y.y

# Define basic functions, like "not" and the successor
¬ = λx.x F T # use any symbol as a variable name!

S = (λw y x.y (w y x))

# Twilight supports functions of any complexity through De Brujin Indexing: Even this pair-based predecessor function implementation!

Φ = λp z.z (S (p T)) (p T) # more cool symbols!

P = λn.n Φ (λz.z 0 0) F

# Now, let's define a conditional...
Z = λn.n F ¬ F

# So we can write recursion
Y = (λy.(λx.y (x x)) (λx.y (x x)))

# Twilight employs Normal-Order evaluation, meaning that your recursive functions safely evaluate and exit!
R = λr n.Z n 1 (Z (P n) 1 ((r (P n)) S (r (P (P n)))))

# here's the fibonnaci!
fib = λn.Y R n

# and call...
fib 3
`;

const lexer = new Lexer(source.replaceAll(/\#.*/g, ""));
const parser = new Parser(lexer);
const ast = parser.parse();

let env = {
}

for (let line of ast) {
    if (line instanceof Assignment) {
        const deBrujinified = convertToDeBrujin(injectEnv(line.expression, env));
        const named = convertToNamed(deBrujinified);
        env[line.name] = named;
        console.log((new Assignment(line.name, named)).toString());
    }
    if (line instanceof Variable) {
        if (line.name in env) {
            console.log(env[line.name].toString())
        }
    }
    if (line instanceof Abstraction || line instanceof Application) {
        const deBrujinified = convertToDeBrujin(injectEnv(line, env));
        console.log(deBrujinified)
        const simplified = betaReduce(deBrujinified);
        const named = convertToNamed(simplified);
        console.log(named.toString());
    }
}