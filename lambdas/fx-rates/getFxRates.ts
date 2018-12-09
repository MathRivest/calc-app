import { writeFile } from 'fs';
import fetch from 'node-fetch';
import { config } from 'dotenv';
import supportedSymbols from './symbols';

config();

if (!process.env.FIXER_ACCESS_KEY) {
  throw new Error('No FIXER_ACCESS_KEY found');
}

const symbols = Object.keys(supportedSymbols);
const base = 'EUR'; // Can't change this with base pricing
const fixerLatestURl = `http://data.fixer.io/api/latest?access_key=${
  process.env.FIXER_ACCESS_KEY
}&symbols=${symbols}&base=${base}`;

interface IFixerSuccessResponse {
  success: true;
  timestamp: number;
  base: 'EUR';
  date: 'string';
  rates: {
    [symbol: string]: number;
  };
}

interface IFixerFailedResponse {
  success: false;
  error: {
    code: number;
    type: string;
  };
}

type IFixerResponse = IFixerSuccessResponse | IFixerFailedResponse;

// TODO: Transform this in real aws/azure/googlecloud function
export const init = async (context?: any, req?: any) => {
  const fixerResponse: IFixerResponse = await fetch(fixerLatestURl).then(res =>
    res.json()
  );

  if (fixerResponse.success) {
    writeFile('latest-fx-rates.json', JSON.stringify(fixerResponse), () =>
      console.log('Rates saved successfully')
    );
  } else {
    console.log(`Couldn't retrieve rates: ${fixerResponse.error.type}`);
  }
};

init();
