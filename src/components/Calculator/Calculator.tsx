import { h, Component } from 'preact';
import Rows from './Rows';

const style = require('./Calculator.css');

interface ICalculatorProps {}
interface ICalculatorState {}

class Calculator extends Component<ICalculatorProps, ICalculatorState> {
  expressions: string[] = [
    '2+2',
    '5-10',
    '100*4',
    '100/4',
    '1*2+3',
    '1+2*3',
    '(1+2)*3',
    '1*(1+2)*3+(1+2+3)',
    ')1+2)*3',
  ];

  constructor() {
    super();
  }

  render() {
    return (
      <div className={style.Calculator}>
        <Rows expressions={this.expressions} />
      </div>
    );
  }
}

export default Calculator;
