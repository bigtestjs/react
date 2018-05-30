import { getContext } from './context';

/**
 * Uses the history context setup during `setupAppForTesting` and
 * calls `push` with the provided location argument.
 *
 * ``` javascript
 * // must be called to setup the `history` context
 * setupAppForTesting(App)
 *
 * // calls `history.push()`
 * visit('/someroute')
 * visit({ pathname: '/foo', search: '?bar' })
 * ```
 *
 * @function visit
 * @param {Object|String} location - Argument for `history.push()`
 * @throws Error When `setupAppForTesting` was not called
 */
export function visit(location) {
  getContext('history').push(location);
}

/**
 * Uses the history context setup during `setupAppForTesting` and
 * calls the `goBack` method.
 *
 * ``` javascript
 * // must be called to setup the `history` context
 * setupAppForTesting(App)
 *
 * // go to a route
 * visit('/someroute')
 *
 * // go back
 * goBack()
 * ```
 *
 * @function goBack
 * @throws Error When `setupAppForTesting` was not called
 */
export function goBack() {
  getContext('history').goBack();
}

/**
 * Uses the history context setup during `setupAppForTesting` and
 * calls the `goForward` method.
 *
 * ``` javascript
 * // must be called to setup the `history` context
 * setupAppForTesting(App)
 *
 * // go to a route, and back
 * visit('/someroute')
 * goBack()
 *
 * // go back to `/someroute`
 * goForward()
 * ```
 *
 * @function goForward
 * @throws Error When `setupAppForTesting` was not called
 */
export function goForward() {
  getContext('history').goForward();
}

/**
 * Uses the history context setup during `setupAppForTesting`
 * and returns the current location.
 *
 * ``` javascript
 * // must be called to setup the `history` context
 * setupAppForTesting(App)
 * visit('/someroute')
 *
 * location().pathname
 * //=> "/someroute"
 * ```
 *
 * @returns {Object} Current history location object
 * @throws Error When `setupAppForTesting` was not called
 */
export function location() {
  return getContext('history').location;
}
