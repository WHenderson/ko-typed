assert = require('chai').assert

suite('identity', () ->
  test('Same -> Same', () ->
    converter = ko.typed.getConverter('Same', 'Same')

    assert.isDefined(converter)
    assert.strictEqual(converter(1.2345), 1.2345)
    assert.strictEqual(converter(false), false)
    assert.strictEqual(converter('something'), 'something')
  )
)
