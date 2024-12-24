export const handleConvertUTCToLocal = (date: Date | undefined) => {
  if (!date) return undefined;
  const dateParse = new Date(date);
  const formatToLocalTimeZone = dateParse.toLocaleString("en-US", {
    timeZone: "Asia/Manila",
  });
  return new Date(formatToLocalTimeZone);
};
