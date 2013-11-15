'use strict';
var Mocha = require('mocha')
  , fs = require('fs')
  , path = require('path')
  , u = require('util')
  , glob = require('glob')
  , options
  , mocha
  , specFiles
;

options = {
  ui: 'bdd',
  reporter: 'spec',
  useColors: false,
  bail: true
};

mocha = new Mocha(options);

specFiles = glob.sync(path.join(process.cwd(), "test/**/specs/*.spec.js"));
specFiles.forEach(function(f) {
  console.log("Adding: %s", f);
  mocha.addFile(f);
});

// Now, you can run the tests.
mocha.run(function(failures){
  process.on('exit', function () {
    process.exit(failures);
  });
});

