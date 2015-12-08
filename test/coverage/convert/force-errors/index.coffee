assert = require('chai').assert

suite('forced errors', () ->
  test('failed read conversion', () ->
    base = ko.observable()
    convert = base.extend({
      convert: {
        read: (value) ->
          throw new Error('Fail Read')
        write: (value) ->
          throw new Error('Fail Write')
      }
    })

    try
      convert()
    catch exRead

    assert.isDefined(exRead)
    assert.instanceOf(exRead, Error)
    assert.equal(exRead.message, 'Fail Read')

    try
      convert(10)
    catch exWrite

    assert.isDefined(exWrite)
    assert.instanceOf(exWrite, Error)
    assert.equal(exWrite.message, 'Fail Write')
  )

  test('failed unnamed type check', () ->
    base = ko.observable()
    convert = base.extend({
      convert: {
        check: (value) ->
          false
      }
    })

    try
      convert()
    catch ex

    assert.isDefined(ex)
    assert.instanceOf(ex, TypeError)
    assert.equal(ex.message, 'Unable to convert from internal type Undefined')
  )
)
