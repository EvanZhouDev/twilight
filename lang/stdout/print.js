import format from "./format";
import deBrujinFlatten from "./deBrujinFlatten";
import parseLine from "lang/core";
import AST from "lang/core/ast";

const isChurchNumeral = (node) => {
	if (!(node instanceof AST.Abstraction) || node.binders.length !== 2) {
		return { isNumeral: false };
	}
	let number = 0;
	let expr = node.expr;
	while (expr instanceof AST.Application) {
		if (!(expr.leftExpr instanceof AST.Variable && expr.leftExpr.idx === 1))
			return { isNumeral: false };
		expr = expr.rightExpr;
		number++;
	}

	if (expr instanceof AST.Variable && expr.idx === 0) {
		return { isNumeral: true, numeral: number };
	}
	return { isNumeral: false };
};

export default (node, env, useColor = true) => {
	let result = format(node, [], useColor);
	if (env[deBrujinFlatten(node)]) {
		result += ` ≡ ${env[deBrujinFlatten(node)].join(" ≡ ")}`;
	}
	if (isChurchNumeral(node).isNumeral) {
		result += ` ≡ ${isChurchNumeral(node).numeral}`;
	}
	return result;
};
