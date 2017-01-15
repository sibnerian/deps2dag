import * as t from 'babel-types';
import { parse } from 'babylon';

// hates being imported for some reason
const walk = require('babylon-walk');

const visitors = {
  ImportDeclaration(node, state) {
    t.assertStringLiteral(node.source);
    state.importsOrRequires.push(node.source.value);
  },
  CallExpression(node, state) {
    if (t.isIdentifier(node.callee) && node.callee.name === 'require') {
      const arg = node.arguments[0];
      t.assertStringLiteral(arg);
      state.importsOrRequires.push(arg.value);
    }
  },
};

export default function dependenciesOfSource(source, babylonPlugins = []) {
  const babylonOpts = { sourceType: 'module', plugins: babylonPlugins };
  const ast = parse(source, babylonOpts);
  const state = {
    importsOrRequires: [],
  };
  try {
    walk.simple(ast, visitors, state);
  } catch (e) {
    if (e.message && e.message.indexOf('Expected type "StringLiteral"') >= 0) {
      throw new Error('Found dynamic dependency. All dependencies must be string literals.');
    } else {
      throw e;
    }
  }
  return state.importsOrRequires;
}
