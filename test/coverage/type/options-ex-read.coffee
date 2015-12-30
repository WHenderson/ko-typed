assert = require('chai').assert

suite('options.exRead', () ->
  test('options.exRead.catch: false', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Number'
      exRead: {
        catch: false
      }
    }})

    assert.write(base, undefined).readThrows(typed, false, TypeError, 'Unexpected internal type. Expected Number, got Undefined')
  )

  test('options.exRead.catch: true', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Number'
      exRead: {
        catch: true
      }
    }})

    assert.write(base, undefined).readThrows(typed, true, TypeError, 'Unexpected internal type. Expected Number, got Undefined')
  )

  test('options.exRead.catch: function', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Number'
      exRead: {
        catch: (ex) -> true
      }
    }})

    assert.write(base, undefined).readThrows(typed, true, TypeError, 'Unexpected internal type. Expected Number, got Undefined')
  )

  test('options.exRead.defaultValue', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Number'
      exRead: {
        catch: true
        useDefault: true
        defaultValue: 42
      }
    }})

    assert.write(base, undefined).read( typed, 42, TypeError, 'Unexpected internal type. Expected Number, got Undefined')
  )

  test('options.exRead.defaultFunc', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Number'
      exRead: {
        catch: true
        useDefault: true
        defaultFunc: () -> 10
      }
    }})

    assert.write(base, undefined).read( typed, 10, TypeError, 'Unexpected internal type. Expected Number, got Undefined')
  )
)
