import deepEqual from "util/deepEqual";
import AST from "lang/core/ast";

const shift = (node, i, cutoff) => {
	if (node instanceof AST.Variable) {
		if (node.idx < cutoff) return new AST.Variable(node.name, node.idx);
		return new AST.Variable(node.name, node.idx + i);
	}
	if (node instanceof AST.Abstraction) {
		return new AST.Abstraction(
			node.binders,
			shift(node.expr, i, cutoff + node.binders.length),
		);
	}
	if (node instanceof AST.Application) {
		return new AST.Application(
			shift(node.leftExpr, i, cutoff),
			shift(node.rightExpr, i, cutoff),
		);
	}
};

const substitute = (node, e, m) => {
	// console.log("SUB", node, e, m);
	if (node instanceof AST.Variable) {
		if (node.idx === m) return e;
		return new AST.Variable(node.name, node.idx);
	}

	if (node instanceof AST.Abstraction) {
		return new AST.Abstraction(
			node.binders,
			substitute(
				node.expr,
				shift(e, node.binders.length, node.binders.length - 1),
				m + node.binders.length,
			),
		);
	}

	if (node instanceof AST.Application) {
		return new AST.Application(
			substitute(node.leftExpr, e, m),
			substitute(node.rightExpr, e, m),
		);
	}
};

// An iterative approach to beta reduction in the DeBrujin indexed Lambda Calculus for Abstractions with multiple binders

const betaReduce = (node) => {
	if (node instanceof AST.Application) {
		if (node.leftExpr instanceof AST.Abstraction) {
			const n = node.leftExpr.binders.length;

			if (node.leftExpr.binders.length > 1) {
				return new AST.Abstraction(
					node.leftExpr.binders.slice(1),
					shift(
						substitute(node.leftExpr.expr, shift(node.rightExpr, n, 0), n - 1),
						-1,
						n - 1,
					),
				);
			}

			return shift(
				substitute(node.leftExpr.expr, shift(node.rightExpr, 1, 0), 0),
				-1,
				0,
			);
		}

		const reducedLeft = betaReduce(node.leftExpr);
		if (!deepEqual(reducedLeft, node.leftExpr)) {
			return new AST.Application(reducedLeft, node.rightExpr);
		}

		return new AST.Application(node.leftExpr, betaReduce(node.rightExpr));
	}
	if (node instanceof AST.Abstraction) {
		return new AST.Abstraction(node.binders, betaReduce(node.expr));
	}
	if (node instanceof AST.Variable) {
		return new AST.Variable(node.name, node.idx);
	}
};

const normalize = (node) => {
	const original = structuredClone(node);
	const reduced = betaReduce(node);

	if (deepEqual(original, reduced)) {
		return reduced;
	}
	return normalize(reduced);
};

const collapseAbstractions = (node) => {
	if (node instanceof AST.Abstraction) {
		let expr = node.expr;
		let binders = [...node.binders];

		while (expr instanceof AST.Abstraction) {
			binders = [...binders, ...expr.binders];
			expr = expr.expr;
		}

		return new AST.Abstraction(binders, expr);
	}

	if (node instanceof AST.Application) {
		return new AST.Application(
			collapseAbstractions(node.leftExpr),
			collapseAbstractions(node.rightExpr),
		);
	}

	if (node instanceof AST.Variable) {
		return new AST.Variable(node.name, node.idx);
	}
};

const simplify = (node) => {
	const normal = normalize(node);
	const collapsed = collapseAbstractions(normal);

	return collapsed;
};

export default simplify;
