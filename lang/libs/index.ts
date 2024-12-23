import type { Expression } from "lang/core/ast";

export interface Module {
	static?: { [key: string]: Expression };
	dynamic?: { [key: string]: (input: string) => Expression };
	varLookup?: { [key: string]: string[] };
	patterns?: ((expr: Expression) => {
		match: boolean;
		value?: string;
	})[];
}

export interface Library {
	[lib: string]: Module;
}
