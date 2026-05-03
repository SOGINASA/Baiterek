module.exports = {
  style: {
    postcss: {
      loaderOptions: (postcssLoaderOptions) => {
        postcssLoaderOptions.postcssOptions.plugins = [
          require("@tailwindcss/postcss"),
          require("autoprefixer"),
        ];
        return postcssLoaderOptions;
      },
    },
  },
};