  ko.typeRestricted.addConverter(
    'Moment'
    'Date'
    (value, options) ->
      value.toDate()
  )
