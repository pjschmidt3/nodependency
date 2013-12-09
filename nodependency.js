(function () {
  var lifeCycles = {};
  var instances = {};
  
  function LifeCycle ( key ) {
    if(typeof lifeCycles[key] !== 'undefined') {
      return lifeCycles[key];
    }

    var lifeCycleProto = {
      resolveFactory : function ( key ) {
        if(this.name === "singleton") {
          if(typeof this.cache[key] === 'undefined') {
            this.cache[key] = _resolveDependencies(this.factories[key].factoryMethod)();
          }
          return this.cache[key];
        } else if (this.name === "transient") {
          return _resolveDependencies(this.factories[key].factoryMethod)();
        }
        if(typeof this.cache[key] !== 'undefined') {
          return this.cache[key];
        } else {
          var valueToCache = _resolveDependencies(this.factories[key].factoryMethod)();
          this.cache[key] = valueToCache;
          console.log(valueToCache);
          return valueToCache;
        }
      },
      factory : function ( key, fact ) {
        this.factories[key] = new Factory({
          name: key,
          factoryMethod: fact,
          lifeCycle: this
        });
        return this;
      },
      expire: function () {
        this.cache = {};
        return this;
      }
    }

    var thisLifeCycle = Object.create(lifeCycleProto, {
      name: { writable: false, value: key },
      factories : { writable: true, value: {} },
      instances: { writable: true, value: {} },
      cache: { writable: true, value: {} }
    });

    lifeCycles[key] = thisLifeCycle;
    return thisLifeCycle;
  }

  function Factory ( options ) {
    return Object.create({}, {
      name: { writable: false, value: options.name },
      lifeCycle : { writable: false, value: options.lifeCycle },
      factoryMethod: {
        get: function () {
          if(typeof options.arguments !== 'undefined') {
            return options.factoryMethod.apply(options.factoryMethod, options.arguments);
          }
          return options.factoryMethod;
        }
      }
    });
  }

  function _getFactory ( key ) {
    for (var lc in lifeCycles) {
      if(lifeCycles.hasOwnProperty(lc)) {
        var lifeCycle = lifeCycles[lc];
        if(typeof lifeCycle.factories[key] !== 'undefined') {
          return lifeCycle.factories[key];
        }
      }
    }
  }

  function _getInstance ( key ) {
    if (typeof instances[key] !== 'undefined') {
      return instances[key];
    }
  }

  function _resolveItem ( key, type ) {
    if(type === 'instance') {
      return _getInstance(key);
    } else if (type === 'factory') {
      var resolvedItem = _resolveDependencies(
        _getFactory(key)
        .lifeCycle
        .resolveFactory(key)
      );
      return resolvedItem;
    }
    throw new Error('Dependency not found: ' + key);
  }

  function _resolveDependencies ( method ) {
    var methodString = method.toString()
      , commentRegex = /\/\*.*?\*\//
      , paramRegex = /\bfunction\s*\S*\s*?\(\s*([^)]+)/i;

    methodString = methodString.replace(commentRegex, "");
    var matches = paramRegex.exec(methodString);

    if(!matches || matches.length === 0)  {
      return method;
    }

    var dependencies = matches[1].split(',').map(function(item) {
      return item.trim();
    });

    var replacements = [];

    dependencies.forEach(function(item) {    
      if(typeof _getFactory(item) !== 'undefined') {
        replacements.push(_resolveItem(item, 'factory'));
      }

      var instance = _getInstance(item);
      if(typeof instance !== 'undefined') {
        replacements.push(instance);
      }
    });

    return function () {
      return method.apply(method, replacements);
    }
  }

  var injectorProto = {
    lifeCycle : (function() {
      function F(args) {
        return LifeCycle.apply(this, args);
      }
      F.prototype = LifeCycle.prototype;
      return function () {
        return new F(arguments);
      }
    })(),
    factory : function ( key, fact ) {
      if(typeof fact === 'undefined') {
        var factory = _getFactory(key);
        return factory.lifeCycle.resolveFactory(key);
      }
      return LifeCycle('transient').factory(key, fact);
    },
    instance : function (key, instance) {
      if(typeof instance === 'undefined') {
        return _getInstance(key);
      }
      instances[key] = instance;
    },
    inject: function ( method ) {
      return _resolveDependencies(method);
    }
  }

  var injector = Object.create(injectorProto);

  if (typeof module !== "undefined" && typeof require !== "undefined") {
    module.exports = injector;
  } else {
    window["h"] = injector;
  }
})();