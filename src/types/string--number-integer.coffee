  ko.typed.addConverter(
    'String',
    'Number.Integer',
    (value, options) ->
      if options.trim
        value = value.trim()

      if options.base == 10 and not options.strict
        try
          return ko.typed.getConverter('String', 'Number')(value, 0)
        catch ex
          throw new TypeError("Unable to convert from #{value} to Number.Integer")

      chars = '0123456789abcdefghijklmnopqrstuvwxyz'
      if not RegExp("^(\\-|\\+)?[#{chars.slice(0, options.base ? 10)}]+$", if not options.strict then 'i').test(value)
        throw new TypeError("Unable to convert from #{value} to Number.Integer")

      return parseInt(value, options.base)
    {
      base: 10
      strict: false
      trim: false
    }
    'base'
  )
