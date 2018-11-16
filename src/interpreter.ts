type Token = OperatorToken | NumberToken | EOFToken | PrecedenceToken;

const OperatorsValueEnum = {
  '+': '+',
  '-': '-',
  '*': '*',
  '/': '/',
};

type MathOperator = keyof typeof OperatorsValueEnum;

type OperatorToken = {
  kind: TokenKind.Operator;
  value: MathOperator;
};

type NumberToken = {
  kind: TokenKind.Number;
  value: string;
};

type EOFToken = {
  kind: TokenKind.EOF;
};

type PrecedenceToken = {
  kind: TokenKind.Precedence;
  value: string;
};

enum TokenKind {
  Operator,
  Number,
  EOF,
  Precedence,
}

type Node = NumberLiteral | BinaryExpression;

enum NodeKind {
  NumberLiteral,
  BinaryExpression,
}

type NumberLiteral = {
  kind: NodeKind.NumberLiteral;
  value: number;
};

type BinaryExpression = {
  kind: NodeKind.BinaryExpression;
  left: NumberLiteral | BinaryExpression;
  right: NumberLiteral | BinaryExpression;
  operator: MathOperator;
};

const isSupportedMathOperator = (char: any): char is MathOperator =>
  Object.keys(OperatorsValueEnum).indexOf(char) >= 0;

function tokenizer(input: string): Token[] {
  let current = 0;

  const tokens: Token[] = [];

  while (current < input.length) {
    let char = input[current];

    if (isSupportedMathOperator(char)) {
      tokens.push({
        kind: TokenKind.Operator,
        value: char,
      });
      current++;
      continue;
    }

    let NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      let value = '';

      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({ kind: TokenKind.Number, value });
      continue;
    }

    let PRECEDENCE = /\(|\)/;
    if (PRECEDENCE.test(char)) {
      tokens.push({ kind: TokenKind.Precedence, value: char });
      current++;
      continue;
    }

    throw new Error('Unkown character: ' + char);
  }

  tokens.push({ kind: TokenKind.EOF });

  return tokens;
}

function parser(tokens: Token[]): Node {
  let i = 0;

  function currentToken(): Token {
    return tokens[i];
  }

  function consumeToken(kind: TokenKind): Token {
    const token = tokens[i];
    if (token.kind !== kind) {
      throw new Error(`Unexpected token: ${token}`);
    }
    i++;
    return token;
  }

  function makeNumberLiteral(token: NumberToken): NumberLiteral {
    return {
      kind: NodeKind.NumberLiteral,
      value: parseInt(token.value),
    };
  }

  function makeBinaryExpression(
    left: NumberLiteral | BinaryExpression,
    operator: MathOperator,
    right: NumberLiteral | BinaryExpression
  ): BinaryExpression {
    return {
      kind: NodeKind.BinaryExpression,
      left: left,
      operator: operator,
      right: right,
    };
  }

  function factor(): NumberLiteral | BinaryExpression {
    let token = currentToken();
    if (token.kind === TokenKind.Number) {
      return makeNumberLiteral(consumeToken(TokenKind.Number) as NumberToken);
    } else if (token.kind === TokenKind.Precedence && token.value === '(') {
      consumeToken(TokenKind.Precedence) as PrecedenceToken;
    }
    let node = expr();
    consumeToken(TokenKind.Precedence) as PrecedenceToken;
    return node;
  }

  function term(): NumberLiteral | BinaryExpression {
    let node: NumberLiteral | BinaryExpression = factor();

    let token = currentToken();

    while (
      token.kind === TokenKind.Operator &&
      (token.value === '*' || token.value === '/')
    ) {
      const operator = consumeToken(TokenKind.Operator) as OperatorToken;
      node = makeBinaryExpression(node, operator.value, factor());
      token = currentToken();
    }

    return node;
  }

  function expr(): NumberLiteral | BinaryExpression {
    let node: NumberLiteral | BinaryExpression = term();

    let token = currentToken();

    while (
      token.kind === TokenKind.Operator &&
      (token.value === '+' || token.value === '-')
    ) {
      const operator = consumeToken(TokenKind.Operator) as OperatorToken;
      node = makeBinaryExpression(node, operator.value, term());
      token = currentToken();
    }

    return node;
  }

  return expr();
}

function evaluate(ast: Node): string {
  function visit(node: NumberLiteral | BinaryExpression) {
    switch (node.kind) {
      case NodeKind.BinaryExpression:
        return visitBinaryExpression(node);
      case NodeKind.NumberLiteral:
        return visitNumberLiteral(node);
      default:
        throw new Error(`Unexpected node kind: ${node}`);
    }
  }

  function visitBinaryExpression(node: BinaryExpression) {
    switch (node.operator) {
      case '+':
        return visit(node.left) + visit(node.right);
      case '-':
        return visit(node.left) - visit(node.right);
      case '*':
        return visit(node.left) * visit(node.right);
      case '/':
        return visit(node.left) / visit(node.right);
    }
  }

  function visitNumberLiteral(node: NumberLiteral) {
    return node.value;
  }

  return visit(ast);
}

export { tokenizer, parser };

export default function(input: string): string {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  console.log(ast);
  return evaluate(ast);
}
