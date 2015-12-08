assert = require('chai').assert

suite('function', () ->
  test('custom type', () ->
    base = ko.observable()
    typed = base.extend({ type: (value) -> value == 10 })

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
)
