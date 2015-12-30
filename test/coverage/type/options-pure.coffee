assert = require('chai').assert

suite('options.pure', () ->
  test('options.pure: true', () ->
    assert.isTrue(ko.isPureComputed(ko.observable().extend({ type: { type: 'Undefined', pure: true }})))
  )

  test('options.pure: false', () ->
    assert.isFalse(ko.isPureComputed(ko.observable().extend({ type: { type: 'Undefined', pure: false }})))
  )
)
