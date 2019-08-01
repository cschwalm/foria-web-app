
const lessThanOneFormatter = (currency: string) => new Intl.NumberFormat(undefined, {
  style: "currency",
  currency,
  maximumFractionDigits: 2,
  minimumFractionDigits: 2
})

const greaterThanOneFormatter = (currency: string) => new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
})

// Formats numbers for preview, 20.39 => $20, and 0.80 => $0.80
export const pricePreviewFormatter = (amount: number, currency: string) => {
  amount = Math.max(amount, 0.01)
  return amount < 1
    ? lessThanOneFormatter(currency).format(amount)
    : greaterThanOneFormatter(currency).format(amount)
}
