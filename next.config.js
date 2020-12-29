const withImages = require('next-images');
module.exports = {
  i18n: {
    locales: [
      'en-US',
    ],
    defaultLocale: 'en-US',
  },
  ...withImages(),
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};
