class Abstraction {
	constructor(binders, expression) {
		this.binders = binders;
		this.expression = expression;
	}

	toString() {
		return `(λ${this.binders.join(" ")}.${this.expression.toString()})`;
	}
}

class Application {
	constructor(leftExpression, rightExpression) {
		this.leftExpression = leftExpression;
		this.rightExpression = rightExpression;
	}

	toString() {
		return `(${this.leftExpression.toString()} ${this.rightExpression.toString()})`;
	}
}

class Variable {
	constructor(name) {
		this.name = name;
	}

	toString() {
		return String(this.name);
	}
}

class Assignment {
	constructor(name, expression) {
		this.name = name;
		this.expression = expression;
	}

	toString() {
		return `${this.name} = ${this.expression.toString()}`;
	}
}

export default { Abstraction, Application, Variable, Assignment };
