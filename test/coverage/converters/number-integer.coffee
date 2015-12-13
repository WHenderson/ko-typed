assert = require('chai').assert

suite('number-integer', () ->

  test('Number.Integer -> String', () ->
    converter = ko.typed.getConverter('Number.Integer', 'String')

    assert.isDefined(converter)
    assert.strictEqual(converter(0), '0')
    assert.strictEqual(converter(15), '15')
    assert.strictEqual(converter(15, 16), 'f')
    assert.strictEqual(converter(15, { base: 16, upperCase: true }), 'F')
    assert.strictEqual(converter(-15, { base: 16, upperCase: true }), '-F')
  )

  test('Number.Integer -> Boolean', () ->
    converter = ko.typed.getConverter('Number.Integer', 'Boolean')

    assert.isDefined(converter)
    assert.strictEqual(converter(0), false)
    assert.strictEqual(converter(1), true)
    assert.strictEqual(converter(-1), true)
    assert.strictEqual(converter(2, { truthy: 2 }), true)
    assert.strictEqual(converter(0, { truthy: 0, falsey: undefined }), true)
    assert.strictEqual(converter(1, { truthy: 0, falsey: undefined }), false)

    assert.throws(
      () -> converter(1, { truthy: -1 })
      'Cannot convert from 1 to Boolean'
    )
  )

  test('Number.Integer -> Number', () ->
    converter = ko.typed.getConverter('Number.Integer', 'Number')

    assert.isDefined(converter)
    assert.strictEqual(converter(0), 0)
    assert.strictEqual(converter(1), 1)
  )
)
