import {
  Token,
  TokenKind,
  NumberToken,
  LPrecedenceToken,
  RPrecedenceToken,
  OperatorToken,
} from './tokenizer';

export type Node = NumberLiteral | BinaryExpression;

type MathOperator = '+' | '-' | '*' | '/';

export enum NodeKind {
  NumberLiteral,
  BinaryExpression,
}

export type NumberLiteral = {
  kind: NodeKind.NumberLiteral;
  value: number;
};

export type BinaryExpression = {
  kind: NodeKind.BinaryExpression;
  left: NumberLiteral | BinaryExpression;
  right: NumberLiteral | BinaryExpression;
  operator: '+' | '-' | '*' | '/';
};

export default function parser(tokens: Token[]): Node {
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
    } else if (token.kind === TokenKind.LPrecedence) {
      consumeToken(TokenKind.LPrecedence) as LPrecedenceToken;
      let node = expr();
      consumeToken(TokenKind.RPrecedence) as RPrecedenceToken;
      return node;
    }
    throw Error(`Unexpected token : ${token}`);
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
