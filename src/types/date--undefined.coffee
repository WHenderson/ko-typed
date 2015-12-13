  ko.typed.addConverter(
    'Date',
    'Undefined',
    (value, options) ->
      if not isNaN(value.valueOf())
        throw new TypeError('Unable to convert from valid Date to Undefined')

      return undefined
  )
