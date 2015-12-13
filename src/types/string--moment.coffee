  ko.typed.addConverter(
    'String'
    'Moment'
    (value, options) ->
      if options.trim
        value = value.trim()

      result = (moment ? require('moment'))(value, options.format, options.language, options.strict)
      if not result.isValid()
        throw new TypeError("Unable to convert from #{value} to Moment")

      return result
    {
      strict: false
      language: 'en'
      format: 'L'
      trim: false
    }
    'format'
  )
