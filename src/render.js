const createPost = (state, post, i18next) => {
  const item = document.createElement('li');
  item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
  const link = document.createElement('a');
  const linkClassList = (state.visitedPostsIds.has(post.id)) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
  link.classList.add(...linkClassList);
  link.textContent = post.title;
  const attributesLink = [['href', post.link], ['target', '_blank'], ['rel', 'noopener noreferrer'], ['data-id', post.id]];
  attributesLink.map((attribute) => link.setAttribute(...attribute));
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  const attributesButton = [['type', 'button'], ['data-id', post.id], ['data-bs-toggle', 'modal'], ['data-bs-target', '#modal']];
  attributesButton.map((attribute) => button.setAttribute(...attribute));
  button.textContent = i18next.t('buttonPost');
  item.append(link, button);
  return item;
};

const renderPost = (state, i18next) => {
  const wrapper = document.createElement('div');
  wrapper.classList.add('card', 'border-0');
  const posts = document.createElement('div');
  posts.classList.add('card-body');
  const title = document.createElement('h2');
  title.classList.add('card-title', 'h4');
  title.textContent = i18next.t('titlePost');
  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');
  const itemsPosts = state.post.map((post) => createPost(state, post, i18next));
  list.append(...itemsPosts);
  posts.append(title, list);
  wrapper.append(posts);
  return wrapper;
};

const creatFeed = (feed) => {
  const item = document.createElement('li');
  item.classList.add('list-group-item', 'border-0', 'border-end-0');
  const title = document.createElement('h3');
  title.classList.add('h6', 'm-0');
  title.textContent = feed.title;
  const article = document.createElement('p');
  article.classList.add('m-0', 'small', 'text-black-50');
  article.textContent = feed.description;
  item.append(title, article);
  return item;
};

const renderFeeds = (state, i18next) => {
  const wrapper = document.createElement('div');
  wrapper.classList.add('card', 'border-0');
  const feeds = document.createElement('div');
  feeds.classList.add('card-body');
  const title = document.createElement('h2');
  title.classList.add('card-title', 'h4');
  title.textContent = i18next.t('titleFeeds');
  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');
  const itemsFeeds = state.feeds.map(creatFeed);
  list.append(...itemsFeeds);
  feeds.append(title, list);
  wrapper.append(feeds);
  return wrapper;
};

const renderStatus = (state, i18next, element) => {
  const addErrorMessege = (messege) => {
    element.input.classList.toggle('is-invalid', true);
    element.input.removeAttribute('readonly');
    element.sendsenButton.classList.remove('disabled');
    element.feedback.classList.toggle('text-success', false);
    element.feedback.classList.toggle('text-danger', true);
    element.feedback.textContent = i18next.t(messege);
  };
  switch (state.status) {
    case 'empty field':
      addErrorMessege('emptyField');
      break;
    case 'incorrect URL':
      addErrorMessege('incorrectURL');
      break;
    case 'relapse RSS':
      addErrorMessege('relapseRSS');
      break;
    case 'network problem':
      addErrorMessege('networkProblem');
      break;
    case 'incorrect RSS':
      addErrorMessege('incorrectRSS');
      break;
    case 'loading RSS':
      element.input.classList.toggle('is-invalid', false);
      element.input.setAttribute('readonly', 'true');
      element.sendsenButton.classList.add('disabled');
      element.feedback.classList.toggle('text-danger', false);
      element.feedback.textContent = i18next.t('loadingRSS');
      break;
    case 'added RSS':
      element.input.classList.toggle('is-invalid', false);
      element.input.removeAttribute('readonly');
      element.sendsenButton.classList.remove('disabled');
      element.feedback.classList.toggle('text-danger', false);
      element.feedback.classList.toggle('text-success', true);
      element.feedback.textContent = i18next.t('addedRSS');
      element.input.value = '';
      element.input.focus();
      break;
    default:
      throw new Error(`Incorrect status: '${state.stat}'!`);
  }
};

export default (state, path, i18next, element) => {
  if (path === 'status') {
    renderStatus(state, i18next, element);
  }
  if (path.includes('post') || path.includes('visitedPostsIds')) {
    element.posts.innerHTML = '';
    element.posts.append(renderPost(state, i18next));
    element.feeds.innerHTML = '';
    element.feeds.append(renderFeeds(state, i18next));
  }
  if (path.includes('modal')) {
    element.modalFullAarticle.setAttribute('href', state.modal.link);
    element.modalTitle.textContent = state.modal.title;
    element.modalBody.textContent = state.modal.body;
  }
};
