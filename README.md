# @bigtest/react [![CircleCI](https://circleci.com/gh/bigtestjs/react/tree/master.svg?style=svg)](https://circleci.com/gh/bigtestjs/react/tree/master) [![Join the chat at https://gitter.im/bigtestjs/react](https://badges.gitter.im/bigtestjs/react.svg)](https://gitter.im/bigtestjs/react?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

React DOM helpers for testing big

## What is this?

This package aims to provide a set of helpers to make it easier to
acceptance test your React applications.

The `mount` helper will resolve after mounting a component in a
freshly inserted DOM node. Subsequent uses will clean up any previously
mounted component.

``` javascript
import { mount } from '@bigtest/react';
import Button from '../src/components/button';

describe('My Button', () => {
  // `mount` returns a promise that resolves after rendering
  beforeEach(() => mount(() => <Button/>));

  it('renders', () => {
    expect(document.querySelector('.button')).to.exist;
  });
});
```

The `setupAppForTesting` helper not only mounts the application
component, but will resolve with an instance of the component, and
provide an in-memory history object for [React
Router](https://github.com/ReactTraining/react-router) to use during
testing.

``` javascript
import { setupAppForTesting } from '@bigtest/react';
import App from '../src/app';

describe('My Application', () => {
  let app;

  beforeEach(async () => {
    app = await setupAppForTesting(App);
  });

  it('renders', () => {
    expect(document.querySelector('#app')).to.exist;
  });

  it('has a history prop', () => {
    // this prop is only provided if defined in `propTypes`
    expect(app.props).to.have.property('history');
  });
});
```

The `visit` helpers (`visit`, `goBack`, `goForward`, and `location`)
only work after using `setupAppForTesting` and interface with the
application's `history` prop to navigate between routes.

``` javascript
import { setupAppForTesting, visit, location } from '@bigtest/react';
import App from '../src/app';

describe('My Application', () => {
  beforeEach(() => setupAppForTesting(App));

  describe('navigating', () => {
    beforeEach(() => visit('/some-route'));

    it('is at the new route', () => {
      expect(location()).to.have.property('pathname', '/some-route');
    });
  });
});
```

The `cleanup` helper is called at the start of every `mount` and
`setupAppForTesting` call to clean up any previously mounted component
or application. It can be also used on it's own if you need to clean
up previously mounted components yourself.

``` javascript
import { mount, cleanup } from '@bigtest/react';
import Button from '../src/components/button';

describe('My Button', () => {
  beforeEach(() => mount(() => <Button/>));

  // it's best not to do this so that you can investigate and play
  // with your component for debugging purposes after a test runs
  afterEach(() => cleanup());

  // ...
});
```

### Options

Both `mount` and `setupAppForTesting` accept a hash of `options` as
the second argument.

``` javascript
mount(Component, {
  // used as the ID of the newly inserted DOM node
  mountId: 'testing-root',

  // where to insert the new DOM node
  rootElement: document.body,

  // called before the component is mounted; if a promise is returned,
  // the component will mount after it resolves
  setup: () => {},

  // called during the next `cleanup` invocation, either at the
  // beginning of the next `mount` or `setupAppForTesting` call, or
  // when invoking `cleanup` directly; like `setup`, any returned
  // promise will cause it to wait until resolving
  teardown: () => {}
})
```

Additionally, `setupAppForTesting` accepts a `props` option which will
pass along any user-defined props to the application component.

``` javascript
setupAppForTesting(App, {
  props: {
    store: createStore(),
    // you can provide your own history object as well
    history: createHistory(historyOptions)
  }
})
```

## Reusability

For the most optimal experience when testing your application, any
required application logic that does not live in a component's
life-cycle hooks should be made reusable. Either by providing the
necessary `setup` and `teardown` options, or by moving the logic into
component life-cycle hooks.

In addition to this, it will probably make sense to make use of
`setupAppForTesting` inside of your own test helper where any other
necessary setup is taken care of. This also allows us to not have to
import our app and duplicate setup logic in every test file.

``` javascript
// tests/helpers.js
import { setupAppForTesting } from '@bigtest/react';
export { visit, goBack, goForward, location } from '@bigtest/react';

import App from '../src/app';
import createServer from './mocks/server';

export function setupApplicationForTesting() {
  beforeEach(async function () => {
    this.app = await setupAppForTesting(App, {
      setup: () => this.server = createServer(),
      teardown () => this.server.shutdown()
    });
  });
}
```

## Even Better Testing

While these helpers allow you to repeatedly mount your application for
testing, interacting with your application can also be troublesome.

[`@bigtest/interactor`](https://github.com/bigtestjs/interactor)
provides an easy way to interact with the various parts of your app
via any browser, just like a user would interact with your app. In
fact, composable interactors are the perfect companion for testing
an app made with composable components.

``` javascript
import { setupAppForTesting } from '@bigtest/react';

import App from '../src/app';
import HomePageInteractor from './interactors/home';

describe('My Application', () => {
  const home = new HomePageInteractor();
  beforeEach(() => setupAppForTesting(App))

  it('has a fancy button', () => {
    expect(home.button.isPresent).to.be.true;
    expect(home.button.isFancy).to.be.true;
  });
});
```

Check out the
[`@bigtest/interactor`](https://github.com/bigtestjs/interactor) repo
for more information about interactors and how they work.
