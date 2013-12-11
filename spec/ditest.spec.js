var di = require('../di');

describe('Dependency Registration', function () {
  describe('Instances', function () {
    describe('Calling di.instance() for a registered instance', function () {
      it("should return the registered object", function () {
        var myInstance =  { foo: 'bar' };
        di.instance('myInstance', myInstance);
        expect(di.instance('myInstance')).toBe(myInstance);
      });
    });
  });
  describe('Factories', function () {
    describe('Registering a factory without a lifeCycle', function () {
      it("should register a transient factory", function () {
        var myFactory = function () {
          return new Date();
        }

        di.factory('timeStamp', myFactory);
        var oneFactory = di.factory('timeStamp');
        var anotherFactory = di.factory('timeStamp');
        expect(oneFactory).not.toBe(anotherFactory);
      });
    });
    describe('Calling di.factory on a singleton factory', function () {
      it("should always return the same object", function () {
        var myFactory = function () {
          return new Date();
        }
        di.lifeCycle('singleton')
          .factory('singletonTimeStamp', myFactory);

        var firstFactory = di.factory('singletonTimeStamp');
        var secondFactory = di.factory('singletonTimeStamp');
        expect(firstFactory).toBe(secondFactory);
      });
    });
    describe('Calling di.factory on a transient factory', function () {
      it("should always return a different object", function () {
        var myFactory = function () {
          return new Date();
        }
        di.lifeCycle('transient')
          .factory('singletonTimeStamp', myFactory);

        var firstFactory = di.factory('singletonTimeStamp');
        var secondFactory = di.factory('singletonTimeStamp');
        expect(firstFactory).not.toBe(secondFactory);
      });
    });
    describe('Custom LifeCycles', function () {
      describe('Calling di.factory on a factory with a Custom lifeCycle', function (){
        describe('when the lifecycle has not expired', function () {
          it("should return the same object", function () {
            var myFactory = function () {
              return new Date();
            };

            di.lifeCycle('myCustomLifeCycle')
              .factory('customTimeStamp', myFactory);

            var firstFactory = di.factory('customTimeStamp');
            var secondFactory = di.factory('customTimeStamp');

            expect(firstFactory).toBe(secondFactory);
          });
        });
        describe('when the lifecycle has expired', function () {
          it("should return a different object", function () {
            var myFactory = function () {
              return new Date();
            };

            di.lifeCycle('myCustomLifeCycle')
              .factory('customTimeStampWithExpiry', myFactory);
            var firstFactory = di.factory('customTimeStampWithExpiry');
            di.lifeCycle('myCustomLifeCycle').expire();
            var secondFactory = di.factory('customTimeStampWithExpiry');

            expect(firstFactory).not.toBe(secondFactory);
          });
        });
      });
    });
  });
});
describe('Dependency Injection', function () {
  describe('Factories', function () {
    describe('When getting a factory with a registered dependency', function () {
      it('should return the object with the Dependency replaced', function () {
        var myObject = { foo: 'bar' };
        di.instance('myObject', myObject);

        var fact = function (myObject) {
          return myObject;
        }

        di.lifeCycle('singleton')
          .factory('dependentFactory', fact);

        var objectFromFactory = di.factory('dependentFactory');
        console.log('object from factory: ', objectFromFactory);
        console.log('myObject: ', myObject);
        expect(objectFromFactory).toBe(myObject);
      });
    });
  });
  describe('Functions', function () {
    describe("When passing a function to the inject() method", function () {
      it('should return the function with its dependencies replaced', function () {

        var myObject = {
          foo: 'bar'
        };

        var myFactory = function () {
          return 'baz';
        }

        di.instance('myObj', myObject);
        di.factory('myFact', myFactory);

        var myFunc = function (myObj, myFact) {
          return myObj.foo + myFact;
        }

        var myInjectedFunc = di.inject(myFunc);
        console.log('myInjectedFunc: ', myInjectedFunc);
        var returnValue = myInjectedFunc();
        expect(returnValue).toEqual("barbaz");
      });
    });
  });
});