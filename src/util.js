import AST from "#parser/ast.js";

export function deepEqual(x, y) {
	const ok = Object.keys;
	const tx = typeof x;
	const ty = typeof y;
	return x && y && tx === "object" && tx === ty
		? ok(x).length === ok(y).length &&
				ok(x).every((key) => deepEqual(x[key], y[key]))
		: x === y;
}

export function injectEnv(node, env) {
	if (node instanceof AST.Variable) {
		if (env.static[node.name]) {
			return env.static[node.name];
		}
		for (const regexKey in env.dynamic) {
			if (new RegExp(regexKey, "g").test(node.name)) {
				return env.dynamic[regexKey](node.name);
			}
		}
		return new AST.Variable(node.name);
	}
	if (node instanceof AST.Abstraction) {
		return new AST.Abstraction(node.binders, injectEnv(node.expression, env));
	}
	if (node instanceof AST.Application) {
		return new AST.Application(
			injectEnv(node.leftExpression, env),
			injectEnv(node.rightExpression, env),
		);
	}
	throw new Error(`Unexpected node type: ${node.constructor.name}`);
}