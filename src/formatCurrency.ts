const twoDecimalFormatter = (currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });

const zeroDecimalFormatter = (currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

// Formats numbers for preview, 20.39 => $20, and 0.80 => $0.80
export const pricePreviewFormatter = (amount: number, currency: string) => {
  amount = Math.max(amount, 0.01);
  return amount < 1
    ? twoDecimalFormatter(currency).format(amount)
    : zeroDecimalFormatter(currency).format(amount);
};

export const priceExactFormatter = (amount: number, currency: string) => {
  amount = Math.max(amount, 0.01);
  return Number.isInteger(amount)
    ? zeroDecimalFormatter(currency).format(amount)
    : twoDecimalFormatter(currency).format(amount);
};
