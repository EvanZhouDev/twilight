import AST from "lang/core/ast";
import chalk from "chalk";

const colors = ["green", "yellow", "blue", "magenta", "cyan"];

const format = (node, colorArr = [], useColor = true) => {
	// All parenthesizing is done inside the Application logic, to reduce amount of parenthesis that are used so that it's understandable (and syntatically correct) but concise
	if (node instanceof AST.Application) {
		const right = format(node.rightExpr, [...colorArr], useColor);

		const left = format(node.leftExpr, [...colorArr], useColor);

		switch (node.leftExpr.constructor) {
			// Applications are leftward binding, so if they occur as the left expression, they do not need parenthesis around the left expression
			case AST.Application:
			// Variables simply do not need parenthesis to stand
			case AST.Variable:
				switch (node.rightExpr.constructor) {
					// Applications are leftward binding, so the right expression should be parenthesized so the left expression in the sub-application isn't first applied
					case AST.Application:
					// For the sake of clarity and in some cases syntatical necessity, Abstractions are wrapped in parenthesis
					case AST.Abstraction:
						return `${left} (${right})`;
					// Variables need not be parenthesized to be understood
					case AST.Variable:
						return `${left} ${right}`;
					default:
						throw new Error(
							`Unexpected node type when formatting output: ${node.rightExpr.constructor}`,
						);
				}
			// Abstractions must be parenthesized to prevent misunderstanding of the right expression being part of the abstraction
			case AST.Abstraction:
				switch (node.rightExpr.constructor) {
					// Applications are leftward binding, so the right expression should be parenthesized so the left expression in the sub-application isn't first applied
					case AST.Application:
					// For the sake of clarity and in some cases syntatical necessity, Abstractions are wrapped in parenthesis
					case AST.Abstraction:
						return `(${left}) (${right})`;
					// Variables need not be parenthesized to be understood
					case AST.Variable:
						return `(${left}) ${right}`;
					default:
						throw new Error(
							`Unexpected node type when formatting output: ${node.rightExpr.constructor}`,
						);
				}
			default:
				throw new Error(
					`Unexpected node type when formatting output: ${node.leftExpr.constructor}`,
				);
		}
	}

	if (node instanceof AST.Variable) {
		if (!useColor) return String(node.name);
		return chalk[colorArr[node.idx]](node.name);
	}

	if (node instanceof AST.Assignment) {
		return `${node.name} -> ${format(node.expr, [...colorArr], useColor)}`;
	}

	if (node instanceof AST.Abstraction) {
		const binderColors = [];

		for (let i = 0; i < node.binders.length; i++) {
			binderColors.unshift(colors[(colorArr.length + i) % colors.length]);
		}

		const expr = format(node.expr, [...binderColors, ...colorArr], useColor);

		return `λ${node.binders
			.map((x, i) =>
				useColor ? chalk[binderColors[binderColors.length - i - 1]](x) : x,
			)
			.join(" ")}.${expr}`;
	}
};

export default format;
