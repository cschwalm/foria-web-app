
type Selector<T> = (elem: T) => any;
const defaultSelector = <T>(elem: T): T => elem;

// > minMax([1,2,3])
// [1, 3]
// > minMax([{data:1}, {data:2}, {data:3}], elem => elem.data)
// [{data:1}, {data:3}]
function minMax<T>(data: T[], selector: Selector<T> = defaultSelector): [T, T] {
  if (!data.length) {
    throw new Error("Cannot take the minmax of an empty list");
  }

  let maxElem, maxElemValue, minElem, minElemValue;
  minElem = maxElem = data[0];
  minElemValue = maxElemValue = selector(minElem);

  for (const elem of data) {
    const elemValue = selector(elem);
    if (minElemValue > elemValue) {
      minElem = elem;
      minElemValue = elemValue;
    }
    if (maxElemValue < elemValue) {
      maxElem = elem;
      maxElemValue = elemValue;
    }
  }

  return [minElem, maxElem];
}

export default minMax;
