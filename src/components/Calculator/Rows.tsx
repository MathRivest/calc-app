import { h, Component } from 'preact';
import Interpreter from '../Interpreter';
const style = require('./Rows.css');

interface IRowsProps {
  expressions: string[];
}

interface IRowItemProps {
  expression: string;
}

export default function Rows({ expressions }: IRowsProps) {
  return (
    <div className={style.rows}>
      {expressions.map(expression => (
        <RowItem expression={expression} />
      ))}
    </div>
  );
}

class RowItem extends Component<IRowItemProps, {}> {
  shouldComponentUpdate({ expression }: IRowItemProps) {
    return this.props.expression !== expression;
  }

  render({ expression }: IRowItemProps) {
    return (
      <div className={style.rowItem}>
        <div className={style.rowItemValue}>{expression}</div>
        <div className={style.rowItemResult}>
          <Interpreter value={expression} />
        </div>
      </div>
    );
  }
}
