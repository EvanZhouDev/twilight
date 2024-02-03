import AST from "#parser/ast.js";
import { injectEnv } from "../util.js";
import reduce from "./reducer/reduce.js";
import preprocess from "./preprocess/index.js";
import { parseSource } from "#parser/index.js";

let run = (source) => {
    let [code, env] = preprocess(source);

    const ast = parseSource(code);

    for (let line of ast) {
        if (line instanceof AST.Assignment) {
            env.static[line.name] = injectEnv(line.expression, env);
        }
        if (line instanceof AST.Application && line.leftExpression instanceof AST.Variable && line.leftExpression.name === "import") {
            throw new Error("All imports must be declared at the top of the file.")
        }
        if (line instanceof AST.Abstraction || line instanceof AST.Application) {
            console.log(reduce(injectEnv(line, env)).toString())
        }
    }

    return env;
}

export default run;