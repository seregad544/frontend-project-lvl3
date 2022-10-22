import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import { isEqual } from 'lodash';
import renderPage from './render.js';
import validate from './validate.js';
import parse from './parse.js';
import ru from './locales/ru.js';

const initializationDictionary = () => {
  const i18nextInstance = i18next.createInstance();
  return i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  }).then(() => i18nextInstance);
};

const initializationState = (i18nextInstance) => {
  const state = onChange(
    {
      status: '',
      site: [],
      feeds: [],
      post: [],
    },
    (path) => renderPage(state, path, i18nextInstance),
  );
  return state;
};

const request = (url) => axios({
  url: 'https://allorigins.hexlet.app/get',
  params: {
    disableCache: true,
    url,
  },
  timeout: 45000,
})
  .then((response) => response.data);

const addHandlers = (state) => {
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    if (validate({ url }, state)) {
      state.status = 'loading RSS';
      request(url)
        .then((data) => {
          const [feed, post] = parse(data);
          state.site.push(url);
          state.feeds = [...state.feeds, feed];
          state.post = [...state.post, ...post];
          state.status = 'added RSS';
        })
        .catch((error) => {
          if (error.message === 'Site does not contain RSS') {
            state.status = 'incorrect RSS';
          } else {
            state.status = 'network problem';
          }
        });
    }
  });
};

const getPosts = (url) => request(url).then((data) => parse(data)[1]);

const updatingPosts = (state) => {
  setTimeout(function run() {
    const posts = state.site.map(getPosts);
    Promise.all(posts)
      .then((updatedPost) => {
        if (!isEqual(updatedPost.flat(), state.post)) {
          state.post = updatedPost.flat();
        }
      })
      .finally(() => setTimeout(run, 5000));
  }, 5000);
};

export default () => {
  initializationDictionary()
    .then((dictionary) => initializationState(dictionary))
    .then((state) => {
      addHandlers(state);
      updatingPosts(state);
    });
};
