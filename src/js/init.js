import onChange from "on-change";
import * as yup from "yup";
import i18next from "i18next";
// import isEmpty from 'lodash/isEmpty.js';
import render from "./view.js";
import resources from "../locales/index.js";
import axios from "axios";

export default () => {
  const initialState = {
    addedUrls: [],
    addingUrlProcess: {
      processState: "filling", // варианты: 'filling', 'error', 'added'
      // processError: null, // для сетевых ошибок
    },
    form: {
      // valid: true,
      errors: {},
      fields: {
        url: "",
      },
    },
  };

  const elements = {
    form: document.querySelector("form"),
    urlInput: document.getElementById("url-input"),
    submitButton: document.querySelector("button"),
    feedbackElement: document.querySelector(".feedback"),
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance
    .init({
      lng: "ru",
      debug: true,
      resources,
    })
    .then(() => {
      yup.setLocale({
        string: {
          url: () => ({
            key: "errors.invalidUrl",
          }),
        },
        mixed: {
          required: () => ({
            key: "errors.required",
          }),
          notOneOf: () => ({
            key: "errors.linkExists",
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

      elements.form
        .addEventListener("submit", (e) => {
          e.preventDefault();

          const urlInputValue = elements.urlInput.value;
          watchedState.form.fields.url = urlInputValue;
          const schema = createSchema(watchedState.addedUrls);
          schema.validate(watchedState.form.fields).then(() => {
            watchedState.addingUrlProcess.processState = "added"; // меняем статус процесса для render()
            watchedState.addedUrls.push(urlInputValue); // добавляем валидный url в подписки
            // watchedState.form.errors = {}; // сбрасываем ошибки

            axios
              .get(createProxyUrl(initialState.form.fields.url))
              // .then((response) => {
              //   if (response.ok) return response.json();
              //   throw new Error('Network response was not ok.');
              // })
              // .then((data) => {
              //   const newData = data.contents;
              //   const parser = new DOMParser();
              //   const xmlDoc = parser.parseFromString(newData, 'application/xml');
              //   const items = xmlDoc.querySelectorAll('item');
              //   items.forEach((item) => {
              //     const title = item.querySelector('title').textContent;
              //     const link = item.querySelector('link').textContent;
              //     const description = item.querySelector('description').textContent;
              //     console.log(`Title: ${title}`);
              //     console.log(`Link: ${link}`);
              //     console.log(`Description: ${description}`);
              //     console.log('---');
              //   });
              // });
              .then((response) => {
                  if (response.status === 200) return response.data;
                  throw new Error('Network response was not ok.');
                })
              .then((data) => {
                // console.log(response.status);
                const newData = data.contents;
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(newData, 'application/xml');
                const items = xmlDoc.querySelectorAll('item');
                items.forEach((item) => {
                  const title = item.querySelector('title').textContent;
                  const link = item.querySelector('link').textContent;
                  const description = item.querySelector('description').textContent;
                  console.log(`Title: ${title}`);
                  console.log(`Link: ${link}`);
                  console.log(`Description: ${description}`);
                  console.log('---');
                });
               
              });
          });
        })
        .catch((err) => {
          watchedState.addingUrlProcess.processState = "error";
          watchedState.form.errors = err.message;
          console.log(JSON.stringify(err, null, 2));
          console.log(watchedState.addedUrls);
        });
      // .finally(() => {
      //   console.log(initialState);
      //   console.log(elements);
      //   console.log(initialState.addedUrls);
      // });
    });
  //   fetch(
  //     createProxyUrl(initialState.form.fields.url),
  //   )
  //     .then((response) => {
  //       if (response.ok) return response.json();
  //       throw new Error('Network response was not ok.');
  //     })
  //     .then((data) => {
  //       const newData = data.contents;
  //       const parser = new DOMParser();
  //       const xmlDoc = parser.parseFromString(newData, 'application/xml');
  //       const items = xmlDoc.querySelectorAll('item');
  //       items.forEach((item) => {
  //         const title = item.querySelector('title').textContent;
  //         const link = item.querySelector('link').textContent;
  //         const description = item.querySelector('description').textContent;
  //         console.log(`Title: ${title}`);
  //         console.log(`Link: ${link}`);
  //         console.log(`Description: ${description}`);
  //         console.log('---');
  //       });
  //     });
  // });
};
