export function formatCurrency(value: number | string) {
  const n = typeof value === "string" ? Number(value) : value;
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
