/* global describe, beforeEach, afterEach, it */
import React from 'react';
import { expect } from 'chai';
import mount, { cleanup } from '../src/mount';

describe('BigTest React Helpers: mount', () => {
  let mounted = false;

  class Test extends React.Component {
    componentDidMount() {
      mounted = true;
    }

    componentWillUnmount() {
      mounted = false;
    }

    render() {
      return <div {...this.props}/>;
    }
  }

  it('mounts the component', async () => {
    expect(mounted).to.be.false;
    expect(document.getElementById('test')).to.not.exist;

    await expect(mount(() => <Test id="test"/>)).to.be.fulfilled;

    expect(document.getElementById('test')).to.exist;
    expect(mounted).to.be.true;
  });

  it('mounts the component in a new DOM node', async () => {
    let $mount1, $mount2;

    await expect(mount(() => <Test/>)).to.be.fulfilled;
    $mount1 = document.getElementById('testing-root');

    expect($mount1.parentNode).to.equal(document.body);

    await expect(mount(() => <Test/>)).to.be.fulfilled;
    $mount2 = document.getElementById('testing-root');

    expect($mount2.parentNode).to.equal(document.body);
    expect($mount1.parentNode).to.be.null;
    expect($mount1).to.not.equal($mount2);
  });

  it('cleans up previously mounted components', async () => {
    await expect(mount(() => <Test id="test1"/>)).to.be.fulfilled;
    await expect(mount(() => <Test id="test2"/>)).to.be.fulfilled;

    expect(document.getElementById('test1')).to.not.exist;
    expect(document.getElementById('test2')).to.exist;
  });

  describe('calling cleanup', () => {
    it('cleans up the mounted component', async () => {
      await expect(mount(() => <Test id="test"/>)).to.be.fulfilled;
      expect(document.getElementById('test')).to.exist;
      expect(mounted).to.be.true;

      await expect(cleanup()).to.be.fulfilled;
      expect(document.getElementById('test')).to.not.exist;
      expect(mounted).to.be.false;
    });
  });

  describe('specifying a different mountId', () => {
    it('mounts the component in a new DOM node with a different ID', async () => {
      expect(document.getElementById('test')).to.not.exist;
      await expect(mount(() => <Test />, { mountId: 'test' })).to.be.fulfilled;
      expect(document.getElementById('test')).to.exist;
    });

    it('cleans up the previously mounted component', async () => {
      await expect(mount(() => <Test />, { mountId: 'test1' })).to.be.fulfilled;
      expect(document.getElementById('test1')).to.exist;

      await expect(mount(() => <Test />, { mountId: 'test2' })).to.be.fulfilled;
      expect(document.getElementById('test1')).to.not.exist;
      expect(document.getElementById('test2')).to.exist;
    });
  });

  describe('specifying a different rootElement', () => {
    let $root;

    beforeEach(() => {
      $root = document.createElement('div');
      document.body.appendChild($root);
    });

    afterEach(() => {
      document.body.removeChild($root);
      $root = null;
    });

    it('inserts the mounting node into a different rootElement', async () => {
      await expect(mount(() => <Test/>, { rootElement: $root })).to.be.fulfilled;
      expect(document.getElementById('testing-root').parentNode).to.equal($root);
    });

    it('cleans up the previous rootElement', async () => {
      let $mount1, $mount2;

      await expect(mount(() => <Test/>, { rootElement: $root })).to.be.fulfilled;
      $mount1 = document.getElementById('testing-root');
      expect($mount1.parentNode).to.equal($root);

      await expect(mount(() => <Test/>)).to.be.fulfilled;
      $mount2 = document.getElementById('testing-root');
      expect($mount2.parentNode).to.equal(document.body);
      expect($mount1.parentNode).to.be.null;
    });
  });

  describe('with setup and teardown functions', () => {
    it('calls setup before mounting the component', async () => {
      let called = false;

      await expect(mount(() => <Test id="test"/>, {
        setup() {
          expect(document.getElementById('test')).to.not.exist;
          called = true;
        }
      })).to.be.fulfilled;

      expect(document.getElementById('test')).to.exist;
      expect(called).to.be.true;
    });

    it('waits for any returned promise to resolve from setup', async () => {
      let called = false;

      await expect(mount(() => <Test id="test"/>, {
        setup: () => new Promise(resolve => {
          expect(document.getElementById('test')).to.not.exist;
          called = true;
          resolve();
        })
      })).to.be.fulfilled;

      expect(document.getElementById('test')).to.exist;
      expect(called).to.be.true;
    });

    it('rejects and does not mount the component if setup errors', async () => {
      await expect(mount(() => <Test id="test"/>, {
        setup() { throw new Error('err'); }
      })).to.be.rejectedWith('err');

      expect(document.getElementById('test')).to.not.exist;
    });

    it('calls the previous teardown function before the next setup function', async () => {
      let setup = false;
      let teardown = false;

      await expect(mount(() => <Test id="test"/>, {
        teardown() {
          expect(setup).to.be.false;
          teardown = true;
        }
      })).to.be.fulfilled;

      await expect(mount(() => <Test id="test"/>, {
        setup() {
          expect(teardown).to.be.true;
          setup = true;
        }
      })).to.be.fulfilled;

      expect(setup).to.be.true;
      expect(teardown).to.be.true;
    });

    describe('calling cleanup', () => {
      it('calls teardown from the previous mount options', async () => {
        let setup = false;
        let teardown = false;

        await expect(mount(() => <Test id="test"/>, {
          setup() { setup = true; },
          teardown() { teardown = true; }
        })).to.be.fulfilled;

        expect(setup).to.be.true;
        expect(teardown).to.be.false;

        await expect(cleanup()).to.be.fulfilled;

        expect(setup).to.be.true;
        expect(teardown).to.be.true;
      });
    });
  });
});
