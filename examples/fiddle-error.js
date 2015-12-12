var ko = require('knockout');
var isAn = require('is-an');
var util = require('util');
require('../index')(ko);
kov = require('knockout.validation');

var base = ko.observable();
var typed = base.extend({ type: { type: 'Undefined|Number', message: 'ahhh snap' } }).extend({ validatable: true });

typed.subscribe(function () { console.log('A typed:', typed()); });
typed.typeError.subscribe(function () { console.log('B error:', typed.typeError()); });
typed.subscribe(function () { console.log('C typed:', typed()); });
typed.typeError.subscribe(function () { console.log('D error:', typed.typeError()); });

try {
  typed('boom');
}
catch (ex) {
  console.log('---');
  console.log('ex:', ex.message);
}

console.log('v error:', typed.error());
typed(10);
console.log('v error:', typed.error());

