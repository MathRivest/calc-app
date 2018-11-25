import {
  Token,
  SyntaxKind,
  NumberToken,
  BinaryLiteralToken,
  CurrencyToken,
} from './tokenizer';
import { Representation } from './interpreter';
import { Currency } from './currencies';

export type Node = Expression;

type MathOperator = '+' | '-' | '*' | '/' | '^';

export enum NodeKind {
  NumberLiteral,
  BinaryExpression,
  UnaryPlus,
  UnaryMinus,
  ConvertToBinary,
  ConvertToDecimal,
  ConvertToCurrency,
}

export type Expression =
  | NumberLiteral
  | UnaryMinus
  | UnaryPlus
  | BinaryExpression
  | ConvertToBinary
  | ConvertToDecimal
  | ConvertToCurrency;

export type NumberLiteral = {
  kind: NodeKind.NumberLiteral;
  value: number;
  representation: Representation;
};

export type ConvertToCurrency = {
  kind: NodeKind.ConvertToCurrency;
  currency: Currency;
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

export type BinaryExpression = {
  kind: NodeKind.BinaryExpression;
  left: Expression;
  right: Expression;
  operator: MathOperator;
};

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
    if (currentToken().kind === SyntaxKind.Currency) {
      const currencyToken = consumeToken(SyntaxKind.Currency) as CurrencyToken;
      node = {
        kind: NodeKind.ConvertToCurrency,
        expression: node,
        currency: currencyToken.value,
      } as ConvertToCurrency;
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
        } else if (currentToken().kind === SyntaxKind.Currency) {
          const currencyToken = consumeToken(
            SyntaxKind.Currency
          ) as CurrencyToken;
          node = {
            kind: NodeKind.ConvertToCurrency,
            expression: node,
            currency: currencyToken.value,
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
      node = makeBinaryExpression(node, '^', conversion());
    }

    return node;
  }

  function term(): Expression {
    let node: Expression = exponent();

    while (true) {
      if (testAndConsume(SyntaxKind.AsteriskToken)) {
        node = makeBinaryExpression(node, '*', exponent());
      } else if (testAndConsume(SyntaxKind.SlashToken)) {
        node = makeBinaryExpression(node, '/', exponent());
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
        node = makeBinaryExpression(node, '+', term());
      } else if (testAndConsume(SyntaxKind.MinusToken)) {
        node = makeBinaryExpression(node, '-', term());
      } else {
        break;
      }
    }

    return node;
  }

  return expr();
}
