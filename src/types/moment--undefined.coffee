  ko.typed.addConverter(
    'Moment',
    'Undefined',
    (value, options) ->
      if value.isValid()
        throw new TypeError('Unable to convert from valid Moment to Undefined')

      return undefined
  )
