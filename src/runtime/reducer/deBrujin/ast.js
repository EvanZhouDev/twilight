class Variable {
	constructor(value) {
		this.value = value;
	}
}

class Application {
	constructor(leftExpression, rightExpression) {
		this.leftExpression = leftExpression;
		this.rightExpression = rightExpression;
	}
}

class Abstraction {
	constructor(expression) {
		this.expression = expression;
	}
}

export default { Variable, Abstraction, Application };
