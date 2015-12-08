assert = require('chai').assert

suite('custom', () ->
  test('custom', () ->
    ko.typeRestricted.addConverter(
      'Undefined'
      'Custom'
      (value) ->
        'Simple'
    )

    converter = ko.typeRestricted.getConverter('Undefined', 'Custom')

    assert.isDefined(converter)
    assert.strictEqual(converter(undefined), 'Simple')

    ko.typeRestricted.removeConverter('Undefined', 'Custom')

    # Shouldn't throw an error even if it doesnt exist
    ko.typeRestricted.removeConverter('Undefined', 'Custom')

    converter = ko.typeRestricted.getConverter('Undefined', 'Custom')
    assert.isUndefined(converter)
  )
)
