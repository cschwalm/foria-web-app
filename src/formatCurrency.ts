export const twoDecimalNoCurrencyFormatter = (amount: number) =>
  new Intl.NumberFormat(undefined, {
    style: "decimal",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(amount)

export const twoDecimalFormatter = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(amount)

const zeroDecimalFormatter = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);

// Formats numbers for preview
// 20.39 => $20
// 0.80 => $0.80
// 0.01 => $0.01
// 0.0001 => $0
// 0 => $0
export const pricePreviewFormatter = (amount: number, currency: string) =>
  amount < 1 && amount >= 0.01
    ? twoDecimalFormatter(amount, currency)
    : zeroDecimalFormatter(amount, currency)

// Use two decimal places if the number is not an integer
// 20.39 => $20.39
// 0.80 => $0.80
// 0.01 => $0.01
// 0.0001 => $0
// 0 => $0
export const feeFormatter = (amount: number, currency: string) =>
  Number.isInteger(amount) || amount < 0.01
    ? zeroDecimalFormatter(amount, currency)
    : twoDecimalFormatter(amount, currency);
