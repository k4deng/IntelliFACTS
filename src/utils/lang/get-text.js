import en from './en.js';

export default (lang, key) => {

  if (lang === 'en') {
    return en[key];

  } else if (lang === null) return {
    'en': en[key]
  }

};