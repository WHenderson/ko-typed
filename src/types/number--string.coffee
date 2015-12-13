  ko.typed.addConverter(
    'Number'
    'String'
    (value, options) ->
      if options.decimals?
        value = Math.round10(value, -options.decimals)
        value = value.toFixed(options.decimals)
      else
        value = value.toString()

      return value
    {
      decimals: undefined
    }
    'decimals'
  )
