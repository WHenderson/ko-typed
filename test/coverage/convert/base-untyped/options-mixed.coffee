assert = require('chai').assert

suite('mixed', () ->
  test('discrete', () ->
    base = ko.observable()
    convert = base.extend({
      convert: {
        type: 'Undefined'
        String: {
        }
      }
    })

    assert.equal(convert.typeName, 'Undefined|String')
  )

  test('overlap', () ->
    base = ko.observable()
    convert = base.extend({
      convert: {
        type: 'Undefined|String'
        Undefined: {
        }
        String: {
        }
      }
    })

    assert.equal(convert.typeName, 'Undefined|String')
  )

  test('specific discrete', () ->
    base = ko.observable()
    convert = base.extend({
      convert: {
        String: {
          type: 'Undefined'
          Number: {}
        }
      }
    })

    convert()
    base(10)
    convert()
    base('')
    try
      convert()
    catch ex

    assert.isDefined(ex)
    assert.instanceOf(ex, TypeError)
  )

  test('specific overlap', () ->
    base = ko.observable()
    convert = base.extend({
      convert: {
        String: {
          type: 'Undefined'
          Undefined: {}
          Number: {}
        }
      }
    })

    convert()
    base(10)
    convert()
    base('')
    try
      convert()
    catch ex

    assert.isDefined(ex)
    assert.instanceOf(ex, TypeError)
  )
)
