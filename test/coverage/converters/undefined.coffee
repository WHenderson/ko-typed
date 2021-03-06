assert = require('chai').assert

suite('undefined', () ->
  test('Undefined -> String', () ->
    converter = ko.typed.getConverter('Undefined', 'String')

    assert.isDefined(converter)
    assert.strictEqual(converter(undefined), '')
  )

  test('Undefined -> Date', () ->
    converter = ko.typed.getConverter('Undefined', 'Date')

    assert.isDefined(converter)
    assert.ok(isAn.Date(converter(undefined)))
    assert.ok(isAn.Number.NaN(converter(undefined).getTime()))
  )

  test('Undefined -> Moment', () ->
    converter = ko.typed.getConverter('Undefined', 'Moment')
    moment = require('moment')

    assert.isDefined(converter)
    assert.ok(moment.isMoment(converter(undefined)))
    assert.notOk(converter(undefined).isValid())
  )
)
