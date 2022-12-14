import * as yup from 'yup';

const isEmptyField = (field) => yup.object({ url: yup.string().required() }).isValidSync(field);

const isUrl = (field) => yup.object({ url: yup.string().url() }).isValidSync(field);

const isAdd = (field, state) => yup.object({
  url: yup
    .string()
    .notOneOf(state.feeds.map((feed) => feed.url)),
}).isValidSync(field);

export default (field, state) => {
  const fieldStatus = isEmptyField(field);
  const urlStatus = isUrl(field);
  const addStatus = isAdd(field, state);
  if (!fieldStatus) {
    state.status = 'empty field';
    return false;
  }
  if (!urlStatus) {
    state.status = 'incorrect URL';
    return false;
  }
  if (!addStatus) {
    state.status = 'relapse RSS';
    return false;
  }
  return true;
};
