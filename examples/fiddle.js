var ko = require('knockout');
var isAn = require('is-an');
require('../index');

var base = ko.observable();
var typed = base.extend({ type: 'Number' });

ko.computed(function () {
  console.log('base:', base());
  console.log('typed:', base());
});

typed(10);
try {
  typed('blam');
}
catch (ex) {
  console.log(ex.message);
}
typed(11);


