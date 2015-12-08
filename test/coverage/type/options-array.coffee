assert = require('chai').assert

suite('array', () ->
  test('array', () ->
    base = ko.observable()
    typed = base.extend({
      type: ['Undefined', 'String']
    })

    assert.equal(typed.typeName, 'Undefined|String')
  )
)
