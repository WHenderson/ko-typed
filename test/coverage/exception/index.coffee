assert = require('chai').assert

suite('exception', () ->
  test('pure', () ->
    assert.ok(ko.isPureComputed(ko.observable().extend({ exception: { pure: true } })))
    assert.ok(not ko.isPureComputed(ko.observable().extend({ exception: { pure: false } })))
  )

  test('deferEvaluation', () ->
    assert.throws(
      () ->
        ko
        .pureComputed(() -> throw new Error('contrived error'))
        .extend({ exception: { pure: true, deferEvaluation: false } })
    )
    assert.doesNotThrow(
      () ->
        ko
        .pureComputed(() -> throw new Error('contrived error'))
        .extend({ exception: { pure: true, deferEvaluation: true } })
    )
    assert.throws(
      () ->
        ko
        .pureComputed(() -> throw new Error('contrived error'))
        .extend({ exception: { pure: false, deferEvaluation: false } })
    )
    assert.doesNotThrow(
      () ->
        ko
        .pureComputed(() -> throw new Error('contrived error'))
        .extend({ exception: { pure: false, deferEvaluation: true } })
    )
  )

  require('./read')

  require('./write')
)
