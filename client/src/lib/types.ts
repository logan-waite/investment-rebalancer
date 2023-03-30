type Holding = {
  value: number;
  currencyCode: string;
  tickerSymbol: string;
  name: string;
  type: string;
};

export type AccountData = {
  name: string;
  accountId: string;
  available: number;
  balance: number;
  invested: number;
  holdings: Holding[];
};
