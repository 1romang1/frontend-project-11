import * as yup from "yup";
import fetchRSS from "./fetchRSS";

const parceRSS = (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data.contents, "applicatoin/xml");

  const isRss = doc.querySelector("rss");
  const isAtom = doc.querySelector("feed");

  if (!isRss && !isAtom) {
    return false;
  }
  return true;
};

const isRSS = (url) => fetchRSS(url).then((data) => parceRSS(data)); // возвращает булево значение

export default (validatedUrl) =>
  yup.object({
    url: yup
      .string()
      .url()
      .required()
      .notOneOf(validatedUrl)
      .test("is-rss", { key: 'errors.notRSS' }, (value) => {
        if (!value) return false;
        // Используем оригинальную isRSS
        return isRSS(value)
          .then(() => true) // если парсинг удался — всё ок
          .catch(() => false); // если ошибка — не RSS
      }),
  });
