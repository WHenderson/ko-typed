  ko.typeRestricted.addConverter(
    'String',
    'Undefined',
    (value, options) ->
      if options.trim
        value = value.trim()

      if value.length != 0
        throw new TypeError("Unable to convert from #{value} to Undefined")

      return undefined
    {
      trim: false
    }
  )
