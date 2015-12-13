  ko.typed.addConverter(
    'Boolean'
    'String'
    (value, options) ->
      value = if value then options.truthy else options.falsey

      if options.upperCase
        value = value.toUpperCase()

      return value
    {
      upperCase: false
      truthy: 'true'
      falsey: 'false'
    }
    'upperCase'
  )
