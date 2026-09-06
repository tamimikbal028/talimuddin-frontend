export const FINANCE_TYPES = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;

export type FinanceType = keyof typeof FINANCE_TYPES;

export const FINANCE_ENTRY_LIMIT = 20;
