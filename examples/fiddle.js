var ko = require('knockout');
var isAn = require('is-an');
var util = require('util');
require('../index');

var base = ko.observable().extend({ type: 'Number' });
var convert = base.extend({ convert: true });

