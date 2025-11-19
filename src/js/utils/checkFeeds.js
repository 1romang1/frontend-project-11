import fetchRSS from "./fetchRSS.js";
import parseXML from "./parseXML.js";

/**
 * Проверяет все подписанные RSS-ленты и добавляет новые посты.
 * Работает в цикле: checkFeeds → setTimeout → checkFeeds.
 *
 * @param {Object} state — реактивное состояние приложения
 */
const checkFeeds = (state) => {
  const { addedUrls, posts, feeds } = state;

  // Собираем Promises на получение всех RSS
  const feedPromises = addedUrls.map((url) => fetchRSS(url));

  Promise.allSettled(feedPromises)
    .then((results) => {
      results.forEach((result, feedIndex) => {
        if (result.status !== "fulfilled") {
          // Если какая-то лента временно недоступна — просто пропускаем
          console.warn(`RSS ошибка в ленте ${addedUrls[feedIndex]}`);
          return;
        }

        const xml = result.value;
        const doc = parseXML(xml);
        if (!doc) return;

        const items = doc.querySelectorAll("item");

        const existingIds = posts.map((p) => p.id);
        const feedId = feeds[feedIndex].id; // правильная привязка к фиду

        items.forEach((item) => {
          const guid = item.querySelector("guid")?.textContent?.trim();
          if (!guid) return;

          // защита от дублей
          if (existingIds.includes(guid)) return;

          const title = item.querySelector("title")?.textContent || "";
          const link = item.querySelector("link")?.textContent || "";

          state.posts.push({
            feedId,
            id: guid,
            title,
            link,
          });
        });
      });
    })
    .finally(() => {
      // продолжаем цикл через 5 секунд
      setTimeout(() => {
        checkFeeds(state);
      }, 5000);
    });
};

export default checkFeeds;
