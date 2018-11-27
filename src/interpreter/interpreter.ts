import tokenizer from './tokenizer';
import parser, {
  NumberLiteral,
  BinaryExpression,
  NodeKind,
  Node,
  Expression,
} from './parser';
import { BaseUnitDefinition, unitDefinitions, UnitDefinition } from './units';

export enum Representation {
  Unknown,
  Decimal,
  Binary,
}

type ExpressionResult = {
  value: number;
  representation: Representation;
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
  if (er.unit === null) {
    return r;
  }
  const unit = unitMap.get(er.unit);
  return unit !== undefined ? unit.format(r) : r;
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
      case NodeKind.Addition:
        return visitAdditiveBinaryExpression(node, (l, r) => l + r);
      case NodeKind.Substraction:
        return visitAdditiveBinaryExpression(node, (l, r) => l - r);
      case NodeKind.Multiplication:
        return visitTermBinaryExpression(node, (l, r) => l * r);
      case NodeKind.Division:
        return visitTermBinaryExpression(node, (l, r) => l / r);
      case NodeKind.Exponent:
        return visitTermBinaryExpression(node, Math.pow);
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
      case NodeKind.ConvertToUnit: {
        const result = visit(node.expression);
        return {
          value: convert(result.unit, node.unit, result.value),
          unit: node.unit,
          representation: result.representation,
        };
      }
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
  ) {
    const left = visit(node.left);
    const right = visit(node.right);
    const targetUnit = getAdditiveTargetUnit(left.unit, right.unit);
    const leftConvertedValue = convert(left.unit, targetUnit, left.value);

    return {
      value: operation(leftConvertedValue, right.value),
      representation: mergeRepresentation(
        left.representation,
        right.representation
      ),
      unit: targetUnit,
    };
  }

  // "*" "/" "^" : TODO : Find a better name
  function visitTermBinaryExpression(
    node: BinaryExpression,
    operation: (left: number, right: number) => number
  ): ExpressionResult {
    const left = visit(node.left);
    const right = visit(node.right);

    return {
      value: operation(left.value, right.value),
      representation: mergeRepresentation(
        left.representation,
        right.representation
      ),
      unit: right.unit, // Todo : compute real target unit
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
