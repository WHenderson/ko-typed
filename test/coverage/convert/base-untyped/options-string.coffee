assert = require('chai').assert

suite('string', () ->
  test('single type', () ->
    base = ko.observable()
    convert = base.extend({
      convert: 'Number'
    })

    try
      convert()
    catch ex

    assert.isDefined(ex)
    assert.instanceOf(ex, TypeError)

    convert(10)

    assert.strictEqual(convert(), 10)
    assert.strictEqual(base(), 10)

    try
      convert(undefined)
    catch ex2

    assert.isDefined(ex2)
    assert.instanceOf(ex2, TypeError)
    assert.strictEqual(base(), convert())
    assert.strictEqual(base(), 10)
  )

  test('multiple types', () ->
    base = ko.observable()
    convert = base.extend({
      convert: 'Undefined|Number'
    })

    assert.strictEqual(base(), convert())

    convert(10)
    assert.strictEqual(base(), convert())
    assert.strictEqual(base(), 10)

    convert(undefined)
    assert.strictEqual(base(), convert())
    assert.strictEqual(base(), undefined)

    try
      convert('invalid type')
    catch ex

    assert.isDefined(ex)
    assert.instanceOf(ex, TypeError)
    assert.strictEqual(base(), convert())
    assert.strictEqual(base(), undefined)
  )
)
