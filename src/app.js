import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import { isEqual } from 'lodash';
import renderPage, { changeModal } from './render.js';
import validate from './validate.js';
import parse from './parse.js';
import ru from './locales/ru.js';

const initializationState = () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  });

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

const request = (url) => new Promise((resolve, reject) => {
  axios({
    url: 'https://allorigins.hexlet.app/get',
    params: {
      disableCache: true,
      url,
    },
    validateStatus: (status) => status === 200,
    timeout: 45000,
  })
    .then((response) => response.data)
    .then((data) => {
      if (data.status.http_code === 200) {
        resolve(data);
      } else {
        reject(new Error(`Error code: ${data.status.http_code}`));
      }
    });
});

const addHandlers = (state) => {
  const form = document.querySelector('.rss-form');
  const Modal = document.getElementById('modal');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    if (validate({ url }, state)) {
      state.status = 'loading RSS';
      request(url)
        .then((data) => {
          console.log(data.status.http_code);
          try {
            const [feed, post] = parse(data);
            state.site.push(url);
            state.feeds = [...state.feeds, feed];
            state.post = [...state.post, ...post];
            state.status = 'added RSS';
          } catch (error) {
            state.status = 'incorrect RSS';
            console.log('incorrect RSS');
          }
        })
        .catch((error) => {
          console.log(error);
          state.status = 'network problem';
        });
    }
  });

  Modal.addEventListener('show.bs.modal', (event) => changeModal(event, state, Modal));
};

const getPosts = (url) => request(url).then((data) => parse(data)[1]);

const updatingPosts = (state) => {
  setTimeout(function run() {
    const posts = state.site.map(getPosts);
    Promise.all(posts)
      .then((updatedPost) => {
        if (!isEqual(updatedPost.flat(), state.post)) {
          state.post = updatedPost.flat();
          console.log('refresh');
        }
        console.log('no error');
      })
      .finally(() => setTimeout(run, 5000));
  }, 5000);
};

export default () => {
  const state = initializationState();
  addHandlers(state);
  updatingPosts(state);
};
