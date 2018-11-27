import {
  Token,
  SyntaxKind,
  NumberToken,
  BinaryLiteralToken,
  UnitToken,
} from './tokenizer';
import { Representation } from './interpreter';

export type Node = Expression;

export enum NodeKind {
  NumberLiteral,
  Addition,
  Substraction,
  Multiplication,
  Division,
  Exponent,
  UnaryPlus,
  UnaryMinus,
  ConvertToBinary,
  ConvertToDecimal,
  ConvertToUnit,
}

export type Expression =
  | NumberLiteral
  | UnaryMinus
  | UnaryPlus
  | ConvertToBinary
  | ConvertToDecimal
  | ConvertToUnit
  | Addition
  | Substraction
  | Multiplication
  | Division
  | Exponent;

export interface BinaryExpression {
  left: Expression;
  right: Expression;
}

export type NumberLiteral = {
  kind: NodeKind.NumberLiteral;
  value: number;
  representation: Representation;
};

export type ConvertToUnit = {
  kind: NodeKind.ConvertToUnit;
  unit: string;
  expression: Expression;
};

export type UnaryPlus = {
  kind: NodeKind.UnaryPlus;
  expression: Expression;
};

export type UnaryMinus = {
  kind: NodeKind.UnaryMinus;
  expression: Expression;
};

export interface Addition extends BinaryExpression {
  kind: NodeKind.Addition;
}

export interface Substraction extends BinaryExpression {
  kind: NodeKind.Substraction;
}

export interface Multiplication extends BinaryExpression {
  kind: NodeKind.Multiplication;
}

export interface Division extends BinaryExpression {
  kind: NodeKind.Division;
}

export interface Exponent extends BinaryExpression {
  kind: NodeKind.Exponent;
}

export type ConvertToBinary = {
  kind: NodeKind.ConvertToBinary;
  expression: Expression;
};

export type ConvertToDecimal = {
  kind: NodeKind.ConvertToDecimal;
  expression: Expression;
};

export default function parser(tokens: Token[]): Node {
  let i = 0;

  function currentToken(): Token {
    return tokens[i];
  }

  function testAndConsume(kind: SyntaxKind): boolean {
    const token = currentToken();
    if (token.kind === kind) {
      i++;
      return true;
    }
    return false;
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
      value: parseFloat(token.value),
      representation: Representation.Unknown,
    };
  }

  function makeNumberLiteralFromBinary(
    token: BinaryLiteralToken
  ): NumberLiteral {
    return {
      kind: NodeKind.NumberLiteral,
      value: parseInt(token.value, 2),
      representation: Representation.Binary,
    };
  }

  function factor(): Expression {
    let token = currentToken();
    if (testAndConsume(SyntaxKind.PlusToken)) {
      return { kind: NodeKind.UnaryPlus, expression: factor() };
    } else if (testAndConsume(SyntaxKind.MinusToken)) {
      return { kind: NodeKind.UnaryMinus, expression: factor() };
    } else if (token.kind === SyntaxKind.BinaryLiteral) {
      return makeNumberLiteralFromBinary(consumeToken(
        SyntaxKind.BinaryLiteral
      ) as BinaryLiteralToken);
    } else if (token.kind === SyntaxKind.NumberLiteral) {
      return makeNumberLiteral(consumeToken(
        SyntaxKind.NumberLiteral
      ) as NumberToken);
    } else if (testAndConsume(SyntaxKind.LPrecedence)) {
      let node = expr();
      consumeToken(SyntaxKind.RPrecedence);
      return node;
    }
    throw Error(`Unexpected token : ${token}`);
  }

  function unit(): Expression {
    let node: Expression = factor();
    if (currentToken().kind === SyntaxKind.Unit) {
      const unitToken = consumeToken(SyntaxKind.Unit) as UnitToken;
      node = {
        kind: NodeKind.ConvertToUnit,
        expression: node,
        unit: unitToken.value,
      } as ConvertToUnit;
    }
    return node;
  }

  function conversion(): Expression {
    let node: Expression = unit();

    while (true) {
      if (testAndConsume(SyntaxKind.In)) {
        if (testAndConsume(SyntaxKind.Binary)) {
          node = {
            kind: NodeKind.ConvertToBinary,
            expression: node,
          };
        } else if (testAndConsume(SyntaxKind.Decimal)) {
          node = {
            kind: NodeKind.ConvertToDecimal,
            expression: node,
          };
        } else if (currentToken().kind === SyntaxKind.Unit) {
          const unitToken = consumeToken(SyntaxKind.Unit) as UnitToken;
          node = {
            kind: NodeKind.ConvertToUnit,
            expression: node,
            unit: unitToken.value,
          };
        } else {
          throw new Error(`Can't extract unit from token ${currentToken()}`);
        }
      } else {
        break;
      }
    }

    return node;
  }

  function exponent(): Expression {
    let node: Expression = conversion();

    while (testAndConsume(SyntaxKind.CaretToken)) {
      node = { kind: NodeKind.Exponent, left: node, right: conversion() };
    }

    return node;
  }

  function term(): Expression {
    let node: Expression = exponent();

    while (true) {
      if (testAndConsume(SyntaxKind.AsteriskToken)) {
        node = { kind: NodeKind.Multiplication, left: node, right: exponent() };
      } else if (testAndConsume(SyntaxKind.SlashToken)) {
        node = { kind: NodeKind.Division, left: node, right: exponent() };
      } else if (testAndConsume(SyntaxKind.LPrecedence)) {
        let ex = expr();
        consumeToken(SyntaxKind.RPrecedence);
        node = { kind: NodeKind.Multiplication, left: node, right: ex };
      } else {
        break;
      }
    }

    return node;
  }

  function expr(): Expression {
    let node: Expression = term();

    while (true) {
      if (testAndConsume(SyntaxKind.PlusToken)) {
        node = { kind: NodeKind.Addition, left: node, right: term() };
      } else if (testAndConsume(SyntaxKind.MinusToken)) {
        node = { kind: NodeKind.Substraction, left: node, right: term() };
      } else {
        break;
      }
    }

    return node;
  }

  return expr();
}
