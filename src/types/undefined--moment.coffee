  ko.typed.addConverter(
    'Undefined',
    'Moment',
    (value) ->
      return require('moment').invalid()
  )
