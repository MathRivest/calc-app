export type UnitDefinition = {
  fromBase: (value: number) => number;
  toBase: (value: number) => number;
  format: (s: string) => string;
  synonyms: string[];
};

export type BaseUnitDefinition = {
  base: string;
  units: UnitDefinition[];
};

function unitWithRatio(
  synonyms: string[],
  ratio: number,
  format
): UnitDefinition {
  return unitDefinition(synonyms, v => v * ratio, v => v / ratio, format);
}

function unitDefinition(
  synonyms: string[] = [],
  fromBase: (value: number) => number,
  toBase: (value: number) => number,
  format
): UnitDefinition {
  return {
    fromBase,
    toBase,
    format,
    synonyms,
  };
}

export const unitDefinitions: BaseUnitDefinition[] = [
  {
    base: 'Currency',
    units: [
      unitWithRatio(['USD'], 1, str => `$${str}`),
      unitWithRatio(['CAD'], 1.32, str => `$${str} CAD`),
    ],
  },
  {
    base: 'Temperature',
    units: [
      unitDefinition(['kelvin'], v => v, v => v, str => `${str} K`),
      unitDefinition(
        ['°C', 'C', 'celsius'],
        v => v - 273.15,
        v => v + 273.15,
        str => `${str} °C`
      ),
      unitDefinition(
        ['°F', 'F', 'fahrenheit'],
        v => ((v - 273.15) * 9) / 5 + 32,
        v => ((v - 32) * 5) / 9 + 273.15,
        str => `${str} °F`
      ),
    ],
  },
];
