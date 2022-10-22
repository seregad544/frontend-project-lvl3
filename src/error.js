export default class RSSError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RSSError';
  }
}
