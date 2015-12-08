assert = require('chai').assert

suite('string', () ->
  test('single type', () ->
    base = ko.observable(0).extend({
      type: 'Number'
    })
    convert = base.extend({
      convert: 'String'
    })

    assert.strictEqual(convert(), '0')
    assert.strictEqual(base(), 0)

    convert('10')

    assert.strictEqual(convert(), '10')
    assert.strictEqual(base(), 10)

    try
      convert('xyz')
    catch ex2

    assert.isDefined(ex2)
    assert.instanceOf(ex2, TypeError)
    assert.strictEqual(convert(), '10')
    assert.strictEqual(base(), 10)
  )
)
