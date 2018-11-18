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
