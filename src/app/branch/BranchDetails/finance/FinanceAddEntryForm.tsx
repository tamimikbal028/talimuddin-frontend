import { useState, useEffect } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaTrash,
  FaCheck,
  FaTimes,
  FaEdit,
} from "react-icons/fa";
import {
  useCategoriesList,
  useCreateCategory,
  useCreateFinanceEntry,
  useUpdateFinanceEntry,
} from "@/hooks/useBranchFinance";
import { toast } from "sonner";
import type { FinanceEntry } from "@/types";

const entrySchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  category_id: z.string().trim().min(1, "Category is required"),
  note: z.string().trim().optional(),
  date: z.string().min(1, "Date is required"),
  personName: z.string().trim().optional(),
  personPhone: z.string().trim().optional(),
  details: z
    .array(
      z.object({
        itemName: z.string().trim().min(1, "Item name is required"),
        amount: z.coerce.number().positive("Amount must be > 0"),
      })
    )
    .optional(),
});

type EntryFormData = z.infer<typeof entrySchema>;

interface FinanceAddEntryFormProps {
  branchId: string;
  entryToEdit?: FinanceEntry | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

const FinanceAddEntryForm = ({
  branchId,
  entryToEdit,
  onSuccess,
  onCancel,
}: FinanceAddEntryFormProps) => {
  const { data: categoriesData, isLoading: isCatLoading } =
    useCategoriesList(branchId);
  const { mutate: createCategory, isPending: isCreatingCat } =
    useCreateCategory(branchId);
  const { mutate: createEntry, isPending: isCreatingEntry } =
    useCreateFinanceEntry(branchId);
  const { mutate: updateEntry, isPending: isUpdatingEntry } =
    useUpdateFinanceEntry(branchId);

  const isSavingEntry = isCreatingEntry || isUpdatingEntry;
  const isEditing = !!entryToEdit;

  const [isAddingCustomCat, setIsAddingCustomCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const categories = categoriesData?.data?.categories ?? [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema) as Resolver<EntryFormData>,
    defaultValues: {
      type: "INCOME",
      date: new Date().toISOString().split("T")[0],
      details: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  });

  useEffect(() => {
    if (entryToEdit) {
      reset({
        type: entryToEdit.type,
        amount: entryToEdit.amount,
        category_id: entryToEdit.category?.id || "",
        date: entryToEdit.date
          ? new Date(entryToEdit.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        note: entryToEdit.note || "",
        personName: entryToEdit.person_name || "",
        personPhone: entryToEdit.person_phone || "",
        details: entryToEdit.details || [],
      });
    }
  }, [entryToEdit, reset]);

  const selectedType = watch("type");

  // Filter categories by selected type (INCOME / EXPENSE)
  const filteredCategories = categories.filter(
    (cat) => cat.type === selectedType
  );

  const handleCreateCustomCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) {
      toast.error("Category name cannot be empty");
      return;
    }

    createCategory(
      { name: trimmed, type: selectedType },
      {
        onSuccess: (response) => {
          setNewCatName("");
          setIsAddingCustomCat(false);
          // Auto-select the newly created category
          const newId = response.data?.category?.id;
          if (newId) {
            setValue("category_id", newId);
          }
        },
      }
    );
  };

  const onSubmit = (data: EntryFormData) => {
    const payload = {
      type: data.type,
      amount: data.amount,
      category_id: data.category_id,
      note: data.note || undefined,
      date: data.date,
      personName: data.personName || undefined,
      personPhone: data.personPhone || undefined,
      details:
        data.details && data.details.length > 0 ? data.details : undefined,
    };

    if (isEditing && entryToEdit) {
      updateEntry(
        { entryId: entryToEdit.id, data: payload },
        {
          onSuccess: () => {
            onSuccess();
          },
        }
      );
    } else {
      createEntry(payload, {
        onSuccess: () => {
          reset({
            type: "INCOME",
            date: new Date().toISOString().split("T")[0],
            details: [],
          });
          onSuccess();
        },
      });
    }
  };

  return (
    <div className="border-gray-150 rounded-xl border bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800 sm:text-base">
          {isEditing ? (
            <>
              <FaEdit className="h-4 w-4 text-blue-600" />
              Edit Transaction
            </>
          ) : (
            <>
              <FaPlus className="h-4 w-4 text-blue-600" />
              Add Transaction
            </>
          )}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Income / Expense Toggle */}
        <div className="flex gap-2">
          {(["INCOME", "EXPENSE"] as const).map((t) => (
            <label
              key={t}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 p-2.5 text-xs font-semibold transition-colors sm:p-3 sm:text-sm ${
                selectedType === t
                  ? t === "INCOME"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                value={t}
                {...register("type")}
                className="sr-only"
                onChange={(e) => {
                  register("type").onChange(e);
                  // Reset selected category because type changed
                  setValue("category_id", "");
                }}
              />
              {t === "INCOME" ? (
                <FaArrowUp className="h-3.5 w-3.5" />
              ) : (
                <FaArrowDown className="h-3.5 w-3.5" />
              )}
              {t === "INCOME" ? "Income" : "Expense"}
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Amount field */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Amount (BDT) *
            </label>
            <input
              type="number"
              step="any"
              {...register("amount")}
              placeholder="e.g. 500"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-sm"
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-red-600">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Category Dropdown & Custom Category input */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-600">
                Category *
              </label>
              {!isAddingCustomCat && (
                <button
                  type="button"
                  onClick={() => setIsAddingCustomCat(true)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 sm:text-xs"
                >
                  + Add Category
                </button>
              )}
            </div>

            {isAddingCustomCat ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="New Category Name"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-sm"
                />
                <button
                  type="button"
                  onClick={handleCreateCustomCategory}
                  disabled={isCreatingCat}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  title="Save Category"
                >
                  <FaCheck className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCustomCat(false);
                    setNewCatName("");
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  title="Cancel"
                >
                  <FaTimes className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <select
                {...register("category_id")}
                disabled={isCatLoading}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-sm"
              >
                <option value="">-- Select category --</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
            {errors.category_id && !isAddingCustomCat && (
              <p className="mt-1 text-xs text-red-600">
                {errors.category_id.message}
              </p>
            )}
          </div>

          {/* Date field */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Date *
            </label>
            <input
              type="date"
              {...register("date")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-sm"
            />
          </div>

          {/* Person Name field */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Person Name{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              {...register("personName")}
              placeholder="e.g. Abdullah"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-sm"
            />
          </div>

          {/* Person Phone field */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Person Phone{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="tel"
              {...register("personPhone")}
              placeholder="e.g. 01712345678"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-sm"
            />
          </div>

          {/* Note field */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Note <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              {...register("note")}
              placeholder="Short transaction note..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-sm"
            />
          </div>
        </div>

        {/* Dynamic Details Section */}
        <div className="space-y-3 rounded-xl border border-gray-200/80 bg-gray-50/50 p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-800">
                Breakdown Details
                <span className="ml-1.5 text-[10px] font-normal text-gray-400">
                  (Optional)
                </span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Add itemized breakdown list for this transaction
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                append({ itemName: "", amount: "" as unknown as number })
              }
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
            >
              <FaPlus className="h-3 w-3" />
              Add Item
            </button>
          </div>

          {fields.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xs">
              <div className="grid grid-cols-12 border-b border-gray-100 bg-gray-50/80 px-3 py-2 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                <div className="col-span-7 sm:col-span-8">Item Name</div>
                <div className="col-span-4 text-right sm:col-span-3">
                  Amount (BDT)
                </div>
                <div className="col-span-1 text-center"></div>
              </div>
              <div className="divide-y divide-gray-100">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-12 items-center gap-2 px-3 py-2 transition-colors hover:bg-gray-50/40"
                  >
                    <div className="col-span-7 sm:col-span-8">
                      <input
                        type="text"
                        {...register(`details.${index}.itemName` as const)}
                        placeholder="e.g. Electricity Bill"
                        className="w-full rounded-md border border-gray-200 bg-gray-50/50 px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                      />
                      {errors.details?.[index]?.itemName && (
                        <p className="mt-0.5 text-[10px] text-red-600">
                          {errors.details[index]?.itemName?.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-4 sm:col-span-3">
                      <input
                        type="number"
                        step="any"
                        {...register(`details.${index}.amount` as const)}
                        placeholder="0.00"
                        className="w-full rounded-md border border-gray-200 bg-gray-50/50 px-2.5 py-1.5 text-right text-xs font-semibold text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                      />
                      {errors.details?.[index]?.amount && (
                        <p className="mt-0.5 text-right text-[10px] text-red-600">
                          {errors.details[index]?.amount?.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Remove item"
                      >
                        <FaTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Subtotal row */}
              <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-3.5 py-2 text-xs font-semibold">
                <span className="text-gray-600">Breakdown Total:</span>
                <span className="font-bold text-gray-900">
                  {(watch("details") || [])
                    .reduce((acc, item) => acc + (Number(item?.amount) || 0), 0)
                    .toLocaleString()}{" "}
                  BDT
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 bg-white py-4 text-center">
              <p className="text-xs text-gray-400">
                No items added. Click{" "}
                <span className="font-semibold text-blue-600">+ Add Item</span>{" "}
                to add breakdown line items.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 sm:text-sm"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSavingEntry}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60 sm:text-sm"
          >
            {isEditing ? (
              <>
                <FaEdit className="h-3.5 w-3.5" />
                {isSavingEntry ? "Updating..." : "Update Entry"}
              </>
            ) : (
              <>
                <FaPlus className="h-3.5 w-3.5" />
                {isSavingEntry ? "Saving..." : "Save Entry"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FinanceAddEntryForm;
