  ko.typed.addConverter(
    'Undefined',
    'Date',
    (value) ->
      return new Date(NaN)
  )
