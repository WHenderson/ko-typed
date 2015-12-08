  ko.typeRestricted.addConverter(
    'Moment'
    'String'
    (value, options) ->
      if not value.isValid()
        return ''

      return value.locale(options.locale).format(options.format)
    {
      strict: false
      locale: 'en'
      format: 'L'
    }
    'format'
  )
