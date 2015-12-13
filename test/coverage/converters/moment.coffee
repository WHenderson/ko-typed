assert = require('chai').assert

suite('moment', () ->

  test('Moment -> Undefined', () ->
    converter = ko.typed.getConverter('Moment', 'Undefined')
    moment = require('moment')

    assert.isDefined(converter)
    assert.strictEqual(converter(new moment('')), undefined)

    assert.throws(
      () -> converter(moment())
      'Unable to convert from valid Moment to Undefined'
    )
  )

  test('Moment -> String', () ->
    converter = ko.typed.getConverter('Moment', 'String')
    moment = require('moment')

    m = moment('1995-12-17T03:24:00')

    assert.isDefined(converter)
    assert.strictEqual(converter(m), m.locale('en').format('L'))
    assert.strictEqual(converter(m, 'dddd, MMMM Do YYYY, h:mm:ss a'), 'Sunday, December 17th 1995, 3:24:00 am')
    assert.strictEqual(converter(moment('')), '')
  )

  test('Moment -> Date', () ->
    converter = ko.typed.getConverter('Moment', 'Date')
    moment = require('moment')

    m = moment('1995-12-17T03:24:00')

    assert.isDefined(converter)
    assert.strictEqual(converter(m).valueOf(), m.toDate().valueOf())
  )
)
