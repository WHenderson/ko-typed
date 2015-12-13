  ko.typed.addConverter(
    'Moment'
    'Date'
    (value, options) ->
      value.toDate()
  )
