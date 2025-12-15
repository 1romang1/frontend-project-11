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
      processState: 'filling',
    },
    form: {
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
    if (!postId) return;
    if (!watchedState.uiState.readPosts.includes(postId)) {
      watchedState.uiState.readPosts.push(postId);
      watchedState.uiState.modal.postId = postId;
      watchedState.uiState.modal.isOpen = true;
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
        watchedState.addingUrlProcess.processState = 'loading';
        watchedState.addedUrls.push(urlInputValue);
        watchedState.form.errors = {};

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
          const itemDescr = item.querySelector('description');
          watchedState.posts.push({
            feedId: watchedState.feeds[watchedState.feeds.length - 1].id,
            id: itemId.textContent,
            title: itemTitle.textContent,
            link: itemLink.textContent,
            description: itemDescr,
          });

          if (watchedState.feeds.length === 1) {
            checkFeeds(watchedState);
          }
        });

        watchedState.addingUrlProcess.processState = 'added';
      })
      .catch((err) => {
        if (err instanceof yup.ValidationError) {
          watchedState.form.errors = err.message;
        } else {
          watchedState.form.errors = 'errors.network';
        }
        watchedState.addingUrlProcess.processState = 'error';
      });
  });
};
