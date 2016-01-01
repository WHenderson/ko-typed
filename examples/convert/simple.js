var ko = require('../../index');
var assert = require('chai').assert;

var base = ko.observable();
var typed = base.extend({ type: 'Undefined|String' });
var converted = typed.extend({ convert: true });

converted('');
assert.strictEqual(base(), undefined);
converted(10);
assert.strictEqual(base(), '10');
converted('string');
assert.strictEqual(base(), 'string');

base(undefined);
assert.strictEqual(converted(), undefined);
base('10');
assert.strictEqual(converted(), '10');
base('string');
assert.strictEqual(converted(), 'string');
