import AST from "lang/core/ast";

const alphaSimilarity = (node1, node2) => {
	if (node1.constructor !== node2.constructor) {
		return false;
	}

	if (node1 instanceof AST.Variable) {
		return node1.idx === node2.idx;
	}

	if (node1 instanceof AST.Abstraction) {
		return (
			node1.binders.length === node2.binders.length &&
			alphaSimilarity(node1.expr, node2.expr)
		);
	}

	if (node1 instanceof AST.Application) {
		return (
			alphaSimilarity(node1.leftExpr, node2.leftExpr) &&
			alphaSimilarity(node1.rightExpr, node2.rightExpr)
		);
	}

	return false;
};

export default alphaSimilarity;
