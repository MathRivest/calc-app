import { keywordToCurrency, Currency } from './currencies';

export interface Token {
  kind: SyntaxKind;
}

export enum SyntaxKind {
  NumberLiteral,
  BinaryLiteral,
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
  Decimal,
  Currency,
}

export interface CurrencyToken extends Token {
  kind: SyntaxKind.Currency;
  value: Currency;
}

export interface NumberToken extends Token {
  kind: SyntaxKind.NumberLiteral;
  value: string;
}

export interface BinaryLiteralToken extends Token {
  kind: SyntaxKind.BinaryLiteral;
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
  ['decimal', SyntaxKind.Decimal],
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

function extractBinary(input: string, i: number): string {
  if (input[i] !== '0' && input[i + 1] !== 'b') {
    throw new Error('Expected literal binary prefix');
  }
  i += 2; // Skip over prefix
  let value = '';
  while (input[i] === '0' || input[i] === '1') {
    value += input[i];
    i++;
  }
  return value;
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
    } else if (char === '0' && input[current + 1] === 'b') {
      const binaryAsString = extractBinary(input, current);
      current += binaryAsString.length + 2;
      tokens.push({
        kind: SyntaxKind.BinaryLiteral,
        value: binaryAsString,
      } as BinaryLiteralToken);
    } else if (isDigit(char)) {
      var numberAsString = extractNumber(input, current);
      current += numberAsString.length;
      tokens.push({
        kind: SyntaxKind.NumberLiteral,
        value: numberAsString,
      } as NumberToken);
    } else if (isLetter(char)) {
      const keyword = extractNextKeyword(input, current);

      const currency = keywordToCurrency.get(keyword);
      const syntaxKind = keywordToSyntaxKindMap.get(keyword);
      if (currency !== undefined) {
        tokens.push({
          kind: SyntaxKind.Currency,
          value: currency,
        } as CurrencyToken);
      } else if (syntaxKind !== undefined) {
        tokens.push({ kind: syntaxKind });
      } else {
        throw new Error(`Invalid keyword : ${keyword}`);
      }
      current += keyword.length;
    } else if (char == ' ') {
      current++;
    } else {
      throw new Error('Unkown character: ' + char);
    }
  }

  tokens.push({ kind: SyntaxKind.EOF });
  return tokens;
}
