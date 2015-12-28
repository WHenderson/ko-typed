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

    assert.readDoesNotThrow(base, undefined, typed, undefined)
    assert.readDoesNotThrow(base, 'value', typed, 'value')
    assert.writeThrows(base, 'value', typed, 42, true, TypeError, 'Unexpected external type. Expected Undefined|String, received Number')
    assert.writeDoesNotThrow(base, undefined, typed, undefined)
    assert.readThrows(base, 10, typed, true, TypeError, 'Unexpected internal type. Expected Undefined|String, got Number')
    assert.readDoesNotThrow(base, undefined, typed, undefined)
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

    assert.readDoesNotThrow(base, undefined, typed, undefined)
    assert.readDoesNotThrow(base, 'value', typed, 'value')
    assert.writeThrows(base, 'value', typed, 42, true, TypeError, 'Unexpected external type. Expected Undefined|String, received Number')
    assert.writeDoesNotThrow(base, undefined, typed, undefined)
    assert.readThrows(base, 10, typed, true, TypeError, 'Unexpected internal type. Expected Undefined|String, got Number')
    assert.readDoesNotThrow(base, undefined, typed, undefined)
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
