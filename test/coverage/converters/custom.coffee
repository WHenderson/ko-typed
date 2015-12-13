assert = require('chai').assert

suite('custom', () ->
  test('custom', () ->
    ko.typed.addConverter(
      'Undefined'
      'Custom'
      (value) ->
        'Simple'
    )

    converter = ko.typed.getConverter('Undefined', 'Custom')

    assert.isDefined(converter)
    assert.strictEqual(converter(undefined), 'Simple')

    ko.typed.removeConverter('Undefined', 'Custom')

    # Shouldn't throw an error even if it doesnt exist
    ko.typed.removeConverter('Undefined', 'Custom')

    converter = ko.typed.getConverter('Undefined', 'Custom')
    assert.isUndefined(converter)
  )
)
