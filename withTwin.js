const path = require("path");

module.exports = function withTwin(nextConfig) {
  return {
    ...nextConfig,
    webpack(config, options) {
      const { dev, isServer } = options;
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];

      const patchedDefaultLoaders = options.defaultLoaders.babel;
      patchedDefaultLoaders.options.hasServerComponents = false;
      if (!isServer) {
        patchedDefaultLoaders.options.hasReactRefresh = false;
      }

      // Twin Macro
      const componentsDir = path.resolve(__dirname, "components");
      config.module.rules.push({
        test: /\.(js|jsx|ts|tsx)$/,
        include: [componentsDir],
        use: [
          patchedDefaultLoaders,
          {
            loader: "babel-loader",
            options: {
              sourceMaps: dev,
              plugins: [
                require.resolve("babel-plugin-macros"),
                //[require.resolve("babel-plugin-styled-components"), { ssr: true, displayName: true }],
                [require.resolve("@babel/plugin-syntax-typescript"), { isTSX: true }],
              ],
            },
          },
        ],
      });

      if (!isServer) {
        config.resolve.fallback = {
          ...(config.resolve.fallback || {}),
          fs: false,
          module: false,
          path: false,
          os: false,
          crypto: false,
        };
      }

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options);
      } else {
        return config;
      }
    },
  };
};
