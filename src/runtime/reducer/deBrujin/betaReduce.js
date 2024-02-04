import { deepEqual } from "#src/util.js";
import DeBrujinAST from "./ast.js";

const shift = (node, i, cutoff) => {
	if (node instanceof DeBrujinAST.Variable) {
		if (node.value < cutoff) return new DeBrujinAST.Variable(node.value);
		return new DeBrujinAST.Variable(node.value + i);
	}
	if (node instanceof DeBrujinAST.Abstraction) {
		return new DeBrujinAST.Abstraction(shift(node.expression, i, cutoff + 1));
	}
	if (node instanceof DeBrujinAST.Application) {
		return new DeBrujinAST.Application(
			shift(node.leftExpression, i, cutoff),
			shift(node.rightExpression, i, cutoff),
		);
	}
};

const substitute = (node, e, m) => {
	if (node instanceof DeBrujinAST.Variable) {
		if (node.value === m) return e;
		return new DeBrujinAST.Variable(node.value);
	}

	if (node instanceof DeBrujinAST.Abstraction) {
		return new DeBrujinAST.Abstraction(
			substitute(node.expression, shift(e, 1, 0), m + 1),
		);
	}

	if (node instanceof DeBrujinAST.Application) {
		return new DeBrujinAST.Application(
			substitute(node.leftExpression, e, m),
			substitute(node.rightExpression, e, m),
		);
	}
};

const betaReduceOnce = (node) => {
	if (node instanceof DeBrujinAST.Application) {
		if (node.leftExpression instanceof DeBrujinAST.Abstraction) {
			return shift(
				substitute(
					node.leftExpression.expression,
					shift(node.rightExpression, 1, 0),
					0,
				),
				-1,
				0,
			);
		}
		const reducedLeft = betaReduceOnce(node.leftExpression);
		if (!deepEqual(reducedLeft, node.leftExpression)) {
			return new DeBrujinAST.Application(reducedLeft, node.rightExpression);
		}
		return new DeBrujinAST.Application(
			node.leftExpression,
			betaReduceOnce(node.rightExpression),
		);
	}
	if (node instanceof DeBrujinAST.Abstraction) {
		return new DeBrujinAST.Abstraction(betaReduceOnce(node.expression));
	}
	if (node instanceof DeBrujinAST.Variable) {
		return new DeBrujinAST.Variable(node.value);
	}
};

export const betaReduce = (node) => {
	const original = structuredClone(node);
	const reduced = betaReduceOnce(node);
	if (deepEqual(original, reduced)) {
		return reduced;
	}
	return betaReduce(reduced);
};

export default betaReduce;
