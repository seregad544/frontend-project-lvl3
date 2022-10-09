const regexp = /<(img|br|a).*?(\/|\/a)>/gm;
const removeHtmlTags = (text) => text.replaceAll(regexp, '');

export default (data) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(data.contents, 'text/xml');
  const items = Array.from(xml.querySelectorAll('item'));
  const posts = [];
  items.map((item) => posts.push({
    title: item.querySelector('title').textContent,
    description: removeHtmlTags(item.querySelector('description').textContent),
    link: item.querySelector('link').textContent,
  }));
  const channel = xml.querySelector('channel');
  const feed = {
    title: channel.querySelector('title').textContent,
    description: channel.querySelector('description').textContent,
    link: channel.querySelector('link').textContent,
  };
  return [feed, posts];
};
