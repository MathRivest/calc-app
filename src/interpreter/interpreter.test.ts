import interpreter from './interpreter';

test('addition', () => {
  expect(interpreter('1+2')).toBe('3');
});

test('substraction', () => {
  expect(interpreter('2-1')).toBe('1');
});

test('multiplication', () => {
  expect(interpreter('2+1*3')).toBe('5');
});

test('division', () => {
  expect(interpreter('10-2/4')).toBe('9.5');
});

test('parenthesis', () => {
  expect(interpreter('(10-2)/4*(3+1)')).toBe('8');
});

test('unary plus and minus', () => {
  expect(interpreter('-(10-2)+(+3)')).toBe('-5');
});

test('exponent', () => {
  expect(interpreter('2^3')).toBe('8');
  expect(interpreter('2^3^4')).toBe('4096');
  expect(interpreter('2*2^3')).toBe('16');
});

test('white space', () => {
  expect(interpreter('  ( 2 + 3 )  ')).toBe('5');
});

test('plus', () => {
  expect(interpreter('1plus2')).toBe('3');
  expect(interpreter('1 plus 2')).toBe('3');
});

// Todo: Handle composite keywords
test.skip('divide by', () => {
  expect(interpreter('4 divide by 2')).toBe('2');
});

describe('binary', () => {
  test('number to binary', () =>
    expect(interpreter('5 in binary')).toBe('0b101'));
  test('expression to binary', () =>
    expect(interpreter('1+2+3 in binary')).toBe('0b110'));

  // Todo
  test.skip('number representation propagation', () =>
    expect(interpreter('1 in binary + 6')).toBe('0b111'));
});
