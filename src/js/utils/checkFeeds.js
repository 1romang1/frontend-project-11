import fetchRSS from "./fetchRSS";
import parseXML from "./parseXML";

const checkFeeds = (state) => {
  // здесь будет цепочка промисов
  const feedPromises = state.addedUrls.map((url) => fetchRSS(url));
  Promise.all(feedPromises)
  .then(results => {
    results.forEach(result => {
      parseXML(result)
    })
  })


  // здесь вызов следующего цикла
  setTimeout(() => {
    checkFeeds();
  }, 5000);
};
