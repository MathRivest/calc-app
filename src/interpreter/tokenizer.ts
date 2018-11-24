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
  CaretToken,
  In,
  Binary,
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
  ['^', SyntaxKind.CaretToken],
]);

const keywordToSyntaxKindMap: Map<string, SyntaxKind> = new Map([
  ['plus', SyntaxKind.PlusToken],
  ['and', SyntaxKind.PlusToken],
  ['with', SyntaxKind.PlusToken],
  ['minus', SyntaxKind.MinusToken],
  ['substract', SyntaxKind.MinusToken],
  ['without', SyntaxKind.MinusToken],
  ['times', SyntaxKind.AsteriskToken],
  ['mul', SyntaxKind.AsteriskToken],
  ['divide', SyntaxKind.SlashToken],
  ['in', SyntaxKind.In],
  ['binary', SyntaxKind.Binary],
]);

function isDigit(char: string) {
  const NUMBERS = /[0-9]/;
  return NUMBERS.test(char);
}

function isLetter(char: string) {
  const code = char.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function extractNextKeyword(input: string, current: number): string {
  let keyword = '';
  while (input[current] && isLetter(input[current])) {
    keyword += input[current];
    current++;
  }
  return keyword;
}

function extractNumber(input: string, current: number): string {
  let value = '';
  let hasDecimals = false;

  while (input[current]) {
    if (isDigit(input[current])) {
      value += input[current];
    } else if (input[current] === '.' && !hasDecimals) {
      value += '.';
      hasDecimals = true;
    } else {
      break;
    }
    current++;
  }
  return value;
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
      var numberAsString = extractNumber(input, current);
      current += numberAsString.length;
      tokens.push({
        kind: SyntaxKind.Number,
        value: numberAsString,
      } as NumberToken);
    } else if (isLetter(char)) {
      const keyword = extractNextKeyword(input, current);
      const syntaxKind = keywordToSyntaxKindMap.get(keyword);
      if (syntaxKind === undefined) {
        throw new Error(`Invalid keyword : ${keyword}`);
      }
      current += keyword.length;
      tokens.push({ kind: syntaxKind });
    } else if (char == ' ') {
      current++;
    } else {
      throw new Error('Unkown character: ' + char);
    }
  }

  tokens.push({ kind: SyntaxKind.EOF });
  return tokens;
}
