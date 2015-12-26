assert = require('chai').assert

suite('object', () ->
  test('single type', () ->
    base = ko.observable(0).extend({
      type: 'Number'
    })
    convert = base.extend({
      convert: {
        String: {}
      }
    })

    assert.strictEqual(convert(), '0')
    assert.strictEqual(base(), 0)

    convert('10')

    assert.strictEqual(convert(), '10')
    assert.strictEqual(base(), 10)

    try
      convert('xyz')
    catch ex2

    assert.isDefined(ex2)
    assert.instanceOf(ex2, TypeError)
    assert.strictEqual(convert(), '10')
    assert.strictEqual(base(), 10)
  )

  test('custom type', () ->
    base = ko.observable(0).extend({
      type: 'Number'
    })
    convert = base.extend({
      convert: {
        read: (value) -> value + 1000
        write: (value) -> value - 1000
      }
    })

    assert.strictEqual(base(), 0)
    assert.strictEqual(convert(), 1000)

    convert(1010)

    assert.strictEqual(base(), 10)
    assert.strictEqual(convert(), 1010)
  )

  test('mixed types', () ->
    base = ko.observable(0).extend({
      type: 'Number'
    })
    convert = base.extend({
      convert: {
        Undefined: {
          write: (value) -> 0
        }
        String: {
          check: (value) -> typeof value == 'string' and /^([0-9a-f]+)$/.test(value)
          write: (value) -> parseInt(value, 16)
          Number: {
            read: (value) -> value.toString(16)
          }
        }
      }
    })

    assert.strictEqual(base(), 0)
    assert.strictEqual(convert(), '0')

    convert('1f')

    assert.strictEqual(base(), 31)
    assert.strictEqual(convert(), '1f')

    convert(undefined)

    assert.strictEqual(base(), 0)
    assert.strictEqual(convert(), '0')
  )

  test('specific type, custom write', () ->
    base = ko.observable().extend({
      type: 'String'
    })
    convert = base.extend({
      convert: {
        Number: {
          String: {
            write: (value) ->
              value.toFixed(4)
          }
        }
      }
    })

    convert(1.12345)

    assert.equal(base(), '1.1235')
  )

  test('multiple target types', () ->
    base = ko.observable().extend({
      type: 'Number|Undefined'
    })
    convert = base.extend({
      convert: 'Undefined|Number'
    })

    assert.strictEqual(convert(), undefined)
    base(10)
    assert.strictEqual(convert(), 10)
    base(undefined)
    assert.strictEqual(convert(), undefined)
  )

  test('knockout-validation', () ->
    require('knockout.validation')

    typed = ko.observable().extend({
      type: {
        type: 'Number'
        exRead: {
          useDefault: true
          defaultValue: 42
        }
        exWrite: {
          noThrow: true
        }
        deferEvaluation: false
        validation: {
          enable: true
        }
      }
    })

    assert.equal(typed.error(), 'Unexpected internal type. Expected Number, got Undefined')

    typed = ko.observable().extend({
      type: {
        type: 'Number'
        exRead: {
          useDefault: true
          defaultValue: 42
        }
        exWrite: {
          noThrow: true
        }
        deferEvaluation: false
        validation: {
          enable: true
          message: 'invalid value'
        }
      }
    })

    assert.equal(typed.error(), 'invalid value')

  )
)
