import { Token, SyntaxKind, NumberToken } from './tokenizer';

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
  operator: MathOperator;
};

export default function parser(tokens: Token[]): Node {
  let i = 0;

  function currentToken(): Token {
    return tokens[i];
  }

  function consumeToken(kind: SyntaxKind): Token {
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
    if (token.kind === SyntaxKind.Number) {
      return makeNumberLiteral(consumeToken(SyntaxKind.Number) as NumberToken);
    } else if (token.kind === SyntaxKind.LPrecedence) {
      consumeToken(SyntaxKind.LPrecedence);
      let node = expr();
      consumeToken(SyntaxKind.RPrecedence);
      return node;
    }
    throw Error(`Unexpected token : ${token}`);
  }

  function term(): NumberLiteral | BinaryExpression {
    let node: NumberLiteral | BinaryExpression = factor();

    let token = currentToken();

    while (true) {
      if (token.kind === SyntaxKind.AsteriskToken) {
        consumeToken(SyntaxKind.AsteriskToken);
        node = makeBinaryExpression(node, '*', factor());
      } else if (token.kind === SyntaxKind.SlashToken) {
        consumeToken(SyntaxKind.SlashToken);
        node = makeBinaryExpression(node, '/', factor());
      } else {
        break;
      }
      token = currentToken();
    }

    return node;
  }

  function expr(): NumberLiteral | BinaryExpression {
    let node: NumberLiteral | BinaryExpression = term();

    let token = currentToken();

    while (true) {
      if (token.kind === SyntaxKind.PlusToken) {
        consumeToken(SyntaxKind.PlusToken);
        node = makeBinaryExpression(node, '+', term());
      } else if (token.kind === SyntaxKind.MinusToken) {
        consumeToken(SyntaxKind.MinusToken);
        node = makeBinaryExpression(node, '-', term());
      } else {
        break;
      }
      token = currentToken();
    }

    return node;
  }

  return expr();
}
