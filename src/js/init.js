import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import render from './view.js';
import resources from '../locales/index.js';

export default () => {
  const initialState = {
    addedUrls: [],
    addingUrlProcess: {
      processState: 'filling', // варианты: 'filling', 'error', 'added'
      // processError: null, // для сетевых ошибок
    },
    form: {
      // valid: true,
      errors: {},
      fields: {
        url: '',
      },
    },
    feeds: [],
    posts: [],
  };

  const elements = {
    form: document.querySelector('form'),
    urlInput: document.getElementById('url-input'),
    submitButton: document.querySelector('button'),
    feedbackElement: document.querySelector('.feedback'),
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance
    .init({
      lng: 'ru',
      debug: true,
      resources,
    })
    .then(() => {
      yup.setLocale({
        string: {
          url: () => ({
            key: 'errors.invalidUrl',
          }),
        },
        mixed: {
          required: () => ({
            key: 'errors.required',
          }),
          notOneOf: () => ({
            key: 'errors.linkExists',
          }),
        },
      });

      const createSchema = (validatedUrl) =>
        yup.object({
          url: yup.string().url().required().notOneOf(validatedUrl),
        });

      const watchedState = onChange(
        initialState,
        render(elements, initialState, i18nextInstance)
      );

      const createProxyUrl = (newUrl) =>
        `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
          newUrl
        )}`;

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const urlInputValue = elements.urlInput.value;
        watchedState.form.fields.url = urlInputValue;

        const schema = createSchema(watchedState.addedUrls);

        schema
          .validate(watchedState.form.fields)
          .then(() => {
            watchedState.addingUrlProcess.processState = 'added'; // меняем статус процесса для render()
            watchedState.addedUrls.push(urlInputValue); // добавляем валидный url в подписки
            // watchedState.form.errors = {}; // сбрасываем ошибки
            console.log(initialState);
            axios
              .get(createProxyUrl(initialState.form.fields.url))
              .then((response) => {
                if (response.status === 200) return response.data;
                throw new Error('Network response was not ok.');
              })
              .then((data) => {
                // console.log(response.status);
                const newData = data.contents;
                const parser = new DOMParser();
                // const xmlDoc = parser.parseFromString(newData, 'application/xml');
                return parser.parseFromString(newData, 'application/xml');
              })
              .then((xmlDoc) => {
                const channel = xmlDoc.querySelector('channel');
                const channelTitle = channel.querySelector('title');
                const channelDescription = channel.querySelector('description');
                // console.log(`Feed title: ${channelTitle.textContent}`);
                // console.log(
                //   `Feed discription: ${channelDescription.textContent}`
                // );
                // console.log('---');
                // console.log(watchedState.feeds);
                watchedState.feeds.push({
                  id: uniqueId('feed_'),
                  title: channelTitle.textContent,
                  description: channelDescription.textContent,
                });
                // console.log(watchedState.feeds);
                const items = xmlDoc.querySelectorAll('item');
                items.forEach((item) => {
                  const itemTitle = item.querySelector('title');
                  const itemLink =
                    item.querySelector('link');
                    watchedState.posts.push({
                      feedId: watchedState.feeds[watchedState.feeds.length - 1].id,
                      id: uniqueId('posts_'),
                      title: itemTitle.textContent,
                      link: itemLink.textContent,
                    });
                  console.log(`Title: ${itemTitle}`);
                  console.log(`Link: ${itemLink}`);
                  console.log('---');
                });
                console.log(watchedState.posts);
              });
          })
          .catch((err) => {
            watchedState.addingUrlProcess.processState = 'error';
            watchedState.form.errors = err.message;
            console.log(JSON.stringify(err, null, 2));
            console.log(watchedState.addedUrls);
          });
      });
    });
};
