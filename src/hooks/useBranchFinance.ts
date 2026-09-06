import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { branchFinanceServices } from "@/services/branchFinance.service";
import { toast } from "sonner";
import { handleMutationError } from "@/utils/errorHandler";
import { FINANCE_KEYS } from "@/constants/queryKeys";
import type { CreateFinanceEntryRequest } from "@/types";

const useCategoriesList = (branchId: string) => {
  return useQuery({
    queryKey: [FINANCE_KEYS.CATEGORIES_LIST, branchId],
    queryFn: () => branchFinanceServices.getCategoriesList(branchId),
    enabled: !!branchId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

const useCreateCategory = (branchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; type: "INCOME" | "EXPENSE" }) =>
      branchFinanceServices.createCategory(branchId, data),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({
        queryKey: [FINANCE_KEYS.CATEGORIES_LIST, branchId],
      });
    },
    onError: handleMutationError("Failed to create category"),
  });
};

const useCreateFinanceEntry = (branchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFinanceEntryRequest) =>
      branchFinanceServices.createFinanceEntry(branchId, data),
    onSuccess: (response) => {
      toast.success(response.message);
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: [FINANCE_KEYS.ENTRIES, branchId] });
      queryClient.invalidateQueries({ queryKey: [FINANCE_KEYS.SUMMARY, branchId] });
      queryClient.invalidateQueries({
        queryKey: [FINANCE_KEYS.CATEGORIES, branchId],
      });
    },
    onError: handleMutationError("Failed to save transaction"),
  });
};

const useFinanceEntries = (
  branchId: string,
  filters: {
    type?: string;
    category_id?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }
) => {
  return useQuery({
    queryKey: [FINANCE_KEYS.ENTRIES, branchId, filters],
    queryFn: () => branchFinanceServices.getFinanceEntries(branchId, filters),
    enabled: !!branchId,
  });
};

const useFinanceSummary = (branchId: string) => {
  return useQuery({
    queryKey: [FINANCE_KEYS.SUMMARY, branchId],
    queryFn: () => branchFinanceServices.getFinanceSummary(branchId),
    enabled: !!branchId,
  });
};

const useFinanceCategories = (branchId: string, type?: "INCOME" | "EXPENSE") => {
  return useQuery({
    queryKey: [FINANCE_KEYS.CATEGORIES, branchId, type],
    queryFn: () => branchFinanceServices.getFinanceCategories(branchId, type),
    enabled: !!branchId,
  });
};

const useFinanceMonthExport = (
  branchId: string,
  year: number,
  month: number,
  enabled = false
) => {
  return useQuery({
    queryKey: [FINANCE_KEYS.MONTH_EXPORT, branchId, year, month],
    queryFn: () => branchFinanceServices.getFinanceMonthExport(branchId, year, month),
    enabled: enabled && !!branchId && year > 0 && month > 0,
  });
};

const useUpdateFinanceEntry = (branchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryId,
      data,
    }: {
      entryId: string;
      data: CreateFinanceEntryRequest;
    }) => branchFinanceServices.updateFinanceEntry(branchId, entryId, data),
    onSuccess: (response) => {
      toast.success(response.message);
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: [FINANCE_KEYS.ENTRIES, branchId] });
      queryClient.invalidateQueries({ queryKey: [FINANCE_KEYS.SUMMARY, branchId] });
      queryClient.invalidateQueries({
        queryKey: [FINANCE_KEYS.CATEGORIES, branchId],
      });
    },
    onError: handleMutationError("Failed to update transaction"),
  });
};

const useDeleteFinanceEntry = (branchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) =>
      branchFinanceServices.deleteFinanceEntry(branchId, entryId),
    onSuccess: (response) => {
      toast.success(response.message);
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: [FINANCE_KEYS.ENTRIES, branchId] });
      queryClient.invalidateQueries({ queryKey: [FINANCE_KEYS.SUMMARY, branchId] });
      queryClient.invalidateQueries({
        queryKey: [FINANCE_KEYS.CATEGORIES, branchId],
      });
    },
    onError: handleMutationError("Failed to delete transaction"),
  });
};

const financeHooks = {
  useCategoriesList,
  useCreateCategory,
  useCreateFinanceEntry,
  useUpdateFinanceEntry,
  useFinanceEntries,
  useFinanceSummary,
  useFinanceCategories,
  useFinanceMonthExport,
  useDeleteFinanceEntry,
};

export default financeHooks;
export {
  useCategoriesList,
  useCreateCategory,
  useCreateFinanceEntry,
  useUpdateFinanceEntry,
  useFinanceEntries,
  useFinanceSummary,
  useFinanceCategories,
  useFinanceMonthExport,
  useDeleteFinanceEntry,
};

