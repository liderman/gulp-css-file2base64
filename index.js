'use strict';

var fs = require('fs');
var path = require('path');
var through = require('through2');
var gutil = require('gulp-util');

// Consts
var PLUGIN_NAME = 'gulp-css-file2base64';

var REGEX_FUNCTION = /file2base64\(\'([^\']*)\'\)/gi;

// Plugin level function(dealing with files)
function gulpCssFile2base64(opts) {
  opts = opts ||  {};
  
  // Creating a stream through which each file will pass
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      // return empty file
      cb(null, file);
    }
    
    //var baseDir = path.dirname(module.parent.filename);
    var filePath = path.dirname(file.path);
    
    if (file.isBuffer()) {
      var str = file.contents.toString('utf8');
      var result = str.replace(REGEX_FUNCTION, function(matches, relativePath) {
        var fullPath = path.normalize(path.join(filePath, relativePath));
        
        if (fs.existsSync(fullPath)) {
          var bitmap = fs.readFileSync(fullPath, 'utf-8');
          return new Buffer(bitmap).toString('base64'); // Success convert to base64
        }
      
        if (opts.debug) gutil.log(PLUGIN_NAME + ':', gutil.colors.red('file not found => skip') + gutil.colors.gray(' (' + fullPath + ')'));
        return "file2base64('" + relativePath + "')";  // Fail reading file
      });
      
      if (result) file.contents = new Buffer(result);
    }
    
    if (file.isStream()) {
      return this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }

    this.push(file);
    cb();
  });
};

// Exporting the plugin main function
module.exports = gulpCssFile2base64;
