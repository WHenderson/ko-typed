assert = require('chai').assert

suite('forced errors', () ->
  test('failed read conversion', () ->
    base = ko.observable()
    debugger
    convert = base.extend({
      convert: {
        read: (value) ->
          throw new Error('Fail Read')
        write: (value) ->
          throw new Error('Fail Write')
        validation: {
          enable: false
        }
      }
    })

    try
      convert()
    catch exRead

    assert.isDefined(exRead)
    assert.instanceOf(exRead, Error)
    assert.equal(exRead.message, 'Fail Read')
    assert.equal(convert.writeError(), undefined)

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
        validation: {
          enable: false
        }
      }
    })

    assert.strictEqual(convert.writeError(), undefined)

    try
      convert()
    catch exRead

    assert.isDefined(exRead)
    assert.instanceOf(exRead, TypeError)
    assert.equal(exRead.message, 'Unable to convert from internal type Undefined')
    assert.strictEqual(convert.writeError(), undefined)

    try
      convert(10)
    catch exWrite

    assert.isDefined(exWrite)
    assert.instanceOf(exWrite, TypeError)
    assert.equal(exWrite.message, 'Unable to convert from external type Number')
    assert.strictEqual(convert.writeError(), exWrite)
  )

  test('immediate check and failure', () ->
    assert.throws(
      ()-> ko.observable().extend({ convert: { type: 'Number', deferEvaluation: false } })
      'Unable to convert from internal type Undefined to external type Number'
    )
  )

  test('bad write, no throw', () ->
    typed = ko.observable(10).extend({ convert: {
      type: 'Number',
      exWrite:{
        noThrow: true
      }
    } })

    typed('not a number')

    assert.instanceOf(typed.writeError(), TypeError)
    assert.strictEqual(typed.writeError().message, 'Unable to convert from external type String')
  )

  test('forced failure', () ->
    typed = ko.observable().extend({ convert: {
      type: 'Undefined',
      check: () ->
        throw new Error('not a type error')
      validation: {
        enable: false
      }
    } })

    assert.throws(
      () -> typed()
      'not a type error'
    )
    assert.isUndefined(typed.readError())

    assert.throws(
      () -> typed('not a number')
      'not a type error'
    )
    assert.isUndefined(typed.writeError())

  )

  test('error leading to default value', () ->
    typed = ko.observable().extend({ convert: {
      type: 'Number',
      exRead: {
        useDefault: true
        defaultValue: 42
      }
    } })

    assert.strictEqual(typed(), 42)
    assert.instanceOf(typed.readError(), TypeError)
    assert.strictEqual(typed.readError().message, 'Unable to convert from internal type Undefined to external type Number')
  )
)
