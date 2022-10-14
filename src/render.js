const form = document.querySelector('.rss-form');
const input = form.querySelector('#url-input');
const sendsenButton = form.querySelector('button');
const feedback = document.querySelector('.feedback');

export const changeModal = (event, state, modal) => {
  const button = event.relatedTarget;
  const id = button.getAttribute('data-id');
  const modalTitle = modal.querySelector('.modal-title');
  const modalBodyInput = modal.querySelector('.modal-body');
  const fullAarticle = modal.querySelector('.full-article');
  fullAarticle.setAttribute('href', state.post[id].link);
  modalTitle.textContent = state.post[id].title;
  modalBodyInput.textContent = state.post[id].description;
};

const createPost = (post, id, i18next) => {
  const item = document.createElement('li');
  item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
  const link = document.createElement('a');
  link.classList.add('fw-bold');
  link.textContent = post.title;
  const attributesLink = [['href', post.link], ['target', '_blank'], ['rel', 'noopener noreferrer'], ['data-id', id]];
  attributesLink.map((attribute) => link.setAttribute(...attribute));
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  const attributesButton = [['type', 'button'], ['data-id', id], ['data-bs-toggle', 'modal'], ['data-bs-target', '#modal']];
  attributesButton.map((attribute) => button.setAttribute(...attribute));
  button.textContent = i18next.t('buttonPost');
  link.onclick = () => {
    link.classList.replace('fw-bold', 'fw-normal');
    link.classList.add('link-secondary');
  };
  button.onclick = () => {
    link.classList.replace('fw-bold', 'fw-normal');
    link.classList.add('link-secondary');
  };
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
  const itemsPosts = state.post.map((post, index) => createPost(post, index, i18next));
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

const renderStatus = (state, i18next) => {
  const addErrorMessege = (messege) => {
    input.classList.toggle('is-invalid', true);
    input.removeAttribute('readonly');
    sendsenButton.classList.remove('disabled');
    feedback.classList.toggle('text-success', false);
    feedback.classList.toggle('text-danger', true);
    feedback.textContent = i18next.t(messege);
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
      input.classList.toggle('is-invalid', false);
      input.setAttribute('readonly', 'true');
      sendsenButton.classList.add('disabled');
      feedback.classList.toggle('text-danger', false);
      feedback.textContent = i18next.t('loadingRSS');
      break;
    case 'added RSS':
      input.classList.toggle('is-invalid', false);
      input.removeAttribute('readonly');
      sendsenButton.classList.remove('disabled');
      feedback.classList.toggle('text-danger', false);
      feedback.classList.toggle('text-success', true);
      feedback.textContent = i18next.t('addedRSS');
      input.value = '';
      input.focus();
      break;
    default:
      throw new Error(`Incorrect status: '${state.stat}'!`);
  }
};

export default (state, path, i18next) => {
  if (path === 'status') {
    renderStatus(state, i18next);
  }
  if (path === 'post') {
    document.querySelector('.posts').innerHTML = '';
    document.querySelector('.posts').append(renderPost(state, i18next));
    document.querySelector('.feeds').innerHTML = '';
    document.querySelector('.feeds').append(renderFeeds(state, i18next));
  }
};
