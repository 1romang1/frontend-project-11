export default (data) => {
  const parser = new DOMParser();
  const result = parser.parseFromString(data.contents, 'applicatoin/xml');
  const parseError = result.getElementsByTagName('parserror');

  if (parseError.length > 0) {
    return parseError[0].textContent;
  }
  return result;
};
