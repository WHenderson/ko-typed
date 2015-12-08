  ko.typeRestricted.addConverter(
    'Undefined',
    'Date',
    (value) ->
      return new Date('')
  )
