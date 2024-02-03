import { deepEqual } from "#src/util.js";
import DeBrujinAST from "./ast.js"

let shift = (node, i, cutoff) => {
    if (node instanceof DeBrujinAST.Variable) {
        if (node.value < cutoff) return new DeBrujinAST.Variable(node.value);
        else return new DeBrujinAST.Variable(node.value + i);
    }
    if (node instanceof DeBrujinAST.Abstraction) {
        return new DeBrujinAST.Abstraction(shift(node.expression, i, cutoff + 1))
    }
    if (node instanceof DeBrujinAST.Application) {
        return new DeBrujinAST.Application(shift(node.leftExpression, i, cutoff), shift(node.rightExpression, i, cutoff))
    }
}

let substitute = (node, e, m) => {
    if (node instanceof DeBrujinAST.Variable) {
        if (node.value === m) return e;
        else return new DeBrujinAST.Variable(node.value);
    }

    if (node instanceof DeBrujinAST.Abstraction) {
        return new DeBrujinAST.Abstraction(substitute(node.expression, shift(e, 1, 0), m + 1))
    }

    if (node instanceof DeBrujinAST.Application) {
        return new DeBrujinAST.Application(
            substitute(node.leftExpression, e, m),
            substitute(node.rightExpression, e, m)
        )
    }
}

let betaReduceOnce = (node) => {
    if (node instanceof DeBrujinAST.Application) {
        if (node.leftExpression instanceof DeBrujinAST.Abstraction) {
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
                return new DeBrujinAST.Application(reducedLeft, node.rightExpression);
            } else {
                return new DeBrujinAST.Application(node.leftExpression, betaReduceOnce(node.rightExpression));
            }
        }
    } else if (node instanceof DeBrujinAST.Abstraction) {
        return new DeBrujinAST.Abstraction(betaReduceOnce(node.expression));
    } else if (node instanceof DeBrujinAST.Variable) {
        return new DeBrujinAST.Variable(node.value);
    }
}

export let betaReduce = (node) => {
    let original = structuredClone(node);
    let reduced = betaReduceOnce(node);
    if (deepEqual(original, reduced)) {
        return reduced;
    } else {
        return betaReduce(reduced);
    }
}

export default betaReduce;