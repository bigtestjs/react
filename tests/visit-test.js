/* global describe, beforeEach, it */
import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';

import setupAppForTesting from '../src/setup-app';
import { visit, goBack, goForward, location } from '../src/visit';
import { cleanup } from '../src/mount';

class App extends React.Component {
  static propTypes = {
    history: PropTypes.object
  };

  componentDidMount() {
    // re-render when the location changes
    this._unlisten = this.props.history.listen(() => {
      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    this._unlisten();
  }

  // easy access to the current location
  get location() {
    return this.props.history.location;
  }

  render() {
    return (
      <div id="app">
        {this.location.pathname}
      </div>
    );
  }
};

describe('BigTest React Helpers: visit helpers', () => {
  it('throws an error when used before `setupAppForTesting`', () => {
    let err = 'no history context, make sure `setupAppForTesting` was called';

    expect(() => visit('/blah')).to.throw(err);
    expect(() => goBack()).to.throw(err);
    expect(() => goForward()).to.throw(err);
    expect(() => location()).to.throw(err);
  });

  describe('after calling `setupAppForTesting`', () => {
    let app, $app;

    beforeEach(async () => {
      app = await setupAppForTesting(App);
      $app = document.getElementById('app');
    });

    it('can visit a location', () => {
      visit('/visit');
      expect(app.location).to.have.property('pathname', '/visit');
      expect($app.textContent).to.equal('/visit');
    });

    it('can go back', () => {
      visit('/back');
      expect(app.location).to.have.property('pathname', '/back');
      expect($app.textContent).to.equal('/back');

      goBack();
      expect(app.location).to.have.property('pathname', '/');
      expect($app.textContent).to.equal('/');
    });

    it('can go forward', () => {
      visit('/forward');
      goBack();

      expect(app.location).to.have.property('pathname', '/');
      expect($app.textContent).to.equal('/');

      goForward();
      expect(app.location).to.have.property('pathname', '/forward');
      expect($app.textContent).to.equal('/forward');
    });

    it('can get the current location', () => {
      visit('/test');

      let loc = location();
      expect(loc).to.equal(app.location);

      goBack();
      expect(location()).to.not.equal(loc);
      expect(location()).to.equal(app.location);
    });
  });

  describe('after cleanup', () => {
    beforeEach(async () => {
      await setupAppForTesting(App);
      await cleanup();
    });

    it('throws an error again', () => {
      let err = 'no history context, make sure `setupAppForTesting` was called';

      expect(() => visit('/blah')).to.throw(err);
      expect(() => goBack()).to.throw(err);
      expect(() => goForward()).to.throw(err);
      expect(() => location()).to.throw(err);
    });
  });
});
