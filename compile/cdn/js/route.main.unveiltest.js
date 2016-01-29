//# sourceURL=route.main.unveiltest.js

module.requires = [
  { name: 'route.main.unveiltest.css' },
];

module.exports = function(app) {
  "use strict";

  var coreRouterMgrsEvent = app['core.router'].managers.event;

  return function(route) {
    var wrapper = route.wrapper,
    objectMgr = route.managers.object;

    return route.addSequence({
      container:wrapper,
      promises:Array.apply(0,new Array(50)).map(function(a,i) {
        return objectMgr.create(
          'unveil',
          {
            xhrConf : {
              res:'http://www.igaro.com/misc/sitepoint-unveildemo/'+i+'.jpeg'
            },
            loadImg : true,
            width:'420px',
            height:'240px'
          }
          ).then(function(unveil) {
            coreRouterMgrsEvent.on('to-in-progress',function(r) {
              if (r === route)
                unveil.check(); // no return
            }, { deps:[unveil] });
            return unveil;
          });
        })
    });
  };
};
