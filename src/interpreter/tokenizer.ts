import { BaseUnitDefinition, unitDefinitions } from './units';
import { NumberFormat } from './NumberFormats';
import { NumberLiteral } from './parser';

export interface Token {
  kind: SyntaxKind;
}

export enum SyntaxKind {
  NumberLiteral,
  EOF,
  OpenParenthesis,
  CloseParenthesis,
  PlusToken,
  MinusToken,
  AsteriskToken,
  SlashToken,
  CaretToken,
  AmpersandToken,
  PipeToken,
  XorKeyword,
  ModKeyword,
  LeftShift,
  RightShift,
  In,
  Binary,
  Octal,
  Decimal,
  Hexadecimal,
  Unit,
}

export interface UnitToken extends Token {
  kind: SyntaxKind.Unit;
  value: string;
}

export interface NumberToken extends Token {
  kind: SyntaxKind.NumberLiteral;
  format: NumberFormat;
  value: string;
}

const simpleCharToSyntaxKindMap: Map<string, SyntaxKind> = new Map([
  ['+', SyntaxKind.PlusToken],
  ['-', SyntaxKind.MinusToken],
  ['*', SyntaxKind.AsteriskToken],
  ['/', SyntaxKind.SlashToken],
  ['(', SyntaxKind.OpenParenthesis],
  [')', SyntaxKind.CloseParenthesis],
  ['^', SyntaxKind.CaretToken],
  ['&', SyntaxKind.AmpersandToken],
  ['|', SyntaxKind.PipeToken],
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
  ['octal', SyntaxKind.Octal],
  ['decimal', SyntaxKind.Decimal],
  ['hex', SyntaxKind.Hexadecimal],
  ['xor', SyntaxKind.XorKeyword],
  ['mod', SyntaxKind.ModKeyword],
]);

function completeKeywordToSyntaxMapWithUnits(
  unitDefinitions: BaseUnitDefinition[]
) {
  for (let unitDefinition of unitDefinitions) {
    for (let unit of unitDefinition.units) {
      for (let synonym of unit.synonyms) {
        keywordToSyntaxKindMap.set(synonym.toLowerCase(), SyntaxKind.Unit);
      }
    }
  }
}

completeKeywordToSyntaxMapWithUnits(unitDefinitions);

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

function extractOctal(input: string, i: number): string {
  if (input[i] !== '0' && input[i + 1] !== 'o') {
    throw new Error('Expected literal octal prefix');
  }
  i += 2; // Skip over prefix
  let value = '';
  while (input[i].charCodeAt(0) >= 48 && input[i].charCodeAt(0) <= 57) {
    value += input[i];
    i++;
  }
  return value;
}

function extractHexa(input: string, i: number): string {
  if (input[i] !== '0' && input[i + 1] !== 'x') {
    throw new Error('Expected literal octal prefix');
  }
  i += 2; // Skip over prefix
  let value = '';
  while (
    (input[i].charCodeAt(0) >= 48 && input[i].charCodeAt(0) <= 57) ||
    (input[i].charCodeAt(0) >= 97 && input[i].charCodeAt(0) <= 102)
  ) {
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
    } else if (char == '<' && input[current + 1] === '<') {
      current += 2;
      tokens.push({
        kind: SyntaxKind.LeftShift,
      });
    } else if (char == '>' && input[current + 1] === '>') {
      current += 2;
      tokens.push({
        kind: SyntaxKind.RightShift,
      });
    } else if (char === '0' && input[current + 1] === 'b') {
      const binaryAsString = extractBinary(input, current);
      current += binaryAsString.length + 2;
      tokens.push({
        kind: SyntaxKind.NumberLiteral,
        format: NumberFormat.Binary,
        value: binaryAsString,
      } as NumberToken);
    } else if (char === '0' && input[current + 1] === 'o') {
      const octalAsString = extractOctal(input, current);
      current += octalAsString.length + 2;
      tokens.push({
        kind: SyntaxKind.NumberLiteral,
        format: NumberFormat.Octal,
        value: octalAsString,
      } as NumberToken);
    } else if (char === '0' && input[current + 1] === 'x') {
      const hexaAsString = extractHexa(input, current);
      current += hexaAsString.length + 2;
      tokens.push({
        kind: SyntaxKind.NumberLiteral,
        format: NumberFormat.Hexadecimal,
        value: hexaAsString,
      } as NumberToken);
    } else if (isDigit(char)) {
      var numberAsString = extractNumber(input, current);
      current += numberAsString.length;
      tokens.push({
        kind: SyntaxKind.NumberLiteral,
        format: NumberFormat.Unknown,
        value: numberAsString,
      } as NumberToken);
    } else if (isLetter(char)) {
      const keyword = extractNextKeyword(input, current).toLowerCase();
      const syntaxKind = keywordToSyntaxKindMap.get(keyword);
      if (syntaxKind === SyntaxKind.Unit) {
        tokens.push({
          kind: SyntaxKind.Unit,
          value: keyword,
        } as UnitToken);
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
