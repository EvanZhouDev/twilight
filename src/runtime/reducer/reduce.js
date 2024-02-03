import DeBrujinAST from "./deBrujin/ast.js";
import betaReduce from "./deBrujin/betaReduce.js";
import AST from "#parser/ast.js";

export function convertToDeBrujin(node) {
    let context = [];

    function convert(node) {
        if (node instanceof AST.Variable) {
            let index;
            if (context.includes(node.name)) {
                index = context.lastIndexOf(node.name);
            } else {
                throw new Error("Unbounded variable: " + node.name)
            }
            return new DeBrujinAST.Variable(context.length - index - 1);
        } else if (node instanceof AST.Abstraction) {
            let expr;
            if (node.binders.length > 1) {
                context.push(node.binders[0]);
                expr = convert(new AST.Abstraction(node.binders.slice(1), node.expression))
                context.pop()
            } else {
                context.push(node.binders[0]);
                expr = convert(node.expression);
                context.pop();
            }
            return new DeBrujinAST.Abstraction(expr);
        } else if (node instanceof AST.Application) {
            return new DeBrujinAST.Application(convert(node.leftExpression), convert(node.rightExpression));
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
        if (node instanceof DeBrujinAST.Variable) {
            if (!context[node.value]) {
                // Generate a unique name for the free variable and increment the counter
                return new AST.Variable("f" + variableNames[freeVariableCounter++]);
            }
            return new AST.Variable(structuredClone(context).reverse()[node.value]);
        } else if (node instanceof DeBrujinAST.Abstraction) {
            const newVar = variableNames[context.length % variableNames.length];
            context.push(newVar);
            const expr = convert(node.expression);
            context.pop();
            return new AST.Abstraction([newVar], expr);
        } else if (node instanceof DeBrujinAST.Application) {
            return new AST.Application(convert(node.leftExpression), convert(node.rightExpression));
        } else {
            throw new Error(`Unexpected node type: ${node}`);
        }
    }

    return convert(node);
}

let reduce = (namedAst) => {
    const deBrujinified = convertToDeBrujin(namedAst);
    const simplified = betaReduce(deBrujinified);
    const simplifiedNamed = convertToNamed(simplified);

    return simplifiedNamed;
}

export default reduce;