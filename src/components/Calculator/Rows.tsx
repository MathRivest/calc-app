import { h, Component } from 'preact';
import Interpreter from '../Interpreter';
const style = require('./Rows.css');

interface IRowsProps {
  expressions: string[];
}

export default function Rows({ expressions }: IRowsProps) {
  return (
    <div className={style.rows}>
      {expressions.map(expression => (
        // <RowItem expression={expression}>
        <Interpreter value={expression} />
      ))}
    </div>
  );
}

// class RowItem extends Component<any, any> {
//   render({ expression }) {
//     return (
//       <div className={style.rowItem}>
//         <div className={style.rowItemValue}>{expression}</div>
//         <div className={style.rowItemResult}>
//           <Interpreter value={expression} />
//         </div>
//       </div>
//     );
//   }
// }
