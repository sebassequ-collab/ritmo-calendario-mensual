export const isoDate = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const monthKey = (date) => isoDate(date).slice(0, 7);
export function calendarDays(view) {
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(view.getFullYear(), view.getMonth(), 1 - offset);
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}
export const monthLabel = (date) => new Intl.DateTimeFormat('es', { month:'long', year:'numeric' }).format(date);
