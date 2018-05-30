import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: [{
    format: 'umd',
    name: 'BigTest.ReactHelpers',
    file: pkg.main,
    globals: {
      'react': 'React',
      'react-dom': 'ReactDOM'
    }
  }, {
    format: 'es',
    file: pkg.module
  }],
  external: [
    'react',
    'react-dom'
  ],
  plugins: [
    resolve(),
    commonjs({
      exclude: 'src/**'
    }),
    babel({
      babelrc: false,
      comments: false,
      presets: [
        ['@babel/env', {
          modules: false
        }],
        '@babel/stage-3',
        '@babel/react'
      ]
    })
  ]
};
