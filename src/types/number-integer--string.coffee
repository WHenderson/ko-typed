  ko.typed.addConverter(
    'Number.Integer'
    'String',
    (value, options) ->
      value = value.toString(options.base)
      if options.upperCase
        value = value.toUpperCase()

      return value
    {
      base: 10
      upperCase: false
    }
    'base'
  )
