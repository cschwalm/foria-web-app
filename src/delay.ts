const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Waits at least ms before yielding the promise
const atLeast = (ms: number, promise: Promise<any>) =>
  delay(ms).then(() => promise);

export default delay;
export {atLeast};
