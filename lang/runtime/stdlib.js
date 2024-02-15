import parseLine from "lang/core";
import AST from "lang/core/ast";

export default {
	dynamic: {
		numerals: {
			"[0-9]+": (n) => {
				let body = new AST.Variable("z", 0);
				for (let i = 0; i < n; i++) {
					body = new AST.Application(new AST.Variable("s", 1), body);
				}
				return new AST.Abstraction(["s"], new AST.Abstraction(["z"], body));
			},
		},
	},
	static: {
		booleans: {
			T: parseLine("\\x y.x"),
			F: parseLine("\\x y.y"),
		},
	},
};
