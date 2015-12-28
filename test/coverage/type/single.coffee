assert = require('chai').assert

suite('single', () ->
  test('options.type: string', () ->
    base = ko.observable()
    typed = base.extend({ type: { type: 'Undefined' } })

    assert.typed(typed, {
      typeName: 'Undefined'
      invalidValue: 42
      validValues: {
        Undefined: undefined
      }
    })

    assert.readDoesNotThrow(base, undefined, typed, undefined)
    assert.writeThrows(base, undefined, typed, 42, true, TypeError, 'Unexpected external type. Expected Undefined, received Number')
    assert.writeDoesNotThrow(base, undefined, typed, undefined)
    assert.readThrows(base, 10, typed, TypeError, 'Unexpected internal type. Expected Undefined, got Number')
    assert.readDoesNotThrow(base, undefined, typed, undefined)
  )

  test('options: string', () ->
    base = ko.observable()
    typed = base.extend({ type: 'Undefined' })

    assert.typed(typed, {
      typeName: 'Undefined'
      invalidValue: 42
      validValues: {
        Undefined: undefined
      }
    })

    assert.readDoesNotThrow(base, undefined, typed, undefined)
    assert.writeThrows(base, undefined, typed, 42, true, TypeError, 'Unexpected external type. Expected Undefined, received Number')
    assert.writeDoesNotThrow(base, undefined, typed, undefined)
    assert.readThrows(base, 10, typed, TypeError, 'Unexpected internal type. Expected Undefined, got Number')
    assert.readDoesNotThrow(base, undefined, typed, undefined)
  )

  test('options.check: function', () ->
    base = ko.observable()
    typed = base.extend({ type: { check: (value) -> value == 42 } })

    assert.typed(typed, {
      validValue: 42
      invalidValue: 41
    })
  )

  test('options: function', () ->
    base = ko.observable()
    typed = base.extend({ type: (value) -> value == 42 })

    assert.typed(typed, {
      validValue: 42
      invalidValue: 41
    })
  )
)
