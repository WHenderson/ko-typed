  ko.typeRestricted.addConverter(
    'String'
    'Number'
    (value, options) ->
      if options.trim
        value = value.trim()

      if not /^(\+|\-)?[0-9]+(\.?)[0-9]*$/.test(value)
        throw new TypeError("Unable to convert from #{value} to Number")

      value = parseFloat(value, options.base)

      if options.decimals?
        value = Math.round10(value, -options.decimals)

      return value
    {
      decimals: undefined
      trim: false
    }
    'decimals'
  )
