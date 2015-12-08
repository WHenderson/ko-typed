assert = require('chai').assert

suite('boolean', () ->
  test('Boolean -> String', () ->
    converter = ko.typeRestricted.getConverter('Boolean', 'String')

    assert.isDefined(converter)
    assert.strictEqual(converter(true), 'true')
    assert.strictEqual(converter(false), 'false')
    assert.strictEqual(converter(true, true), 'TRUE')
  )

  test('Boolean -> Number', () ->
    converter = ko.typeRestricted.getConverter('Boolean', 'Number')

    assert.isDefined(converter)
    assert.strictEqual(converter(true), 1)
    assert.strictEqual(converter(false), 0)
    assert.strictEqual(converter(true, -1), -1)
    assert.strictEqual(converter(false, -1), 0)
  )

  test('Boolean -> Number.Integer', () ->
    converter = ko.typeRestricted.getConverter('Boolean', 'Number.Integer')

    assert.isDefined(converter)
    assert.strictEqual(converter(true), 1)
    assert.strictEqual(converter(false), 0)
    assert.strictEqual(converter(true, -1), -1)
    assert.strictEqual(converter(false, -1), 0)
  )
)
