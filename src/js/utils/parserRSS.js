export default (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data.contents, 'application/xml');

  const parseError = doc.getElementsByTagName('parserror');
  if (parseError) {
    throw new Error(parseError[0].textContent);
  }
  return doc;
};
