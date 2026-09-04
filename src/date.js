export const isoDate = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const monthKey = (date) => isoDate(date).slice(0, 7);
export function calendarDays(view) {
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(view.getFullYear(), view.getMonth(), 1 - offset);
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}
export const monthLabel = (date) => new Intl.DateTimeFormat('es', { month:'long', year:'numeric' }).format(date);

export function taskOccursOnDate(task, date) {
  if (!task.date) return false;
  if ((task.task_type || 'reel') !== 'ad') return task.date === date;
  return task.date <= date && (task.end_date || task.date) >= date;
}

export function taskOccursInMonth(task, month) {
  if (!task.date || !/^\d{4}-\d{2}$/.test(month)) return false;
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  const start = `${month}-01`;
  const end = `${month}-${String(lastDay).padStart(2, '0')}`;
  const taskEnd = (task.task_type || 'reel') === 'ad' ? (task.end_date || task.date) : task.date;
  return task.date <= end && taskEnd >= start;
}
