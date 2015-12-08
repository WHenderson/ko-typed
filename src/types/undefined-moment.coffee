  ko.typeRestricted.addConverter(
    'Undefined',
    'Moment',
    (value) ->
      return require('moment')('')
  )
