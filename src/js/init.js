import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import { uniqueId } from 'lodash';
import fetchRSS from './utils/fetchRSS.js';
import parseXML from './utils/parseXML.js';
import render from './view.js';
import resources from '../locales/index.js';
import createSchema from './utils/createSchema.js';
import checkFeeds from './utils/checkFeeds.js';

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
    uiState: {
      readPosts: [],
      modal: {
        isOpen: false,
        postId: null,
      },
    },
  };

  const elements = {
    form: document.querySelector('form'),
    urlInput: document.getElementById('url-input'),
    submitButton: document.querySelector('button'),
    feedbackElement: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
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
    });

  const watchedState = onChange(
    initialState,
    render(elements, initialState, i18nextInstance),
  );

  elements.postsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const { postId } = btn.dataset;
    if (!postId) return; // игнорируем кнопки без data-post-id (например submit)
    if (!watchedState.uiState.readPosts.includes(postId)) {
      watchedState.uiState.readPosts.push(postId);
    }
  });

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
        console.log(elements);
        return fetchRSS(watchedState.form.fields.url);
      })
      .then((contents) => {
        const xmlDoc = parseXML(contents);
        const channel = xmlDoc.querySelector('channel');
        const channelTitle = channel.querySelector('title');
        const channelDescription = channel.querySelector('description');
        watchedState.feeds.push({
          id: uniqueId('feed_'),
          title: channelTitle.textContent,
          description: channelDescription.textContent,
        });
        const items = xmlDoc.querySelectorAll('item');
        items.forEach((item) => {
          const itemTitle = item.querySelector('title');
          const itemLink = item.querySelector('link');
          const itemId = item.querySelector('guid');
          watchedState.posts.push({
            feedId: watchedState.feeds[watchedState.feeds.length - 1].id,
            id: itemId.textContent,
            title: itemTitle.textContent,
            link: itemLink.textContent,
          });

          if (watchedState.feeds.length === 1) {
            checkFeeds(watchedState);
          }

          console.log(`Title: ${itemTitle.textContent}`);
          console.log(`Link: ${itemLink.textContent}`);
          console.log('---');
        });
        console.log(watchedState.posts);
      })
      .catch((err) => {
        watchedState.addingUrlProcess.processState = 'error';
        watchedState.form.errors = err.message;
        console.log(JSON.stringify(err, null, 2));
        console.log(watchedState.addedUrls);
      });
  });
};
