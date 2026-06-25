export const cx = (...args: Array<string | false | null | undefined>) =>
  args.filter(Boolean).join(" ");

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateBatchId(skuPrefix: string, date?: Date): string {
  const d = date ?? new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${skuPrefix}-${yyyy}${mm}${dd}-${rand}`;
}

export function success<T>(data: T, message = "Success") {
  return { success: true, message, data };
}

export function failure(message: string, status = 400) {
  return { success: false, message, status };
}
