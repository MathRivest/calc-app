import tokenizer from './tokenizer';
import parser, {
  NumberLiteral,
  BinaryExpression,
  NodeKind,
  Node,
  Expression,
} from './parser';

function evaluate(ast: Node): string {
  function visit(node: Expression) {
    switch (node.kind) {
      case NodeKind.UnaryPlus:
        return visit(node.expression);
      case NodeKind.UnaryMinus:
        return -visit(node.expression);
      case NodeKind.BinaryExpression:
        return visitBinaryExpression(node);
      case NodeKind.NumberLiteral:
        return visitNumberLiteral(node);
      default:
        throw new Error(`Unexpected node kind: ${node}`);
    }
  }

  function visitBinaryExpression(node: BinaryExpression) {
    switch (node.operator) {
      case '+':
        return visit(node.left) + visit(node.right);
      case '-':
        return visit(node.left) - visit(node.right);
      case '*':
        return visit(node.left) * visit(node.right);
      case '/':
        return visit(node.left) / visit(node.right);
      case '^':
        return Math.pow(visit(node.left), visit(node.right));
    }
  }

  function visitNumberLiteral(node: NumberLiteral) {
    return node.value;
  }

  return visit(ast).toString();
}

export default function(input: string): string {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  return evaluate(ast);
}
