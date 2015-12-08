  ko.typeRestricted.addConverter(
    'Date'
    'Moment'
    (value, options) ->
      (moment ? require('moment'))(value)
  )
