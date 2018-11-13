type Token = OperatorToken | NumberToken | EOFToken;

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

enum TokenKind {
  Operator,
  Number,
  EOF,
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
    console.log('consuming');
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
    left: Node,
    operator: MathOperator,
    right: Node
  ): BinaryExpression {
    console.log('creating binary expression');
    return {
      kind: NodeKind.BinaryExpression,
      left: left,
      operator: operator,
      right: right,
    };
  }

  function factor(): NumberLiteral {
    return makeNumberLiteral(consumeToken(TokenKind.Number) as NumberToken);
  }

  function term(): Node {
    console.log('term');
    let node: Node = factor();

    let token = currentToken();

    while (
      token.kind === TokenKind.Operator &&
      (token.value === '*' || token.value === '/')
    ) {
      console.log('term loop');
      const operator = consumeToken(TokenKind.Operator) as OperatorToken;
      node = makeBinaryExpression(node, operator.value, factor());
      token = currentToken();
    }

    return node;
  }

  function expr(): Node {
    console.log('expr');
    let node: Node = term();

    let token = currentToken();

    while (
      token.kind === TokenKind.Operator &&
      (token.value === '+' || token.value === '-')
    ) {
      console.log('expr loop');
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
  console.log(tokens);
  const ast = parser(tokens);
  console.log(ast);
  return evaluate(ast);
}
