assert = require('chai').assert
require('knockout.validation')

suite('options.validation', () ->
  test('no validation library', () ->
    base = ko.observable()

    try
      koValidation = ko.validation
      delete ko.validation

      typed = base.extend({ type: {
        type: 'Undefined'
        validation: {
          enable: true
        }
      }})

    finally
      ko.validation = koValidation

    assert.isFalse(ko.validation.utils.isValidatable(typed))
  )

  test('options.validation.enable: true', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Undefined'
      validation: {
        enable: true
      }
      exRead: {
        catch: true
        useDefault: true
        defaultValue: undefined
      }
      exWrite: {
        catch: true
      }
    }})

    assert.isTrue(ko.validation.utils.isValidatable(typed))
    assert.isTrue(typed.isValid())
    base(42)
    assert.equal(typed.error(), 'Unexpected internal type. Expected Undefined, got Number')
  )

  test('options.validation: true', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Undefined'
      validation: true
      exRead: {
        catch: true
        useDefault: true
        defaultValue: undefined
      }
      exWrite: {
        catch: true
      }
    }})

    assert.isTrue(ko.validation.utils.isValidatable(typed))
    assert.isTrue(typed.isValid())
    base(42)
    assert.equal(typed.error(), 'Unexpected internal type. Expected Undefined, got Number')
  )

  test('options.validation.enable: false', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Undefined'
      validation: {
        enable: false
      }
      exRead: {
        catch: true
        useDefault: true
        defaultValue: undefined
      }
      exWrite: {
        catch: true
      }
    }})

    assert.isFalse(ko.validation.utils.isValidatable(typed))
  )

  test('options.validation: false', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Undefined'
      validation: false
      exRead: {
        catch: true
        useDefault: true
        defaultValue: undefined
      }
      exWrite: {
        catch: true
      }
    }})

    assert.isFalse(ko.validation.utils.isValidatable(typed))
  )

  test('message', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Number'
      exRead: {
        catch: true
        useDefault: true
        defaultValue: 0
      }
      exWrite: {
        catch: true
        noThrow: true
      }
      validation: {
        enable: true
        target: true
        result: true
      }
    }})

    assert.isTrue(ko.validation.utils.isValidatable(typed))
    assert.isTrue(ko.validation.utils.isValidatable(base))

    assert.equal(typed.error(), 'Unexpected internal type. Expected Number, got Undefined')
    assert.equal(base.error(), 'Unexpected internal type. Expected Number, got Undefined')

    typed('not a number')

    assert.equal(typed.error(), 'Unexpected external type. Expected Number, received String')
    assert.equal(base.error(), 'Unexpected external type. Expected Number, received String')

    typed(10)

    assert.equal(typed.error(), null)
    assert.equal(base.error(), null)
  )

  test('message override', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Number'
      exRead: {
        catch: true
        useDefault: true
        defaultValue: 0
      }
      exWrite: {
        catch: true
        noThrow: true
      }
      validation: {
        enable: true
        message: 'is invalid'
        target: true
        result: true
      }
    }})

    assert.isTrue(ko.validation.utils.isValidatable(typed))
    assert.isTrue(ko.validation.utils.isValidatable(base))

    assert.equal(typed.error(), 'is invalid')
    assert.equal(base.error(), 'is invalid')

    typed('not a number')

    assert.equal(typed.error(), 'is invalid')
    assert.equal(base.error(), 'is invalid')

    typed(10)

    assert.equal(typed.error(), null)
    assert.equal(base.error(), null)
  )

  test('validation.result / validation.target', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Undefined'
      validation: {
        enable: true
        target: false
        result: false
      }
    }})
    assert.isFalse(ko.validation.utils.isValidatable(base))
    assert.isFalse(ko.validation.utils.isValidatable(typed))

    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Undefined'
      validation: {
        enable: true
        target: true
        result: false
      }
    }})
    assert.isTrue(ko.validation.utils.isValidatable(base))
    assert.isFalse(ko.validation.utils.isValidatable(typed))

    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Undefined'
      validation: {
        enable: true
        target: false
        result: true
      }
    }})
    assert.isFalse(ko.validation.utils.isValidatable(base))
    assert.isTrue(ko.validation.utils.isValidatable(typed))

    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Undefined'
      validation: {
        enable: true
        target: true
        result: true
      }
    }})
    assert.isTrue(ko.validation.utils.isValidatable(base))
    assert.isTrue(ko.validation.utils.isValidatable(typed))
  )

  test('irrelevant', () ->

    assert.isFalse(ko.validation.utils.isValidatable(ko.observable().extend({ type: {
      type: 'Undefined'
      validation: {
        enable: true
        read: false
        write: false
      }
    }})))
  )

  test('validation.read: false', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Number'
      exRead: {
        catch: true
        useDefault: true
        defaultValue: 0
      }
      exWrite: {
        catch: true
        noThrow: true
      }
      validation: {
        enable: true
        read: false
        write: true
      }
    }})

    assert.equal(typed.error(), null)

    typed('not a number')

    assert.equal(typed.error(), 'Unexpected external type. Expected Number, received String')

    typed(10)

    assert.equal(typed.error(), null)
  )

  test('validation.write: false', () ->
    base = ko.observable()
    typed = base.extend({ type: {
      type: 'Number'
      exRead: {
        catch: true
        useDefault: true
        defaultValue: 0
      }
      exWrite: {
        catch: true
        noThrow: true
      }
      validation: {
        enable: true
        read: true
        write: false
      }
    }})

    assert.equal(typed.error(), 'Unexpected internal type. Expected Number, got Undefined')

    typed('not a number')

    assert.equal(typed.error(), 'Unexpected internal type. Expected Number, got Undefined')

    typed(10)

    assert.equal(typed.error(), null)
  )

)
