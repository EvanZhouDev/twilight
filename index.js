class Token {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

class NameToken extends Token {
  constructor(value) {
    super("NAME", value);
  }
}

class LambdaToken extends Token {
  constructor() {
    super("LAMBDA");
  }
}

class PeriodToken extends Token {
  constructor() {
    super("PERIOD");
  }
}

class LParenToken extends Token {
  constructor() {
    super("LPAREN");
  }
}

class RParenToken extends Token {
  constructor() {
    super("RPAREN");
  }
}

class EOFToken extends Token {
  constructor() {
    super("EOF");
  }
}

class Lexer {
  constructor(input) {
    this.input = input;
    this.pos = 0;
  }

  next() {
    while (this.pos < this.input.length && this.input[this.pos] === " ") {
      this.pos++;
    }

    if (this.pos >= this.input.length) {
      return new EOFToken();
    }

    const ch = this.input[this.pos++];

    if (/[a-z]/i.test(ch)) {
      let name = ch;
      while (
        this.pos < this.input.length &&
        /[a-z]/i.test(this.input[this.pos])
      ) {
        name += this.input[this.pos++];
      }
      return new NameToken(name);
    }

    switch (ch) {
      case "λ":
      case "\\":
        return new LambdaToken();
      case ".":
        return new PeriodToken();
      case "(":
        return new LParenToken();
      case ")":
        return new RParenToken();
      default:
        throw new Error(`Unexpected character: ${ch}`);
    }
  }
}

class ASTNode {
  constructor(type) {
    this.type = type;
  }
}

class LambdaNode extends ASTNode {
  constructor(binders, expr) {
    super("LAMBDA");
    this.binders = binders;
    this.expr = expr;
  }

  toString() {
    return `(λ${this.binders.join(" ")}.${this.expr.toString()})`;
  }
}

class AppNode extends ASTNode {
  constructor(func, arg) {
    super("APP");
    this.func = func;
    this.arg = arg;
  }

  toString() {
    return `(${this.func.toString()} ${this.arg.toString()})`;
  }
}

class VarNode extends ASTNode {
  constructor(name) {
    super("VAR");
    this.name = name;
  }

  toString() {
    return this.name.toString();
  }
}

class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.lookahead = this.lexer.next();
  }

  match(type) {
    if (this.lookahead.type === type) {
      this.lookahead = this.lexer.next();
    } else {
      throw new Error(`Unexpected token: ${this.lookahead.type}`);
    }
  }

  expr() {
    if (this.lookahead instanceof LambdaToken) {
      this.match("LAMBDA");
      const binders = this.binders();
      this.match("PERIOD");
      const expr = this.expr();
      return new LambdaNode(binders, expr);
    } else {
      return this.application();
    }
  }

  application() {
    let expr = this.simpleExpr();
    while (
      this.lookahead instanceof NameToken ||
      this.lookahead instanceof LParenToken
    ) {
      expr = new AppNode(expr, this.simpleExpr());
    }
    return expr;
  }

  simpleExpr() {
    if (this.lookahead instanceof NameToken) {
      const name = this.lookahead.value;
      this.match("NAME");
      return new VarNode(name);
    } else if (this.lookahead instanceof LParenToken) {
      this.match("LPAREN");
      const expr = this.expr();
      this.match("RPAREN");
      return expr;
    } else {
      throw new Error(`Unexpected token: ${this.lookahead.type}`);
    }
  }

  binders() {
    const binders = [];
    while (this.lookahead instanceof NameToken) {
      binders.push(this.lookahead.value);
      this.match("NAME");
    }
    return binders;
  }
}

class FreeVariables {
  visit(node) {
    if (node instanceof VarNode) {
      return new Set([node.name]);
    } else if (node instanceof AppNode) {
      return new Set([...this.visit(node.func), ...this.visit(node.arg)]);
    } else if (node instanceof LambdaNode) {
      const bodyFreeVars = this.visit(node.expr);
      console.log(bodyFreeVars);
      node.binders.forEach((binder) => {
        console.log(binder)
        bodyFreeVars.delete(binder);
      });
      console.log(bodyFreeVars)
      return bodyFreeVars;
    }
  }
}

class BoundVariables {
  visit(node) {
    if (node instanceof VarNode) {
      return new Set();
    } else if (node instanceof AppNode) {
      return new Set([...this.visit(node.func), ...this.visit(node.arg)]);
    } else if (node instanceof LambdaNode) {
      const bodyBoundVars = this.visit(node.expr);
      node.binders.forEach((binder) => bodyBoundVars.add(binder));
      return bodyBoundVars;
    }
  }
}

class AlphaConversion {
  constructor(toReplace, replacement) {
    this.toReplace = toReplace;
    this.replacement = replacement;
  }

  visit(node) {
    if (node instanceof VarNode) {
      return node.name === this.toReplace ? this.replacement : node;
    } else if (node instanceof AppNode) {
      return new AppNode(this.visit(node.func), this.visit(node.arg));
    } else if (node instanceof LambdaNode) {
      const newBinders = node.binders.map((binder) =>
        binder === this.toReplace ? this.replacement : binder,
      );
      return new LambdaNode(newBinders, this.visit(node.expr));
    }
  }
}

class BetaReduction {
  constructor() {
    this.reduced = false;
  }

  visit(node) {
    if (node instanceof VarNode) {
      return node;
    } else if (node instanceof AppNode) {
      if (node.func instanceof LambdaNode && !this.reduced) {
        this.reduced = true;
        const alphaConversion = new AlphaConversion(
          node.func.binders[0],
          node.arg,
        );
        return alphaConversion.visit(node.func.expr);
      } else {
        return new AppNode(this.visit(node.func), this.visit(node.arg));
      }
    } else if (node instanceof LambdaNode) {
      return new LambdaNode(node.binders, this.visit(node.expr));
    }
  }
}

// function toDeBruijn(node, context = []) {
//   if (node instanceof VarNode) {
//     const index = context.length - context.lastIndexOf(node.name);
//     return new VarNode(index);
//   } else if (node instanceof LambdaNode) {
//     const newContext = [...context, node.binders[0]];
//     const newExpr = toDeBruijn(node.expr, newContext);
//     return new LambdaNode(node.binders, newExpr);
//   } else if (node instanceof AppNode) {
//     const newFunc = toDeBruijn(node.func, context);
//     const newArg = toDeBruijn(node.arg, context);
//     return new AppNode(newFunc, newArg);
//   } else {
//     return node;
//   }
// }

// const source = "(λy.(λx.y (x x)) (λx.y (x x)))";
const source = "(λx. λy. x y) (\\x.x) (\\y.y)";

const lexer = new Lexer(source);
const parser = new Parser(lexer);
let ast = parser.expr();
console.log(JSON.stringify(ast, null, 2));

let freeVariables = new FreeVariables();
// console.log(JSON.stringify(freeVariables.visit(ast), null, 2));
console.log(JSON.stringify(ast, null, 2));

let reduced = false;
do {
  let betaReduction = new BetaReduction();
  ast = betaReduction.visit(ast);
  reduced = betaReduction.reduced;
  betaReduction.reduced = false; // Reset the flag
} while (reduced);

console.log(JSON.stringify(ast, null, 2));
