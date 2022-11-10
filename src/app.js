import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import renderPage from './render.js';
import validate from './validate.js';
import parse from './parse.js';
import ru from './locales/ru.js';
import RSSError from './error.js';

const htmlElement = {
  form: document.querySelector('.rss-form'),
  input: document.querySelector('#url-input'),
  sendsenButton: document.querySelector('[aria-label="add"]'),
  feedback: document.querySelector('.feedback'),
  modal: document.getElementById('modal'),
  modalTitle: document.querySelector('.modal-title'),
  modalBody: document.querySelector('.modal-body'),
  modalFullAarticle: document.querySelector('.full-article'),
  posts: document.querySelector('.posts'),
  feeds: document.querySelector('.feeds'),
};

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
      feeds: [],
      post: [],
      visitedPostsIds: new Set(),
      modal: {
        link: '',
        title: '',
        body: '',
      },
    },
    (path) => renderPage(state, path, i18nextInstance, htmlElement),
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
}).then((response) => response.data);

const addHandlers = (state) => {
  htmlElement.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    if (validate({ url }, state)) {
      state.status = 'loading RSS';
      request(url)
        .then((data) => {
          const [feed, post] = parse(data, url);
          state.feeds = [...state.feeds, feed];
          state.post = [...state.post, ...post];
          state.status = 'added RSS';
        })
        .catch((error) => {
          if (error instanceof RSSError) {
            state.status = 'incorrect RSS';
          } else {
            state.status = 'network problem';
          }
        });
    }
  });
  htmlElement.modal.addEventListener('show.bs.modal', (event) => {
    const id = event.relatedTarget.getAttribute('data-id');
    const post = state.post.filter((item) => item.id === id)[0];
    state.modal = {
      link: post.link,
      title: post.title,
      body: post.description,
    };
  });
  htmlElement.posts.addEventListener('click', (event) => {
    if (event.target.closest('a') || event.target.closest('button')) {
      state.visitedPostsIds.add(event.target.getAttribute('data-id'));
    }
  });
};

const getPosts = (url) => request(url).then((data) => parse(data, url)[1]);

const updatingPosts = (state) => {
  setTimeout(function run() {
    const updatePosts = state.feeds.map((feed) => getPosts(feed.url));
    Promise.all(updatePosts)
      .then((updatedPost) => {
        const oldPostList = state.post.map((post) => post.title);
        const newPostList = updatedPost.flat().map((post) => post.title);
        const difference = newPostList.filter((x) => !oldPostList.includes(x));
        if (difference.length > 0) {
          const change = updatedPost.flat().filter((post) => difference.includes(post.title));
          state.post = [...change, ...onChange.target(state.post)];
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
