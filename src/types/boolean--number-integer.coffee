  ko.typeRestricted.addConverter(
    'Boolean'
    'Number.Integer'
    (value, options) ->
      return if value then options.truthy else options.falsey
    {
      truthy: 1
      falsey: 0
    }
    'truthy'
  )
