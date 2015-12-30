assert = require('chai').assert

suite('convert', () ->

  #require('./base-untyped')

  #require('./base-typed')

  #require('./force-errors')

  #require('./validation')

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
)
