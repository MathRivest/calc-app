import { h } from 'preact';
import interpreter from '../interpreter/interpreter';

export default ({ value }: { value: string }) => {
  let results;
  try {
    results = interpreter(value);
  } catch (error) {
    console.log(error);
    results = 'Nope';
  }
  return <span>{results}</span>;
};
