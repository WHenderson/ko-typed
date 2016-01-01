var ko = require('../../index');
var assert = require('chai').assert;

var base = ko.observable();
var typed = base.extend({ type: 'Undefined|String' });

assert.doesNotThrow(
  function () {
    typed();
  }
);

base(10);
assert.throws(
  function () {
    typed();
  },
  TypeError,
  'Unexpected internal type. Expected Undefined|String, got Number'
);

assert.doesNotThrow(
  function () {
    typed(undefined);
    typed('string');
  }
);

assert.throws(
  function () {
    typed(10);
  },
  TypeError,
  'Unexpected external type. Expected Undefined|String, received Number'
);
