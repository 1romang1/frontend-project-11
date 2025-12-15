import axios from 'axios';

export default (url) => axios
  .get(
    `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
      url,
    )}`,
  )
  .then((res) => res.data.contents)
  .catch(() => {
    throw new Error('errors.network');
  });
