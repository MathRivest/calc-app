export type UnitDefinition = {
  fromBase: (value: number) => number;
  toBase: (value: number) => number;
  format: (s: string) => string;
};

export type BaseUnitDefinition = {
  base: string;
  conversionMap: Map<string, UnitDefinition>;
};

function unitWithRatio(
  standard: string,
  ratio: number,
  format = str => `${str}${standard}`
): [string, UnitDefinition] {
  return [
    standard,
    {
      fromBase: v => v * ratio,
      toBase: v => v / ratio,
      format,
    },
  ];
}

function unitDefinition(
  standard: string,
  fromBase: (value: number) => number,
  toBase: (value: number) => number,
  format = str => `${str}${standard}`
): [string, UnitDefinition] {
  return [
    standard,
    {
      fromBase,
      toBase,
      format,
    },
  ];
}

export const unitDefinitions: BaseUnitDefinition[] = [
  {
    base: 'Currency',
    conversionMap: new Map([
      unitWithRatio('USD', 1, str => `$${str}`),
      unitWithRatio('CAD', 1.32, str => `$${str} CAD`),
    ]),
  },
  {
    base: 'Temperature',
    conversionMap: new Map([
      unitDefinition('K', v => v, v => v, str => `${str} K`),
      unitDefinition('C', v => v - 273.15, v => v + 273.15, str => `${str} C`),
      unitDefinition(
        'F',
        v => ((v - 273.15) * 9) / 5 + 32,
        v => ((v - 32) * 5) / 9 + 273.15,
        str => `${str} F`
      ),
    ]),
  },
];
