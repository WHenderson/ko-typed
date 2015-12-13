  ko.typed.addConverter(
    'Number.Integer'
    'Boolean'
    (value, options) ->
      if options.falsey? and value == options.falsey
        return false
      else if options.truthy? and value == options.truthy
        return true
      else if not options.falsey?
        return false
      else if not options.truthy?
        return true

      throw new TypeError("Cannot convert from #{value} to Boolean")
    {
      truthy: undefined
      falsey: 0
    }
  )
