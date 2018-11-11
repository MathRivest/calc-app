type Token = OperatorToken | NumberToken;

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

  return tokens;
}

function parser(tokens: Token[]): Node[] {
  let i = 0;
  let tree: any[] = [];

  function consumeToken(kind: TokenKind, index: number): Token | null {
    const token = tokens[index];
    if (token.kind !== kind) {
      throw new Error(`Unexpected token : ${token}`);
    }
    return token;
  }

  function makeNumberLiteral(token: NumberToken): NumberLiteral {
    return {
      kind: NodeKind.NumberLiteral,
      value: parseInt(token.value),
    };
  }

  while (i <= tokens.length - 3) {
    try {
      const left = consumeToken(TokenKind.Number, i) as NumberToken;
      const operator = consumeToken(TokenKind.Operator, i + 1) as OperatorToken;
      const right = consumeToken(TokenKind.Number, i + 2) as NumberToken;
      const newNode = {
        kind: NodeKind.BinaryExpression,
        left: makeNumberLiteral(left),
        operator: operator.value,
        right: makeNumberLiteral(right),
      };
      tree.push(newNode);
    } catch {}
    i = i + 1;
  }
  return tree;
}

function evaluate(ast: Node): string {
  if (ast.kind !== NodeKind.BinaryExpression) {
    throw new Error(`Invalid ast node: ${ast}`);
  }

  let expression = '';
  if (isSupportedMathOperator(ast.operator)) {
    switch (ast.operator) {
      case OperatorsValueEnum['+']:
        expression = (ast.left.value + ast.right.value).toString();
        break;
      case OperatorsValueEnum['-']:
        expression = (ast.left.value - ast.right.value).toString();
        break;
      case OperatorsValueEnum['*']:
        expression = (ast.left.value * ast.right.value).toString();
        break;
      case OperatorsValueEnum['/']:
        expression = (ast.left.value / ast.right.value).toString();
        break;
    }
  } else {
    throw new Error(`Invalid operator: ${ast.operator}`);
  }
  return expression;
}

export default function(input: string): string {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  console.log(ast);
  return evaluate(ast[0]);
}
