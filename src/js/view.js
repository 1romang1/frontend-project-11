export default (elements, initialState) => {
  switch (initialState.addingUrlProcess.processState) {
    case 'added':
      elements.feedbackElement.textContent = 'RSS успешно загружен';
      elements.urlInput.value = '';
      break;
    case 'error':
      elements.urlInput.classList.add('is-invalid');
      break;
    default:
      //   throw new Error('Unknown value');
      break;
  }
};
