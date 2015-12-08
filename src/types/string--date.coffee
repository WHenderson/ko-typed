  ko.typeRestricted.addConverter(
    'String'
    'Date'
    (value, options) ->
      if options.trim
        value = value.trim()

      date = new Date(value)
      if isNaN(date.valueOf())
        throw TypeError("Unable to convert from #{value} to Date")

      return date
    {
      trim: false
    }
  )
