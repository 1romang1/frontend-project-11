function postsAndFeedsRender(elements, initialState) {
  elements.feedsContainer.innerHTML = ''; // очистка перед рендером
  elements.postsContainer.innerHTML = '';

  initialState.feeds.forEach((feed) => {
    const feedEl = document.createElement("article");
    const titleEl = document.createElement("h2");
    titleEl.textContent = feed.title;
    const descriptionEl = document.createElement("p");
    descriptionEl.textContent = feed.description;
    feedEl.appendChild(titleEl);
    feedEl.appendChild(descriptionEl);
    elements.feedsContainer.appendChild(feedEl);
  });

  initialState.posts.forEach((post) => {
    const postEl = document.createElement("div");
    const linkEl = document.createElement("a");
    linkEl.href = post.link;
    linkEl.textContent = post.title;
    postEl.appendChild(linkEl);
    elements.postsContainer.appendChild(postEl);
  });
}

export default (elements, initialState, i18nextInstance) => () => {
  switch (initialState.addingUrlProcess.processState) {
    case "added":
      elements.feedbackElement.textContent = i18nextInstance.t("validFeedback");
      elements.feedbackElement.classList.remove("text-danger");
      elements.urlInput.classList.remove("is-invalid");
      elements.feedbackElement.classList.add("text-success");
      elements.urlInput.value = "";
      postsAndFeedsRender(elements, initialState);
      break;
    case "error":
      elements.urlInput.classList.add("is-invalid");
      elements.feedbackElement.textContent = i18nextInstance.t(
        initialState.form.errors.key
      );
      elements.feedbackElement.classList.remove("text-success");
      elements.feedbackElement.classList.add("text-danger");
      break;
    default:
      break;
  }
};
