assert = require('chai').assert

suite('date', () ->

  test('Date -> Undefined', () ->
    converter = ko.typed.getConverter('Date', 'Undefined')

    assert.isDefined(converter)
    assert.strictEqual(converter(new Date('')), undefined)

    assert.throws(
      () -> converter(new Date())
      'Unable to convert from valid Date to Undefined'
    )
  )

  test('Date -> String', () ->
    converter = ko.typed.getConverter('Date', 'String')

    date = new Date('1995-12-17T03:24:00')

    assert.isDefined(converter)
    assert.strictEqual(converter(date), date.toString())
    assert.strictEqual(converter(date, 'localeDate'), date.toLocaleDateString())
    assert.strictEqual(converter(new Date('')), '')
  )

  test('Date -> Moment', () ->
    converter = ko.typed.getConverter('Date', 'Moment')
    moment = require('moment')

    date = new Date('1995-12-17T03:24:00')

    assert.isDefined(converter)
    assert.strictEqual(converter(date).valueOf(), moment(date).valueOf())
  )
)
