assert = require('chai').assert

suite('options.pure', () ->
  test('options.pure: true', () ->
    assert.ok(ko.isPureComputed(ko.observable().extend({ type: { type: 'Undefined', pure: true }})))
  )

  test('options.pure: false', () ->
    assert.notOk(ko.isPureComputed(ko.observable().extend({ type: { type: 'Undefined', pure: false }})))
  )
)
