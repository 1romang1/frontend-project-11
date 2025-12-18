import * as yup from 'yup'
import fetchRSS from './fetchRSS.js'
import parseXML from './parseXML.js'

const parseRSS = (data) => {
  // data может быть строкой или объектом { contents }
  const xml = typeof data === 'string' ? data : (data && data.contents) || ''
  const doc = parseXML(xml)
  const isRss = doc.querySelector('rss')
  const isAtom = doc.querySelector('feed')

  if (!isRss && !isAtom) {
    throw new Error('errors.notRSS')
  }

  return true
}

// Проверка, является ли URL RSS
const isRSS = (url) => fetchRSS(url).then((data) => parseRSS(data))

export default (validatedUrl) => yup.object({
  url: yup
    .string()
    .url()
    .required()
    .notOneOf(validatedUrl)
    .test('is-rss', { key: 'errors.notRSS' }, (value) => {
      if (!value) return false
      // Используем оригинальную isRSS
      return isRSS(value)
      // .then(() => true) // если парсинг удался — всё ок
      // .catch(() => false); // если ошибка — не RSS
    }),
})
