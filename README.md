# Deps2Dag
[![Build Status](https://travis-ci.org/sibnerian/deps2dag.svg?branch=master)](https://travis-ci.org/sibnerian/deps2dag)[![MIT License](https://img.shields.io/npm/l/ghooks.svg)](http://opensource.org/licenses/MIT)
## Transform your JS dependencies into a graph.

## Install
Install with [npm](https://npmjs.org/package/deps2dag)
```sh
npm install --save deps2dag
```

## Example (CLI):

```sh
deps2dag -i "node_modules/**/*" -i "test/**/*""**/*.js"
```

## CLI Options

```
  Usage: deps2dag [options] [globs...]

  Options:

    -h, --help                   output usage information
    -V, --version                output the version number
    -i, --ignore [ignoreGlob]    A glob file pattern to ignore. This option can be used more than once to ignore multiple patterns.
    -o, --outfile [outfile]      A path to write the JSON results. This option can be used more than once for multiple outfiles. If none are specified, prints to stdout.
    --babylon-plugins [plugins]  Comma separated list of babylon plugins to use.
```

## Example (JS):

```js

import deps2dag from 'deps2dag';

const babylonPlugins = ['jsx'];
const srcFiles = ['a.js', 'b.js', 'c.jsx'];
deps2dag(srcFiles, babylonPlugins)
  .then(graph => console.log(graph))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
```

## Usage (JS):
### deps2dag(srcFiles, babylonPlugins = [])
Arguments:
* `srcFiles` - Paths to the source files from which the dependency graph should be constructed.
These will be parsed using [`babylon`](https://github.com/babel/babylon). This array must include
*all* source files used in the application. Otherwise, if a dependency is found to a file not specified in
`srcFiles` then an error will be thrown.
* `babylonPlugins` - The raw plugins list that will be passed to [Babylon](https://github.com/babel/babylon).
You should make sure that this list matches the plugins you use in your `.babelrc`.
As of this writing, the options are:
 - `jsx`
 - `flow`
 - `doExpressions`
 - `objectRestSpread`
 - `decorators` (Based on an outdated version of the Decorators proposal. Will be removed in a future version of `Babylon`)
 - `classProperties`
 - `exportExtensions`
 - `asyncGenerators`
 - `functionBind`
 - `functionSent`
 - `dynamicImport`

## License
Published under the [MIT License](http://opensource.org/licenses/MIT).
