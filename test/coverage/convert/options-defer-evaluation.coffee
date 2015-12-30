assert = require('chai').assert

suite('options.deferEvaluation', () ->
  test('options.deferEvaluation : false', () ->
    assert.throws(
      () -> ko.observable().extend({ convert: { type: 'Number', deferEvaluation: false }})
      TypeError
      'Unable to convert from internal type Undefined to external type Number'
    )
    assert.doesNotThrow(
      () -> ko.observable().extend({ convert: { type: 'Undefined', deferEvaluation: false }})
      TypeError
      'Unexpected internal type. Expected Number, got Undefined'
    )
  )
)
