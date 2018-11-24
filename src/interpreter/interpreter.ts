import tokenizer from './tokenizer';
import parser, {
  NumberLiteral,
  BinaryExpression,
  NodeKind,
  Node,
  Expression,
} from './parser';

enum Representation {
  Unknown,
  Decimal,
  Binary,
}

type ExpressionResult = {
  value: number;
  representation: Representation;
};

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

function display(er: ExpressionResult): string {
  switch (er.representation) {
    case Representation.Unknown:
    case Representation.Decimal:
      return er.value.toString();
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
      case NodeKind.UnaryMinus:
        const result = visit(node.expression);
        return {
          value: -result.value,
          representation: result.representation,
        };
      case NodeKind.BinaryExpression:
        return visitBinaryExpression(node);
      case NodeKind.NumberLiteral:
        return visitNumberLiteral(node);
      case NodeKind.ConvertToBinaryNumber:
        return {
          ...visit(node.expression),
          representation: Representation.Binary,
        };
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
    };
  }

  function visitNumberLiteral(node: NumberLiteral): ExpressionResult {
    return {
      value: node.value,
      representation: Representation.Unknown,
    };
  }

  return display(visit(ast));
}

export default function(input: string): string {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  return evaluate(ast);
}
