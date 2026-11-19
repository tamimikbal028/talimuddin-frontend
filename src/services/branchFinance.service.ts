import { getActiveUserId, supabase } from "@/config/supabase";
import { FINANCE_TYPES } from "@/constants";
import { createApiResponse } from "@/utils/apiResponse";
import {
  getBranchAccessContext,
  throwIfError,
} from "@/utils/supabaseHelpers";
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
  FinanceEntry,
  FinanceCategory,
  FinancePayment,
  FinanceCategoryBreakdown,
  FinanceCategoryMonthStat,
  FinanceMonthlyStat,
  User,
} from "../types";

const PAYMENT_STATUS = {
  PAID: "PAID",
  PARTIAL: "PARTIAL",
  DUE: "DUE",
} as const;

const FINANCE_ENTRY_SELECT = `
  id, branch_id, type, amount, total_amount, paid_amount, due_amount, payment_status, note, date, person_name, person_phone, member_id, salary_month, details, created_at,
  recorded_by:users!recorded_by(id, full_name, user_name, avatar),
  category:branch_finance_categories!category_id(id, name, type),
  member:branch_memberships!member_id(id, name, phone, serial_no)
`;

const unwrapSingle = <T>(val: T | T[] | null | undefined): T | null => {
  if (!val) return null;
  return Array.isArray(val) ? val[0] || null : val;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapEntryWithDue = (raw: any): FinanceEntry => {
  const totalAmount = Number(
    raw.total_amount !== undefined && raw.total_amount !== null
      ? raw.total_amount
      : raw.amount
  );
  const paidAmount = Number(
    raw.paid_amount !== undefined && raw.paid_amount !== null
      ? raw.paid_amount
      : raw.amount
  );
  const dueAmount = Number(
    raw.due_amount !== undefined && raw.due_amount !== null
      ? raw.due_amount
      : 0
  );
  const paymentStatus = (raw.payment_status ||
    (dueAmount > 0
      ? paidAmount > 0
        ? PAYMENT_STATUS.PARTIAL
        : PAYMENT_STATUS.DUE
      : PAYMENT_STATUS.PAID)) as "PAID" | "PARTIAL" | "DUE";

  const cat = unwrapSingle(raw.category) as {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
  } | null;

  const recordedBy = unwrapSingle(raw.recorded_by) as User | null;
  const member = unwrapSingle(raw.member) as FinanceEntry["member"];

  return {
    id: raw.id,
    branch_id: raw.branch_id,
    type: raw.type,
    amount: Number(raw.amount ?? totalAmount),
    total_amount: totalAmount,
    paid_amount: paidAmount,
    due_amount: dueAmount,
    payment_status: paymentStatus,
    category_id: raw.category_id || cat?.id || "",
    note: raw.note ?? "",
    date: raw.date,
    salary_month: raw.salary_month ?? null,
    recorded_by: (recordedBy || {}) as User,
    person_name: raw.person_name ?? "",
    person_phone: raw.person_phone ?? "",
    member_id: raw.member_id ?? null,
    member: member ?? null,
    details: Array.isArray(raw.details) ? raw.details : [],
    created_at: raw.created_at,
    category: cat || { id: "", name: "Uncategorized", type: raw.type },
  };
};

const computePaymentAmounts = (
  totalAmount: number,
  paymentStatus?: string,
  paidAmountInput?: number
) => {
  let status: "PAID" | "PARTIAL" | "DUE" =
    (paymentStatus as "PAID" | "PARTIAL" | "DUE") || PAYMENT_STATUS.PAID;
  let paidAmt = 0;
  let dueAmt = 0;

  if (status === PAYMENT_STATUS.PAID) {
    paidAmt = totalAmount;
    dueAmt = 0;
  } else if (status === PAYMENT_STATUS.DUE) {
    paidAmt = 0;
    dueAmt = totalAmount;
  } else if (status === PAYMENT_STATUS.PARTIAL) {
    paidAmt = Number(paidAmountInput);
    if (isNaN(paidAmt) || paidAmt < 0 || paidAmt >= totalAmount) {
      throw new Error(
        "For partial payment, paid amount must be >= 0 and less than total amount"
      );
    }
    dueAmt = totalAmount - paidAmt;
    if (dueAmt <= 0) {
      status = PAYMENT_STATUS.PAID;
      dueAmt = 0;
    }
  } else {
    status = PAYMENT_STATUS.PAID;
    paidAmt = totalAmount;
    dueAmt = 0;
  }

  return { status, paidAmt, dueAmt };
};

const getCategoriesList = async (
  branchId: string
): Promise<CategoriesListResponse> => {
  const userId = await getActiveUserId();
  const { isAdmin, isAppAdmin, isModerator, allowedCategoryIds } =
    await getBranchAccessContext(branchId, userId, {
      requireFinanceAccess: true,
    });

  let query = supabase
    .from("branch_finance_categories")
    .select("id, branch_id, name, type, created_at")
    .eq("branch_id", branchId)
    .order("name", { ascending: true });

  if (!isAdmin && !isAppAdmin && isModerator) {
    if (allowedCategoryIds && allowedCategoryIds.length > 0) {
      query = query.in("id", allowedCategoryIds);
    }
  }

  const { data: categories, error } = await query;
  throwIfError(error, "Failed to fetch categories list");

  return createApiResponse(
    { categories: (categories || []) as FinanceCategory[] },
    "Categories fetched successfully"
  );
};

const createCategory = async (
  branchId: string,
  data: { name: string; type: "INCOME" | "EXPENSE" }
): Promise<CreateCategoryResponse> => {
  const userId = await getActiveUserId();
  const { isAdmin, isAppAdmin, isModerator, allowedCategoryIds } =
    await getBranchAccessContext(branchId, userId, {
      requireBranchStaff: true,
    });

  if (!isAdmin && !isAppAdmin && isModerator) {
    if (allowedCategoryIds && allowedCategoryIds.length > 0) {
      throw new Error(
        "নির্দিষ্ট ক্যাটাগরিতে সীমাবদ্ধ মডারেটর নতুন ক্যাটাগরি তৈরি করতে পারবেন না।"
      );
    }
  }

  if (!data.name || !data.type) {
    throw new Error("Category name and type are required");
  }

  if (
    data.type !== FINANCE_TYPES.INCOME &&
    data.type !== FINANCE_TYPES.EXPENSE
  ) {
    throw new Error("Type must be INCOME or EXPENSE");
  }

  const trimmedName = data.name.trim();
  if (!trimmedName) {
    throw new Error("Category name cannot be empty");
  }

  const { data: existing, error: findError } = await supabase
    .from("branch_finance_categories")
    .select("id")
    .eq("branch_id", branchId)
    .eq("type", data.type)
    .ilike("name", trimmedName)
    .maybeSingle();

  throwIfError(findError, "Error verifying category uniqueness");

  if (existing) {
    throw new Error(
      `Category "${trimmedName}" already exists for ${data.type.toLowerCase()}s`
    );
  }

  const { data: newCategory, error: insertError } = await supabase
    .from("branch_finance_categories")
    .insert({
      branch_id: branchId,
      name: trimmedName,
      type: data.type,
    })
    .select()
    .single();

  if (insertError || !newCategory) {
    throw new Error(insertError?.message || "Failed to create category");
  }

  return createApiResponse(
    { category: newCategory as FinanceCategory },
    "Category created successfully",
    201
  );
};

const createFinanceEntry = async (
  branchId: string,
  data: CreateFinanceEntryRequest
): Promise<CreateFinanceEntryResponse> => {
  const userId = await getActiveUserId();
  const { isAdmin, isAppAdmin, isModerator, allowedCategoryIds } =
    await getBranchAccessContext(branchId, userId, {
      requireBranchStaff: true,
    });

  const rawAmount =
    data.total_amount !== undefined ? data.total_amount : data.amount;
  if (!data.type || rawAmount === undefined || !data.category_id) {
    throw new Error("Type, amount, and category_id are required");
  }

  if (
    data.salary_month &&
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(data.salary_month)
  ) {
    throw new Error("salary_month must be in YYYY-MM format");
  }

  if (
    data.type !== FINANCE_TYPES.INCOME &&
    data.type !== FINANCE_TYPES.EXPENSE
  ) {
    throw new Error("Type must be INCOME or EXPENSE");
  }

  const totalAmount = Number(rawAmount);
  if (isNaN(totalAmount) || totalAmount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  const { status, paidAmt, dueAmt } = computePaymentAmounts(
    totalAmount,
    data.payment_status,
    data.paid_amount
  );

  const { data: category, error: catError } = await supabase
    .from("branch_finance_categories")
    .select("id, type")
    .eq("id", data.category_id)
    .eq("branch_id", branchId)
    .maybeSingle();

  if (catError || !category) {
    throw new Error("Invalid category selected for this branch");
  }

  if (category.type !== data.type) {
    throw new Error("Category type mismatch");
  }

  if (!isAdmin && !isAppAdmin && isModerator) {
    if (allowedCategoryIds && allowedCategoryIds.length > 0) {
      if (!allowedCategoryIds.includes(data.category_id)) {
        throw new Error(
          "আপনার এই ক্যাটাগরিতে এন্ট্রি যোগ করার অনুমতি নেই।"
        );
      }
    }
  }

  if (data.details && Array.isArray(data.details) && data.details.length > 0) {
    const detailsSum = data.details.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
    if (Math.abs(detailsSum - totalAmount) > 0.01) {
      throw new Error(
        `Total amount (${totalAmount}) does not match the sum of item details (${detailsSum}).`
      );
    }
  }

  const basePayload = {
    branch_id: branchId,
    type: data.type,
    amount: totalAmount,
    total_amount: totalAmount,
    paid_amount: paidAmt,
    due_amount: dueAmt,
    payment_status: status,
    category_id: data.category_id,
    note: data.note?.trim() || "",
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    recorded_by: userId,
    person_name: data.personName?.trim() || "",
    person_phone: data.personPhone?.trim() || "",
    member_id: data.member_id || null,
    salary_month: data.salary_month || null,
    details: data.details && data.details.length > 0 ? data.details : [],
  };

  const { data: inserted, error: insertError } = await supabase
    .from("branch_finances")
    .insert(basePayload)
    .select(FINANCE_ENTRY_SELECT)
    .single();

  if (insertError || !inserted) {
    throw new Error(insertError?.message || "Failed to create finance entry");
  }

  const entry = mapEntryWithDue(inserted);

  if (paidAmt > 0) {
    await supabase.from("branch_finance_payments").insert({
      finance_id: entry.id,
      branch_id: branchId,
      amount: paidAmt,
      payment_date: entry.date,
      note: "Initial payment",
      recorded_by: userId,
    });
  }

  return createApiResponse(
    { entry },
    "Finance entry recorded successfully",
    201
  );
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
  const userId = await getActiveUserId();

  try {
    await getBranchAccessContext(branchId, userId, {
      requireFinanceAccess: true,
    });
  } catch (err) {
    let allowed = false;
    if (filters.member_id) {
      const { data: selfMem } = await supabase
        .from("branch_memberships")
        .select("id")
        .eq("id", filters.member_id)
        .eq("branch_id", branchId)
        .eq("user_id", userId)
        .eq("is_deleted", false)
        .maybeSingle();
      if (selfMem) allowed = true;
    }
    if (!allowed) throw err;
  }

  const parsedPage = Number(filters.page) || 1;
  const parsedLimit = Number(filters.limit) || 20;
  const from = (parsedPage - 1) * parsedLimit;
  const to = from + parsedLimit - 1;

  let qb = supabase
    .from("branch_finances")
    .select(FINANCE_ENTRY_SELECT, { count: "exact" })
    .eq("branch_id", branchId);

  if (
    filters.type === FINANCE_TYPES.INCOME ||
    filters.type === FINANCE_TYPES.EXPENSE
  ) {
    qb = qb.eq("type", filters.type);
  }

  if (filters.category_id) {
    qb = qb.eq("category_id", filters.category_id);
  }

  if (filters.member_id) {
    qb = qb.eq("member_id", filters.member_id);
  }

  if (filters.payment_status) {
    if (filters.payment_status === "HAS_DUE") {
      qb = qb.gt("due_amount", 0);
    } else if (
      filters.payment_status === PAYMENT_STATUS.PAID ||
      filters.payment_status === PAYMENT_STATUS.PARTIAL ||
      filters.payment_status === PAYMENT_STATUS.DUE
    ) {
      qb = qb.eq("payment_status", filters.payment_status);
    }
  }

  if (filters.startDate) {
    qb = qb.gte("date", new Date(filters.startDate).toISOString());
  }

  if (filters.endDate) {
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    qb = qb.lte("date", end.toISOString());
  }

  const { data: entries, error, count } = await qb
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  throwIfError(error, "Failed to fetch finance entries");

  const mappedEntries = (entries || []).map(mapEntryWithDue);
  const totalDocs = count ?? 0;
  const totalPages = Math.ceil(totalDocs / parsedLimit);

  return createApiResponse(
    {
      entries: mappedEntries,
      pagination: {
        totalDocs,
        limit: parsedLimit,
        page: parsedPage,
        totalPages,
        hasNextPage: parsedPage < totalPages,
        hasPrevPage: parsedPage > 1,
      },
    },
    "Finance entries fetched successfully"
  );
};

const getFinanceSummary = async (
  branchId: string
): Promise<FinanceSummaryResponse> => {
  const userId = await getActiveUserId();
  await getBranchAccessContext(branchId, userId, {
    requireFinanceAccess: true,
  });

  const { data: allRaw, error } = await supabase
    .from("branch_finances")
    .select(
      "type, amount, total_amount, paid_amount, due_amount, payment_status, date, category:branch_finance_categories!category_id(name)"
    )
    .eq("branch_id", branchId)
    .order("date", { ascending: false });

  throwIfError(error, "Failed to compute finance summary");

  const overallData = (allRaw || []).map(mapEntryWithDue);

  let totalIncome = 0;
  let totalExpense = 0;
  let totalCashIn = 0;
  let totalCashOut = 0;
  let totalReceivable = 0;
  let totalPayable = 0;

  interface MonthlyAccumulator {
    year: number;
    month: number;
    income: number;
    expense: number;
    cash_in: number;
    cash_out: number;
    receivable: number;
    payable: number;
    breakdownMap: Record<
      string,
      {
        category: string;
        type: "INCOME" | "EXPENSE";
        total: number;
        paid: number;
        due: number;
        count: number;
      }
    >;
  }

  const monthlyGroups: Record<string, MonthlyAccumulator> = {};

  for (const item of overallData) {
    const totalAmt = Number(item.total_amount ?? item.amount);
    const paidAmt = Number(item.paid_amount ?? totalAmt);
    const dueAmt = Number(item.due_amount ?? 0);

    if (item.type === FINANCE_TYPES.INCOME) {
      totalIncome += totalAmt;
      totalCashIn += paidAmt;
      totalReceivable += dueAmt;
    } else {
      totalExpense += totalAmt;
      totalCashOut += paidAmt;
      totalPayable += dueAmt;
    }

    const txDate = new Date(item.date);
    const year = txDate.getFullYear();
    const month = txDate.getMonth() + 1;
    const key = `${year}-${month.toString().padStart(2, "0")}`;

    if (!monthlyGroups[key]) {
      monthlyGroups[key] = {
        year,
        month,
        income: 0,
        expense: 0,
        cash_in: 0,
        cash_out: 0,
        receivable: 0,
        payable: 0,
        breakdownMap: {},
      };
    }

    const grp = monthlyGroups[key];
    const categoryName = item.category?.name || "Unknown";

    if (item.type === FINANCE_TYPES.INCOME) {
      grp.income += totalAmt;
      grp.cash_in += paidAmt;
      grp.receivable += dueAmt;
    } else {
      grp.expense += totalAmt;
      grp.cash_out += paidAmt;
      grp.payable += dueAmt;
    }

    const bdKey = `${categoryName}_${item.type}`;
    if (!grp.breakdownMap[bdKey]) {
      grp.breakdownMap[bdKey] = {
        category: categoryName,
        type: item.type,
        total: 0,
        paid: 0,
        due: 0,
        count: 0,
      };
    }
    grp.breakdownMap[bdKey].total += totalAmt;
    grp.breakdownMap[bdKey].paid += paidAmt;
    grp.breakdownMap[bdKey].due += dueAmt;
    grp.breakdownMap[bdKey].count += 1;
  }

  const monthlyStats: FinanceMonthlyStat[] = Object.values(monthlyGroups).map(
    (m) => ({
      year: m.year,
      month: m.month,
      income: m.income,
      expense: m.expense,
      cash_in: m.cash_in,
      cash_out: m.cash_out,
      balance: m.cash_in - m.cash_out,
      receivable: m.receivable,
      payable: m.payable,
      breakdown: Object.values(m.breakdownMap).sort(
        (a, b) => b.total - a.total
      ),
    })
  );

  return createApiResponse(
    {
      overall: {
        income: totalIncome,
        expense: totalExpense,
        balance: totalCashIn - totalCashOut,
        total_cash_in: totalCashIn,
        total_cash_out: totalCashOut,
        total_receivable: totalReceivable,
        total_payable: totalPayable,
      },
      monthlyStats,
    },
    "Finance summary computed successfully"
  );
};

const getFinanceCategories = async (
  branchId: string,
  type?: "INCOME" | "EXPENSE"
): Promise<FinanceCategoriesBreakdownResponse> => {
  const userId = await getActiveUserId();
  await getBranchAccessContext(branchId, userId, {
    requireFinanceAccess: true,
  });

  let qb = supabase
    .from("branch_finances")
    .select(
      `
      id, type, amount, total_amount, paid_amount, due_amount, payment_status, date,
      category:branch_finance_categories!category_id(id, name, type)
    `
    )
    .eq("branch_id", branchId);

  if (type === FINANCE_TYPES.INCOME || type === FINANCE_TYPES.EXPENSE) {
    qb = qb.eq("type", type);
  }

  const { data: entries, error } = await qb;
  throwIfError(error, "Failed to fetch categories breakdown");

  const parseYearMonth = (dateStr: string) => {
    if (typeof dateStr === "string" && dateStr.length >= 7) {
      const parts = dateStr.split("-");
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
        return {
          year: y,
          month: m,
          monthKey: `${y}-${m.toString().padStart(2, "0")}`,
        };
      }
    }
    const d = new Date(dateStr);
    const y = isNaN(d.getFullYear())
      ? new Date().getFullYear()
      : d.getFullYear();
    const m = isNaN(d.getMonth()) ? new Date().getMonth() + 1 : d.getMonth() + 1;
    return {
      year: y,
      month: m,
      monthKey: `${y}-${m.toString().padStart(2, "0")}`,
    };
  };

  interface CategoryAcc extends Omit<FinanceCategoryBreakdown, "months"> {
    monthsMap: Record<string, FinanceCategoryMonthStat>;
  }

  const categoryMap: Record<string, CategoryAcc> = {};

  for (const raw of entries || []) {
    const entry = mapEntryWithDue(raw);
    const catId = entry.category?.id;
    const catName = entry.category?.name || "Uncategorized";
    const catType = entry.category?.type || entry.type;

    if (!catId) continue;

    if (!categoryMap[catId]) {
      categoryMap[catId] = {
        id: catId,
        category: catName,
        type: catType,
        income: 0,
        expense: 0,
        paid: 0,
        due: 0,
        balance: 0,
        count: 0,
        monthsMap: {},
      };
    }

    const totalAmt = Number(entry.total_amount ?? entry.amount);
    const paidAmt = Number(entry.paid_amount ?? totalAmt);
    const dueAmt = Number(entry.due_amount ?? 0);

    const acc = categoryMap[catId];
    acc.count += 1;
    acc.paid = (acc.paid || 0) + paidAmt;
    acc.due = (acc.due || 0) + dueAmt;

    if (entry.type === FINANCE_TYPES.INCOME) {
      acc.income += totalAmt;
      acc.balance += paidAmt;
    } else {
      acc.expense += totalAmt;
      acc.balance -= paidAmt;
    }

    const { year, month, monthKey } = parseYearMonth(entry.date);
    if (!acc.monthsMap[monthKey]) {
      acc.monthsMap[monthKey] = {
        year,
        month,
        monthKey,
        income: 0,
        expense: 0,
        paid: 0,
        due: 0,
        balance: 0,
        count: 0,
      };
    }

    const m = acc.monthsMap[monthKey];
    m.count += 1;
    m.paid += paidAmt;
    m.due += dueAmt;

    if (entry.type === FINANCE_TYPES.INCOME) {
      m.income += totalAmt;
      m.balance += paidAmt;
    } else {
      m.expense += totalAmt;
      m.balance -= paidAmt;
    }
  }

  const categories: FinanceCategoryBreakdown[] = Object.values(categoryMap)
    .map((cat) => {
      const months = Object.values(cat.monthsMap).sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return b.month - a.month;
      });
      return {
        id: cat.id,
        category: cat.category,
        type: cat.type,
        income: cat.income,
        expense: cat.expense,
        paid: cat.paid,
        due: cat.due,
        balance: cat.balance,
        count: cat.count,
        months,
      };
    })
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));

  return createApiResponse(
    { categories },
    "Categories breakdown fetched successfully"
  );
};

const getFinanceMonthExport = async (
  branchId: string,
  year: number,
  month: number
): Promise<FinanceMonthExportResponse> => {
  const userId = await getActiveUserId();
  await getBranchAccessContext(branchId, userId, {
    requireFinanceAccess: true,
  });

  if (!Number.isInteger(year) || year < 2000 || year > 3000) {
    throw new Error("Year must be a valid number");
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12");
  }

  const { data: entries, error } = await supabase
    .from("branch_finances")
    .select(FINANCE_ENTRY_SELECT)
    .eq("branch_id", branchId)
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });

  throwIfError(error, "Failed to retrieve monthly entries");

  const mapped = (entries || []).map(mapEntryWithDue);
  const filteredEntries = mapped.filter((entry) => {
    const entryDate = new Date(entry.date);
    return (
      entryDate.getFullYear() === year && entryDate.getMonth() + 1 === month
    );
  });

  let incomeTotal = 0;
  let expenseTotal = 0;
  let cashInTotal = 0;
  let cashOutTotal = 0;
  let receivableTotal = 0;
  let payableTotal = 0;

  for (const entry of filteredEntries) {
    const totalAmt = Number(entry.total_amount ?? entry.amount);
    const paidAmt = Number(entry.paid_amount ?? totalAmt);
    const dueAmt = Number(entry.due_amount ?? 0);

    if (entry.type === FINANCE_TYPES.INCOME) {
      incomeTotal += totalAmt;
      cashInTotal += paidAmt;
      receivableTotal += dueAmt;
    } else {
      expenseTotal += totalAmt;
      cashOutTotal += paidAmt;
      payableTotal += dueAmt;
    }
  }

  return createApiResponse(
    {
      year,
      month,
      entries: filteredEntries,
      summary: {
        income: incomeTotal,
        expense: expenseTotal,
        cash_in: cashInTotal,
        cash_out: cashOutTotal,
        balance: cashInTotal - cashOutTotal,
        receivable: receivableTotal,
        payable: payableTotal,
        totalEntries: filteredEntries.length,
      },
    },
    "Monthly export retrieved successfully"
  );
};

const deleteFinanceEntry = async (
  branchId: string,
  entryId: string,
  actionCode?: string
): Promise<DeleteFinanceEntryResponse> => {
  await getActiveUserId();

  const { error } = await supabase.rpc("delete_finance_entry_rpc", {
    p_branch_id: branchId,
    p_entry_id: entryId,
    p_action_code: actionCode ?? null,
  });

  throwIfError(error, "Failed to delete finance entry");

  return createApiResponse(
    { entryId },
    "Finance entry deleted successfully"
  );
};

const updateFinanceEntry = async (
  branchId: string,
  entryId: string,
  data: CreateFinanceEntryRequest
): Promise<CreateFinanceEntryResponse> => {
  await getActiveUserId();

  const rawAmount =
    data.total_amount !== undefined ? data.total_amount : data.amount;
  if (!data.type || rawAmount === undefined || !data.category_id) {
    throw new Error("Type, amount, and category_id are required");
  }

  if (
    data.salary_month &&
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(data.salary_month)
  ) {
    throw new Error("salary_month must be in YYYY-MM format");
  }

  if (
    data.type !== FINANCE_TYPES.INCOME &&
    data.type !== FINANCE_TYPES.EXPENSE
  ) {
    throw new Error("Type must be INCOME or EXPENSE");
  }

  const totalAmount = Number(rawAmount);
  if (isNaN(totalAmount) || totalAmount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  if (data.details && Array.isArray(data.details) && data.details.length > 0) {
    const detailsSum = data.details.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
    if (Math.abs(detailsSum - totalAmount) > 0.01) {
      throw new Error(
        `Total amount (${totalAmount}) does not match the sum of item details (${detailsSum}).`
      );
    }
  }

  let status: "PAID" | "PARTIAL" | "DUE" =
    data.payment_status || PAYMENT_STATUS.PAID;
  let paidAmt = Number(
    data.paid_amount !== undefined ? data.paid_amount : totalAmount
  );
  if (status === PAYMENT_STATUS.PAID) {
    paidAmt = totalAmount;
  } else if (status === PAYMENT_STATUS.DUE) {
    paidAmt = 0;
  }
  const dueAmt = Math.max(0, totalAmount - paidAmt);
  if (dueAmt <= 0) {
    status = PAYMENT_STATUS.PAID;
  }

  const { error: rpcErr } = await supabase.rpc("update_finance_entry_rpc", {
    p_branch_id: branchId,
    p_entry_id: entryId,
    p_type: data.type,
    p_total_amount: totalAmount,
    p_paid_amount: paidAmt,
    p_due_amount: dueAmt,
    p_payment_status: status,
    p_category_id: data.category_id,
    p_note: data.note?.trim() || "",
    p_date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    p_person_name: data.personName?.trim() || "",
    p_person_phone: data.personPhone?.trim() || "",
    p_member_id: data.member_id ?? null,
    p_salary_month: data.salary_month ?? null,
    p_details: data.details && data.details.length > 0 ? data.details : [],
    p_action_code: data.actionCode ?? null,
  });

  throwIfError(rpcErr, "Failed to update finance entry");

  const { data: updatedRaw, error: fetchErr } = await supabase
    .from("branch_finances")
    .select(FINANCE_ENTRY_SELECT)
    .eq("id", entryId)
    .single();

  if (fetchErr || !updatedRaw) {
    throw new Error(fetchErr?.message || "Failed to load updated entry");
  }

  return createApiResponse(
    { entry: mapEntryWithDue(updatedRaw) },
    "Finance entry updated successfully"
  );
};

const recordFinancePayment = async (
  branchId: string,
  entryId: string,
  data: RecordFinancePaymentRequest
): Promise<RecordFinancePaymentResponse> => {
  await getActiveUserId();

  const paymentAmount = Number(data.amount);
  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    throw new Error("Payment amount must be greater than 0");
  }

  const paymentDate = data.date
    ? new Date(data.date).toISOString()
    : new Date().toISOString();

  const { data: rpcResult, error: rpcErr } = await supabase.rpc(
    "record_finance_payment_rpc",
    {
      p_branch_id: branchId,
      p_entry_id: entryId,
      p_amount: paymentAmount,
      p_payment_date: paymentDate,
      p_note: data.note?.trim() || "",
    }
  );

  throwIfError(rpcErr, "Failed to record payment");

  const paymentId = (rpcResult as { payment_id?: string } | null)?.payment_id;

  const [{ data: updatedRaw, error: entryErr }, { data: paymentRow }] =
    await Promise.all([
      supabase
        .from("branch_finances")
        .select(FINANCE_ENTRY_SELECT)
        .eq("id", entryId)
        .single(),
      paymentId
        ? supabase
            .from("branch_finance_payments")
            .select(
              `
              id, finance_id, amount, payment_date, note, created_at,
              recorded_by:users!recorded_by(id, full_name, user_name, avatar)
            `
            )
            .eq("id", paymentId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  if (entryErr || !updatedRaw) {
    throw new Error(entryErr?.message || "Failed to load updated finance entry");
  }

  const formattedPayment: FinancePayment = paymentRow
    ? {
        id: paymentRow.id,
        finance_id: paymentRow.finance_id,
        amount: Number(paymentRow.amount),
        payment_date: paymentRow.payment_date,
        note: paymentRow.note,
        created_at: paymentRow.created_at,
        recorded_by: (unwrapSingle(paymentRow.recorded_by) || undefined) as
          | User
          | undefined,
      }
    : {
        id: paymentId || "",
        finance_id: entryId,
        amount: paymentAmount,
        payment_date: paymentDate,
        note: data.note?.trim() || "",
        created_at: new Date().toISOString(),
      };

  return createApiResponse(
    {
      entry: mapEntryWithDue(updatedRaw),
      payment: formattedPayment,
    },
    "Payment recorded successfully",
    201
  );
};

const getFinancePayments = async (
  branchId: string,
  entryId: string
): Promise<FinancePaymentsResponse> => {
  const userId = await getActiveUserId();
  await getBranchAccessContext(branchId, userId, {
    requireFinanceAccess: true,
  });

  const { data: payments, error } = await supabase
    .from("branch_finance_payments")
    .select(
      `
      id, finance_id, amount, payment_date, note, created_at,
      recorded_by:users!recorded_by(id, full_name, user_name, avatar)
    `
    )
    .eq("finance_id", entryId)
    .order("payment_date", { ascending: true });

  throwIfError(error, "Failed to fetch payment history");

  const formatted: FinancePayment[] = (payments || []).map((p) => ({
    id: p.id,
    finance_id: p.finance_id,
    amount: Number(p.amount),
    payment_date: p.payment_date,
    note: p.note,
    created_at: p.created_at,
    recorded_by: (unwrapSingle(p.recorded_by) || undefined) as
      | User
      | undefined,
  }));

  return createApiResponse(
    { payments: formatted },
    "Payment history fetched successfully"
  );
};

const getBranchActionCode = async (
  branchId: string
): Promise<BranchActionCodeResponse> => {
  await getActiveUserId();
  const { data, error } = await supabase.rpc("get_branch_action_code", {
    p_branch_id: branchId,
  });

  throwIfError(error, "Failed to fetch branch security code");

  return createApiResponse(
    { actionCode: (data as string) || "1234" },
    "Security code fetched successfully"
  );
};

const updateBranchActionCode = async (
  branchId: string,
  actionCode: string
): Promise<BranchActionCodeResponse> => {
  await getActiveUserId();
  const { data, error } = await supabase.rpc("update_branch_action_code", {
    p_branch_id: branchId,
    p_new_code: actionCode,
  });

  throwIfError(error, "Failed to update branch security code");

  return createApiResponse(
    { actionCode: (data as string) || actionCode.trim() },
    "সিকিউরিটি কোড সফলভাবে আপডেট করা হয়েছে"
  );
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
