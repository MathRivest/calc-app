import { h } from 'preact';
import Interpreter from '../Interpreter';

interface IRowsProps {
  expressions: string[];
}

export default function Rows({ expressions }: IRowsProps) {
  return (
    <div className="Rows">
      {expressions.map(expression => (
        <Interpreter value={expression} />
      ))}
    </div>
  );
}
