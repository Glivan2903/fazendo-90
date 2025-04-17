
import { format, isValid, parseISO, startOfWeek, addDays } from "date-fns";

export const getDateRange = (date: Date) => ({
  start: startOfWeek(date, { weekStartsOn: 0 }),
  end: addDays(startOfWeek(date, { weekStartsOn: 0 }), 6)
});

export const validateDate = (dateStr: string, timeStr: string): Date => {
  const date = new Date(`${dateStr}T${timeStr}`);
  if (!isValid(date)) {
    console.error("Invalid date detected:", { dateStr, timeStr });
    return new Date();
  }
  return date;
};

export const formatDateForDB = (date: Date) => format(date, "yyyy-MM-dd");
