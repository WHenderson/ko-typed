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
    assert.equal(convert.typeWriteError(), undefined)

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

    assert.strictEqual(convert.typeWriteError(), undefined)

    try
      convert()
    catch exRead

    assert.isDefined(exRead)
    assert.instanceOf(exRead, TypeError)
    assert.equal(exRead.message, 'Unable to convert from internal type Undefined')
    assert.strictEqual(convert.typeWriteError(), undefined)

    try
      convert(10)
    catch exWrite

    assert.isDefined(exWrite)
    assert.instanceOf(exWrite, TypeError)
    assert.equal(exWrite.message, 'Unable to convert from external type Number')
    assert.strictEqual(convert.typeWriteError(), exWrite)
  )

  test('immediate check and failure', () ->
    assert.throws(
      ()-> ko.observable().extend({ convert: { type: 'Number', deferEvaluation: false } })
      'Unable to convert from internal type Undefined to external type Number'
    )
  )

  test('bad write, no throw', () ->
    typed = ko.observable().extend({ convert: {
      type: 'Number',
      noThrow: true
    } })

    typed('not a number')

    assert.instanceOf(typed.typeWriteError(), TypeError)
    assert.strictEqual(typed.typeWriteError().message, 'Unable to convert from external type String')
  )

  test('forced failure', () ->
    typed = ko.observable().extend({ convert: {
      type: 'Undefined',
      check: () ->
        throw new Error('not a type error')
    } })

    assert.throws(
      () -> typed()
      'not a type error'
    )
    assert.isUndefined(typed.typeReadError())

    assert.throws(
      () -> typed('not a number')
      'not a type error'
    )
    assert.isUndefined(typed.typeWriteError())

  )

  test('error leading to default value', () ->
    typed = ko.observable().extend({ convert: {
      type: 'Number',
      default: 42
      useDefault: true
    } })

    assert.strictEqual(typed(), 42)
    assert.instanceOf(typed.typeReadError(), TypeError)
    assert.strictEqual(typed.typeReadError().message, 'Unable to convert from internal type Undefined to external type Number')
  )
)
