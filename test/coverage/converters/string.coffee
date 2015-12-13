assert = require('chai').assert

suite('string', () ->

  test('String -> Undefined', () ->
    converter = ko.typed.getConverter('String', 'Undefined')

    assert.isDefined(converter)
    assert.strictEqual(converter(''), undefined)
    assert.strictEqual(converter('    ', { trim: true }), undefined)
    assert.throws(
      () -> converter('invalid')
      'Unable to convert from invalid to Undefined'
    )
  )

  test('String -> Boolean', () ->
    converter = ko.typed.getConverter('String', 'Boolean')

    assert.isDefined(converter)

    assert.strictEqual(converter('true'), true)
    assert.strictEqual(converter('t'), true)
    assert.strictEqual(converter('1'), true)
    assert.strictEqual(converter('-1'), true)
    assert.strictEqual(converter('yes'), true)
    assert.strictEqual(converter('y'), true)

    assert.strictEqual(converter('false'), false)
    assert.strictEqual(converter('f'), false)
    assert.strictEqual(converter('0'), false)
    assert.strictEqual(converter('no'), false)
    assert.strictEqual(converter('n'), false)

    assert.strictEqual(converter('true', true), true)
    assert.strictEqual(converter('false', true), false)

    assert.strictEqual(converter('  true  ', { trim: true }), true)

    assert.throws(
      () -> converter('t', true)
      'Cannot convert from t to Boolean'
    )

    assert.throws(
      () -> converter('TRUE', { ignoreCase: false })
      'Cannot convert from TRUE to Boolean'
    )

    assert.throws(
      () -> converter('invalid')
      'Cannot convert from invalid to Boolean'
    )
  )

  test('String -> Number', () ->
    converter = ko.typed.getConverter('String', 'Number')

    assert.isDefined(converter)

    assert.strictEqual(converter('0'), 0)
    assert.strictEqual(converter('1'), 1)
    assert.strictEqual(converter('1.123456789'), 1.123456789)
    assert.strictEqual(converter('1.123456789', 4), 1.1235)

    assert.strictEqual(converter('  0  ', { trim: true }), 0)

    assert.throws(
      () -> converter('invalid')
      'Unable to convert from invalid to Number'
    )
  )

  test('String -> Number.Integer', () ->
    converter = ko.typed.getConverter('String', 'Number.Integer')

    assert.isDefined(converter)

    assert.strictEqual(converter('0'), 0)
    assert.strictEqual(converter('1'), 1)
    assert.strictEqual(converter('F', 16), 0xf)
    assert.strictEqual(converter('10.5'), 11)

    assert.strictEqual(converter('  0  ', { trim: true }), 0)

    assert.throws(
      () -> converter('F', { strict: true, base: 16 })
      'Unable to convert from F to Number.Integer'
    )

    assert.throws(
      () -> converter('invalid')
      'Unable to convert from invalid to Number.Integer'
    )
  )

  test('String -> Date', () ->
    converter = ko.typed.getConverter('String', 'Date')

    assert.isDefined(converter)

    assert.strictEqual(converter('December 17, 1995 03:24:00').valueOf(), (new Date('December 17, 1995 03:24:00')).valueOf())
    assert.strictEqual(converter('1995-12-17T03:24:00').valueOf(), (new Date('1995-12-17T03:24:00')).valueOf())

    assert.strictEqual(converter('   1995-12-17T03:24:00   ', { trim: true }).valueOf(), (new Date('1995-12-17T03:24:00')).valueOf())

    assert.throws(
      () -> converter('invalid')
      'Unable to convert from invalid to Date'
    )
  )

  test('String -> Moment', () ->
    converter = ko.typed.getConverter('String', 'Moment')
    moment = require('moment')

    assert.isDefined(converter)

    assert.strictEqual(converter('2010-01-01T05:06:07', moment.ISO_8601).valueOf(), (moment('2010-01-01T05:06:07', moment.ISO_8601)).valueOf())
    assert.strictEqual(converter('  2010-01-01T05:06:07  ', { format: moment.ISO_8601, trim: true } ).valueOf(), (moment('2010-01-01T05:06:07', moment.ISO_8601)).valueOf())

    assert.throws(
      () -> converter('invalid')
      'Unable to convert from invalid to Moment'
    )
  )
)
