import { format, isToday, isYesterday, isThisYear } from "date-fns";

export const handleDateFormat = (currentDate: Date) => {
  if (isToday(currentDate)) {
    return format(currentDate, "p"); //12:00am
  } else if (isYesterday(currentDate)) {
    return format(currentDate, "'Yesterday', p"); //Yesterday, 12:00am
  } else if (isThisYear(currentDate)) {
    return format(currentDate, "ccc, p"); //Mon, 12:00am
  } else {
    return format(currentDate, "PPPP"); //Friday, December 23th, 2024
  }
};
