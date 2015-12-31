  ko.typed.addConverter(
    'String'
    'Date'
    (value, options) ->
      if options.trim
        value = value.trim()

      if options.strict
        match = value.match(options.format)
        if not match?
          throw TypeError('Unable to convert from String to Date')

        num = (value, def) ->
          if (value? and value != '') then parseFloat(value) else def

        tz = undefined
        if match[7]? and match[7] != ''
          tz = (num(match[options.formatDict.tzHours]) * 60 + num(match[options.formatDict.tzMinutes])) * 60 * 1000
          if match[options.formatDict.tzSign] == '-'
            tz *= -1

        if options.utc or tz?
          time = Date.UTC(
            num(match[options.formatDict.year], 0)
            num(match[options.formatDict.month], 1) - 1
            num(match[options.formatDict.day], 1)
            num(match[options.formatDict.hours], 0)
            num(match[options.formatDict.minutes], 0)
            num(match[options.formatDict.seconds], 0)
          )

          if tz?
            time += tz

          date = new Date(time)
        else
          date = new Date(
            num(match[options.formatDict.year], 0)
            num(match[options.formatDict.month], 1) - 1
            num(match[options.formatDict.day], 1)
            num(match[options.formatDict.hours], 0)
            num(match[options.formatDict.minutes], 0)
            num(match[options.formatDict.seconds], 0)
          )

          date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
      else
        date = new Date(value)

      if isNaN(date.valueOf())
        throw TypeError('Unable to convert from String to Date')

      return date
    {
      # https://www.debuggex.com/r/FnDf90hqnGul1ZYu/0
      format: /^([0-9]{4})-([0-9]{2})-([0-9]{2})(?:(?:T|\s)([0-9]{2}):([0-9]{2})(?::([0-9]{2}(?:.[0-9]+)?))?(?:(\+|\-)([0-9]{2}):([0-9]{2}))?)?$/
      formatDict: {
        year: 1
        month: 2
        day: 3
        hours: 4
        minutes: 5
        seconds: 6
        tzSign: 7
        tzHours: 8
        tzMinutes: 9
      }
      utc: false
      strict: true
      trim: false
    }
  )
