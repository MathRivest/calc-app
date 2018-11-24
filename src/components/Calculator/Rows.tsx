import { h } from 'preact';
import Interpreter from '../Interpreter';
const style = require('./Rows.css');

interface IRowsProps {
  expressions: string[];
}

export default function Rows({ expressions }: IRowsProps) {
  return (
    <div className={style.rows}>
      {expressions.map(expression => (
        <div className={style.rowItem}>
          <div>{expression}</div>
          <Interpreter value={expression} />
        </div>
      ))}
    </div>
  );
}
