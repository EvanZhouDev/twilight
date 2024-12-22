import type { Expression } from "lang/core/ast";
import type { Module } from "lang/libs";
import { DeBruijnFormatter } from "lang/formatter";
export class Environment {
	public static: { [key: string]: Expression };
	public dynamic: { [key: string]: (input: string) => Expression };
	public varLookup: { [key: string]: string[] };
	public patterns: ((expr: Expression) => {
		match: boolean;
		value?: string;
	})[];
	public includedLibraries: string[];

	constructor() {
		this.static = {};
		this.dynamic = {};
		this.varLookup = {};
		this.patterns = [];
		this.includedLibraries = [];
	}

	addStatic(name: string, expr: Expression): Environment {
		this.static[name] = expr;

		const deBrujinValue = expr.toString(new DeBruijnFormatter());

		if (!this.varLookup[deBrujinValue]) {
			this.varLookup[deBrujinValue] = [];
		}
		if (!this.varLookup[deBrujinValue].includes(name)) {
			this.varLookup[deBrujinValue].push(name);
		}

		return this;
	}

	merge(env: Environment | Module): Environment {
		this.static = { ...this.static, ...env.static };

		for (const key in env.static) {
			this.addStatic(key, env.static[key]);
		}

		this.dynamic = { ...this.dynamic, ...env.dynamic };
		if (env.patterns) {
			this.patterns = [...this.patterns, ...env.patterns];
		}

		if (env instanceof Environment) {
			this.includedLibraries = [
				...this.includedLibraries,
				...env.includedLibraries,
			];
		}

		return this;
	}
}
