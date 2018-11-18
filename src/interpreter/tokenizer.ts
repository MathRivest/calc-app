export interface Token {
  kind: SyntaxKind;
}

export enum SyntaxKind {
  Number,
  EOF,
  LPrecedence,
  RPrecedence,
  PlusToken,
  MinusToken,
  AsteriskToken,
  SlashToken,
}

export interface NumberToken extends Token {
  kind: SyntaxKind.Number;
  value: string;
}

const simpleCharToSyntaxKindMap: Map<string, SyntaxKind> = new Map([
  ['+', SyntaxKind.PlusToken],
  ['-', SyntaxKind.MinusToken],
  ['*', SyntaxKind.AsteriskToken],
  ['/', SyntaxKind.SlashToken],
  ['(', SyntaxKind.LPrecedence],
  [')', SyntaxKind.RPrecedence],
]);

function isDigit(char: string) {
  const NUMBERS = /[0-9]/;
  return NUMBERS.test(char);
}

export default function tokenizer(input: string): Token[] {
  let current = 0;

  const tokens: Token[] = [];

  while (current < input.length) {
    let char = input[current];

    let syntaxKind = simpleCharToSyntaxKindMap.get(char);
    if (syntaxKind !== undefined) {
      tokens.push({
        kind: syntaxKind,
      });
      current++;
    } else if (isDigit(char)) {
      let value = '';
      while (isDigit(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({ kind: SyntaxKind.Number, value } as NumberToken);
    }

    throw new Error('Unkown character: ' + char);
  }

  tokens.push({ kind: SyntaxKind.EOF });
  return tokens;
}
