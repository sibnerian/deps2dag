import * as t from 'babel-types';
import deline from 'deline';
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

export default function dependenciesOfSource(filename, source, babylonPlugins = []) {
  try {
    const babylonOpts = { sourceType: 'module', plugins: babylonPlugins };
    const ast = parse(source, babylonOpts);
    const state = {
      importsOrRequires: [],
    };
    walk.simple(ast, visitors, state);
    return state.importsOrRequires;
  } catch (e) {
    if (e.message && e.message.indexOf('Expected type "StringLiteral"') >= 0) {
      throw new Error(deline`
        Found dynamic dependency in ${filename}. All dependencies must be string literals.
      `);
    } else {
      throw new Error(deline`
        Encountered exception while parsing ${filename}.
        
        Original error: ${e}
      `);
    }
  }
}
