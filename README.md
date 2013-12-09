nodependency
============

A dependency injection framework for node.js with support for custom lifecycles.

# Registering Dependencies
## Instances
Registering a simple object as a dependency can be done using `instance()`.

    var nd = require('./nodependency');

    var myObject = {
      foo: 'bar'
    };

    nd.instance('myObject', myObject);

## Factories
The other type of dependendy that can be registered with nodependency is a `factory`. Factories are functions responsible for returning the value of a dependency.
Registering a factory is done by calling the `factory()` method of a lifecycle.

### Lifecycles
All factories registered with nodependency will belong to a `lifecycle`.
There are two default lifecycle, `singleton` and `transient`. If you register a factory without a lifecycle, it will belong to the transient lifecycle by default.
Custom lifecycles are also supported.

#### Transient
Factory dependencies that are registered as part of the transient lifecycle will not be cached. The factory function will be called each time the dependency is injected.

    var nd = require('./nodependency');

    var foo = function () {
      return 'bar';
    }

    nd.lifeCycle('transient')
      .factory('foo', foo);

Since this is the default lifestyle, you can also do this by calling:

    nd.factory('foo', foo);

#### Singleton
Factory dependencies that are registered as part of the singleton lifecycle will call the factory method exactly once, and cache the value from then on.
You can register a singleton factory by calling:

    var foo = function () {
      return 'bar';
    }
    nd.lifeCycle('singleton')
      .factory('foo', foo);

#### Custom lifeCycles
Custom lifecycles allow you to control exactly when to reset the nodepency cache. Custom lifecycles can be set up like this:

    var foo = function () {
      return 'bar';
    }

    nd.lifeCycle('myCustomLifeCycle')
      .factory('foo', foo);

This factory will operate like a singleton factory until you call:

    nd.lifeCycle('myCustomLifeCycle').expire();

After calling expire, all cached factory dependencies in the lifecycle will be reset.

# Injecting Dependencies

## Simple retrieval

    var myObject = nd.instance('myAlreadyRegisteredInstance')
      , myFactory = nd.factory('myAlreadyRegisteredFactory');

## Injecting into functions
You can also pass a function to the `inject()` method, and nodependency will return a new function with the parameters already bound to it.

    //
    //Register myObject and myFactory
    //
    var homeController = function ( myObject, myFactory ) {
      console.log(myObject, myFactory);
    }

    var injected = nd.inject(homeController);

    injected();
    //myObject, myFactory

