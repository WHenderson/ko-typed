var ko = require('knockout');
var isAn = require('is-an');
var util = require('util');
require('../index')(ko);
kov = require('knockout.validation');

var base = ko.observable();
var typed = base.extend({ type: { type: 'Undefined|Number', validate: false } });//.extend({ validatable: true });

console.log(typed.getSubscriptionsCount());

//typed.subscribe(function () { console.log('A typed:', typed()); });
//typed.typeWriteError.subscribe(function () { console.log('B error:', typed.typeWriteError()); });
//typed.subscribe(function () { console.log('C typed:', typed()); });
//typed.typeWriteError.subscribe(function () { console.log('D error:', typed.typeWriteError()); });

try {
  typed('boom');
}
catch (ex) {
  console.log('---');
  console.log('ex:', ex.message);
}

//console.log('v error:', typed.error());
//typed(10);
//console.log('v error:', typed.error());

console.log('r error:', typed.typeReadError());
try {
  base('not valid');
}
catch (ex) {

}
console.log('r error:', typed.typeReadError());
