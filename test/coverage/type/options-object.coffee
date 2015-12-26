assert = require('chai').assert

suite('object', () ->
  test('single type', () ->
    base = ko.observable()
    typed = base.extend({
      type: {
        Custom: (value) -> value == 10
        ignored: true
      }
    })

    try
      typed()
    catch ex

    assert.isDefined(ex)
    assert.instanceOf(ex, TypeError)

    typed(10)
    assert.strictEqual(base(), typed())
    assert.strictEqual(base(), 10)

    try
      typed('invalid type')
    catch ex2

    assert.isDefined(ex2)
    assert.instanceOf(ex2, TypeError)
    assert.strictEqual(base(), typed())
    assert.strictEqual(base(), 10)
  )

  test('multiple types', () ->
    base = ko.observable()
    typed = base.extend({
      type: {
        type: 'Undefined|Custom'
        Custom: (value) -> value == 10
      }
    })

    assert.strictEqual(base(), typed())

    typed(10)
    assert.strictEqual(base(), typed())
    assert.strictEqual(base(), 10)

    typed(undefined)
    assert.strictEqual(base(), typed())
    assert.strictEqual(base(), undefined)

    try
      typed('invalid type')
    catch ex

    assert.isDefined(ex)
    assert.instanceOf(ex, TypeError)
    assert.strictEqual(base(), typed())
    assert.strictEqual(base(), undefined)
  )

  test('computed', () ->
    base = ko.observable()
    typed = base.extend({
      type: {
        type: 'Undefined'
        pure: false
      }
    })

    assert.ok(ko.isComputed(typed))
    assert.notOk(ko.isPureComputed(typed))

    typed = base.extend({
      type: {
        type: 'Undefined'
        pure: true
      }
    })

    assert.ok(ko.isComputed(typed))
    assert.ok(ko.isPureComputed(typed))
  )

  test('immediate check and failure', () ->
    assert.throws(
      ()-> ko.observable().extend({ type: { type: 'Number', deferEvaluation: false } })
      'Unexpected internal type. Expected Number, got Undefined'
    )
  )

  test('bad write, no throw', () ->
    typed = ko.observable().extend({ type: {
      type: 'Number',
      exWrite: {
        noThrow: true
      }
    } })

    typed('not a number')

    assert.instanceOf(typed.writeError(), TypeError)
    assert.strictEqual(typed.writeError().message, 'Unexpected external type. Expected Number, received String')
  )

  test('forced failure', () ->
    typed = ko.observable().extend({ type: {
      type: 'Number',
      check: () -> throw new Error('not a type error')
    } })

    assert.throws(
      () -> typed()
      'not a type error'
    )
    assert.isUndefined(typed.readError())

    assert.throws(
      () -> typed('not a number')
      'not a type error'
    )
    assert.isUndefined(typed.writeError())

  )

  test('error leading to default value', () ->
    typed = ko.observable().extend({ type: {
      type: 'Number',
      exRead: {
        useDefault: true
        defaultValue: 42
      }
    } })

    assert.strictEqual(typed(), 42)
    assert.instanceOf(typed.readError(), TypeError)
    assert.strictEqual(typed.readError().message, 'Unexpected internal type. Expected Number, got Undefined')
  )
)
