var nd = require('./nodependency');


var fooFactory = function () {
  console.log('*******\nFactory method called\n*******');
  return {
    bar: function (baz) {
      return baz;
    }
  };
}

var transientFactory = function () {
  return new Date().toString();
}

nd.lifeCycle('transient')
  .factory('transientValue', transientFactory);

console.log('Transient factory: ', nd.factory('transientValue'));

setTimeout(function () {
  console.log('Transient factory: ', nd.factory('transientValue'));
}, 1500);

var singletonFactory = function () {
  return new Date().toString();
}

nd.lifeCycle('singleton')
  .factory('singletonValue', singletonFactory);

console.log('Singleton factory: ', nd.factory('singletonValue'));

setTimeout(function () {
  console.log('Singleton factory: ', nd.factory('singletonValue'));
}, 1500);

var bazInstance = {
  doSomething: function () {
    return 'Did something!';
  }
}

nd.instance('baz', bazInstance);

nd.lifeCycle('firstLifeCycle')
  .factory('foo', fooFactory);


console.log('Getting value from factory');
var foo = nd.factory('foo');
// {
//   foo : function () {
//     return 'foo';
//   }
// }

var firstController = function ( foo, baz ) {
  console.log('Called controller function with parameters: ', foo, ', ', baz);
  return foo.bar(baz.doSomething());
}

//this returns the function you passed it, bound to its dependency-injected arguments
var injectedController = nd.inject(firstController);

//now call your method without parameters
var controllerReturn = injectedController();
// 'bar'

console.log('Getting cached value for factory')
// will be cached
var newFoo = nd.factory('foo');

console.log(newFoo.bar('Got cached foo'));

console.log('Expiring lifecycle');
nd.lifeCycle('firstLifeCycle').expire();

console.log('Getting factory result after expiry');
var uncachedFoo = nd.factory('foo');

console.log('Result after lifeCycle expiry: ', uncachedFoo.bar('Dependency injection is the coolest!'));




