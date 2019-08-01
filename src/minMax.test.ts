import minMax from "./minMax";

it("yields the proper minimum value", () => {
  let [min, max] = minMax([0, 1, 2, -1]);
  expect(min).toEqual(-1);
});

it("yields the proper maximum value", () => {
  let [min, max] = minMax([0, 1, 2, -1]);
  expect(max).toEqual(2);
});

it("selects the element with the min value", () => {
  let expectedMinItem = {data: -1};
  let [minItem, maxItem] = minMax(
    [expectedMinItem, {data: 0}, {data: 1}, {data: 2}],
    elem => elem.data
  );
  expect(minItem).toEqual(expectedMinItem);
});

it("selects the element with the max value", () => {
  let expectedMaxItem = {data: 2};
  let [minItem, maxItem] = minMax(
    [expectedMaxItem, {data: 0}, {data: 1}, {data: -1}],
    elem => elem.data
  );
  expect(maxItem).toEqual(expectedMaxItem);
});
