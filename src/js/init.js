import onChange from 'on-change';
import * as yup from 'yup';
// import isEmpty from 'lodash/isEmpty.js';
import render from './view.js';

const initialState = {
  addedUrls: [],
  addingUrlProcess: {
    processState: 'filing', // варианты: 'filling', 'error', 'added'
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
const schema = yup.object({
  url: yup
    .string()
    .url('Ссылка должна быть валидным URL')
    .required('Это поле обязательно для заполнения')
    .test(
      'unique-url',
      'Ссылка уже существует',
      (value) => !initialState.addedUrls.includes(value)
    ),
});

export default () => {
  const elements = {
    form: document.querySelector('form'),
    urlInput: document.getElementById('url-input'),
    submitButton: document.querySelector('button'),
    feedbackElement: document.querySelector('.feedback'),
  };

  const watchedState = onChange(initialState, render(elements, initialState));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const urlInputValue = elements.urlInput.value;
    watchedState.form.fields.url = urlInputValue;

    schema
      .validate(initialState.form.fields)
      .then(() => {
        watchedState.addingUrlProcess.processState = 'added'; // меняем статус процесса для render()
        watchedState.addedUrls.push(urlInputValue); // добавляем валидный url в подписки
        // watchedState.form.errors = {}; // сбрасываем ошибки
      })
      .catch((err) => {
        watchedState.addingUrlProcess.processState = 'error';
        watchedState.form.errors = err.message;
      })
      .finally(() => {
        console.log(initialState);
        console.log(elements);
      });
  });
};
