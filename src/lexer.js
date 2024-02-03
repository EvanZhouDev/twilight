import Token from "./token.js";

export default class Lexer {
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
