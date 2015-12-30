assert = require('chai').assert

suite('custom convert', () ->

  test('custom convert exact', () ->
    base = ko.observable().extend({ type: 'Number' })
    convert = base.extend({ convert: {
      Number: {
        Number: {
          read: (value) -> value + 1
          write: (value) -> value - 1
        }
      }
    }})

    assert.write(base, 42).read(convert, 43)
    assert.write(convert, 42).read(base, 41)
  )

  test('custom convert exact - fail', () ->
    base = ko.observable().extend({ type: 'Number' })
    convert = base.extend({ convert: {
      type: 'Number'
      Number: {
        Number: {
          read: (value) -> throw TypeError('read')
          write: (value) -> throw TypeError('write')
        }
      }
    }})

    assert.write(base, 42).readThrows(convert, true, TypeError, 'Unable to convert from internal type Number to external type Number')
    assert.writeThrows(convert, 42, true, TypeError, 'Unable to convert from external type Number to internal type Number').read(base, 42)
  )

  test('custom convert specific', () ->
    base = ko.observable().extend({ type: 'Number' })
    convert = base.extend({ convert: {
      type: 'Number'
      Number: {
        read: (value) -> value + 1
        write: (value) -> value - 1
      }
    }})

    assert.write(base, 42).read(convert, 43)
    assert.write(convert, 42).read(base, 41)
  )

  test('custom convert generic', () ->
    base = ko.observable().extend({ type: 'Number' })
    convert = base.extend({ convert: {
      type: 'Number'
      read: (value) -> value + 1
      write: (value) -> value - 1
    }})

    assert.write(base, 42).read(convert, 43)
    assert.write(convert, 42).read(base, 41)
  )

)

