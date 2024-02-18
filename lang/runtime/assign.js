import deBrujinFlatten from "lang/stdout/deBrujinFlatten";
export default (env, name, expr) => {
	env.static[name] = expr;
	if (!env.varLookup[deBrujinFlatten(expr)]) {
		env.varLookup[deBrujinFlatten(expr)] = [];
	}
	if (!env.varLookup[deBrujinFlatten(expr)].includes(name)) {
		env.varLookup[deBrujinFlatten(expr)].push(name);
	}
};
