// function postsAndFeedsRender(elements, initialState) {
//   elements.feedsContainer.innerHTML = ''; // очистка перед рендером
//   elements.postsContainer.innerHTML = '';

//   initialState.feeds.forEach((feed) => {
//     const feedEl = document.createElement("article");
//     const titleEl = document.createElement("h2");
//     titleEl.textContent = feed.title;
//     const descriptionEl = document.createElement("p");
//     descriptionEl.textContent = feed.description;
//     feedEl.appendChild(titleEl);
//     feedEl.appendChild(descriptionEl);
//     elements.feedsContainer.appendChild(feedEl);
//   });

//   initialState.posts.forEach((post) => {
//     const postEl = document.createElement("div");
//     const linkEl = document.createElement("a");
//     linkEl.href = post.link;
//     linkEl.textContent = post.title;
//     postEl.appendChild(linkEl);
//     elements.postsContainer.appendChild(postEl);
//   });
// }
const renderFeedsList = (feeds, elements) => {
  const { feedsContainer } = elements;
  if (!feedsContainer) return;

  if (feeds.length === 0) {
    feedsContainer.innerHTML = `
      <div class="card border-0">
        <div class="card-body">
          <h2 class="card-title h4">Фиды</h2>
          <p class="card-text text-muted">Пока нет RSS потоков. Добавьте первый!</p>
        </div>
      </div>
    `;
    return;
  }

  const feedsHtml = feeds
    .map(
      (feed) => `
    <div class="card mb-3">
      <div class="card-body">
        <h3 class="card-title h6">${feed.title}</h3>
        <p class="card-text">${feed.description}</p>
      </div>
    </div>
  `
    )
    .join("");

  feedsContainer.innerHTML = `
    <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">Фиды</h2>
        ${feedsHtml}
      </div>
    </div>
  `;
};

const renderPostsList = (posts, elements) => {
  const { postsContainer } = elements
  if (!postsContainer) return

  if (posts.length === 0) {
    postsContainer.innerHTML = `
      <div class="card border-0">
        <div class="card-body">
          <h2 class="card-title h4">Посты</h2>
          <p class="card-text text-muted">Пока нет постов. Новые посты будут появляться автоматически.</p>
        </div>
      </div>
    `
    return
  }

  const postsHtml = posts.map((post) => {
    // const isRead = readPosts.has(post.id)
    // const titleClass = isRead ? '' : 'fw-bold'

    return `
    <div class="list-group-item d-flex justify-content-between align-items-start border-0">
      <a href="${post.link}" class="${titleClass}" target="_blank" rel="noopener noreferrer">
        ${post.title}
      </a>
      <button type="button" class="btn btn-outline-primary btn-sm" data-post-id="${post.id}">
        Просмотр
      </button>
    </div>
    `
  }).join('')

  postsContainer.innerHTML = `
    <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">Посты</h2>
        <div class="list-group">
          ${postsHtml}
        </div>
      </div>
    </div>
  `
};
export default (elements, initialState, i18nextInstance) => () => {
  switch (initialState.addingUrlProcess.processState) {
    case "added":
      elements.feedbackElement.textContent = i18nextInstance.t("validFeedback");
      elements.feedbackElement.classList.remove("text-danger");
      elements.urlInput.classList.remove("is-invalid");
      elements.feedbackElement.classList.add("text-success");
      elements.urlInput.value = "";
      // postsAndFeedsRender(elements, initialState);
      renderFeedsList(initialState.feeds, elements);
      renderPostsList(initialState.posts, elements);
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
