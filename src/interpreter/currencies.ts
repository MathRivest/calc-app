export enum Currency {
  USD,
  CAD,
}

export const keywordToCurrency = new Map([
  ['USD', Currency.USD],
  ['CAD', Currency.CAD],
]);
