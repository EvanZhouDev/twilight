class Token {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

class NameToken extends Token {
  constructor(value) {
    super('NAME', value);
  }
}

class LambdaToken extends Token {
  constructor() {
    super('LAMBDA');
  }
}

class PeriodToken extends Token {
  constructor() {
    super('PERIOD');
  }
}

class LParenToken extends Token {
  constructor() {
    super('LPAREN');
  }
}

class RParenToken extends Token {
  constructor() {
    super('RPAREN');
  }
}

class EOFToken extends Token {
  constructor() {
    super('EOF');
  }
}

class Lexer {
  constructor(input) {
    this.input = input;
    this.pos = 0;
  }

  next() {
    while (this.pos < this.input.length && this.input[this.pos] === ' ') {
      this.pos++;
    }

    if (this.pos >= this.input.length) {
      return new EOFToken();
    }

    const ch = this.input[this.pos++];

    if (/[a-z]/i.test(ch)) {
      let name = ch;
      while (this.pos < this.input.length && /[a-z]/i.test(this.input[this.pos])) {
        name += this.input[this.pos++];
      }
      return new NameToken(name);
    }

    switch (ch) {
      case '\\':
        return new LambdaToken();
      case '.':
        return new PeriodToken();
      case '(':
        return new LParenToken();
      case ')':
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
    super('LAMBDA');
    this.binders = binders;
    this.expr = expr;
  }
}

class AppNode extends ASTNode {
  constructor(func, arg) {
    super('APP');
    this.func = func;
    this.arg = arg;
  }
}

class VarNode extends ASTNode {
  constructor(name) {
    super('VAR');
    this.name = name;
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
      this.match('LAMBDA');
      const binders = this.binders();
      this.match('PERIOD');
      const expr = this.expr();
      return new LambdaNode(binders, expr);
    } else {
      return this.app_expr();
    }
  }

  app_expr() {
    let expr = this.simple_expr();
    while (this.lookahead instanceof NameToken || this.lookahead instanceof LParenToken) {
      expr = new AppNode(expr, this.simple_expr());
    }
    return expr;
  }

  simple_expr() {
    if (this.lookahead instanceof NameToken) {
      const name = this.lookahead.value;
      this.match('NAME');
      return new VarNode(name);
    } else if (this.lookahead instanceof LParenToken) {
      this.match('LPAREN');
      const expr = this.expr();
      this.match('RPAREN');
      return expr;
    } else {
      throw new Error(`Unexpected token: ${this.lookahead.type}`);
    }
  }

  binders() {
    const binders = [];
    while (this.lookahead instanceof NameToken) {
      binders.push(this.lookahead.value);
      this.match('NAME');
    }
    return binders;
  }
}