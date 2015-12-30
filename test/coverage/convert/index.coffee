assert = require('chai').assert

suite('convert', () ->

  test('untyped - untyped', () ->
    base = ko.observable()
    convert = base.extend({ convert: true })

    assert.typed(convert, {
      typeName: undefined
    })

    assert.write(base, undefined).read(convert, undefined)
    assert.write(base, 42).read(convert, 42)
    assert.write(base, 'value').read(convert, 'value')

    assert.write(convert, undefined).read(base, undefined)
    assert.write(convert, 42).read(base, 42)
    assert.write(convert, 'value').read(base, 'value')
  )

  test('untyped - typed', () ->
    base = ko.observable()
    convert = base.extend({ convert: 'Undefined' })

    assert.typed(convert, {
      typeName: 'Undefined'
      invalidValue: 42
      validValues: {
        Undefined: undefined
      }
    })

    assert.write(base, undefined).read(convert, undefined)
    assert.write(base, 42).readThrows(convert, true, TypeError, 'Unable to convert from internal type Number to external type Undefined')
    assert.write(base, 'value').readThrows(convert, true, TypeError, 'Unable to convert from internal type String to external type Undefined')
    assert.write(base, '').read(convert, undefined)

    assert.write(convert, undefined).read(base, undefined)
    assert.writeThrows(convert, 42, true, TypeError, 'Unable to convert from external type Number').read(base, undefined)
    assert.writeThrows(convert, 'value', true, TypeError, 'Unable to convert from external type String').read(base, undefined)
  )

  test('untyped - multi-typed', () ->
    base = ko.observable()
    convert = base.extend({ convert: 'Undefined|Number' })

    assert.typed(convert, {
      typeName: 'Undefined|Number'
      invalidValue: 'value'
      validValues: {
        Undefined: undefined
        Number: 42
      }
    })

    assert.write(base, undefined).read(convert, undefined)
    assert.write(base, 42).read(convert, 42)
    assert.write(base, 'value').readThrows(convert, true, TypeError, 'Unable to convert from internal type String to external type Undefined')
    assert.write(base, '').read(convert, undefined)
    assert.write(base, '42').read(convert, 42)

    assert.write(convert, undefined).read(base, undefined)
    assert.write(convert, 42).read(base, 42)
    assert.writeThrows(convert, 'value', true, TypeError, 'Unable to convert from external type String').read(base, 42)
  )

  test('typed - untyped', () ->
    base = ko.observable().extend({ type: 'String' })
    convert = base.extend({ convert: true })

    assert.typed(convert, {
      typeName: undefined
    })

    assert.write(base, 'value').read(convert, 'value')

    assert.write(convert, 'value').read(base, 'value')
    assert.write(convert, 42).read(base, '42')
    assert.write(convert, undefined).read(base, '')
    assert.write(convert, '').read(base, '')
  )

  test('typed - typed', () ->
    base = ko.observable().extend({ type: 'String' })
    convert = base.extend({ convert: 'Undefined' })

    assert.typed(convert, {
      typeName: 'Undefined'
      invalidValue: 42
      validValues: {
        Undefined: undefined
      }
    })

    assert.write(base, '').read(convert, undefined)
    assert.write(base, 'value').readThrows(convert, true, TypeError, 'Unable to convert from internal type String to external type Undefined')

    assert.write(convert, undefined).read(base, '')
    assert.writeThrows(convert, 42, true, TypeError, 'Unable to convert from external type Number').read(base, '')
    assert.writeThrows(convert, 'value', true, TypeError, 'Unable to convert from external type String').read(base, '')
  )

  test('typed - multi-typed', () ->
    base = ko.observable().extend({ type: 'String' })
    convert = base.extend({ convert: 'Undefined|Number' })

    assert.typed(convert, {
      typeName: 'Undefined|Number'
      invalidValue: 'value'
      validValues: {
        Undefined: undefined
        Number: 42
      }
    })

    assert.write(base, '').read(convert, undefined)
    assert.write(base, '42').read(convert, 42)
    assert.write(base, 'value').readThrows(convert, true, TypeError, 'Unable to convert from internal type String to external type Undefined')

    assert.write(convert, undefined).read(base, '')
    assert.write(convert, 42).read(base, '42')
    assert.writeThrows(convert, 'value', true, TypeError, 'Unable to convert from external type String').read(base, '42')
  )


  test('multi-typed - untyped', () ->
    base = ko.observable().extend({ type: 'Undefined|String' })
    convert = base.extend({ convert: true })

    assert.typed(convert, {
      typeName: undefined
    })

    assert.write(base, undefined).read(convert, undefined)
    assert.write(base, 'value').read(convert, 'value')

    assert.write(convert, 'value').read(base, 'value')
    assert.write(convert, 42).read(base, '42')
    assert.write(convert, undefined).read(base, undefined)
    assert.write(convert, '').read(base, undefined)
  )

  test('multi-typed - typed', () ->
    base = ko.observable().extend({ type: 'Undefined|String' })
    convert = base.extend({ convert: 'Undefined' })

    assert.typed(convert, {
      typeName: 'Undefined'
      invalidValue: 42
      validValues: {
        Undefined: undefined
      }
    })

    assert.write(base, undefined).read(convert, undefined)
    assert.write(base, '').read(convert, undefined)
    assert.write(base, 'value').readThrows(convert, true, TypeError, 'Unable to convert from internal type String to external type Undefined')

    assert.write(convert, undefined).read(base, undefined)
    assert.writeThrows(convert, 42, true, TypeError, 'Unable to convert from external type Number').read(base, undefined)
    assert.writeThrows(convert, 'value', true, TypeError, 'Unable to convert from external type String').read(base, undefined)
  )

  test('multi-typed - multi-typed', () ->
    base = ko.observable().extend({ type: 'Undefined|String' })
    convert = base.extend({ convert: 'Undefined|Number' })

    assert.typed(convert, {
      typeName: 'Undefined|Number'
      invalidValue: 'value'
      validValues: {
        Undefined: undefined
        Number: 42
      }
    })

    assert.write(base, undefined).read(convert, undefined)
    assert.write(base, '').read(convert, undefined)
    assert.write(base, '42').read(convert, 42)
    assert.write(base, 'value').readThrows(convert, true, TypeError, 'Unable to convert from internal type String to external type Undefined')

    assert.write(convert, undefined).read(base, undefined)
    assert.write(convert, 42).read(base, '42')
    assert.writeThrows(convert, 'value', true, TypeError, 'Unable to convert from external type String').read(base, '42')
  )

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

  test('custom convert exact', () ->
    base = ko.observable().extend({ type: 'Number' })
    convert = base.extend({ convert: {
      Number: {
        Number: {
          read: (value) -> value + 1
          write: (value) -> value - 1
        }
      }
    }})

    assert.write(base, 42).read(convert, 43)
    assert.write(convert, 42).read(base, 41)
  )

  test('custom convert exact - fail', () ->
    base = ko.observable().extend({ type: 'Number' })
    convert = base.extend({ convert: {
      type: 'Number'
      Number: {
        Number: {
          read: (value) -> throw TypeError('read')
          write: (value) -> throw TypeError('write')
        }
      }
    }})

    assert.write(base, 42).readThrows(convert, true, TypeError, 'Unable to convert from internal type Number to external type Number')
    assert.writeThrows(convert, 42, true, TypeError, 'Unable to convert from external type Number to internal type Number').read(base, 42)
  )

  test('custom convert specific', () ->
    base = ko.observable().extend({ type: 'Number' })
    convert = base.extend({ convert: {
      type: 'Number'
      Number: {
        read: (value) -> value + 1
        write: (value) -> value - 1
      }
    }})

    assert.write(base, 42).read(convert, 43)
    assert.write(convert, 42).read(base, 41)
  )

  test('custom convert generic', () ->
    base = ko.observable().extend({ type: 'Number' })
    convert = base.extend({ convert: {
      type: 'Number'
      read: (value) -> value + 1
      write: (value) -> value - 1
    }})

    assert.write(base, 42).read(convert, 43)
    assert.write(convert, 42).read(base, 41)
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
