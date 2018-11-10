type Token = OperatorToken | NumberToken;

type OperatorToken = {
  kind: TokenKind.Operator;
  value: string;
};

type NumberToken = {
  kind: TokenKind.Number;
  value: string;
};

enum TokenKind {
  Operator,
  Number,
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
  left: NumberLiteral;
  right: NumberLiteral;
  operator: string;
};

const supportedOperators = ['+', '-', '*', '/'];

function tokenizer(input: string): Token[] {
  let current = 0;

  const tokens: Token[] = [];

  while (current < input.length) {
    let char = input[current];

    if(supportedOperators.indexOf(char) >= 0) {
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

  return tokens;
}

function parser(tokens: Token[]): Node {
  let i = 0;
  function consumeToken(kind: TokenKind): Token {
    const token = tokens[i];
    if (token.kind !== kind) {
      throw new Error(`Unexpected token : ${token}`);
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

  const left = consumeToken(TokenKind.Number) as NumberToken;
  const operator = consumeToken(TokenKind.Operator) as OperatorToken;
  const right = consumeToken(TokenKind.Number) as NumberToken;

  return {
    kind: NodeKind.BinaryExpression,
    left: makeNumberLiteral(left),
    operator: operator.value,
    right: makeNumberLiteral(right),
  };
}

function evaluate(ast: Node): string {
  if (ast.kind !== NodeKind.BinaryExpression) {
    throw new Error(`Invalid ast node: ${ast}`);
  }

  if (supportedOperators.indexOf(ast.operator) === -1) {
    throw new Error(`Invalid operator: ${ast.operator}`);
  }

  const expression = `${ast.left.value}${ast.operator}${ast.right.value}`;
  return (new Function( 'return (' + expression + ')' )());
}

export default function(input: string): string {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  return evaluate(ast);
}
