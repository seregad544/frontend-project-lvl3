import * as yup from 'yup';
import onChange from 'on-change';

const isEmptyField = (field) => yup.object({ url: yup.string().required() }).isValidSync(field);

const isUrl = (field) => yup.object({ url: yup.string().url() }).isValidSync(field);

const isAdd = (field, watch) => yup.object({
  url: yup
    .string()
    .notOneOf(onChange.target(watch).site),
}).isValidSync(field);

const validate = (field, watch) => {
  const fieldStatus = isEmptyField(field);
  const urlStatus = isUrl(field);
  const addStatus = isAdd(field, watch);
  if (!fieldStatus) {
    watch.status = 'empty field';
    return false;
  }
  if (!urlStatus) {
    watch.status = 'incorrect URL';
    return false;
  }
  if (!addStatus) {
    watch.status = 'relapse RSS';
    return false;
  }
  return true;
};

const isRSS = (data) => {
  console.log(data);
  return data.contents.includes('<rss');
};

export { validate, isRSS };
