var ko = require('knockout');
var isAn = require('is-an');
var util = require('util');
require('../index');

var base = ko.observable();
var typed = base.extend({ type: 'Undefined|String|Number' });
var convert = typed.extend({ convert: 'String'});

function padd(message, minLength) {
  while (message.length < minLength) {
    message += ' ';
  }
  return message;
}

function dataString() {
  return util.inspect({
    base: base(),
    typed: typed(),
    convert: convert()
  });
}
function setTyped(value) {
  console.log('Setting typed to', JSON.stringify(value), '...');

  try {
    typed(value)
  }
  catch (ex) {
    console.log(ex);
    return;
  }

  console.log(dataString());
}

function setConvert(value) {
  console.log('Setting typed to', JSON.stringify(value), '...');

  try {
    convert(value)
  }
  catch (ex) {
    console.log(ex);
    return;
  }

  console.log(dataString());
}

console.log('Initial...');
console.log(dataString());

setTyped(10);
setTyped(null);
setTyped(11);

setConvert('woot');
setConvert('');



