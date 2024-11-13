export default (elements, initialState) => () => {
  switch (initialState.addingUrlProcess.processState) {
    case 'added':
      elements.feedbackElement.textContent = 'RSS успешно загружен';
      elements.feedbackElement.classList.remove('text-danger');
      elements.urlInput.classList.remove('is-invalid');
      elements.feedbackElement.classList.add('text-success');
      elements.urlInput.value = '';
      break;
    case 'error':
      elements.urlInput.classList.add('is-invalid');
      elements.feedbackElement.textContent = initialState.form.errors;
      elements.feedbackElement.classList.remove('text-success');
      elements.feedbackElement.classList.add('text-danger');
      break;
    default:
      //   throw new Error('Unknown value');
      break;
  }
};
