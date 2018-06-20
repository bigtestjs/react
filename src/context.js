// local context where various things can be persisted using the
// helper functions below
let context = Object.create(null);

/**
 * Clears everything from the current context by creating a brand new
 * empty context.
 *
 * @private
 */
export function clearContext() {
  context = Object.create(null);
}

/**
 * Adds things to the context by key, value.
 *
 * @private
 * @param {Object} newContexts - Hash of things to store in the
 * current context
 */
export function setContext(newContext) {
  Object.assign(context, newContext);
}

/**
 * Retrieves the value of a specific key in the current context.
 *
 * @private
 * @param {String} key - The key of the value to retrieve
 * @param {String|Boolean} [error] - Specific error message to throw
 * @returns Value of `key` within the current context
 * @throws {Error} when `key` is not fonud in the current context
 */
export function getContext(key, error) {
  if (typeof error === 'undefined') {
    error = `no ${key} context, make sure \`setupAppForTesting\` was called`;
  }

  if (key in context) {
    return context[key];
  } else if (error) {
    throw new Error(error);
  }
}
