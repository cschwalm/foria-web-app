export default (resp: Response) => {
  return resp.text().then(text => {
    // Either resolve an object or text
    let result = text;
    try {
      result = JSON.parse(text);
    } catch {
      // Unable to parse as json
    }

    // Reject any error code >= 400
    return resp.status >= 400
      ? Promise.reject(result)
      : Promise.resolve(result);
  });
};
