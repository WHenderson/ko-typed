assert = require('chai').assert

suite('error conditions', () ->

  test('restricted conversion', () ->
    base = ko.observable().extend({ type: 'Undefined|Number|String' })
    convert = base.extend({ convert: {
      type: 'String'
      String: {
        type: 'String'
      }
    }})

    assert.write(base, undefined).readThrows(convert, true, TypeError, 'Unable to convert from internal type Undefined to external type String')
    assert.write(base, 42).readThrows(convert, true, TypeError, 'Unable to convert from internal type Number to external type String')
    assert.write(base, 'value').read(convert, 'value')

    assert.write(convert, 'value2').read(base, 'value2')
    assert.write(convert, '42').read(base, '42')
    assert.write(convert, '').read(base, '')
  )


  test('unexpected failure', () ->
    base = ko.observable().extend({ type: 'Undefined' })
    convert = base.extend({ convert: {
      type: 'Number'
      read: (value) -> throw new Error('read')
      write: (value) -> throw new Error('write')
    }})

    assert.readThrows(convert, false, Error, 'read')
    assert.writeThrows(convert, 'value', false, Error, 'write')
  )

  test('bad custom conversion', () ->
    base = ko.observable(42).extend({ type: 'Number' })
    convert = base.extend({ convert: {
      type: 'Number'
      read: (value) -> undefined
      write: (value) -> undefined
    }})

    assert.readThrows(convert, true, TypeError, 'Unable to convert from internal type Number to external type Number')
    assert.writeThrows(convert, 'value', true, TypeError, 'Unexpected external type. Expected Number, received Undefined')
  )

  test('no default converters', () ->
    base = ko.observable().extend({ type: 'Undefined|String' })
    convert = base.extend({ convert: {
      type: 'String'
      ignoreDefaultConverters: true
    }})

    assert.write(base, undefined).readThrows(convert, true, TypeError, 'Unable to convert from internal type Undefined to external type String')
    assert.write(base, '').read(convert, '')
    assert.write(base, 'value').read(convert, 'value')

    assert.writeThrows(convert, undefined, true, TypeError, 'Unable to convert from external type Undefined to internal type Undefined|String').read(base, 'value')
    assert.write(convert, '').read(base, '')
    assert.write(convert, 'value').read(base, 'value')
  )

  test('check generic', () ->
    base = ko.observable()
    convert = base.extend({ convert: {
      check: () -> false
    }})

    assert.readThrows(convert, true, TypeError, 'Unable to convert from internal type Undefined')
    assert.writeThrows(convert, 10, true, TypeError, 'Unable to convert from external type Number')
  )

  test('don\'t extend', () ->
    base = ko.observable()
    convert = base.extend({ convert: false })

    assert.strictEqual(base, convert)
  )
)
