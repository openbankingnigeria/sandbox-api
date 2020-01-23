'use strict';


/**
Boot loader for all handlers
*/

function autoLoadDir(_dirname_, _module_filename_){
  /*
  Read it's not okay to modify arguments directly, 
  i.e don't do _dirname_ = _dirname_ || "default value"
  better to store in a local variable, then modify local variable
  */
  var dirname = _dirname_;
  dirname = dirname || __dirname; 

  var module_filename = _module_filename_;
  module_filename = module_filename || module.filename;

  var fs        = require('fs');
  var path      = require('path'); 
  var basename  = path.basename(module_filename);  
  var Handlers  = {};  

  fs
  .readdirSync(dirname)
  .filter(function(file) { 
    return (file !== basename && file !== ".DS_Store");
  })
  .forEach(function(file) {
    var handler = file.replace('.js', '');
    Handlers[handler] = require(dirname+'/'+handler); 
  });
 
  return Handlers;
}

module.exports = autoLoadDir;
