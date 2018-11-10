import { h } from 'preact';
import interpreter from '../interpreter';

export default ({ value }: { value: string }) => {
  let results;
  try {
    results = interpreter(value);
  } catch {
    results = 'Nope';
  }
  return <div>{value}: {results}</div>;
};
