import fetchRSS from './fetchRSS.js';
import parseXML from './parseXML.js';

const checkFeeds = (state) => {
  const { addedUrls, posts, feeds } = state;

  const feedPromises = addedUrls.map((url) => fetchRSS(url));

  Promise.allSettled(feedPromises)
    .then((results) => {
      results.forEach((result, feedIndex) => {
        if (result.status !== 'fulfilled') {
          console.warn(`RSS ошибка в ленте ${addedUrls[feedIndex]}`);
          return;
        }

        const xml = result.value;
        const doc = parseXML(xml);
        if (!doc) return;

        const items = doc.querySelectorAll('item');

        const existingIds = posts.map((p) => p.id);
        const feedId = feeds[feedIndex].id;

        items.forEach((item) => {
          const guid = item.querySelector('guid')?.textContent?.trim();
          if (!guid) return;

          if (existingIds.includes(guid)) return;

          const title = item.querySelector('title')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';

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
      setTimeout(() => {
        checkFeeds(state);
      }, 5000);
    });
};

export default checkFeeds;
