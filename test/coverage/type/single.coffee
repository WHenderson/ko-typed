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

    assert.write(base, undefined).read(typed, undefined)
    assert.writeThrows(typed, 42, true, TypeError, 'Unexpected external type. Expected Undefined, received Number').read(base, undefined)
    assert.write(typed, undefined).read(base, undefined)
    assert.write(base, 10).readThrows(typed, true, TypeError, 'Unexpected internal type. Expected Undefined, got Number')
    assert.write(base, undefined).read(typed, undefined)
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

    assert.write(base, undefined).read( typed, undefined)
    assert.writeThrows(typed, 42, true, TypeError, 'Unexpected external type. Expected Undefined, received Number').read(base, undefined)
    assert.write(typed, undefined).read(base, undefined)
    assert.write(base, 10).readThrows(typed, true, TypeError, 'Unexpected internal type. Expected Undefined, got Number')
    assert.write(base, undefined).read( typed, undefined)
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
