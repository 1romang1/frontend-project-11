import onChange from 'on-change';
import * as yup from 'yup';
// import isEmpty from 'lodash/isEmpty.js';
import { render } from './view.js';

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

const elements = {
  form: document.querySelector('form'),
  urlInput: document.getElementById('url-input'),
  submitButton: document.querySelector('button'),
  feedbackElement: document.querySelector('.feedback'),
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

// const watchedState = onChange(initialState, render(elements, initialState));

export default () => {
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const urlInputValue = elements.urlInput.value;
    initialState.form.fields.url = urlInputValue;

    schema
      .validate(initialState.form.fields)
      .then(() => {
        initialState.addingUrlProcess.processState = 'added'; // меняем статус процесса для render()
        initialState.addedUrls.push(urlInputValue); // добавляем валидный url в подписки
        initialState.form.fields.url = ''; // очищаем поле ввода
        initialState.form.errors = {}; // сбрасываем ошибки
      })
      .catch((err) => {
        initialState.addingUrlProcess.processState = 'error';
        initialState.form.errors = err.message;
      })
      .finally(() => {
        console.log(initialState);
      });
  });
};
