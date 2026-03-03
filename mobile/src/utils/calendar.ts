/** 星期标题 */
export const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

/** 月份名称 */
export const MONTH_NAMES = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

/** 格式化日期为 YYYY-MM-DD */
export function formatDate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/** 从 Date 对象获取 YYYY-MM-DD */
export function dateToKey(date: Date): string {
  return formatDate(date.getFullYear(), date.getMonth(), date.getDate());
}

/** 解析 YYYY-MM-DD 为 Date */
export function keyToDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 获取某月的天数 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** 获取某月第一天是星期几 (0=周日) */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/** 判断是否是今天 */
export function isToday(year: number, month: number, day: number): boolean {
  const today = new Date();
  return (
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day
  );
}

/** 生成日历网格数据，包含上月尾部和下月头部的填充 */
export interface CalendarDay {
  day: number;
  month: number; // 实际月份 (0-indexed)
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dateKey: string;
}

export function generateCalendarDays(
  year: number,
  month: number,
): CalendarDay[] {
  const days: CalendarDay[] = [];
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // 上个月的尾部填充
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    days.push({
      day,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      isToday: isToday(prevYear, prevMonth, day),
      dateKey: formatDate(prevYear, prevMonth, day),
    });
  }

  // 当月
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      day,
      month,
      year,
      isCurrentMonth: true,
      isToday: isToday(year, month, day),
      dateKey: formatDate(year, month, day),
    });
  }

  // 下个月的头部填充（补满 6 行 = 42 格）
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const remaining = 42 - days.length;

  for (let day = 1; day <= remaining; day++) {
    days.push({
      day,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
      isToday: isToday(nextYear, nextMonth, day),
      dateKey: formatDate(nextYear, nextMonth, day),
    });
  }

  return days;
}

/** 格式化显示日期：3月3日 星期二 */
export function formatDisplayDate(dateKey: string): string {
  const date = keyToDate(dateKey);
  const weekDay = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekDay[date.getDay()]}`;
}
