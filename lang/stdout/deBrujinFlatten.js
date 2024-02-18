import AST from "lang/core/ast";

const deBrujinFlatten = (node) => {
	if (node instanceof AST.Variable) {
		return String(node.idx);
	}

	if (node instanceof AST.Application) {
		return `(${deBrujinFlatten(node.leftExpr)} ${deBrujinFlatten(
			node.rightExpr,
		)})`;
	}

	if (node instanceof AST.Abstraction) {
		return `(λ${node.binders.map((_) => "_").join("")}.${deBrujinFlatten(
			node.expr,
		)})`;
	}
};

export default deBrujinFlatten;
