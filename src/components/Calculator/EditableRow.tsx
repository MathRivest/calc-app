import { h, Component } from 'preact';
const style = require('./EditableRow.css');

interface IEditableRowProps {
  onSubmit: (expression: string) => void;
}

interface IEditableRowState {
  expression: string;
}

export default class EditableRow extends Component<
  IEditableRowProps,
  IEditableRowState
> {
  constructor() {
    super();
    this.state = {
      expression: '',
    };
  }
  handleChange = (evt: any) => {
    this.setState({ expression: evt.target.value });
  };

  handleSubmit = (evt: any) => {
    this.setState(() => {
      this.props.onSubmit(evt.target.value);
      return { expression: '' };
    });
  };

  render() {
    return (
      <input
        className={style.input}
        type="text"
        onKeyDown={this.handleChange}
        onChange={this.handleSubmit}
        value={this.state.expression}
      />
    );
  }
}
