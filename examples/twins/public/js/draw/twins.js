(function(){
  var module = module || {};

  module.exports = function(data, element){

  };

  module.exports.flot = true;

  // executes (client side) or exports the module (server side)
  if (typeof window != 'undefined' && 'DrawBack' in window)
    DrawBack.register('twins', module.exports);


})();