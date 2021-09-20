export type OrderSide = "buy" | "sell";

export enum Errors {
  MaxProfitSum = "Maximum profit sum is 500%",
  MinProfitValue = "Minimum value is 0.01",
  TargetProfit = "Each target's profit should be greater than the previous one",
  MinTradePrice = "Price must be greater than 0",
  OutOfArea = "out of 100% selected. Please decrease by",
}

export interface ProfitTarget {
  id: string;
  profit: number;
  price: number;
  amount: number;
  errors?: ProfitTargetErrors
}

export interface ProfitTargetError {
  message: string
}

export type ProfitTargetFieldUpdated = keyof Pick<ProfitTarget, 'profit' | 'price' | 'amount'>

export interface ProfitTargetErrors {
  profit?: Errors;
  price?: Errors;
  amount?: string;
}
