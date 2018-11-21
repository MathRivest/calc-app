import { Token, SyntaxKind, NumberToken } from './tokenizer';

export type Node = Expression;

type MathOperator = '+' | '-' | '*' | '/' | '^';

export enum NodeKind {
  NumberLiteral,
  BinaryExpression,
  UnaryPlus,
  UnaryMinus,
  ConvertToBinaryNumber,
}

export type Expression =
  | NumberLiteral
  | UnaryMinus
  | UnaryPlus
  | BinaryExpression
  | ConvertToBinaryNumber;

export type NumberLiteral = {
  kind: NodeKind.NumberLiteral;
  value: number;
};

export type UnaryPlus = {
  kind: NodeKind.UnaryPlus;
  expression: Expression;
};

export type UnaryMinus = {
  kind: NodeKind.UnaryMinus;
  expression: Expression;
};

export type BinaryExpression = {
  kind: NodeKind.BinaryExpression;
  left: Expression;
  right: Expression;
  operator: MathOperator;
};

export type ConvertToBinaryNumber = {
  kind: NodeKind.ConvertToBinaryNumber;
  expression: Expression;
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
    left: Expression,
    operator: MathOperator,
    right: Expression
  ): BinaryExpression {
    return {
      kind: NodeKind.BinaryExpression,
      left: left,
      operator: operator,
      right: right,
    };
  }

  function factor(): Expression {
    let token = currentToken();
    if (token.kind === SyntaxKind.PlusToken) {
      consumeToken(SyntaxKind.PlusToken);
      return { kind: NodeKind.UnaryPlus, expression: factor() };
    } else if (token.kind === SyntaxKind.MinusToken) {
      consumeToken(SyntaxKind.MinusToken);
      return { kind: NodeKind.UnaryMinus, expression: factor() };
    } else if (token.kind === SyntaxKind.Number) {
      return makeNumberLiteral(consumeToken(SyntaxKind.Number) as NumberToken);
    } else if (token.kind === SyntaxKind.LPrecedence) {
      consumeToken(SyntaxKind.LPrecedence);
      let node = expr();
      consumeToken(SyntaxKind.RPrecedence);
      return node;
    }
    throw Error(`Unexpected token : ${token}`);
  }

  function exponent(): Expression {
    let node: Expression = factor();

    let token = currentToken();

    while (true) {
      if (token.kind === SyntaxKind.CaretToken) {
        consumeToken(SyntaxKind.CaretToken);
        node = makeBinaryExpression(node, '^', factor());
      } else {
        break;
      }
      token = currentToken();
    }

    return node;
  }

  function term(): Expression {
    let node: Expression = exponent();

    let token = currentToken();

    while (true) {
      if (token.kind === SyntaxKind.AsteriskToken) {
        consumeToken(SyntaxKind.AsteriskToken);
        node = makeBinaryExpression(node, '*', exponent());
      } else if (token.kind === SyntaxKind.SlashToken) {
        consumeToken(SyntaxKind.SlashToken);
        node = makeBinaryExpression(node, '/', exponent());
      } else {
        break;
      }
      token = currentToken();
    }

    return node;
  }

  function expr(): Expression {
    let node: Expression = term();

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

  function conversion() {
    let node: Expression = expr();

    if (currentToken().kind === SyntaxKind.In) {
      consumeToken(SyntaxKind.In);

      if (currentToken().kind === SyntaxKind.Binary) {
        consumeToken(SyntaxKind.Binary);
        node = {
          kind: NodeKind.ConvertToBinaryNumber,
          expression: node,
        };
      } else {
        throw new Error(`Can't extract unit from token ${currentToken()}`);
      }
    }

    return node;
  }

  return conversion();
}
