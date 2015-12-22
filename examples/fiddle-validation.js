var ko = require('knockout');
var isAn = require('is-an');
var util = require('util');
require('../index')(ko);
kov = require('knockout.validation');

var base = ko.observable();
var typed = base.extend({ type: { type: 'Undefined|Number', validation: { message: 'typed error' } } }).extend({ validatable: true });
var convert = typed.extend({ convert: { type: 'String', noThrow: true, validation: { result: false, message: 'convert error' } } }).extend({ validatable: true });

console.log('nothing');
console.log('typed  :', typed.error());
console.log('convert:', convert.error());

convert('hmm');

console.log('errors');
console.log('typed  :', typed.error());
console.log('convert:', convert.error());
