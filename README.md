![image_squidhome@2x.png](http://i.imgur.com/RIvu9.png)

# node-sails-model-reverser
Produces static Sails / Waterline models by reverse engineering existing databases


### Installation

To install this adapter, run:

```sh
$ npm install --save sails-model-reverser
```


### Usage

An example follows which uses the Apache Derby adapter (sails-derby) to
reverse engineer and create models for the TESTTABLE table of the TESTDB
database (running on the standard port of localhost).

Each model is written to a single file and is placed in the path specified
by `options.outputPath` (`/path/for/output` in the example below).  If no
output path is specified, the files will be placed in the `generated`
sub-directory of this module (so, probably
`node_modules/sails-model-reverser/generated`).

Each model is generated to use the connection specified by
`options.connectionName` (`myConnection` in the example below).  If no
connection name is specified, the default connection name, `default`, will
be used.

At the time of this writing, sails-derby is the only tested adapter.

```javascript
var Reverser = require('sails-model-reverser');
var adapter = require('sails-derby');

var connection = {
  url: 'jdbc:derby://localhost:1527/TESTDB',
  minpoolsize: 10,
  maxpoolsize: 100,
};

var tables = [
  'TESTTABLE',
];

var options = {
  outputPath: '/path/for/output',
  connectionName: 'myConnection',
};

var reverser = new Reverser(adapter, connection, tables, options);
reverser.reverse();
```


### More Resources

- [Stackoverflow](http://stackoverflow.com/questions/tagged/sails.js)
- [#sailsjs on Freenode](http://webchat.freenode.net/) (IRC channel)
- [Twitter](https://twitter.com/sailsjs)
- [Professional/enterprise](https://github.com/balderdashy/sails-docs/blob/master/FAQ.md#are-there-professional-support-options)
- [Tutorials](https://github.com/balderdashy/sails-docs/blob/master/FAQ.md#where-do-i-get-help)
- <a href="http://sailsjs.org" target="_blank" title="Node.js framework for building realtime APIs."><img src="https://github-camo.global.ssl.fastly.net/9e49073459ed4e0e2687b80eaf515d87b0da4a6b/687474703a2f2f62616c64657264617368792e6769746875622e696f2f7361696c732f696d616765732f6c6f676f2e706e67" width=60 alt="Sails.js logo (small)"/></a>


### License

**[MIT](./LICENSE)**
&copy; 2016 [balderdashy](http://github.com/balderdashy) & [contributors]
[Mike McNeil](http://michaelmcneil.com), [Balderdash](http://balderdash.co) & contributors

[Sails](http://sailsjs.org) is free and open-source under the [MIT License](http://sails.mit-license.org/).

