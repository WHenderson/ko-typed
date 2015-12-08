  ko.typeRestricted.addConverter(
    'Undefined',
    'String',
    (value) ->
      return ''
  )
