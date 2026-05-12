export const formatMetricValue = (value, options = {}) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "0";
  }

  const numericValue = Number(value);

  if (options.currency) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(numericValue);
  }

  if (options.percent) {
    return `${numericValue.toFixed(2)}%`;
  }

  return new Intl.NumberFormat("en-IN").format(numericValue);
};
