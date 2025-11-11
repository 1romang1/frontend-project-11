export default (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'application/xml');

  const parseError = doc.getElementsByTagName('parsererror');
  if (parseError) {
    throw new Error(parseError[0].textContent);
  }
  return doc;
};
