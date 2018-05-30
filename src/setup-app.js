import React from 'react';
import createHistory from 'history/createMemoryHistory';

import { setContext, getContext } from './context';
import mount from './mount';

/**
 * Returns `true` or `false` if the component specifies a prop type in
 * it's static `propTypes`.
 *
 * @private
 * @param {Component} Component - Component class
 * @param {String} propType - Prop type name
 * @returns {Boolean} If the prop is accepted or not
 */
function hasPropType(Component, propType) {
  return !!Component.propTypes && propType in Component.propTypes;
}

/**
 * Mounts an application component in the DOM with additional
 * properties useful for testing. Using the `props` option, you may
 * provide any custom properties to the app component.
 *
 * ``` javascript
 * setupAppForTesting(App, {
 *   props: { testing: true },
 *   setup: () => server = startMockServer(),
 *   teardown: () => server.shutdown()
 * })
 * ```
 *
 * If the application component accepts a `history` property, and one
 * was not already provided via `props`, an in-memory history object
 * is created which can then be used with routers such as [React
 * Router]().
 *
 * The `history` object is kept in a context which is used by the
 * `visit` helpers to make it easy to navigate your app. The `visit`
 * helpers will not work unless `setupAppForTesting` is called at
 * least once.
 *
 * ``` javascript
 * // `history` must be defined as a prop type
 * App.propTypes = {
 *   history: PropTypes.object
 * }
 *
 * // if this is not called, the visit helpers will throw errors
 * setupAppForTesting(App)
 *
 * // forwards to `history.push`
 * visit('/someroute')
 * visit({ pathname: '/foo', search: '?bar' })
 *
 * // other history helpers
 * goBack()
 * goForward()
 * ```
 *
 * Every time a new component is mounted via the `setupAppForTesting`
 * or `mount` helpers, or when using the `cleanup` helper, the
 * previous component is unmounted and the context is cleared.
 *
 * ``` javascript
 * setupAppForTesting(App)
 * visit('/someroute')
 * cleanup()
 *
 * visit('/someroute')
 * //=> Error: undefined history context
 * ```
 *
 * @function setupAppForTesting
 * @param {Component} App - The Application component class to mount
 * with additional properties
 * @param {Object} [options] - Mounting options passed along to `mount`
 * @param {Object} [options.props] - Additional props to pass to the
 * App component when it renders
 * @returns {Promise} Resolves with the app instance after it has been
 * mounted in the DOM
 */
export default function setupAppForTesting(App, options = {}) {
  let { props = {}, ...mountOptions } = options;

  // ensure we don't mutate the incoming object
  props = Object.assign({}, props);

  // create an in-memory history object
  if (hasPropType(App, 'history') && !('history' in props)) {
    Object.assign(props, { history: createHistory() });
  }

  // save a reference to the app
  if (Object.getPrototypeOf(App) === React.Component) {
    Object.assign(props, { ref: app => setContext({ app }) });
  }

  // mount with props & options
  return mount(() => <App {...props}/>, mountOptions)
    .then(() => {
      // save the history context after mounting
      if ('history' in props) {
        setContext({ history: props.history });
      }

      // always resolve with the app if possible
      return getContext('app', false) || null;
    });
}
