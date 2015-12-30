assert = require('chai').assert

suite('untyped base', () ->

  #require('./options-string')

  #require('./options-object')

  #require('./options-object-check')

  #require('./options-mixed')

  suite('no conversion', () ->
    test('options.type: "TypeName"', () ->
      base = ko.observable()
      convert = base.extend({ convert: { type: 'Undefined' } })

      assert.typed(convert, {
        typeName: 'Undefined'
        invalidValue: 42
        validValues: {
          Undefined: undefined
        }
      })

      assert.write(base, undefined).read(convert, undefined)
      assert.writeThrows(convert, 42, true, TypeError, 'Unable to convert from external type Number').read(base, undefined)
      assert.write(convert, undefined).read(base, undefined)
      assert.write(base, 42).readThrows(convert, true, TypeError, 'Unable to convert from internal type Number to external type Undefined')
      assert.write(base, undefined).read(convert, undefined)
    )

    test('options: "TypeName"', () ->
      base = ko.observable()
      convert = base.extend({ convert: 'Undefined' })

      assert.typed(convert, {
        typeName: 'Undefined'
        invalidValue: 42
        validValues: {
          Undefined: undefined
        }
      })

      assert.write(base, undefined).read(convert, undefined)
      assert.writeThrows(convert, 42, true, TypeError, 'Unable to convert from external type Number').read(base, undefined)
      assert.write(convert, undefined).read(base, undefined)
      assert.write(base, 42).readThrows(convert, true, TypeError, 'Unable to convert from internal type Number to external type Undefined')
      assert.write(base, undefined).read(convert, undefined)
    )

  )
)
