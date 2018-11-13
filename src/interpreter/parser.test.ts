import { tokenizer, parser } from '../interpreter';

test('should match addition snapshot', () => {
  const ast = parser(tokenizer('1+2'));
  expect(ast).toMatchSnapshot();
});

test('should match substraction snapshot', () => {
  const ast = parser(tokenizer('1-2'));
  expect(ast).toMatchSnapshot();
});

test('should match multiplication snapshot', () => {
  const ast = parser(tokenizer('1*2'));
  expect(ast).toMatchSnapshot();
});

test('should match division snapshot', () => {
  const ast = parser(tokenizer('1/2'));
  expect(ast).toMatchSnapshot();
});

test('should match chain addition snapshot', () => {
  const ast = parser(tokenizer('1+2-2'));
  expect(ast).toMatchSnapshot();
});

test('should match multiplication and addition snapshot', () => {
  const ast = parser(tokenizer('1+2*2'));
  expect(ast).toMatchSnapshot();
});
