import parse from "lang/core";
import AST, { type Expression } from "lang/core/ast";

export default {
	numerals: {
		dynamic: {
			"[0-9]+": (n: string) => {
				let body: Expression = new AST.Variable("z", 0);
				for (let i = 0; i < Number(n); i++) {
					body = new AST.Application(new AST.Variable("s", 1), body);
				}
				return new AST.Abstraction(["s"], new AST.Abstraction(["z"], body));
			},
		},
		patterns: [
			(node: Expression) => {
				if (!(node instanceof AST.Abstraction) || node.binders.length !== 2) {
					return { match: false };
				}
				let number = 0;
				let expr = node.expr;
				while (expr instanceof AST.Application) {
					if (
						!(expr.leftExpr instanceof AST.Variable && expr.leftExpr.idx === 1)
					)
						return { match: false };
					expr = expr.rightExpr;
					number++;
				}

				if (expr instanceof AST.Variable && expr.idx === 0) {
					return { match: true, value: String(number) };
				}
				return { match: false };
			},
		],
	},
	booleans: {
		static: {
			T: parse("\\x y.x"),
			F: parse("\\x y.y"),
		},
	},
};
