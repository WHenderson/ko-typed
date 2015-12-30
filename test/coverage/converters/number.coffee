assert = require('chai').assert

suite('number', () ->

  test('util', () ->
    # Round
    assert.strictEqual(Math.round10(55.55, -1),  55.6)
    assert.strictEqual(Math.round10(55.549, -1),  55.5)
    assert.strictEqual(Math.round10(55, 1),  60)
    assert.strictEqual(Math.round10(54.9, 1),  50)
    assert.strictEqual(Math.round10(-55.55, -1),  -55.5)
    assert.strictEqual(Math.round10(-55.551, -1),  -55.6)
    assert.strictEqual(Math.round10(-55, 1),  -50)
    assert.strictEqual(Math.round10(-55.1, 1),  -60)
    assert.strictEqual(Math.round10(1.005, -2),  1.01)

    # Floor
    assert.strictEqual(Math.floor10(55.59, -1),  55.5)
    assert.strictEqual(Math.floor10(59, 1),  50)
    assert.strictEqual(Math.floor10(-55.51, -1),  -55.6)
    assert.strictEqual(Math.floor10(-51, 1),  -60)

    # Ceil
    assert.strictEqual(Math.ceil10(55.51, -1),  55.6)
    assert.strictEqual(Math.ceil10(51, 1),  60)
    assert.strictEqual(Math.ceil10(-55.59, -1),  -55.5)
    assert.strictEqual(Math.ceil10(-59, 1),  -50)

    # Side cases
    assert.ok(isNaN(Math.round10(NaN, 2)))
    assert.strictEqual(Math.floor10(1.123456789e-10, -10), 1e-10)
    assert.strictEqual(Math.floor10(1.123456789e100, -2), 1.123456789e+100)
  )

  test('Number -> String', () ->
    converter = ko.typed.getConverter('Number', 'String')

    assert.isDefined(converter)
    assert.strictEqual(converter(0), '0')

    number = 1234567890.1234567890
    assert.strictEqual(converter(number), number.toString())

    assert.strictEqual(converter(1.123456, 8), '1.12345600')
    assert.strictEqual(converter(1.123456, 7), '1.1234560')
    assert.strictEqual(converter(1.123456, 6), '1.123456')
    assert.strictEqual(converter(1.123456, 5), '1.12346')
    assert.strictEqual(converter(1.123456, 4), '1.1235')
    assert.strictEqual(converter(1.123456, 3), '1.123')
    assert.strictEqual(converter(1.123456, 2), '1.12')
    assert.strictEqual(converter(1.123456, 1), '1.1')
    assert.strictEqual(converter(1.123456, 0), '1')
  )

  test('Number -> Boolean', () ->
    converter = ko.typed.getConverter('Number', 'Boolean')

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

  test('Number -> Number.Integer', () ->
    converter = ko.typed.getConverter('Number', 'Number.Integer')

    assert.isDefined(converter)

    assert.throws(
      () -> converter(0.5)
      TypeError,
      'Cannot convert from Number to Number.Integer. Number is not an integer'
    )
    assert.strictEqual(converter(20), 20)

    assert.strictEqual(converter(20.49, 'round'), 20)
    assert.strictEqual(converter(20.5, 'round'), 21)
    assert.strictEqual(converter(-20.5, 'round'), -20)
    assert.strictEqual(converter(-20.51, 'round'), -21)

    assert.strictEqual(converter(45.95, 'floor'), 45)
    assert.strictEqual(converter(-45.95, 'floor'), -46)

    assert.strictEqual(converter(45.95, Math.floor), 45)
    assert.strictEqual(converter(-45.95, Math.floor), -46)

    assert.strictEqual(converter(45.95, 'ceil'), 46)
    assert.strictEqual(converter(-45.95, 'ceil'), -45)
  )
)
