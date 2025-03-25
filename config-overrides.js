module.exports = function override(config, env) {
  // Add fallbacks for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "stream": require.resolve("stream-browserify"),
    "crypto": false,
    "zlib": false,
    "fs": false,
    "path": false,
    "os": false
  };

  return config;
}; 