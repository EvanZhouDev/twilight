import deBrujinFlatten from "lang/stdout/deBrujinFlatten";
export default (env, name, expr) => {
	env.static[name] = expr;
	if (!env.reverse[deBrujinFlatten(expr)]) {
		env.reverse[deBrujinFlatten(expr)] = [];
	}
	env.reverse[deBrujinFlatten(expr)].push(name);
};
