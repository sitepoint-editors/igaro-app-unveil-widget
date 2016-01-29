//# sourceURL=instance.unveil.js

module.requires = [
  { name:'instance.unveil.css' }
];

module.exports = function(app) {
  "use strict";

  var bless = app['core.object'].bless,
  dom = app['core.dom'];

  var removeWindowListeners = function() {
    var wh = this.__winowHook;
    if (wh) {
      window.removeEventListener('scroll',wh);
      window.removeEventListener('resize',wh);
    }
    this.__windowHook = null;
  };

  var InstanceUnveil = function(o) {
    var self = this;
    this.name='instance.unveil';
    this.asRoot=true;
    this.container=function(domMgr) {
      return domMgr.mk('div',o,null,function() {
        if (o.className)
          this.className = o.className;
        this.style.width = o.width;
        this.style.height = o.height;
      });
    };
    bless.call(this,o);
    this.onUnveil = o.onUnveil;
    this.xhrConf = o.xhrConf;
    this.loadImg = o.loadImg;
    this.__windowHook = function() {
      return self.check(o);
    };
    window.addEventListener('scroll', this.__windowHook);
    window.addEventListener('resize', this.__windowHook);
    this.managers.event.on('destroy', removeWindowListeners.bind(this));
  };

  InstanceUnveil.prototype.init = function(o) {
    return this.check(o);
  };

  InstanceUnveil.prototype.check = function() {
    var container = this.container;
    // if not visible to the user, return
    if (! this.__windowHook || dom.isHidden(container) || dom.offset(container).y > (document.body.scrollTop || document.documentElement.scrollTop) + document.documentElement.clientHeight)
      return Promise.resolve();
    var self = this,
    managers = this.managers,
    xhrConf = this.xhrConf;
    removeWindowListeners.call(this);
    container.classList.add('instance-unveil-loading');
    return Promise.resolve().then(function() {
      if (xhrConf) {
        return managers.object.create('xhr', xhrConf).then(function(xhr) {
          return xhr.get(self.loadImg? { responseType: 'blob' } : {}).then(function(data) {
            if (self.loadImg) {
              self.container = managers.dom.mk('img',{ insertBefore:container }, null, function() {
                var img = this,
                windowURL = window.URL;
                // gc
                this.addEventListener('load',function() {
                  windowURL.revokeObjectURL(img.src);
                });
                this.src = windowURL.createObjectURL(data);
                this.className = container.className;
                this.style.height = container.style.height;
                this.style.width = container.style.width;
              });
              dom.purge(container);
              container = self.container;
            }
            return data;
          }).then(function(data) {
            if (self.onUnveil)
              return self.onUnveil(self,data);
          }).then(function() {
            return xhr.destroy();
          });
        });
}
if (self.onUnveil)
  return self.onUnveil(self);
}).catch(function(e) {
  container.classList.add('instance-unveil-error');
  container.classList.remove('instance-unveil-loading');
  throw e;
}).then(function() {
  container.classList.remove('instance-unveil-loading');
});
};

return InstanceUnveil;
};
