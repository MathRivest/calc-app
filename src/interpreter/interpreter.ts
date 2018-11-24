import tokenizer from './tokenizer';
import parser, {
  NumberLiteral,
  BinaryExpression,
  NodeKind,
  Node,
  Expression,
} from './parser';
import { Currency } from './currencies';

export enum Representation {
  Unknown,
  Decimal,
  Binary,
}

type ExpressionResult = {
  value: number;
  representation: Representation;
  unit: Currency | null;
};

const conversionMap = new Map([[Currency.CAD, 1.32], [Currency.USD, 1]]);

function convert(from: Currency | null, to: Currency, value: number): number {
  if (from === null) {
    return value;
  }

  const fromRate = conversionMap.get(from);
  const toRate = conversionMap.get(to);
  if (toRate === undefined || fromRate === undefined) {
    throw new Error('Unkown unit');
  }

  return value * (1 / fromRate) * toRate;
}

function mergeRepresentation(
  left: Representation,
  right: Representation
): Representation {
  if (left === Representation.Unknown) {
    return right;
  }
  if (right === Representation.Unknown) {
    return left;
  }
  return right;
}

function roundTo2Decimals(value: number): string {
  return (Math.round(value * 100) / 100).toString();
}

function display(er: ExpressionResult): string {
  const r = displayRepresentation(er);
  switch (er.unit) {
    case null:
      return r;
    case Currency.CAD:
      return `$${r} CAD`;
    case Currency.USD:
      return `$${r}`;
    default:
      return r;
  }
}

function displayRepresentation(er: ExpressionResult): string {
  switch (er.representation) {
    case Representation.Unknown:
    case Representation.Decimal:
      return roundTo2Decimals(er.value);
    case Representation.Binary:
      return '0b' + er.value.toString(2);
    default:
      throw new Error(`Unknown number representation: ${er.representation}`);
  }
}

function evaluate(ast: Node): string {
  function visit(node: Expression): ExpressionResult {
    switch (node.kind) {
      case NodeKind.UnaryPlus:
        return visit(node.expression);
      case NodeKind.UnaryMinus: {
        const result = visit(node.expression);
        return {
          value: -result.value,
          representation: result.representation,
          unit: null,
        };
      }
      case NodeKind.BinaryExpression:
        return visitBinaryExpression(node);
      case NodeKind.NumberLiteral:
        return visitNumberLiteral(node);
      case NodeKind.ConvertToDecimal:
        return {
          ...visit(node.expression),
          representation: Representation.Decimal,
        };
      case NodeKind.ConvertToBinary:
        return {
          ...visit(node.expression),
          representation: Representation.Binary,
        };
      case NodeKind.ConvertToCurrency: {
        const result = visit(node.expression);
        return {
          value: convert(result.unit, node.currency, result.value),
          unit: node.currency,
          representation: result.representation,
        };
      }
      default:
        throw new Error(`Unexpected node kind: ${node}`);
    }
  }

  function binaryOperatorToFunction(
    operator: '+' | '-' | '*' | '/' | '^'
  ): (l: number, r: number) => number {
    switch (operator) {
      case '+':
        return (l, r) => l + r;
      case '-':
        return (l, r) => l - r;
      case '*':
        return (l, r) => l * r;
      case '/':
        return (l, r) => l / r;
      case '^':
        return Math.pow;
    }
  }

  function visitBinaryExpression(node: BinaryExpression): ExpressionResult {
    const left = visit(node.left);
    const right = visit(node.right);

    return {
      value: binaryOperatorToFunction(node.operator)(left.value, right.value),
      representation: mergeRepresentation(
        left.representation,
        right.representation
      ),
      unit: right.unit, // Todo: throw when unit is not compatible
    };
  }

  function visitNumberLiteral(node: NumberLiteral): ExpressionResult {
    return {
      value: node.value,
      representation: node.representation,
      unit: null,
    };
  }

  return display(visit(ast));
}

export default function(input: string): string {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  return evaluate(ast);
}
