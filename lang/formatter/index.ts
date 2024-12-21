import type { Expression } from "lang/core/ast";
import type { ColorName } from "chalk";

export interface Formatter {
	variable(name: string, idx: number): string;
	assignment(name: string, expr: Expression): string;
	abstraction(binders: string[], expr: Expression): string;
	application(leftExpr: Expression, rightExpr: Expression): string;
}

// The default AST formatter, to return a minimal but logically correct string
export class DefaultFormatter implements Formatter {
	variable(name: string, idx: number): string {
		return String(name);
	}

	assignment(name: string, expr: Expression): string {
		return `${name} -> ${expr.toString(this)}`;
	}

	abstraction(binders: string[], expr: Expression) {
		return `λ${binders.join(" ")}.${expr.toString(this)}`;
	}

	application(leftExpr: Expression, rightExpr: Expression) {
		const left = leftExpr.toString(this);
		const right = rightExpr.toString(this);

		switch (leftExpr.constructor) {
			// Applications are leftward binding, so if they occur as the left expression, they do not need parenthesis around the left expression
			// Variables simply do not need parenthesis to stand
			// Thus, both Applications and Variables share same logic
			case Application:
			case Variable:
				switch (rightExpr.constructor) {
					// Applications are leftward binding, so the right expression should be parenthesized so the left expression in the sub-application isn't first applied
					case Application:
					// For the sake of clarity and in some cases syntatical necessity, Abstractions are wrapped in parenthesis
					case Abstraction:
						return `${left} (${right})`;
					// Variables need not be parenthesized to be understood
					case Variable:
						return `${left} ${right}`;
					default:
						throw new Error(
							`Unexpected node type when formatting output: ${rightExpr.constructor}`
						);
				}
			// Abstractions must be parenthesized to prevent misunderstanding of the right expression being part of the abstraction
			case Abstraction:
				switch (rightExpr.constructor) {
					// Applications are leftward binding, so the right expression should be parenthesized so the left expression in the sub-application isn't first applied
					case Application:
					// For the sake of clarity and in some cases syntatical necessity, Abstractions are wrapped in parenthesis
					case Abstraction:
						return `(${left}) (${right})`;
					// Variables need not be parenthesized to be understood
					case Variable:
						return `(${left}) ${right}`;
					default:
						throw new Error(
							`Unexpected node type when formatting output: ${rightExpr.constructor}`
						);
				}
			default:
				throw new Error(
					`Unexpected node type when formatting output: ${leftExpr.constructor}`
				);
		}
	}
}

// Format into DeBruijn Form. This allows for Alpha Equivalence checking.
export class DeBruijnFormatter extends DefaultFormatter implements Formatter {
	variable(name: string, idx: number) {
		return String(idx);
	}

	abstraction(binders: string[], expr: Expression) {
		return `(λ${binders.map((_) => "_").join("")}.${expr.toString(this)})`;
	}

	application(leftExpr: Expression, rightExpr: Expression) {
		return `(${leftExpr.toString(this)} ${rightExpr.toString(this)})`;
	}
}

// The Twilight formatter, Default for Twilight and Twilight REPL. Extends the Default Formatter with colors!
import chalk from "chalk";
import { Application, Variable, Abstraction } from "lang/core/ast";

export class TwilightFormatter extends DefaultFormatter implements Formatter {
	static COLORS = ["green", "yellow", "blue", "magenta", "cyan"];

	private colorArr: ColorName[];
	private useColor: boolean;

	constructor() {
		super();
		this.colorArr = [];
		this.useColor = true;
	}

	variable(name: string, idx: number): string {
		if (!this.useColor) return String(name);
		return chalk[this.colorArr[idx]](name);
	}

	abstraction(binders: string[], expr: Expression): string {
		const binderColors = [];

		for (let i = 0; i < binders.length; i++) {
			binderColors.unshift(
				TwilightFormatter.COLORS[
					(this.colorArr.length + i) % TwilightFormatter.COLORS.length
				]
			);
		}

		this.colorArr = [...binderColors, ...this.colorArr];

		return `λ${binders
			.map((x, i) =>
				this.useColor ? chalk[binderColors[binderColors.length - i - 1]](x) : x
			)
			.join(" ")}.${expr.toString(this)}`;
	}
}
