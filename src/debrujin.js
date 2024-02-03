import { deepEqual } from "./util.js";
import { Abstraction, Application, Variable } from "./ast.js"

class DeBrujinVariable {
    constructor(value) {
        this.value = value;
    }
}

class DeBrujinApplication {
    constructor(leftExpression, rightExpression) {
        this.leftExpression = leftExpression;
        this.rightExpression = rightExpression;
    }
}

class DeBrujinAbstraction {
    constructor(expression) {
        this.expression = expression;
    }
}

let shift = (node, i, cutoff) => {
    if (node instanceof DeBrujinVariable) {
        if (node.value < cutoff) return new DeBrujinVariable(node.value);
        else return new DeBrujinVariable(node.value + i);
    }
    if (node instanceof DeBrujinAbstraction) {
        return new DeBrujinAbstraction(shift(node.expression, i, cutoff + 1))
    }
    if (node instanceof DeBrujinApplication) {
        return new DeBrujinApplication(shift(node.leftExpression, i, cutoff), shift(node.rightExpression, i, cutoff))
    }
}

let substitute = (node, e, m) => {
    if (node instanceof DeBrujinVariable) {
        if (node.value === m) return e;
        else return new DeBrujinVariable(node.value);
    }

    if (node instanceof DeBrujinAbstraction) {
        return new DeBrujinAbstraction(substitute(node.expression, shift(e, 1, 0), m + 1))
    }

    if (node instanceof DeBrujinApplication) {
        return new DeBrujinApplication(
            substitute(node.leftExpression, e, m),
            substitute(node.rightExpression, e, m)
        )
    }
}

let betaReduceOnce = (node) => {
    if (node instanceof DeBrujinApplication) {
        if (node.leftExpression instanceof DeBrujinAbstraction) {
            return shift(
                substitute(
                    node.leftExpression.expression,
                    shift(node.rightExpression, 1, 0),
                    0
                ),
                -1,
                0
            );
        } else {
            let reducedLeft = betaReduceOnce(node.leftExpression);
            if (!deepEqual(reducedLeft, node.leftExpression)) {
                return new DeBrujinApplication(reducedLeft, node.rightExpression);
            } else {
                return new DeBrujinApplication(node.leftExpression, betaReduceOnce(node.rightExpression));
            }
        }
    } else if (node instanceof DeBrujinAbstraction) {
        return new DeBrujinAbstraction(betaReduceOnce(node.expression));
    } else if (node instanceof DeBrujinVariable) {
        return new DeBrujinVariable(node.value);
    }
}

export let betaReduce = (node) => {
    // console.log(JSON.stringify(node, null, 2))

    let original = structuredClone(node);
    let reduced = betaReduceOnce(node);
    if (deepEqual(original, reduced)) {
        return reduced;
    } else {
        return betaReduce(reduced);
    }
}

export function injectEnv(node, env) {
    if (node instanceof Variable) {
        if (env.static[node.name]) {
            return env.static[node.name];
        } else {
            for (let regexKey in env.dynamic) {
                if (new RegExp(regexKey, 'g').test(node.name)) {
                    return env.dynamic[regexKey](node.name)
                }
            }
            // check each env
            return new Variable(node.name);
        }
    } else if (node instanceof Abstraction) {
        // ensure that the env variables aren't in binders
        return new Abstraction(node.binders, injectEnv(node.expression, env));
    } else if (node instanceof Application) {
        return new Application(injectEnv(node.leftExpression, env), injectEnv(node.rightExpression, env));
    } else {
        throw new Error(`Unexpected node type: ${node.constructor.name}`);
    }
}

export function convertToDeBrujin(node) {
    let context = [];

    function convert(node) {
        if (node instanceof Variable) {
            let index;
            if (context.includes(node.name)) {
                index = context.lastIndexOf(node.name);
            } else {
                throw new Error("Unbounded variable: " + node.name)
            }
            return new DeBrujinVariable(context.length - index - 1);
        } else if (node instanceof Abstraction) {
            let expr;
            if (node.binders.length > 1) {
                context.push(node.binders[0]);
                expr = convert(new Abstraction(node.binders.slice(1), node.expression))
                context.pop()
            } else {
                context.push(node.binders[0]);
                expr = convert(node.expression);
                context.pop();
            }
            return new DeBrujinAbstraction(expr);
        } else if (node instanceof Application) {
            return new DeBrujinApplication(convert(node.leftExpression), convert(node.rightExpression));
        } else {
            throw new Error(`Unexpected node type: ${node.constructor.name}`);
        }
    }

    return convert(node);
}

export function convertToNamed(node) {
    let context = [];
    let freeVariableCounter = 0;
    const variableNames = ["x", "y", "z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w"];

    function convert(node) {
        if (node instanceof DeBrujinVariable) {
            if (!context[node.value]) {
                // Generate a unique name for the free variable and increment the counter
                return new Variable("f" + variableNames[freeVariableCounter++]);
            }
            return new Variable(structuredClone(context).reverse()[node.value]);
        } else if (node instanceof DeBrujinAbstraction) {
            const newVar = variableNames[context.length % variableNames.length];
            context.push(newVar);
            const expr = convert(node.expression);
            context.pop();
            return new Abstraction([newVar], expr);
        } else if (node instanceof DeBrujinApplication) {
            return new Application(convert(node.leftExpression), convert(node.rightExpression));
        } else {
            throw new Error(`Unexpected node type: ${node.constructor.name}`);
        }
    }

    return convert(node);
}