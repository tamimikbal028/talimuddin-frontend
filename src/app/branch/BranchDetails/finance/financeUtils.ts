import dayjs from "dayjs";

export const formatCurrency = (amount: number) => {
  const rounded = Math.round(amount * 100) / 100;
  return new Intl.NumberFormat("en-BD", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rounded);
};

export const getMonthName = (month: number) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month - 1] || "Unknown";
};

export const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("DD MMM YY");
};

export const formatDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("DD MMM YY • hh:mm A");
};
