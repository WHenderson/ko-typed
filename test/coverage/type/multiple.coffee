assert = require('chai').assert

suite('multiple', () ->
  test('options.type: string', () ->
    base = ko.observable()
    typed = base.extend({ type: { type: 'Undefined|String' } })

    assert.typed(typed, {
      typeName: 'Undefined|String'
      invalidValue: 42
      validValues: {
        Undefined: undefined
        String: 'value'
      }
    })

    assert.write(base, undefined).read( typed, undefined)
    assert.write(base, 'value').read( typed, 'value')
    assert.writeThrows(typed, 42, true, TypeError, 'Unexpected external type. Expected Undefined|String, received Number').read(base, 'value')
    assert.write(typed, undefined).read(base, undefined)
    assert.write(base, 10).readThrows(typed, true, TypeError, 'Unexpected internal type. Expected Undefined|String, got Number')
    assert.write(base, undefined).read( typed, undefined)
  )

  test('options: string', () ->
    base = ko.observable()
    typed = base.extend({ type: 'Undefined|String' })

    assert.typed(typed, {
      typeName: 'Undefined|String'
      invalidValue: 42
      validValues: {
        Undefined: undefined
        String: 'value'
      }
    })

    assert.write(base, undefined).read( typed, undefined)
    assert.write(base, 'value').read( typed, 'value')
    assert.writeThrows(typed, 42, true, TypeError, 'Unexpected external type. Expected Undefined|String, received Number').read(base, 'value')
    assert.write(typed, undefined).read(base, undefined)
    assert.write(base, 10).readThrows(typed, true, TypeError, 'Unexpected internal type. Expected Undefined|String, got Number')
    assert.write(base, undefined).read( typed, undefined)
  )

  test('options: string - repeated types', () ->
    base = ko.observable()
    typed = base.extend({ type: 'Undefined|String|String|String' })

    assert.typed(typed, {
      typeName: 'Undefined|String'
      invalidValue: 42
      validValues: {
        Undefined: undefined
        String: 'value'
      }
    })
  )

  test('options.type: string, options.TypeName: function - custom type', () ->
    base = ko.observable()
    typed = base.extend({ type: { type: 'Undefined|String|String|String', Custom: (value) -> value == 43 } })

    assert.typed(typed, {
      typeName: 'Undefined|String|Custom'
      invalidValue: 42
      validValues: {
        Undefined: undefined
        String: 'value'
        Custom: 43
      }
    })
  )
)
