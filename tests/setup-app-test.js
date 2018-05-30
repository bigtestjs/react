/* global describe, beforeEach, it */
import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';

import setupAppForTesting from '../src/setup-app';
import { cleanup } from '../src/mount';

describe('BigTest React Helpers: setupAppForTesting', () => {
  let App;

  beforeEach(() => {
    App = class App extends React.Component {
      render() { return <div id="app"/>; }
    };
  });

  it('mounts the app', async () => {
    await expect(setupAppForTesting(App)).to.be.fulfilled;
    expect(document.getElementById('app')).to.exist;
  });

  it('resolves with the app', async () => {
    await expect(setupAppForTesting(App))
      .to.eventually.be.an.instanceOf(App);
  });

  it('forwards additional props', async () => {
    let app = await setupAppForTesting(App, {
      props: { test: true }
    });

    expect(app.props).to.have.property('test', true);
  });

  it('accepts mount options', async () => {
    let $root = document.createElement('div');
    let setup, teardown;

    await setupAppForTesting(App, {
      mountId: 'test-app',
      rootElement: $root,
      setup: () => setup = true,
      teardown: () => teardown = true
    });

    expect(setup).to.be.true;
    expect(teardown).to.be.undefined;
    expect($root.firstChild).to.have.property('id', 'test-app');
    expect($root.querySelector('#app')).to.exist;

    // cleanup triggers the previous teardown
    await cleanup();
    expect(teardown).to.be.true;
  });

  describe('with a history prop type', () => {
    beforeEach(() => {
      App.propTypes = {
        history: PropTypes.object
      };
    });

    it('receives a history object', async () => {
      let app = await setupAppForTesting(App);

      expect(app.props).to.have.property('history')
        .that.contains.keys(['push', 'goBack', 'goForward', 'location']);
    });

    it('allows a custom history object', async () => {
      let history = { fake: true };
      let app = await setupAppForTesting(App, {
        props: { history }
      });

      expect(app.props)
        .to.have.property('history')
        .that.equals(history);
    });
  });

  describe('with a stateless functional component', () => {
    beforeEach(() => {
      // eslint-disable-next-line react/display-name
      App = () => <div id="app"/>;
    });

    it('mounts the app', async () => {
      await expect(setupAppForTesting(App)).to.be.fulfilled;
      expect(document.getElementById('app')).to.exist;
    });

    it('resolves with null', async () => {
      await expect(setupAppForTesting(App)).to.eventually.be.null;
    });
  });
});
