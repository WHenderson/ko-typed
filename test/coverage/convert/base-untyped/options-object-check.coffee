assert = require('chai').assert

suite('object (check)', () ->

  test('External.Internal.check on read, convert', () ->
    base = ko.observable()
    convert = base.extend({
      convert: {
        String: {
          Undefined: {
            read: () -> 'String.Undefined.read'
            check: () -> false
          }
          read: () -> 'String.read'
        }
        read: () -> '.read'
      }
    })

    assert.strictEqual(convert(), 'String.read')
  )

  test('External.Internal.check on read', () ->
    base = ko.observable('')
    convert = base.extend({
      convert: {
        String: {
          String: {
            read: () -> 'String.Undefined.read'
            check: () -> false
          }
          read: () -> 'String.read'
        }
        read: () -> '.read'
      }
    })

    assert.strictEqual(convert(), 'String.read')
  )

  test('External.check on read', () ->
    base = ko.observable('')
    convert = base.extend({
      convert: {
        String: {
          String: {
            read: () -> 'Undefined.Undefined.read'
            check: () -> false
          }
          read: () -> 'Undefined.read'
          check: () -> false
        }
        read: () -> '.read'
      }
    })

    assert.strictEqual(convert(), '.read')
  )

  test('.check on read', () ->
    base = ko.observable('')
    convert = base.extend({
      convert: {
        String: {
          String: {
            read: () -> 'Undefined.Undefined.read'
            check: () -> false
          }
          read: () -> 'Undefined.read'
          check: () -> false
        }
        read: () -> '.read'
        check: () -> false
      }
    })

    assert.throws(() -> convert())
  )

  test('.check on write', () ->
    base = ko.observable('')
    convert = base.extend({
      convert: {
        check: () -> false
      }
    })

    assert.throws(() -> convert('fail'))
  )

)
