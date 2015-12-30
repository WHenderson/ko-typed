  ko.typed.addConverter(
    'Number'
    'Number.Integer'
    (value, options) ->
      if not options.mode?
        if not isAn.Number.Integer(value)
          throw new TypeError('Cannot convert from Number to Number.Integer. Number is not an integer')
        return value
      else if typeof options.mode == 'string'
        mode = Math[options.mode]
      else
        mode = options.mode

      return mode(value)
    {
      mode: undefined
    }
    'mode'
  )
