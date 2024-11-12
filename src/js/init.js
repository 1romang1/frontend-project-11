import onChange from 'on-change';
import * as yup from 'yup';
import { render } from './view.js';

const initialState = {
  addedUrls: [],
  addingUrlProcess: {
    processState: 'filing', // варианты: 'filling', 'error', 'added', 'addition'
    processError: null,
  },
  form: {
    valid: true,
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

const validate = (url) => {
  schema
    .validate(url)
    .then(() => {})
    .catch((error) => console.log(error.errors));
};

console.log('йопта!');

// const watchedState = onChange(initialState, render());

export default () => {
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const urlInputValue = elements.urlInput.value;
    const urlInputFeedback = document.createElement('div');
    urlInputFeedback.classList.add('invalid-feedback');
    urlInputFeedback.textContent = urlInputValue;

    elements.form.after(urlInputFeedback);
  });
};
