import promisify from 'es6-promisify';
import { Promise } from 'es6-promise';
import fs from 'fs';
import path from 'path';
import { zipObject, mapValues, mapKeys } from 'lodash';
import toposort from 'toposort-object';
import deline from 'deline';
import dependenciesOfSource from './dependenciesOfSource';

export default function deps2dag(files, babylonPlugins = []) {
  return Promise.all(files.map(readFile))
    .then(sources => sources.map(s => dependenciesOfSource(s, babylonPlugins)))
    .then(dependencies => zipObject(files, dependencies))
    .then(normalizeDependencyGraph)
    .then(checkDag);
}

function readFile(file) {
  return promisify(fs.readFile)(file).then(buf => buf.toString('utf8'));
}

function normalizeDependencyGraph(dependencyGraph) {
  const graphWithNormalizedKeys = mapKeys(dependencyGraph, (v, k) => path.normalize(k));
  return mapValues(graphWithNormalizedKeys, (requirees, requirer) => {
    const requirerDir = path.dirname(requirer);
    return requirees.map((requiree) => {
      if (requiree.indexOf('.') !== 0) {
        return requiree;
      }
      const normalizedRequiree = path.join(requirerDir, requiree);
      // Relative imports can be of multiple filetypes, and could refer to a dir/index.{js,jsx} too
      const possiblyRequiredFiles = [
        `${normalizedRequiree}.js`,
        `${normalizedRequiree}.jsx`,
        path.join(normalizedRequiree, 'index.js'),
        path.join(normalizedRequiree, 'index.jsx'),
      ];
      for (let i = 0; i < possiblyRequiredFiles.length; i++) {
        // Find the first possibility that's actually in the graph.
        if (graphWithNormalizedKeys[possiblyRequiredFiles[i]]) {
          return possiblyRequiredFiles[i];
        }
      }
      throw new Error(deline`
        No file found for import ${requiree} from ${requirer}.

        Check that you're running this function on *all* of the source code for your application.
      `);
    });
  });
}

function checkDag(normalizedGraph) {
  toposort(normalizedGraph, true); // throws if it's not a DAG
  return normalizedGraph;
}
