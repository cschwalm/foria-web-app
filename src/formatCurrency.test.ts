import {pricePreviewFormatter, feeFormatter} from "./formatCurrency";

describe("pricePreviewFormatter", () => {
  it("provides no decimal places for amounts greater than 1", () => {
    expect(pricePreviewFormatter(1.01, "USD")).toEqual("$1");
    expect(pricePreviewFormatter(1.99, "USD")).toEqual("$2");
  });

  it("provides two decimal places for amounts less than 1 and greater than a cent", () => {
    expect(pricePreviewFormatter(0.01, "USD")).toEqual("$0.01");
    expect(pricePreviewFormatter(0.0123, "USD")).toEqual("$0.01");
  });

  it("provides 0 decimal places when there is less than a cent", () => {
    expect(feeFormatter(0.009, "USD")).toEqual("$0");
  })

  it("handles non-USD currencies", () => {
    expect(pricePreviewFormatter(20.23, "EUR")).toEqual("€20");
  });
});

describe("feeFormatter", () => {
  it("provides no decimal places when it can", () => {
    expect(feeFormatter(1, "USD")).toEqual("$1");
    expect(feeFormatter(12345, "USD")).toEqual("$12,345");
  });

  it("provides 2 decimal places when there is a fractional unit of currency", () => {
    expect(feeFormatter(0.01, "USD")).toEqual("$0.01");
    expect(feeFormatter(1.01, "USD")).toEqual("$1.01");
    expect(feeFormatter(0.0123, "USD")).toEqual("$0.01");
  });

  it("provides 0 decimal places when there is less than a cent", () => {
    expect(feeFormatter(0.009, "USD")).toEqual("$0");
  })

  it("handles non-USD currencies", () => {
    expect(feeFormatter(20.23, "EUR")).toEqual("€20.23");
  });
});
