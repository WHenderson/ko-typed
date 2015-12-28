assert = require('chai').assert

suite('options.deferEvaluation', () ->
  test('options.deferEvaluation : false', () ->
    assert.throws(
      () -> ko.observable().extend({ type: { type: 'Number', deferEvaluation: false }})
      TypeError
      'Unexpected internal type. Expected Number, got Undefined'
    )
    assert.doesNotThrow(
      () -> ko.observable().extend({ type: { type: 'Undefined', deferEvaluation: false }})
      TypeError
      'Unexpected internal type. Expected Number, got Undefined'
    )
  )
)
