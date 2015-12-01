assert = require('chai').assert
util = require('util')

suite('coverage', () ->
  ko = null
  isAn = null
  setup(() ->
    ko = require('../dist/ko-type-restricted.coffee')
    #ko = require('../dist/ko-type-restricted.node.js')
    isAn = require('is-an')
  )

  suite('type', () ->
    suite('string', () ->
      test('single type', () ->
        base = ko.observable()
        typed = base.extend({ type: 'Number' })

        try
          typed()
        catch ex

        assert.isDefined(ex)
        assert.instanceOf(ex, TypeError)

        typed(10)
        assert.strictEqual(base(), typed())
        assert.strictEqual(base(), 10)

        try
          typed('invalid type')
        catch ex2

        assert.isDefined(ex2)
        assert.instanceOf(ex2, TypeError)
        assert.strictEqual(base(), typed())
        assert.strictEqual(base(), 10)
      )

      test('multiple types', () ->
        base = ko.observable()
        typed = base.extend({ type: 'Undefined|Number' })

        assert.strictEqual(base(), typed())

        typed(10)
        assert.strictEqual(base(), typed())
        assert.strictEqual(base(), 10)

        typed(undefined)
        assert.strictEqual(base(), typed())
        assert.strictEqual(base(), undefined)

        try
          typed('invalid type')
        catch ex

        assert.isDefined(ex)
        assert.instanceOf(ex, TypeError)
        assert.strictEqual(base(), typed())
        assert.strictEqual(base(), undefined)
      )
    )

    suite('array', () ->
      test('array', () ->
        base = ko.observable()
        typed = base.extend({
          type: ['Undefined', 'String']
        })

        assert.equal(typed.typeName, 'Undefined|String')
      )
    )

    suite('function', () ->
      test('custom type', () ->
        base = ko.observable()
        typed = base.extend({ type: (value) -> value == 10 })

        try
          typed()
        catch ex

        assert.isDefined(ex)
        assert.instanceOf(ex, TypeError)

        typed(10)
        assert.strictEqual(base(), typed())
        assert.strictEqual(base(), 10)

        try
          typed('invalid type')
        catch ex2

        assert.isDefined(ex2)
        assert.instanceOf(ex2, TypeError)
        assert.strictEqual(base(), typed())
        assert.strictEqual(base(), 10)
      )
    )

    suite('object', () ->
      test('single type', () ->
        base = ko.observable()
        typed = base.extend({
          type: {
            Custom: (value) -> value == 10
            ignored: true
          }
        })

        try
          typed()
        catch ex

        assert.isDefined(ex)
        assert.instanceOf(ex, TypeError)

        typed(10)
        assert.strictEqual(base(), typed())
        assert.strictEqual(base(), 10)

        try
          typed('invalid type')
        catch ex2

        assert.isDefined(ex2)
        assert.instanceOf(ex2, TypeError)
        assert.strictEqual(base(), typed())
        assert.strictEqual(base(), 10)
      )

      test('multiple types', () ->
        base = ko.observable()
        typed = base.extend({
          type: {
            type: 'Undefined|Custom'
            Custom: (value) -> value == 10
          }
        })

        assert.strictEqual(base(), typed())

        typed(10)
        assert.strictEqual(base(), typed())
        assert.strictEqual(base(), 10)

        typed(undefined)
        assert.strictEqual(base(), typed())
        assert.strictEqual(base(), undefined)

        try
          typed('invalid type')
        catch ex

        assert.isDefined(ex)
        assert.instanceOf(ex, TypeError)
        assert.strictEqual(base(), typed())
        assert.strictEqual(base(), undefined)
      )
    )
  )

  suite('convert', () ->
    suite('untyped base', () ->
      suite('string', () ->
        test('single type', () ->
          base = ko.observable()
          convert = base.extend({
            convert: 'Number'
          })

          try
            convert()
          catch ex

          assert.isDefined(ex)
          assert.instanceOf(ex, TypeError)

          convert(10)

          assert.strictEqual(convert(), 10)
          assert.strictEqual(base(), 10)

          try
            convert(undefined)
          catch ex2

          assert.isDefined(ex2)
          assert.instanceOf(ex2, TypeError)
          assert.strictEqual(base(), convert())
          assert.strictEqual(base(), 10)
        )

        test('multiple types', () ->
          base = ko.observable()
          convert = base.extend({
            convert: 'Undefined|Number'
          })

          assert.strictEqual(base(), convert())

          convert(10)
          assert.strictEqual(base(), convert())
          assert.strictEqual(base(), 10)

          convert(undefined)
          assert.strictEqual(base(), convert())
          assert.strictEqual(base(), undefined)

          try
            convert('invalid type')
          catch ex

          assert.isDefined(ex)
          assert.instanceOf(ex, TypeError)
          assert.strictEqual(base(), convert())
          assert.strictEqual(base(), undefined)
        )
      )

      suite('object', () ->
        test('empty', () ->
          base = ko.observable()
          convert = base.extend({
            convert: {}
          })

          assert.strictEqual(base(), convert())
          convert(10)
          assert.strictEqual(base(), convert())
          base(20)
          assert.strictEqual(base(), convert())
        )

        test('single type', () ->
          base = ko.observable()
          convert = base.extend({
            convert: {
              Number: {}
            }
          })

          try
            convert()
          catch ex

          assert.isDefined(ex)
          assert.instanceOf(ex, TypeError)

          convert(10)

          assert.strictEqual(base(), convert())
          assert.strictEqual(base(), 10)

          try
            convert(undefined)
          catch ex2

          assert.isDefined(ex2)
          assert.instanceOf(ex2, TypeError)
          assert.strictEqual(base(), convert())
          assert.strictEqual(base(), 10)
        )

        test('multiple types', () ->
          base = ko.observable()
          convert = base.extend({
            convert: {
              Undefined: {}
              Number: {}
              ignored: true
            }
          })

          assert.strictEqual(base(), convert())

          convert(10)
          assert.strictEqual(base(), convert())
          assert.strictEqual(base(), 10)

          convert(undefined)
          assert.strictEqual(base(), convert())
          assert.strictEqual(base(), undefined)

          try
            convert('invalid type')
          catch ex

          assert.isDefined(ex)
          assert.instanceOf(ex, TypeError)
          assert.strictEqual(base(), convert())
          assert.strictEqual(base(), undefined)
        )

        test('custom type', () ->
          base = ko.observable('test')
          convert = base.extend({
            convert: {
              read: (value) -> value.toUpperCase()
              write: (value) -> value.toLowerCase()
            }
          })

          assert.strictEqual(base(), 'test')
          assert.strictEqual(convert(), 'TEST')

          convert('ThisIsATest')

          assert.strictEqual(base(), 'thisisatest')
          assert.strictEqual(convert(), 'THISISATEST')
        )

        test('mixed types', () ->
          base = ko.observable('test')
          convert = base.extend({
            convert: {
              Undefined: {}
              Custom: {
                check: (value) -> typeof value == 'string'
                write: (value) -> value.toLowerCase()
                String: {
                  read: (value) -> value.toUpperCase()
                }
              }
            }
          })

          assert.strictEqual(base(), convert().toLowerCase())
          assert.strictEqual(base().toUpperCase(), convert())

          convert('ThisIsATest')

          assert.strictEqual(base(), convert().toLowerCase())
          assert.strictEqual(base().toUpperCase(), convert())

          convert(undefined)
          assert.strictEqual(base(), convert())

          convert('AnotherTest')

          assert.strictEqual(base(), convert().toLowerCase())
          assert.strictEqual(base().toUpperCase(), convert())

          base(undefined)
          assert.strictEqual(base(), convert())
        )

        test('unchecked custom type', () ->
          base = ko.observable()
          convert = base.extend({
            convert: {
              Custom: {
                write: (value) ->
                  10
              }
            }
          })

          convert(20)
          assert.equal(base(), 10)
        )

        test('ignore defaults', () ->
          base = ko.observable().extend({
            type: 'Undefined'
          })

          do ->
            convert = base.extend({
              convert: {
                String: {
                }
              }
            })

            convert()

            try
              assert.equal(convert(), '')
            catch exRead

            assert.isUndefined(exRead)

            try
              convert('')
            catch exWrite

            assert.isUndefined(exWrite)
            assert.equal(convert(), '')

          do ->
            convert = base.extend({
              convert: {
                String: {
                }
                ignoreDefaultConverters: true
              }
            })

            try
              convert()
            catch exRead

            assert.isDefined(exRead)
            assert.instanceOf(exRead, TypeError)

            try
              convert('')
            catch exWrite

            assert.isDefined(exWrite)
            assert.instanceOf(exWrite, TypeError)
        )

        test('alternate internal type', () ->
          base = ko.observable(10).extend({
            type: 'Undefined|Number'
          })
          convert = base.extend({
            convert: {
              String: {
                Number:
                  read: (value) ->
                    value.toString()
                  write: (value) ->
                    parseInt(value)
              }
            }
          })

          assert.equal(convert(), '10')
        )

        test('custom read generic internal', () ->
          base = ko.observable('ThisIsAValue')
          convert = base.extend({
            convert: {
              String: {
                read: (value) ->
                  value.toUpperCase()
              }
            }
          })

          assert.equal(convert(), 'THISISAVALUE')
        )

        test('custom check, no change', () ->
          base = ko.observable()
          convert = base.extend({
            convert: {
              check: () -> true
            }
          })

          convert('No change')

          assert.equal(convert(), 'No change')
        )

        test('check specific', () ->
          base = ko.observable()
          convert = base.extend({
            convert: {
              String: {
                Number: {
                  check: (value) ->
                    /^[0-9]+$/.test(value)
                }
                Boolean: {
                  check: (value) ->
                    value == 'T' or value == 'F'

                  read: (value) ->
                    if value then 'T' else 'F'
                  write: (value) ->
                    value == 'T'
                }
              }
            }
          })

          convert('123')
          assert.equal(base(), 123)
          assert.equal(convert(), '123')

          convert('T')
          assert.equal(base(), true)
          assert.equal(convert(), 'T')

          convert('F')
          assert.equal(base(), false)
          assert.equal(convert(), 'F')
        )
      )

      suite('mixed', () ->
        test('discrete', () ->
          base = ko.observable()
          convert = base.extend({
            convert: {
              type: 'Undefined'
              String: {
              }
            }
          })

          assert.equal(convert.typeName, 'Undefined|String')
        )

        test('overlap', () ->
          base = ko.observable()
          convert = base.extend({
            convert: {
              type: 'Undefined|String'
              Undefined: {
              }
              String: {
              }
            }
          })

          assert.equal(convert.typeName, 'Undefined|String')
        )

        test('specific discrete', () ->
          base = ko.observable()
          convert = base.extend({
            convert: {
              String: {
                type: 'Undefined'
                Number: {}
              }
            }
          })

          convert()
          base(10)
          convert()
          base('')
          try
            convert()
          catch ex

          assert.isDefined(ex)
          assert.instanceOf(ex, TypeError)
        )

        test('specific overlap', () ->
          base = ko.observable()
          convert = base.extend({
            convert: {
              String: {
                type: 'Undefined'
                Undefined: {}
                Number: {}
              }
            }
          })

          convert()
          base(10)
          convert()
          base('')
          try
            convert()
          catch ex

          assert.isDefined(ex)
          assert.instanceOf(ex, TypeError)
        )
      )
    )
    suite('typed base', () ->
      suite('string', () ->
        test('single type', () ->
          base = ko.observable(0).extend({
            type: 'Number'
          })
          convert = base.extend({
            convert: 'String'
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
      )

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
    )

    suite('forced errors', () ->
      test('failed read conversion', () ->
        base = ko.observable()
        convert = base.extend({
          convert: {
            read: (value) ->
              throw new Error('Fail Read')
            write: (value) ->
              throw new Error('Fail Write')
          }
        })

        try
          convert()
        catch exRead

        assert.isDefined(exRead)
        assert.instanceOf(exRead, Error)
        assert.equal(exRead.message, 'Fail Read')

        try
          convert(10)
        catch exWrite

        assert.isDefined(exWrite)
        assert.instanceOf(exWrite, Error)
        assert.equal(exWrite.message, 'Fail Write')
      )

      test('failed unnamed type check', () ->
        base = ko.observable()
        convert = base.extend({
          convert: {
            check: (value) ->
              false
          }
        })

        try
          convert()
        catch ex

        assert.isDefined(ex)
        assert.instanceOf(ex, TypeError)
        assert.equal(ex.message, 'Unable to convert from internal type Undefined')
      )
    )
  )
)
