var ko = require('knockout');
var isAn = require('is-an');
var util = require('util');
require('../index')(ko);

var base = ko.observable().extend({ type: 'Number' })
var convert = base.extend({ convert: {
  type: 'Number',
  Number: {
    Number: {
      read: function (value) { throw new TypeError('read'); return value + 1; },
      write: function (value) { throw new TypeError('write'); return value - 1; }
    }
  }
}});

base(42);
console.log(convert());
convert(42);

