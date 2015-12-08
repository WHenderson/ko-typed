  ko.typeRestricted.addConverter(
    'Number'
    'Number.Integer'
    (value, options) ->
      if typeof options.mode == 'string'
        mode = Math[options.mode]
      else
        mode = options.mode

      return mode(value)
    {
      mode: 'round'
    }
    'mode'
  )
