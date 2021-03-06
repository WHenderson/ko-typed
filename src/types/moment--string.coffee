  ko.typed.addConverter(
    'Moment'
    'String'
    (value, options) ->
      if not value.isValid()
        return ''

      return value.locale(options.locale).format(options.format)
    {
      locale: 'en'
      format: 'L'
    }
    'format'
  )
