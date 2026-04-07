export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getInitialStartDate = () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 6); // 7 days back (6 days + today)
  return formatDate(start);
};

export const getInitialEndDate = () => {
  return formatDate(new Date());
};

export const getDateRangeByPreset = (preset) => {
  const today = new Date();
  const end = formatDate(today);
  let newStart = "2025-09-01";

  switch (preset) {
    case "7d":
      const start7d = new Date(today);
      start7d.setDate(today.getDate() - 6);
      newStart = formatDate(start7d);
      break;
    case "30d":
      const start30d = new Date(today);
      start30d.setDate(today.getDate() - 29);
      newStart = formatDate(start30d);
      break;
    default:
      newStart = "2025-09-01";
  }

  return { start: newStart, end };
};
