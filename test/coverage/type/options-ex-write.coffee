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

    assert.writeThrows(base, undefined, typed, undefined, false, TypeError, 'Unexpected external type. Expected Number, received Undefined')
  )

  test('options.exWrite.catch: true', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Number'
      exWrite: {
        catch: true
      }
    }})

    assert.writeThrows(base, undefined, typed, undefined, true, TypeError, 'Unexpected external type. Expected Number, received Undefined')
  )

  test('options.exWrite.catch: function', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Number'
      exWrite: {
        catch: (ex) -> true
      }
    }})

    assert.writeThrows(base, undefined, typed, undefined, true, TypeError, 'Unexpected external type. Expected Number, received Undefined')
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

    assert.writeThrows(base, 42, typed, undefined, true, TypeError, 'Unexpected external type. Expected Number, received Undefined')
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

    assert.writeThrows(base, 42, typed, undefined, true, TypeError, 'Unexpected external type. Expected Number, received Undefined')
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

    assert.writeDoesNotThrow(base, undefined, typed, undefined, true, TypeError, 'Unexpected external type. Expected Number, received Undefined')
  )
)
