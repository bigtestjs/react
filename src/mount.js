import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { clearContext, setContext, getContext } from './context';

/**
 * Creates a div with an ID and appends it into the `$root` element.
 *
 * @private
 * @param {String} id - Div ID
 * @param {Node} $root - Element to append the div into
 * @returns {Node} The appended div element
 */
function insertNode(id, $root) {
  let $node = document.createElement('div');
  $node.id = id;
  $root.appendChild($node);
  return $node;
}

/**
 * Cleans up any component that was mounted by previously calling
 * `mount`, and clears the current context used by other helpers.
 *
 * The `teardown` option provided to the previous `mount` function
 * will be called when using this helper. If a promise is returned,
 * the cleanup will not happen until after that promise resovles.
 *
 * @function cleanup
 * @returns {Promise} Resolves after unmounting the component and
 * clearing the current context
 */
export function cleanup() {
  let {
    node,
    teardown = () => {}
  } = getContext('mountOptions', false) || {};

  // maybe teardown
  return Promise.resolve().then(teardown)
  // unmount any existing node and clear the context
    .then(() => {
      if (node) {
        unmountComponentAtNode(node);
        node.parentNode.removeChild(node);
      }

      clearContext();
    });
}

/**
 * Mounts the component within a freshly inserted dom node. If there
 * was a component previously mounted by this function, the `cleanup`
 * helper is automatically used to safely unmount it and clear any
 * existing context.
 *
 * ``` javascript
 * await mount(() => (
 *   <SomeComponent foo="bar">
 *     <SomeOtherComponent/>
 *   </SomeComponent>
 * ))
 * ```
 *
 * The ID given to the mounting node can be customized by providing a
 * `mountId` option, and where the node is inserted into can be
 * controlled by providing a `rootElement`.
 *
 * The `setup` hook is called after cleaning up the previously mounted
 * component, and the new component is not mounted until after any
 * resulting promise resolves.
 *
 * The `teardown` hook is called on the next invokation of `cleanup`,
 * either by using it directly, or by calling `mount` again. Cleanup
 * will not complete until any optional promise returned from
 * `teardown` resolves.
 *
 * @function mount
 * @param {Component} component - The component to mount
 * @param {String} [options.mountId="testing-root"] - The ID given to
 * the insterted mounting node.
 * @param {Node} [options.rootElement=document.body] - The root
 * element the new node will be insterted into.
 * @param {Function} [options.setup] - Called after cleaning up the
 * previously mounted component but before mounting the new
 * component. If a promise is returned, the component will not be
 * mounted until after the promise resolves.
 * @param {Function} [options.teardown] - Called when `cleanup` is
 * used after mounting the component, or when `mount` is used
 * again. If a promise is returned, the component will not be
 * unmounted until after the promise resolves.
 * @returns {Promise} Resolves after the component has been mounted
 * into the newly inserted DOM node.
 */
export default function mount(Component, options = {}) {
  let {
    mountId = 'testing-root',
    rootElement = document.body,
    setup = () => {},
    teardown
  } = options;

  // maybe clean & setup
  return cleanup().then(setup)
  // create a fresh mount node for the component
    .then(() => new Promise(resolve => {
      let node = insertNode(mountId, rootElement);
      setContext({ mountOptions: { node, teardown } });
      render(<Component />, node, resolve);
    }));
}
