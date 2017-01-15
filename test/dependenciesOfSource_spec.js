import { expect } from 'chai';

// eslint-disable-next-line import/no-unresolved, import/extensions
import dependenciesOfSource from '../build/dependenciesOfSource';

describe('dependenciesOfSource', () => {
  it('works with mixed require and import', () => {
    const src = `
      const x = require('./foo/bar');
      import * as foo from './foo/baz';
    `;
    expect(dependenciesOfSource(src)).to.eql(['./foo/bar', './foo/baz']);
  });
  it('throws when the arg to require is not a string literal', () => {
    const src = `
      const y = './bar/foo';
      const x = require(y);
    `;
    const doIt = () => dependenciesOfSource(src);
    expect(doIt).to.throw(Error, /dynamic dependency/i);
  });
});
