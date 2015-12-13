  ko.typed.addConverter(
    'Date'
    'String'
    (value, options) ->
      if isNaN(value.valueOf())
        return ''

      method = options.formats[options.format]
      return value[method].apply(value, options.params)

    {
      formats: {
        date: 'toDateString'
        iso: 'toISOString'
        json: 'toJSON'
        localeDate: 'toLocaleDateString'
        localeTime: 'toLocaleTimeString'
        locale: 'toLocaleString'
        time: 'toTimeString'
        utc: 'toUTCString'
        default: 'toString'
      }
      format: 'default'
      params: []
    }
    'format'
  )
