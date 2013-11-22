'use strict';
var path = require('path')
  , u = require('util')
  , fs = require('fs')
  , shell = require('shelljs')
  , debug = require('debug')('slap:task:less')
  , less = require('less')
  , context = require('slap/context')
  ;

shell.config.fatal = true;
shell.config.silent = true;

module.exports = function(taskSetName, taskConfig, taskSets, slapConfig, callback) {
  'use strict';
  var logKey = ''
    , reporter
    , source, sourceFileName, sourceDir
    , dest, destFileName, destDir
    , createDestDir = false
    , parser
    , errMsg
    , _err
    ;

  logKey = [
    '[', 
    taskSetName, 
    ':less]'
  ].join('');



  debug("%s Executing less task ...", logKey);

  source = taskConfig.from;
  sourceFileName = path.basename(source);
  sourceDir = path.dirname(source);

  destFileName = path.basename(source, 'less') + 'css';
  destDir = path.resolve(taskConfig.toDir);
  dest = path.join(destDir, destFileName);

  debug("%s source:         %s", logKey, source);
  debug("%s sourceFileName: %s", logKey, sourceFileName);
  debug("%s sourceDir:      %s", logKey, sourceDir);

  debug("%s dest:           %s", logKey, dest);
  debug("%s destFileName:   %s", logKey, destFileName);
  debug("%s destDir:        %s", logKey, destDir);


  if (!fs.existsSync(source)) {
      errMsg = u.format("%s File not found: %s", logKey, source);
      console.log(errMsg);
      callback(new Error(errMsg));
      return;
  }

  if (!fs.existsSync(destDir)) {
    u.print(u.format("%s Creating %s ...", logKey, destDir));
    shell.mkdir('-p', destDir);
    u.print(" ok\n");
  }


  u.print(u.format("%s Compiling %s to %s ...", logKey, source, dest));
  fs.readFile(source, 'utf8', function(e, data) {
    var lessOpts;

    if (e) {
      console.log("%s Unable to open file for reading: %s", logKey, source);
      _err = e;
      return;
    }

    lessOpts = {
      dumpLineNumbers: "comments",
      paths: [sourceDir], // Specify search paths for @import directives
      filename: source // Specify a filename, for better error messages
    };

    parser = new(less.Parser)(lessOpts);

    parser.parse(data, function (e2, tree) {
      var css;

      if (e2) {
        _err = e2;
        less.writeError(e2, lessOpts);
        return;
      }

      try {
        css = tree.toCSS(lessOpts);
      } catch (e3) {
        _err = e3;
        less.writeError(e3, lessOpts);
        return;
      }


      try {
        fs.writeFileSync(dest, css, 'utf8');

      } catch (e4) {
        _err = e4;
        console.log("%s Unable to write to file: %s", dest);
        return;
      }
    });

  });

  if (_err) {
    u.print(" not ok!\n");
    callback(_err);
    return;

  } else {
    u.print(" ok\n");
  }

  callback(_err);
}


