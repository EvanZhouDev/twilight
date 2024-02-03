import Lexer from "./src/lexer.js";
import Parser from "./src/parser.js";
import { betaReduce, convertToDeBrujin, convertToNamed, injectEnv } from "./src/debrujin.js";
import { Assignment, Variable, Abstraction, Application } from "./src/ast.js";
import fs from "fs";


// # Define some Church numerals!
// 0 = λs z.z
// 1 = λs z.s z
// 2 = λs z.s (s z)
// 3 = λs z.s (s (s z))

// import test


let source = `
import booleans
import numerals
# import numerals booleans

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
fib 5
`;

let generateAST = (source) => {
    const lexer = new Lexer(source.replaceAll(/\#.*/g, ""));
    const parser = new Parser(lexer);
    const ast = parser.parse();
    return ast;
}

let stdlib = {
    dynamic: {
        numerals: {
            "[0-9]+": (n) => {
                let body = new Variable('z');
                for (let i = 0; i < n; i++) {
                    body = new Application(new Variable('s'), body);
                }
                return new Abstraction('s', new Abstraction('z', body));
            }
        },
    },
    static: {
        functions: {
            "S": generateAST("\\w y x.y (w y x)")[0]
        },
        booleans: {
            "T": generateAST("\\x y.x")[0],
            "F": generateAST("\\x y.y")[0]
        }
    }
}

let env = {
    dynamic: {

    },
    static: {

    }
}

while (true) {
    let line = source.split("\n")[0];
    if (line.trim() === "" || line.trim().split(" ")[0] === "import") {
        for (let importFile of line.split(" ").slice(1)) {
            if (importFile.split(".").at(-1) === "twl") {
                // if (fs.readFileSync())
                // TODO: Handle file imports
                console.log("FILE", importFile)
            } else {
                if (stdlib.dynamic[importFile]) {
                    for (const [key, value] of Object.entries(stdlib.dynamic[importFile])) {
                        env.dynamic[key] = value;
                    }
                } else if (stdlib.static[importFile]) {
                    for (const [key, value] of Object.entries(stdlib.static[importFile])) {
                        env.static[key] = value;
                    }
                } else {
                    throw new Error(`No import ${importFile} found in standard library.`)
                }
                console.log("STDLIB", importFile)
            }
        }
        source = source.split("\n").slice(1).join("\n")
    } else {
        break;
    }
}

const lexer = new Lexer(source.replaceAll(/\#.*/g, ""));
const parser = new Parser(lexer);
const ast = parser.parse();



for (let line of ast) {
    if (line instanceof Assignment) {
        const deBrujinified = convertToDeBrujin(injectEnv(line.expression, env));
        const named = convertToNamed(deBrujinified);
        env.static[line.name] = named;
        // console.log((new Assignment(line.name, named)).toString());
    }
    if (line instanceof Application && line.leftExpression instanceof Variable && line.leftExpression.name === "import") {
        throw new Error("All imports must be declared at the top of the file.")
    }
    if (line instanceof Abstraction || line instanceof Application) {
        const deBrujinified = convertToDeBrujin(injectEnv(line, env));
        // console.log(deBrujinified)
        const simplified = betaReduce(deBrujinified);
        const named = convertToNamed(simplified);
        console.log(named.toString());
    }
}