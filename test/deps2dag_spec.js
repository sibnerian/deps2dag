import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
// eslint-disable-next-line import/no-unresolved, import/extensions
import deps2dag from '../build/index';

chai.use(chaiAsPromised);
const expect = chai.expect;

let cwd;

describe('deps2dag', () => {
  before(() => {
    cwd = process.cwd();
    process.chdir(__dirname);
  });
  after(() => {
    process.chdir(cwd);
  });
  it('works on fixtures', () => {
    const result = deps2dag(['fixtures/foo.js', 'fixtures/bar.js', 'fixtures/baz/index.js']);
    return expect(result).to.eventually.eql({
      'fixtures/foo.js': ['goober', 'fixtures/bar.js'],
      'fixtures/bar.js': ['fixtures/baz/index.js'],
      'fixtures/baz/index.js': ['fs'],
    });
  });
  it('works with babylon plugins', () => {
    const result = deps2dag(
      ['fixtures/foo.js', 'fixtures/bar.js', 'fixtures/baz/index.js', 'fixtures/react.jsx'],
      ['jsx', 'objectRestSpread', 'classProperties'],
    );
    return expect(result).to.eventually.eql({
      'fixtures/foo.js': ['goober', 'fixtures/bar.js'],
      'fixtures/bar.js': ['fixtures/baz/index.js'],
      'fixtures/baz/index.js': ['fs'],
      'fixtures/react.jsx': ['react'],
    });
  });
  it('fails on import not found', () => {
    const result = deps2dag(['failingFixtures/importNotFound.js']);
    return expect(result).to.be.rejectedWith(Error, /No file found for/);
  });
  it('fails if nonexistent file passed in', () => {
    const result = deps2dag(['failingFixtures/thisFileDoesntExist.js']);
    return expect(result).to.be.rejectedWith(Error);
  });
  it('fails on circular dependencies', () => {
    const result = deps2dag(['failingFixtures/circ1.js', 'failingFixtures/circ2.js']);
    return expect(result).to.be.rejectedWith(Error, /Cyclical reference found/);
  });
  it('fails on syntax error', () => {
    const result = deps2dag(['failingFixtures/syntaxError.js']);
    return expect(result).to.be.rejectedWith(Error);
  });
});
