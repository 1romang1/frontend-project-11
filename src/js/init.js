import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
// import isEmpty from 'lodash/isEmpty.js';
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
          required: () => ({
            key: 'required',
          }),
          url: () => ({
            key: 'invalidUrl',
          }),
        },
        mixed: () => ({
          key: 'linkExists',
        }),
      });
      const createSchema = (validatedUrl) =>
        yup.object({
          url: yup.string().url().required().notOneOf(validatedUrl),
        });
      const watchedState = onChange(
        initialState,
        render(elements, initialState),
      );

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const urlInputValue = elements.urlInput.value;
        watchedState.form.fields.url = urlInputValue;
        const schema = createSchema(watchedState.addedUrls);
        schema
          .validate(initialState.form.fields)
          .then(() => {
            watchedState.addingUrlProcess.processState = 'added'; // меняем статус процесса для render()
            watchedState.addedUrls.push(urlInputValue); // добавляем валидный url в подписки
            // watchedState.form.errors = {}; // сбрасываем ошибки
          })
          .catch((err) => {
            watchedState.addingUrlProcess.processState = 'error';
            watchedState.form.errors = err.errors;
            console.log(JSON.stringify(err, null, 2));
            console.log(watchedState.addedUrls);
          });
          // .finally(() => {
          //   console.log(initialState);
          //   console.log(elements);
          //   console.log(initialState.addedUrls);
          // });
      });
    });
};
