const withImages = require('next-images');
module.exports = {
  i18n: {
    locales: [
      'en-US',
    ],
    defaultLocale: 'en-US',
  },
  ...withImages(),
};
