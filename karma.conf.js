module.exports = (config) => {
  config.set({
    frameworks: ['mocha'],
    reporters: ['mocha'],
    browsers: ['Chrome'],

    files: [
      { pattern: 'tests/index.js', watched: false }
    ],

    preprocessors: {
      'tests/index.js': ['webpack']
    },

    mochaReporter: {
      showDiff: true
    },

    webpack: {
      module: {
        rules: [{
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              ['@babel/env', {
                modules: false
              }],
              '@babel/stage-3',
              '@babel/react'
            ]
          }
        }]
      }
    },

    webpackMiddleware: {
      stats: 'minimal'
    },

    plugins: [
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-webpack'
    ]
  });
};
