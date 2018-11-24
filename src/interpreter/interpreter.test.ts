import interpreter from './interpreter';

function t(expression: string, expected: string) {
  test(`${expression} => ${expected}`, () => {
    expect(interpreter(expression)).toBe(expected);
  });
}

t('1+2', '3');
t('2-1', '1');
t('2+1*3', '5');
t('10-2/4', '9.5');
t('(10-2)/4*(3+1)', '8');
t('-(10-2)+(+3)', '-5');
t('2^3', '8');
t('2^3^4', '4096');
t('2*2^3', '16');
t('  ( 2 + 3 )  ', '5');
t('1plus2', '3');
t('1 plus 2', '3');
// t('4 divide by 2','2'); Todo: Handle composite keywords
t('5 in binary', '0b101');
t('1+2+3 in binary', '0b110');
t('1 in binary + 6', '0b111');
// t('0b101 in decimal', '5'); Todo: Handle conversion to decimal
t('1.5+0.33', '1.83');
