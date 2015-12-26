assert = require('chai').assert

suite('options string', () ->
  test('single type', () ->
    base = ko.observable()
    typed = base.extend({ type: 'Number' })

    try
      typed()
    catch ex

    assert.isDefined(ex)
    assert.instanceOf(ex, TypeError)

    typed(10)
    assert.strictEqual(typed(), 10)
    assert.strictEqual(base(), 10)

    try
      typed('invalid type')
    catch ex2

    assert.isDefined(ex2)
    assert.instanceOf(ex2, TypeError)
    assert.strictEqual(typed(), 10)
    assert.strictEqual(base(), 10)
  )

  test('multiple types', () ->
    base = ko.observable()
    typed = base.extend({ type: 'Undefined|Number' })

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
)
