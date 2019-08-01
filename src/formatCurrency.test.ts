import { pricePreviewFormatter, priceExactFormatter } from "./formatCurrency";

describe('pricePreviewFormatter', () => {
it("provides no decimal places for amounts greater than 1", () => {
  expect(pricePreviewFormatter(1.01, "USD")).toEqual("$1");
  expect(pricePreviewFormatter(1.99, "USD")).toEqual("$2");
});

it("provides two decimal places for amounts less than 1", () => {
  expect(pricePreviewFormatter(0.01, "USD")).toEqual("$0.01");
  expect(pricePreviewFormatter(0.0123, "USD")).toEqual("$0.01");
  expect(pricePreviewFormatter(0.0001, "USD")).toEqual("$0.01");
});

it("handles non-USD currencies", () => {
  expect(pricePreviewFormatter(20.23, "EUR")).toEqual("€20");
});

})

describe('priceExactFormatter', () => {
  it("provides no decimal places when it can", () => {
    expect(priceExactFormatter(1, "USD")).toEqual("$1");
    expect(priceExactFormatter(12345, "USD")).toEqual("$12,345");
  });

  it("provides 2 decimal places when there is a fractional unit of currency", () => {
    expect(priceExactFormatter(0.01, "USD")).toEqual("$0.01");
    expect(priceExactFormatter(0.0123, "USD")).toEqual("$0.01");
    expect(priceExactFormatter(1.01, "USD")).toEqual("$1.01");
  });

  it("handles non-USD currencies", () => {
    expect(priceExactFormatter(20.23, "EUR")).toEqual("€20.23");
  });

})
