class Token {
  static LAMBDA = "lambda";
  static VAR = "var";
  static PERIOD = "period";
  static LPAREN = "lparen";
  static RPAREN = "rparen";
  static EOL = "eol";
  static EOF = "eof";
  static EQUALS = "equal";

  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

class Lexer {
  pos = 0;

  constructor(input) {
    this.input = input;
  }

  next() {
    while (this.pos < this.input.length && this.input[this.pos] === " ") {
      this.pos++;
    }

    if (this.pos >= this.input.length) {
      return new Token(Token.EOF);
    }

    const ch = this.input[this.pos++];

    if (ch === "\n") return new Token(Token.EOL);

    if (/[^\\\(\)\.λ\n=\ ]/i.test(ch)) {
      let name = ch;
      while (
        this.pos < this.input.length && /[^\\\(\)\.λ\n=\ ]/i.test(this.input[this.pos])
      ) {
        name += this.input[this.pos++];
      }
      return new Token(Token.VAR, name)
    }

    switch (ch) {
      case "λ":
      case "\\":
        return new Token(Token.LAMBDA);
      case ".":
        return new Token(Token.PERIOD);
      case "(":
        return new Token(Token.LPAREN);
      case ")":
        return new Token(Token.RPAREN);
      case "=":
        return new Token(Token.EQUALS);
      default:
        // Shouldn't happen
        throw new Error(`Unexpected character: ${ch}`);
    }
  }

  peek() {
    const savedPos = this.pos;
    const token = this.next();
    this.pos = savedPos;
    return token;
  }
}

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

  binders() {
    const binders = [];
    while (this.lookahead.type === Token.VAR) {
      binders.push(this.lookahead.value);
      this.match(Token.VAR);
    }
    return binders;
  }

  parse() {
    const expressions = [];
    while (this.lookahead.type !== Token.EOF) {
      if (this.lookahead.type === Token.EOL) {
        this.match(Token.EOL);
      } else if (this.lookahead.type === Token.VAR && this.lexer.peek().type === Token.EQUALS) {
        expressions.push(this.assignment());
      } else {
        expressions.push(this.expression());
      }
    }
    return expressions;
  }

  assignment() {
    const name = this.lookahead.value;
    this.match(Token.VAR);
    this.match(Token.EQUALS);
    const expr = this.expression();
    return new Assignment(name, expr);
  }

  expression() {
    if (this.lookahead.type === Token.LAMBDA) {
      this.match(Token.LAMBDA);

      const binders = this.binders();

      this.match(Token.PERIOD);

      const expr = this.expression();

      return new Abstraction(binders, expr);
    } else {
      return this.application();
    }
  }

  atom() {
    if (this.lookahead.type === Token.VAR) {
      const name = this.lookahead.value;
      this.match(Token.VAR);
      return new Variable(name);
    } else if (this.lookahead.type === Token.LPAREN) {
      this.match(Token.LPAREN);
      const expr = this.expression();
      this.match(Token.RPAREN);
      return expr;
    } else {
      throw new Error(`Unexpected token: ${this.lookahead.type}`);
    }
  }

  application() {
    let expression = this.atom();
    while (
      this.lookahead.type === Token.VAR ||
      this.lookahead.type === Token.LPAREN
    ) {
      expression = new Application(expression, this.atom());
    }
    return expression;
  }
}

class AlphaConversion {
  constructor(toReplace, replacement) {
    this.toReplace = toReplace;
    this.replacement = replacement;
  }

  visit(node) {
    if (node instanceof Variable) {
      return node.name === this.toReplace ? new Variable(this.replacement) : node;
    } else if (node instanceof Application) {
      return new Application(this.visit(node.leftExpression), this.visit(node.rightExpression));
    } else if (node instanceof Abstraction) {
      const newBinders = node.binders.map((binder) =>
        binder === this.toReplace ? this.replacement : binder,
      );
      return new Abstraction(newBinders, this.visit(node.expression));
    } else if (node instanceof Assignment) {
      return new Assignment(node.name, this.visit(node.expression));
    }
  }
}

let env = {
  I: (new Parser(new Lexer("(\\x.x)"))).parse()[0]
}

class BetaReduction {
  constructor() {
    this.reduced = false;
  }

  visit(node) {
    if (node instanceof Variable) {
      if (node.name in env) {
        console.log(node.name + " is in env")
        this.reduced = true;
        return env[node.name];
      }
      return node;
    } else if (node instanceof Application) {
      if (node.leftExpression instanceof Abstraction && !this.reduced) {
        this.reduced = true;
        if (node.leftExpression.binders.length === 1) {
          const alphaConversion = new AlphaConversion(
            node.leftExpression.binders[0],
            node.rightExpression,
          );
          return alphaConversion.visit(node.leftExpression.expression);
        } else {
          const alphaConversion = new AlphaConversion(
            node.leftExpression.binders[0],
            node.rightExpression,
          );
          return this.visit(new Abstraction(node.leftExpression.binders.slice(1), alphaConversion.visit(node.leftExpression.expression)))
        }
      } else {
        return new Application(this.visit(node.leftExpression), this.visit(node.rightExpression));
      }
    } else if (node instanceof Abstraction) {
      return new Abstraction(node.binders, this.visit(node.expression));
    } else if (node instanceof Assignment) {
      return new Assignment(node.name, this.visit(node.expression));
    }
  }
}

// const source = `
// (λn. λf. λx.n (λg.λh.h (g f)) (λu.x) (λu.u)) (\\s z.s (s z))
// `
const source = `
0 = (\\s z.z)
1 = (\\s z.s z)
2 = (\\s z.s (s z))
T = (\\c d.c)
F = (\\x y.y)
not = (\\a.(a F T))

not T
`

const lexer = new Lexer(source);
const parser = new Parser(lexer);
const ast = parser.parse();

for (let line of ast) {
  console.log(line)
  if (line instanceof Assignment) {
    let value = line.expression;
    while (true) {
      let betaReducer = new BetaReduction(value);
      value = betaReducer.visit(value)
      if (!betaReducer.reduced) break;
    }
    env[line.name] = value;
    console.log((new Assignment(line.name, value)).toString());
  }
  if (line instanceof Variable) {
    if (line.name in env) {
      console.log(env[line.name].toString())
    }
  }
  if (line instanceof Abstraction || line instanceof Application) {
    // let newLine = 
    while (true) {
      let betaReducer = new BetaReduction(JSON.parse(JSON.stringify(line)));
      // IMPROVE
      console.log(line.toString())
      line = betaReducer.visit(new Parser(new Lexer(line.toString())).parse()[0])
      if (!betaReducer.reduced) break;
    }
    console.log(line.toString())
  }
}
