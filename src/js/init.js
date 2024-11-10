import * as yup from "yup";

const initialState = {
  addedUrls: ["https://yandex.ru"],
//   url: "https://google.com",
  addingUrlProcess: {
    processState: "filing", // варианты: 'filling', 'error', 'added', 'addition'
    processError: null,
  },
  form: {
    valid: true,
    errors: {},
    fields: {
      url: "https://google.com",
    },
  },
};

const schema = yup.object({
  url: yup
    .string()
    .url("Ссылка должна быть валидным URL")
    .required("Это поле обязательно для заполнения")
    .test(
      "unique-url",
      "Ссылка уже существует",
      (value) => !initialState.addedUrls.includes(value),
    ),
});

const validate = (url) => {
  schema
    .validate(url)
    .then(() => console.log("фид валидный"))
    .catch((error) => console.log(error.errors));
};

const elements = {
  form: document.querySelector('form'),
  submitButton: document.getElementById('url-input'),
};
console.log(elements.submitButton)
validate(initialState.form.fields);
