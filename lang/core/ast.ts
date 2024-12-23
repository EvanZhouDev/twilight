import { DefaultFormatter } from "lang/formatter";
import type { Formatter } from "lang/formatter";

export type Expression = Abstraction | Application | Variable | Assignment;

export class Abstraction {
	public binders: string[];
	public expr: Expression;

	constructor(binders: string[], expr: Expression) {
		this.binders = binders;
		this.expr = expr;
	}

	toString(formatter: Formatter = new DefaultFormatter()): string {
		return formatter.abstraction(this.binders, this.expr);
	}
}

export class Application {
	public leftExpr: Expression;
	public rightExpr: Expression;

	constructor(leftExpr: Expression, rightExpr: Expression) {
		this.leftExpr = leftExpr;
		this.rightExpr = rightExpr;
	}

	toString(formatter: Formatter = new DefaultFormatter()): string {
		return formatter.application(this.leftExpr, this.rightExpr);
	}
}

export class Variable {
	public name: string;
	public idx: number;

	constructor(name: string, idx: number) {
		this.name = name;
		this.idx = idx;
	}

	toString(formatter: Formatter = new DefaultFormatter()): string {
		return formatter.variable(this.name, this.idx);
	}
}

export class Assignment {
	public name: string;
	public expr: Expression;
	constructor(name: string, expr: Expression) {
		this.name = name;
		this.expr = expr;
	}

	toString(formatter: Formatter = new DefaultFormatter()): string {
		return formatter.assignment(this.name, this.expr);
	}
}

export default { Assignment, Variable, Application, Abstraction };
