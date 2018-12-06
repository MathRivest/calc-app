import tokenizer from './tokenizer';
import parser, {
  NumberLiteral,
  BinaryExpression,
  NodeKind,
  Node,
  Expression,
} from './parser';
import { BaseUnitDefinition, unitDefinitions, UnitDefinition } from './units';
import { NumberFormat } from './NumberFormats';

type ExpressionResult = {
  value: number;
  format: NumberFormat;
  unit: string | null;
};

function makeUnitMap(
  unitDefinitions: BaseUnitDefinition[]
): Map<string, UnitDefinition> {
  const map = new Map();
  for (let unitDefinition of unitDefinitions) {
    for (let unit of unitDefinition.units) {
      for (let synonym of unit.synonyms) {
        map.set(synonym.toLowerCase(), unit);
      }
    }
  }
  return map;
}

const unitMap = makeUnitMap(unitDefinitions);

function convert(
  from: string | null,
  to: string | null,
  value: number
): number {
  if (from === null || to === null) {
    return value;
  }

  const fromUnit = unitMap.get(from);
  const toUnit = unitMap.get(to);
  if (fromUnit === undefined) {
    throw new Error(`Unkown unit: "${from}"`);
  }
  if (toUnit === undefined) {
    throw new Error(`Unkown unit: "${to}"`);
  }

  return toUnit.fromBase(fromUnit.toBase(value));
}

function mergeRepresentation(
  left: NumberFormat,
  right: NumberFormat
): NumberFormat {
  if (left === NumberFormat.Unknown) {
    return right;
  }
  if (right === NumberFormat.Unknown) {
    return left;
  }
  return right;
}

function roundTo2Decimals(value: number): string {
  return (Math.round(value * 100) / 100).toString();
}

function display(er: ExpressionResult): string {
  const r = displayRepresentation(er);
  if (er.unit === null) {
    return r;
  }
  const unit = unitMap.get(er.unit);
  return unit !== undefined ? unit.format(r) : r;
}

function displayRepresentation(er: ExpressionResult): string {
  switch (er.format) {
    case NumberFormat.Unknown:
    case NumberFormat.Decimal:
      return roundTo2Decimals(er.value);
    case NumberFormat.Binary:
      return '0b' + er.value.toString(2);
    case NumberFormat.Octal:
      return '0o' + er.value.toString(8);
    case NumberFormat.Hexadecimal:
      return '0x' + er.value.toString(16);

    default:
      throw new Error(`Unknown number representation: ${er.format}`);
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
          format: result.format,
          unit: null,
        };
      }
      case NodeKind.Addition:
        return visitAdditiveBinaryExpression(node, (l, r) => l + r);
      case NodeKind.Substraction:
        return visitAdditiveBinaryExpression(node, (l, r) => l - r);
      case NodeKind.Multiplication:
        return visitSimpleBinaryExpression(node, (l, r) => l * r);
      case NodeKind.Division:
        return visitSimpleBinaryExpression(node, (l, r) => l / r);
      case NodeKind.Modulo:
        return visitSimpleBinaryExpression(node, (l, r) => l % r);
      case NodeKind.BitwiseOr:
        return visitSimpleBinaryExpression(node, (l, r) => l | r);
      case NodeKind.BitwiseXor:
        return visitSimpleBinaryExpression(node, (l, r) => l ^ r);
      case NodeKind.BitwiseAnd:
        return visitSimpleBinaryExpression(node, (l, r) => l & r);
      case NodeKind.LeftShift:
        return visitSimpleBinaryExpression(node, (l, r) => l << r);
      case NodeKind.RightShift:
        return visitSimpleBinaryExpression(node, (l, r) => l >> r);
      case NodeKind.Exponent:
        return visitSimpleBinaryExpression(node, Math.pow);
      case NodeKind.NumberLiteral:
        return visitNumberLiteral(node);
      case NodeKind.ConvertToUnit: {
        const result = visit(node.expression);
        return {
          value: convert(result.unit, node.unit, result.value),
          unit: node.unit,
          format: result.format,
        };
      }
      case NodeKind.FormatNumber:
        return {
          ...visit(node.expression),
          format: node.format,
        };
      default:
        throw new Error(`Unexpected node kind: ${node}`);
    }
  }

  function getAdditiveTargetUnit(left: string | null, right: string | null) {
    if (right !== null) {
      return right;
    }
    return left;
  }

  function visitAdditiveBinaryExpression(
    node: BinaryExpression,
    operation: (left: number, right: number) => number
  ): ExpressionResult {
    const left = visit(node.left);
    const right = visit(node.right);
    const targetUnit = getAdditiveTargetUnit(left.unit, right.unit);
    const leftConvertedValue = convert(left.unit, targetUnit, left.value);

    return {
      value: operation(leftConvertedValue, right.value),
      format: mergeRepresentation(left.format, right.format),
      unit: targetUnit,
    };
  }

  function visitSimpleBinaryExpression(
    node: BinaryExpression,
    operation: (left: number, right: number) => number
  ): ExpressionResult {
    const left = visit(node.left);
    const right = visit(node.right);

    return {
      value: operation(left.value, right.value),
      format: mergeRepresentation(left.format, right.format),
      unit: right.unit, // Todo : compute real target unit
    };
  }

  function visitNumberLiteral(node: NumberLiteral): ExpressionResult {
    return {
      value: node.value,
      format: node.representation,
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
