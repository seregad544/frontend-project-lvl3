import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import { isEqual } from 'lodash';
import { renderStatusValidate, renderPost, renderFeeds } from './render.js';
import { validate, isRSS } from './validate.js';
import parse from './parse.js';
import ru from './locales/ru.js';

const state = {
  status: '',
  site: [],
  feeds: [],
  post: [],
};

const i18nextInstance = i18next.createInstance();
i18nextInstance.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru,
  },
});

const watch = onChange(state, (path) => {
  if (path === 'status') {
    renderStatusValidate(watch, i18nextInstance);
  }
  if (path === 'post') {
    document.querySelector('.posts').innerHTML = '';
    document.querySelector('.posts').append(renderPost(watch, i18nextInstance));
    document.querySelector('.feeds').innerHTML = '';
    document.querySelector('.feeds').append(renderFeeds(watch, i18nextInstance));
  }
});

const request = (url) => {
  const proxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
  return axios.get(proxy)
    .then((response) => response.data)
    .catch(() => {
      watch.status = 'network problem';
    });
};

const form = document.querySelector('.rss-form');
const exampleModal = document.getElementById('modal');

const addHandlers = () => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = [...formData.values()][0];
    if (validate({ url }, watch)) {
      watch.status = 'loading RSS';
      request(url)
        .then((data) => {
          if (isRSS(data)) {
            watch.site.push(url);
            watch.feeds = [...watch.feeds, parse(data)[0]];
            watch.post = [...watch.post, ...parse(data)[1]];
            watch.status = 'added RSS';
          } else {
            watch.status = 'incorrect RSS';
          }
        });
    }
  });

  exampleModal.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget;
    const id = button.getAttribute('data-id');
    const modalTitle = exampleModal.querySelector('.modal-title');
    const modalBodyInput = exampleModal.querySelector('.modal-body');
    const fullAarticle = exampleModal.querySelector('.full-article');
    fullAarticle.setAttribute('href', watch.post[id].link);
    modalTitle.textContent = watch.post[id].title;
    modalBodyInput.textContent = watch.post[id].description;
  });
};

const getPosts = (url) => request(url).then((data) => parse(data)[1]);

const updatingPosts = () => {
  setTimeout(function run() {
    const posts = onChange.target(watch).site.map(getPosts);
    Promise.all(posts)
      .then((values) => {
        if (!isEqual(values.flat(), onChange.target(watch).post)) {
          watch.post = values.flat();
        }
      })
      .finally(setTimeout(run, 5000));
  }, 5000);
};

export default () => {
  addHandlers();
  updatingPosts();
};
