import api from "@/config/axios";
import type {
  CategoriesListResponse,
  CreateCategoryResponse,
  CreateFinanceEntryResponse,
  FinanceEntriesResponse,
  FinanceCategoriesBreakdownResponse,
  FinanceSummaryResponse,
  FinanceMonthExportResponse,
  DeleteFinanceEntryResponse,
  CreateFinanceEntryRequest,
  RecordFinancePaymentRequest,
  RecordFinancePaymentResponse,
  FinancePaymentsResponse,
  BranchActionCodeResponse,
} from "../types";

const getCategoriesList = async (branchId: string): Promise<CategoriesListResponse> => {
  const response = await api.get<CategoriesListResponse>(
    `/branches/${branchId}/finance/categories-list`
  );
  return response.data;
};

const createCategory = async (
  branchId: string,
  data: { name: string; type: "INCOME" | "EXPENSE" }
): Promise<CreateCategoryResponse> => {
  const response = await api.post<CreateCategoryResponse>(
    `/branches/${branchId}/finance/categories`,
    data
  );
  return response.data;
};

const createFinanceEntry = async (
  branchId: string,
  data: CreateFinanceEntryRequest
): Promise<CreateFinanceEntryResponse> => {
  const response = await api.post<CreateFinanceEntryResponse>(
    `/branches/${branchId}/finance`,
    data
  );
  return response.data;
};

const getFinanceEntries = async (
  branchId: string,
  filters: {
    type?: string;
    category_id?: string;
    payment_status?: string;
    member_id?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<FinanceEntriesResponse> => {
  const params = new URLSearchParams();
  if (filters.type) params.append("type", filters.type);
  if (filters.category_id) params.append("category_id", filters.category_id);
  if (filters.payment_status) params.append("payment_status", filters.payment_status);
  if (filters.member_id) params.append("member_id", filters.member_id);
  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);

  const response = await api.get<FinanceEntriesResponse>(
    `/branches/${branchId}/finance?${params.toString()}`
  );
  return response.data;
};

const getFinanceSummary = async (branchId: string): Promise<FinanceSummaryResponse> => {
  const response = await api.get<FinanceSummaryResponse>(
    `/branches/${branchId}/finance/summary`
  );
  return response.data;
};

const getFinanceCategories = async (
  branchId: string,
  type?: "INCOME" | "EXPENSE"
): Promise<FinanceCategoriesBreakdownResponse> => {
  let url = `/branches/${branchId}/finance/categories`;
  if (type) {
    url += `?type=${type}`;
  }
  const response = await api.get<FinanceCategoriesBreakdownResponse>(url);
  return response.data;
};

const getFinanceMonthExport = async (
  branchId: string,
  year: number,
  month: number
): Promise<FinanceMonthExportResponse> => {
  const response = await api.get<FinanceMonthExportResponse>(
    `/branches/${branchId}/finance/export/month?year=${year}&month=${month}`
  );
  return response.data;
};

const deleteFinanceEntry = async (
  branchId: string,
  entryId: string,
  actionCode?: string
): Promise<DeleteFinanceEntryResponse> => {
  const response = await api.delete<DeleteFinanceEntryResponse>(
    `/branches/${branchId}/finance/${entryId}`,
    {
      data: actionCode ? { actionCode } : undefined,
      headers: actionCode ? { "x-action-code": actionCode } : undefined,
    }
  );
  return response.data;
};

const updateFinanceEntry = async (
  branchId: string,
  entryId: string,
  data: CreateFinanceEntryRequest
): Promise<CreateFinanceEntryResponse> => {
  const response = await api.put<CreateFinanceEntryResponse>(
    `/branches/${branchId}/finance/${entryId}`,
    data,
    {
      headers: data.actionCode
        ? { "x-action-code": data.actionCode }
        : undefined,
    }
  );
  return response.data;
};

const recordFinancePayment = async (
  branchId: string,
  entryId: string,
  data: RecordFinancePaymentRequest
): Promise<RecordFinancePaymentResponse> => {
  const response = await api.post<RecordFinancePaymentResponse>(
    `/branches/${branchId}/finance/${entryId}/payments`,
    data
  );
  return response.data;
};

const getFinancePayments = async (
  branchId: string,
  entryId: string
): Promise<FinancePaymentsResponse> => {
  const response = await api.get<FinancePaymentsResponse>(
    `/branches/${branchId}/finance/${entryId}/payments`
  );
  return response.data;
};

const getBranchActionCode = async (
  branchId: string
): Promise<BranchActionCodeResponse> => {
  const response = await api.get<BranchActionCodeResponse>(
    `/branches/${branchId}/finance/action-code`
  );
  return response.data;
};

const updateBranchActionCode = async (
  branchId: string,
  actionCode: string
): Promise<BranchActionCodeResponse> => {
  const response = await api.patch<BranchActionCodeResponse>(
    `/branches/${branchId}/finance/action-code`,
    { actionCode }
  );
  return response.data;
};

export const branchFinanceServices = {
  getCategoriesList,
  createCategory,
  createFinanceEntry,
  getFinanceEntries,
  getFinanceSummary,
  getFinanceCategories,
  getFinanceMonthExport,
  updateFinanceEntry,
  deleteFinanceEntry,
  recordFinancePayment,
  getFinancePayments,
  getBranchActionCode,
  updateBranchActionCode,
};

export default branchFinanceServices;

