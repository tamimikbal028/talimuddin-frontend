import type { User } from "./user.types";

export interface FinanceCategory {
  id: string;
  branch_id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  created_at: string;
}

export interface FinanceDetailItem {
  itemName: string;
  amount: number;
}

export interface FinanceEntry {
  id: string;
  branch_id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  category_id: string;
  note: string;
  date: string;
  recorded_by: User;
  person_name: string;
  person_phone: string;
  details: FinanceDetailItem[];
  created_at: string;
  category: {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
  };
}

export interface FinanceOverallSummary {
  income: number;
  expense: number;
  balance: number;
}

export interface FinanceCategoryBreakdown {
  id: string;
  category: string;
  type: "INCOME" | "EXPENSE";
  income: number;
  expense: number;
  balance: number;
  count: number;
}

export interface FinanceMonthlyStat {
  year: number;
  month: number;
  income: number;
  expense: number;
  breakdown: Array<{
    category: string;
    type: "INCOME" | "EXPENSE";
    total: number;
    count: number;
  }>;
}

export interface FinanceSummaryResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    overall: FinanceOverallSummary;
    monthlyStats: FinanceMonthlyStat[];
  };
}

export interface CreateFinanceEntryRequest {
  type: "INCOME" | "EXPENSE";
  amount: number;
  category_id: string;
  note?: string;
  date: string;
  personName?: string;
  personPhone?: string;
  details?: FinanceDetailItem[];
}

export interface CategoriesListResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    categories: FinanceCategory[];
  };
}

export interface CreateCategoryResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    category: FinanceCategory;
  };
}

export interface CreateFinanceEntryResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    entry: FinanceEntry;
  };
}

export interface FinanceEntriesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    entries: FinanceEntry[];
    pagination: {
      totalDocs: number;
      limit: number;
      page: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface FinanceCategoriesBreakdownResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    categories: FinanceCategoryBreakdown[];
  };
}

export interface FinanceMonthExportResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    year: number;
    month: number;
    entries: FinanceEntry[];
    summary: {
      income: number;
      expense: number;
      balance: number;
      totalEntries: number;
    };
  };
}

export interface DeleteFinanceEntryResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    entryId: string;
  };
}
