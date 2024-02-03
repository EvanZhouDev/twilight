import AST from "#parser/ast.js";
import { parseLine } from "#parser/index.js";

export default {
    dynamic: {
        numerals: {
            "[0-9]+": (n) => {
                let body = new AST.Variable('z');
                for (let i = 0; i < n; i++) {
                    body = new AST.Application(new AST.Variable('s'), body);
                }
                return new AST.Abstraction('s', new AST.Abstraction('z', body));
            }
        },
    },
    static: {
        functions: {
            "S": parseLine("\\w y x.y (w y x)")
        },
        booleans: {
            "T": parseLine("\\x y.x"),
            "F": parseLine("\\x y.y")
        }
    }
}