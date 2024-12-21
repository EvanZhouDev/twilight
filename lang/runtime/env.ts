import type { Expression } from "lang/core/ast";

export interface Environment {
	static: { [key: string]: Expression };
	dynamic: { [key: string]: (input: string) => Expression };
	varLookup: { [key: string]: string };
	patterns: ((expr: Expression) => string)[];
}
