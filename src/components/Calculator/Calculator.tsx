import { h, Component, Ref } from 'preact';
import Rows from './Rows';
import EditableRow from './EditableRow';

const style = require('./Calculator.css');

interface ICalculatorProps {}
interface ICalculatorState {
  expressions: string[];
}

class Calculator extends Component<ICalculatorProps, ICalculatorState> {
  wrapperElement: Element;

  constructor() {
    super();

    this.state = {
      expressions: [
        '2+2',
        '5-10',
        '100*4',
        '100/4',
        '1*2+3',
        '1+2*3',
        '(1+2)*3',
        '1*(1+2)*3+(1+2+3)',
        ')1+2)*3',
        '-1+2-3*2',
      ],
    };
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  handleSubmit = (expression: string) => {
    this.setState(
      {
        expressions: [...this.state.expressions, expression],
      },
      () => this.scrollToBottom(true)
    );
  };

  scrollToBottom = (isSmooth?: boolean) => {
    const el = this.wrapperElement;
    const options: ScrollToOptions = {
      top: el.scrollHeight,
      behavior: isSmooth ? 'smooth' : 'instant',
    };
    el.scrollTo(options);
  };

  render(_props, state: ICalculatorState) {
    const { expressions } = state;
    return (
      <div className={style.calculator}>
        <div className={style.calculatorBody}>
          <div
            className={style.calculatorBodyWrapper}
            ref={ref => (this.wrapperElement = ref)}
          >
            <Rows expressions={expressions} />
          </div>
        </div>
        <div className={style.calculatorFooter}>
          <EditableRow onSubmit={this.handleSubmit} />
        </div>
      </div>
    );
  }
}

export default Calculator;
