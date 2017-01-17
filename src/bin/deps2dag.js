#!/usr/bin/env node
import program from 'commander';
import globCb from 'glob';
import fs from 'fs';
import promisify from 'es6-promisify';
import Promise from 'es6-promise';
import _ from 'lodash';
import deps2dag from '../index';

const glob = promisify(globCb);
const writeFile = promisify(fs.writeFile);

function collect(val, memo) {
  memo.push(val);
  return memo;
}

function onError(e) {
  console.error(e);
  process.exit(1);
}

program
  .version('0.0.1')
  .option('-i, --ignore [ignoreGlob]', 'A glob file pattern to ignore. This option can be used more than once to ignore multiple patterns.', collect, [])
  .option('-o, --outfile [outfile]', 'A path to write the JSON results. This option can be used more than once for multiple outfiles. If none are specified, prints to stdout.', collect, [])
  .option('--babylon-plugins [plugins]', 'Comma separated list of babylon plugins to use.')
  .arguments('[globs...]')
  .action((fileGlobs, { ignore: ignoreGlobs, outfile: outFiles, babylonPlugins }) => {
    const plugins = babylonPlugins && babylonPlugins.length > 0 ? babylonPlugins.split(',') : [];
    Promise.all((
      fileGlobs.map(fileglob => glob(fileglob, { ignore: ignoreGlobs }))
    ))
    .then(arrayOfResults => _.uniq(_.flatten(arrayOfResults)))
    .then(files => deps2dag(files, plugins))
    .then((graph) => {
      const prettyGraph = JSON.stringify(graph, null, 2);
      if (outFiles.length) {
        return Promise.all((
          outFiles.map(outfile => writeFile(outfile, prettyGraph))
        ));
      }
      console.log(prettyGraph);
      return Promise.resolve('done');
    })
    .catch(onError);
  })
  .parse(process.argv);
