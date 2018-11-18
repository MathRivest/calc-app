export type Token =
  | OperatorToken
  | NumberToken
  | EOFToken
  | LPrecedenceToken
  | RPrecedenceToken;

export enum TokenKind {
  Operator,
  Number,
  EOF,
  LPrecedence,
  RPrecedence,
}

export type OperatorToken = {
  kind: TokenKind.Operator;
  value: '+' | '-' | '*' | '/';
};

export type NumberToken = {
  kind: TokenKind.Number;
  value: string;
};

export type EOFToken = {
  kind: TokenKind.EOF;
};

export type LPrecedenceToken = {
  kind: TokenKind.LPrecedence;
};

export type RPrecedenceToken = {
  kind: TokenKind.RPrecedence;
};

const OperatorsValueEnum = {
  '+': '+',
  '-': '-',
  '*': '*',
  '/': '/',
};

type MathOperator = keyof typeof OperatorsValueEnum;

const isSupportedMathOperator = (char: any): char is MathOperator =>
  Object.keys(OperatorsValueEnum).indexOf(char) >= 0;

export default function tokenizer(input: string): Token[] {
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

    if (char === '(') {
      tokens.push({ kind: TokenKind.LPrecedence });
      current++;
      continue;
    }

    if (char === ')') {
      tokens.push({ kind: TokenKind.RPrecedence });
      current++;
      continue;
    }

    throw new Error('Unkown character: ' + char);
  }

  tokens.push({ kind: TokenKind.EOF });
  return tokens;
}
