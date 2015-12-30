assert = require('chai').assert

suite('options.exWrite', () ->
  test('options.exWrite.catch: false', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Number'
      exWrite: {
        catch: false
      }
    }})

    assert.writeThrows(typed, undefined, false, TypeError, 'Unexpected external type. Expected Number, received Undefined').read(base, undefined)
  )

  test('options.exWrite.catch: true', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Number'
      exWrite: {
        catch: true
      }
    }})

    assert.writeThrows(typed, undefined, true, TypeError, 'Unexpected external type. Expected Number, received Undefined').read(base, undefined)
  )

  test('options.exWrite.catch: function', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Number'
      exWrite: {
        catch: (ex) -> true
      }
    }})

    assert.writeThrows(typed, undefined, true, TypeError, 'Unexpected external type. Expected Number, received Undefined').read(base, undefined)
  )

  test('options.exWrite.defaultValue', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Number'
      exWrite: {
        catch: true
        useDefault: true
        defaultValue: 42
      }
    }})

    assert.writeThrows(typed, undefined, true, TypeError, 'Unexpected external type. Expected Number, received Undefined').read(base, 42)
  )

  test('options.exWrite.defaultFunc', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Number'
      exWrite: {
        catch: true
        useDefault: true
        defaultFunc: () -> 42
      }
    }})

    assert.writeThrows(typed, undefined, true, TypeError, 'Unexpected external type. Expected Number, received Undefined').read(base, 42)
  )

  test('options.exWrite.noThrow', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Number'
      exWrite: {
        catch: true
        noThrow: true
      }
    }})

    assert.write(typed, undefined, true, TypeError, 'Unexpected external type. Expected Number, received Undefined').read(base, undefined)
  )
)
