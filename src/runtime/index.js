import AST from "#parser/ast.js";
import { parseSource } from "#parser/index.js";
import { injectEnv } from "../util.js";
import preprocess from "./preprocess/index.js";
import reduce from "./reducer/reduce.js";

const run = (source, directory) => {
	const [code, env] = preprocess(source, directory);

	const ast = parseSource(code);

	for (const line of ast) {
		if (line instanceof AST.Assignment) {
			env.static[line.name] = injectEnv(line.expression, env);
		}
		if (
			line instanceof AST.Application &&
			line.leftExpression instanceof AST.Variable &&
			line.leftExpression.name === "import"
		) {
			throw new Error("All imports must be declared at the top of the file.");
		}
		if (line instanceof AST.Abstraction || line instanceof AST.Application) {
			console.log(reduce(injectEnv(line, env)).toString());
		}
	}

	return env;
};

export default run;
