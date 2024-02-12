class Abstraction {
	constructor(binders, expr) {
		this.binders = binders;
		this.expr = expr;
	}

	toString() {
		return `(λ${this.binders.join(" ")}.${this.expr.toString()})`;
	}
}

class Application {
	constructor(leftExpr, rightExpr) {
		this.leftExpr = leftExpr;
		this.rightExpr = rightExpr;
	}

	toString() {
		return `(${this.leftExpr.toString()} ${this.rightExpr.toString()})`;
	}
}

class Variable {
	constructor(name, idx) {
		this.name = name;
		this.idx = idx;
	}

	toString() {
		return String(String(this.name) + this.idx);
	}
}

class Assignment {
	constructor(name, expr) {
		this.name = name;
		this.expr = expr;
	}

	toString() {
		return `${this.name} = ${this.expr.toString()}`;
	}
}

export default { Abstraction, Application, Variable, Assignment };
