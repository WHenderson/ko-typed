  ko.typeRestricted.addConverter(
    'String',
    'Boolean',
    (value, options) ->
      if options.trim
        value = value.trim()

      if options.ignoreCase
        value = value.toLowerCase()

      if options.strict
        if value == options.truthy[0]
          return true
        else if value == options.falsey[0]
          return false
      else
        for truthy in options.truthy
          if value == truthy
            return true

        for falsey in options.falsey
          if value == falsey
            return false

      throw new TypeError("Cannot convert from #{value} to Boolean")
    {
      ignoreCase: true
      strict: false
      truthy: [
        'true'
        't'
        '1'
        '-1'
        'yes'
        'y'
      ]
      falsey: [
        'false'
        'f'
        '0'
        'no'
        'n'
      ]
      trim: false
    }
    'strict'
  )
