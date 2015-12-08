assert = require('chai').assert

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
