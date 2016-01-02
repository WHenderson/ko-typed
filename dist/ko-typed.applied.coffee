ko = require('knockout')
isAn = require('is-an')

applyKotr = (ko) ->
  ko.typed = {}

  fnTrue = () -> true
  fnFalse = () -> false
  fnIdentity = (x) -> x

  typeNameToString = (value) ->
    if not value? or value.length == 0
      return undefined
    else if isAn.String.Literal(value)
      return value
    else
      return value.join('|')

  typeNameToArray = (value) ->
    value = typeNameToString(value)
    if isAn.String.Literal(value)
      return value.split('|')
    else
      return []

  typeNameToDistinctArray = (value) ->
    value = typeNameToArray(value)

    result = []
    for typeName in value
      if result.indexOf(typeName) == -1
        result.push(typeName)

    return result

  isValidTypeName = (value) ->
    return /^[A-Z]/.test(value)

  isTyped = (value) ->
    return isAn.Function(value) and value.typeName? and value.typeNames? and value.typeCheck? and value.typeChecks?

  ko.typed.options = {
    # validation options
    validation: {
      # turn validation on/off
      enable: false

      # validate on read
      read: true

      # validate on write
      write: true

      # validate the underlying observable
      target: false

      # validate the resulting observable
      result: true

      # the message to use (defaults to the message from the thrown exception)
      message: undefined
    }

    exRead: {
      # Catch exceptions. May also be a function which returns true if the given exception should be caught
      catch: true

      # default catch function to use when catch is true/false
      catchTrue: (ex) -> ex instanceof TypeError
      catchFalse: fnFalse

      # Do not throw exceptions when reading. Use default value/func instead
      useDefault: false

      # Default value to use when an exception is caught
      defaultValue: undefined

      # Compute a default value when an exception is caught. Overrides defaultValue
      defaultFunc: undefined
    }
    exWrite: {
      # Catch exceptions. May also be a function which returns true if the given exception should be caught
      catch: true

      # default catch function to use when catch is true/false
      catchTrue: (ex) -> ex instanceof TypeError
      catchFalse: fnFalse

      # Do not throw exceptions when writing
      noThrow: false

      # Do not leave target unset. Set the target to this value on error
      useDefault: false

      # Default value to use when an exception is caught
      defaultValue: undefined

      # Compute a default value when an exception is caught. Overrides defaultValue
      defaultFunc: undefined
    }

    # use pure computed observables
    pure: true

    # do not attempt to read the value immediately
    deferEvaluation: true
  }

  extend = (root, objects...) ->
    for object in objects
      root = ko.utils.extend(root, object)
    return root

  normalizeEx = (name, root, objects...) ->
    root[name] = opt = extend({}, (object?[name] for own key, object of objects)...)

    # force catch to be a function
    if opt.catch == true
      opt.catch = opt.catchTrue
    else if opt.catch == false
      opt.catch = opt.catchFalse

    # force defaultFunc
    if opt.useDefault and not opt.defaultFunc?
      opt.defaultFunc = () -> opt.defaultValue

    return opt

  normalizeExRead = (root, objects...) ->
    normalizeEx('exRead', root, objects...)

  normalizeExWrite = (root, objects...) ->
    normalizeEx('exWrite', root, objects...)

  normalizeValidation = (root, objects...) ->
    norm = (v) ->
      if v == true
        return { enable: true }
      else if v == false
        return { enable: false }
      else
        return v

    root['validation'] = opt = extend({}, (norm(object?['validation']) for own key, object of objects)...)

    return opt

  wrapRead = (options, target, readError, read) ->
    return () ->
      try
        return read()
      catch ex
        if options.exRead.catch(ex)
          readError(ex)

          if options.exRead.useDefault
            return options.exRead.defaultFunc()

        throw ex
      finally
        if not ex?
          readError(undefined)

  wrapWrite = (options, target, writeError, write) ->
    return (value) ->
      try
        write(value)
      catch ex
        if options.exWrite.catch(ex)
          writeError(ex)

          if options.exWrite.useDefault
            target(options.exWrite.defaultFunc())

        if not options.exWrite.noThrow
          throw ex
      finally
        if not ex?
          writeError(undefined)

  validate = (target, result, options) ->
    if not options.validation.enable
      return

    validation = options.validation

    if (not validation.target and not validation.result) or (not validation.read and not validation.write)
      return

    if ko.validation?
      ###
      Note that using ko validation will force an immediate evaluation of the targetted observables
      ###
      if options.validation.read and options.validation.write
        message = () -> result.writeError()?.message ? result.readError()?.message
      else if options.validation.read
        message = () -> result.readError()?.message
      else #if options.validation.write
        message = () -> result.writeError()?.message

      applyValidation = (base) ->
        base.extend({ validatable: { enable: true } })

        rule = {
          message: undefined
          validator: () ->
            m = message()
            if not m?
              rule.message = undefined
              return true
            else
              rule.message = validation.message ? m
              return false
        }

        ko.validation.addAnonymousRule(base, rule)

        return

      if validation.target
        applyValidation(target)

      if validation.result
        applyValidation(result)

    return






  ko.extenders.type = (target, options) ->
    # Requires
    # typeName : String
    # typeNames : Array of String
    # typeCheck : function (value) { ... }
    # typeChecks : { typeName: function isType(value) { ... }, ... }

    if isAn.String.Literal(options) or isAn.Array(options)
      # .extend({ type: 'TypeName|TypeName|TypeName' })
      # .extend({ type: ['TypeName','TypeName',...] })
      options = { type: options }
    else if isAn.Function(options)
      # .extend({ type: function (value) { return true|false; } })
      options = {
        type: options.typeName
        check: options
      }

    normal = extend({}, ko.typed.options, ko.extenders.type.options, options)
    normalizeExRead(normal, ko.typed.options, ko.extenders.type.options, options)
    normalizeExWrite(normal, ko.typed.options, ko.extenders.type.options, options)
    normalizeValidation(normal, ko.typed.options, ko.extenders.type.options, options)
    options = normal

    # Gather type names
    typeNames = typeNameToArray(options.type)
    typeNames.push((name for own name of options when isValidTypeName(name))...)
    typeNames = typeNameToDistinctArray(typeNames)
    typeName = typeNameToString(typeNames)

    # simple checks
    typeChecksSimple = {}
    do ->
      for name in typeNames
        typeChecksSimple[name] = options[name] ? isAn(name, { returnChecker: true })

    # simple check
    typeCheckSimple = options.check ? (() -> true)

    # checks
    typeChecks = {}
    do ->
      for name, check of typeChecksSimple
        do (check) ->
          typeChecks[name] = (value) ->
            check(value) and typeCheckSimple(value)

    # check
    typeCheck = do ->
      return (value) ->
        typeCheckSimple(value) and ((typeNames.length == 0) or (typeNames.some((name) -> typeChecksSimple[name](value))))

    readError = ko.observable()
    writeError = ko.observable()

    result = ko.computed({
      pure: options.pure
      deferEvaluation: true

      read: wrapRead(
        options,
        target,
        readError,
        () ->
          internalValue = target()

          if not typeCheck(internalValue)
            throw new TypeError("Unexpected internal type. Expected #{typeName}, got #{isAn(internalValue)}")

          return internalValue
      )
      write: wrapWrite(
        options,
        target,
        writeError,
        (externalValue) ->
          if typeCheck(externalValue)
            target(externalValue)
          else
            throw new TypeError("Unexpected external type. Expected #{typeName}, received #{isAn(externalValue)}")

          return
      )
    })

    result.typeName = typeName
    result.typeNames = typeNames
    result.typeCheck = typeCheck
    result.typeChecks = typeChecks

    result.readError = readError
    result.writeError = writeError

    validate(target, result, options)

    if not options.deferEvaluation
      try
        result.peek()
      catch ex
        result.dispose()
        throw ex

    return result

  ko.extenders.type.options = {
  }


  ko.extenders.convert = (target, options) ->
    if options == false
      return target

    # normalize options
    do ->
      if isAn.String(options) or isAn.Array(options)
        options = { type: options }
      else if options == true
        options = {}

      # merge options
      options = extend({}, ko.typed.options, ko.extenders.convert.options, options)

      normal = {
        checkSelf: options.check ? fnTrue
        read: options.read
        write: options.write
        checks: {}
        checkers: []
        isTyped: isTyped(target)
        ignoreDefaultConverters: options.ignoreDefaultConverters
        pure: options.pure
        deferEvaluation: options.deferEvaluation
        types: typeNameToDistinctArray(options.type)
      }

      normalizeExRead(normal, ko.typed.options, ko.extenders.convert.options, options)
      normalizeExWrite(normal, ko.typed.options, ko.extenders.convert.options, options)
      normalizeValidation(normal, ko.typed.options, ko.extenders.convert.options, options)

      # Expand each External Type
      for own extTypeName, extTypeOptions of options
        if not isValidTypeName(extTypeName)
          continue

        extTypeOptions = options[extTypeName] ? {}

        normal[extTypeName] = {
          checkSelf: extTypeOptions.check
          read: extTypeOptions.read
          write: extTypeOptions.write
          types: typeNameToDistinctArray(extTypeOptions.type)
        }

        # Expand all internal types
        for own intTypeName of extTypeOptions
          if not isValidTypeName(intTypeName)
            continue

          intTypeOptions = options[extTypeName]?[intTypeName] ? {}

          normal[extTypeName][intTypeName] = {
            read: intTypeOptions.read
            write: intTypeOptions.write
          }

      normal.type = typeNameToString(normal.types)

      for extTypeName in normal.types
        checker = normal[extTypeName]?.checkSelf ? isAn(extTypeName, { returnChecker: true }) ? fnTrue
        normal.checks[extTypeName] = do (checker) ->
          (value) -> normal.checkSelf(value) and checker(value)
        normal.checkers.push(normal.checks[extTypeName])

      normal.check = (value) ->
        normal.checkSelf(value) and ((normal.checkers.length == 0) or normal.checkers.some((checker) -> checker(value)))

      options = normal


    readError = ko.observable()
    writeError = ko.observable()

    result = ko.computed({
      pure: options.pure
      deferEvaluation: true

      read: wrapRead(
        options,
        target,
        readError,
        () ->
          internalValue = target()
          externalValue = undefined

          # Try exact internal type match
          tryRead = (read, readOptions) ->
            if read?
              try
                externalValue = read(internalValue, readOptions)
              catch ex
                if ex not instanceof TypeError
                  throw ex

              if not ex?
                if options.check(externalValue)
                  return true

            return false

          extTypeNames = options.types
          if extTypeNames.length == 0
            extTypeNames = [isAn(internalValue)]

          # Look for specific conversion
          for extTypeName in extTypeNames
            extTypeOptions = options[extTypeName] ? {}

            # internal types
            intTypeNames = extTypeOptions.types ? []
            if intTypeNames.length == 0
              if options.isTyped
                # go by target order
                intTypeNames = target.typeNames
              else
                # go by inferred order
                intTypeNames = [isAn(internalValue)]

            for intTypeName in intTypeNames
              # check internal type
              if options.isTyped and not target.typeChecks[intTypeName]?(internalValue)
                continue

              # get the options
              intTypeOptions = extTypeOptions[intTypeName] ? {}

              # try custom conversion
              if intTypeOptions.read?
                if tryRead(intTypeOptions.read, intTypeOptions.readOptions)
                  return externalValue
              # try no conversion
              else if intTypeName == extTypeName
                if not extTypeOptions.read? and not options.read? and tryRead(fnIdentity)
                  return externalValue
              else if not options.ignoreDefaultConverters
                # try default conversion
                if tryRead(ko.typed.getConverter(intTypeName, extTypeName), intTypeOptions.readOptions)
                  return externalValue

          # Look for one-sided conversion
          for extTypeName in extTypeNames
            extTypeOptions = options[extTypeName] ? {}

            # try custom conversion
            if tryRead(extTypeOptions.read, extTypeOptions.readOptions)
              return externalValue

          # Look for generic conversion
          if tryRead(options.read, options.readOptions)
            return externalValue

          if options.type?
            throw new TypeError("Unable to convert from internal type #{isAn(internalValue)} to external type #{options.type}")
          else
            throw new TypeError("Unable to convert from internal type #{isAn(internalValue)}")
      )

      write: wrapWrite(
        options,
        target,
        writeError,
        (externalValue) ->
          tryWrite = (write, writeOptions) ->
            if write?
              try
                internalValue = write(externalValue, writeOptions)
              catch ex
                if ex not instanceof TypeError
                  throw ex

              if not ex?
                target(internalValue)
                return true

            return false

          if not options.checkSelf? or options.checkSelf(externalValue)
            extTypeNames = options.types
            if extTypeNames.length == 0
              extTypeNames = [isAn(externalValue)]

            # Look for specific conversion
            for extTypeName in extTypeNames
              extTypeOptions = options[extTypeName] ? {}

              if (extTypeOptions.checkSelf? and not extTypeOptions.checkSelf(externalValue)) or (not extTypeOptions.checkSelf? and not isAn(externalValue, extTypeName))
                continue

              # internal types
              intTypeNames = extTypeOptions.types ? []
              if intTypeNames.length == 0
                if options.isTyped
                  # go by target order
                  intTypeNames = target.typeNames
                else
                  # go by inferred order
                  intTypeNames = [isAn(externalValue)]

              for intTypeName in intTypeNames
                intTypeOptions = extTypeOptions[intTypeName] ? {}

                # try custom conversion
                if intTypeOptions.write?
                  if tryWrite(intTypeOptions.write, intTypeOptions.writeOptions)
                    return
                # try no conversion
                else if extTypeName == intTypeName
                  if not extTypeOptions.write? and not options.write? and (not options.isTyped or target.typeChecks[extTypeName](externalValue)) and tryWrite(fnIdentity)
                    return
                # try default conversion
                else if not options.ignoreDefaultConverters
                  if tryWrite(ko.typed.getConverter(extTypeName, intTypeName), intTypeOptions.writeOptions)
                    return

            # Look for one-sided conversion
            for extTypeName in extTypeNames
              extTypeOptions = options[extTypeName] ? {}

              if (extTypeOptions.checkSelf? and not extTypeOptions.checkSelf(externalValue)) or (not extTypeOptions.checkSelf? and not isAn(externalValue, extTypeName))
                continue

              # try custom conversion
              if tryWrite(extTypeOptions.write, extTypeOptions.writeOptions)
                return

            # Look for generic conversion
            if tryWrite(options.write, options.writeOptions)
              return

          if options.isTyped
            throw new TypeError("Unable to convert from external type #{isAn(externalValue)} to internal type #{target.typeName}")
          else
            throw new TypeError("Unable to convert from external type #{isAn(externalValue)}")
      )
    })

    result.typeName = options.type
    result.typeNames = options.types
    result.typeCheck = options.check
    result.typeChecks = options.checks

    result.readError = readError
    result.writeError = writeError

    validate(target, result, options)

    if not options.deferEvaluation
      try
        result.peek()
      catch ex
        result.dispose()
        throw ex

    return result

  ko.extenders.convert.options = {
  }


  do ->
    ko.typed._converters = converters = {}

    ko.typed.addConverter = (fromTypeName, toTypeName, converter, defaultOptions, defaultOption) ->
      console?.assert?(isValidTypeName(fromTypeName), "Invalid typeName #{fromTypeName}")
      console?.assert?(isValidTypeName(toTypeName), "Invalid typeName #{fromTypeName}")

      if defaultOptions?
        if defaultOption?
          wrapper = (value, options) ->
            if arguments.length == 2 and not isAn.Object(options)
              o = {}
              o[defaultOption] = options
              options = o

            return converter(value, ko.utils.extend(ko.utils.extend({}, wrapper.options), options))
        else
          wrapper = (value, options) ->
            return converter(value, ko.utils.extend(ko.utils.extend({}, wrapper.options), options))
      else
        wrapper = (value) ->
          return converter(value)

      wrapper.options = defaultOptions

      converters[fromTypeName] ?= {}
      converters[fromTypeName][toTypeName] = wrapper

      return ko.typed

    ko.typed.getConverter = (fromTypeName, toTypeName) ->
      converters[fromTypeName]?[toTypeName]

    ko.typed.removeConverter = (fromTypeName, toTypeName) ->
      if converters[fromTypeName]?[toTypeName]?
        delete converters[fromTypeName]?[toTypeName]

      return ko.typed

    return


  do ->
    ## https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Math/round
    decimalAdjust = (type, value, exp) ->
      # if exp is undefined or zero
      if not exp? or +exp == 0
        return type(value)

      value = +value
      exp = +exp

      # If the value it not a number of the exp is not an integer
      if (isNaN(value) or not (typeof exp == 'number' and exp % 1 == 0))
        return NaN

      # Shift
      value = value.toString().split('e')
      value = type(+(value[0] + 'e' + (if value[1] then (+value[1] - exp) else -exp)))

      # Shift back
      value = value.toString().split('e')
      return (+(value[0] + 'e' + (if value[1] then (+value[1] + exp) else exp)))

    ### !pragma coverage-skip-next ###
    if not Math.round10?
      Math.round10 = (value, exp) ->
        return decimalAdjust(Math.round, value, exp)

    ### !pragma coverage-skip-next ###
    if not Math.floor10?
      Math.floor10 = (value, exp) ->
        return decimalAdjust(Math.floor, value, exp)

    ### !pragma coverage-skip-next ###
    if not Math.ceil10?
      Math.ceil10 = (value, exp) ->
        return decimalAdjust(Math.ceil, value, exp)

    return

  ko.typed.addConverter(
    'Boolean'
    'Number.Integer'
    (value, options) ->
      return if value then options.truthy else options.falsey
    {
      truthy: 1
      falsey: 0
    }
    'truthy'
  )

  ko.typed.addConverter(
    'Boolean'
    'Number'
    (value, options) ->
      return if value then options.truthy else options.falsey
    {
      truthy: 1
      falsey: 0
    }
    'truthy'
  )

  ko.typed.addConverter(
    'Boolean'
    'String'
    (value, options) ->
      value = if value then options.truthy else options.falsey

      if options.upperCase
        value = value.toUpperCase()

      return value
    {
      upperCase: false
      truthy: 'true'
      falsey: 'false'
    }
    'upperCase'
  )

  ko.typed.addConverter(
    'Date'
    'Moment'
    (value, options) ->
      (moment ? require('moment'))(value)
  )

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

  ko.typed.addConverter(
    'Date',
    'Undefined',
    (value, options) ->
      if not isNaN(value.valueOf())
        throw new TypeError('Unable to convert from valid Date to Undefined')

      return undefined
  )

  ko.typed.addConverter(
    'Moment'
    'Date'
    (value, options) ->
      value.toDate()
  )

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

  ko.typed.addConverter(
    'Moment',
    'Undefined',
    (value, options) ->
      if value.isValid()
        throw new TypeError('Unable to convert from valid Moment to Undefined')

      return undefined
  )

  ko.typed.addConverter(
    'Number'
    'Boolean'
    (value, options) ->
      if options.falsey? and value == options.falsey
        return false
      else if options.truthy? and value == options.truthy
        return true
      else if not options.falsey?
        return false
      else if not options.truthy?
        return true

      throw new TypeError("Cannot convert from #{value} to Boolean")
    {
      truthy: undefined
      falsey: 0
    }
  )

  ko.typed.addConverter(
    'Number'
    'Number.Integer'
    (value, options) ->
      if not options.mode?
        if not isAn.Number.Integer(value)
          throw new TypeError('Cannot convert from Number to Number.Integer. Number is not an integer')
        return value
      else if typeof options.mode == 'string'
        mode = Math[options.mode]
      else
        mode = options.mode

      return mode(value)
    {
      mode: undefined
    }
    'mode'
  )

  ko.typed.addConverter(
    'Number'
    'String'
    (value, options) ->
      if options.decimals?
        value = Math.round10(value, -options.decimals)
        value = value.toFixed(options.decimals)
      else
        value = value.toString()

      return value
    {
      decimals: undefined
    }
    'decimals'
  )

  ko.typed.addConverter(
    'Number.Integer'
    'Boolean'
    (value, options) ->
      if options.falsey? and value == options.falsey
        return false
      else if options.truthy? and value == options.truthy
        return true
      else if not options.falsey?
        return false
      else if not options.truthy?
        return true

      throw new TypeError("Cannot convert from #{value} to Boolean")
    {
      truthy: undefined
      falsey: 0
    }
  )

  ko.typed.addConverter(
    'Number.Integer'
    'Number',
    (value, options) ->
      return value
  )

  ko.typed.addConverter(
    'Number.Integer'
    'String',
    (value, options) ->
      value = value.toString(options.base)
      if options.upperCase
        value = value.toUpperCase()

      return value
    {
      base: 10
      upperCase: false
    }
    'base'
  )

  ko.typed.addConverter(
    'String',
    'Boolean',
    (value, options) ->
      if options.trim
        value = value.trim()

      if options.ignoreCase
        value = value.toLowerCase()

      if options.strict
        if value == options.truthy[0]
          return true
        else if value == options.falsey[0]
          return false
      else
        for truthy in options.truthy
          if value == truthy
            return true

        for falsey in options.falsey
          if value == falsey
            return false

      throw new TypeError("Cannot convert from #{value} to Boolean")
    {
      ignoreCase: true
      strict: false
      truthy: [
        'true'
        't'
        '1'
        '-1'
        'yes'
        'y'
      ]
      falsey: [
        'false'
        'f'
        '0'
        'no'
        'n'
      ]
      trim: false
    }
    'strict'
  )

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

  ko.typed.addConverter(
    'String'
    'Moment'
    (value, options) ->
      if options.trim
        value = value.trim()

      result = (moment ? require('moment'))(value, options.format, options.language, options.strict)
      if not result.isValid()
        throw new TypeError('Unable to convert from String to Moment')

      return result
    {
      strict: false
      language: 'en'
      format: 'L'
      trim: false
    }
    'format'
  )

  ko.typed.addConverter(
    'String',
    'Number.Integer',
    (value, options) ->
      if options.trim
        value = value.trim()

      if options.base == 10 and not options.strict
        try
          return ko.typed.getConverter('String', 'Number')(value, 0)
        catch ex
          throw new TypeError("Unable to convert from #{value} to Number.Integer")

      chars = '0123456789abcdefghijklmnopqrstuvwxyz'
      if not RegExp("^(\\-|\\+)?[#{chars.slice(0, options.base ? 10)}]+$", if not options.strict then 'i').test(value)
        throw new TypeError("Unable to convert from #{value} to Number.Integer")

      return parseInt(value, options.base)
    {
      base: 10
      strict: false
      trim: false
    }
    'base'
  )

  ko.typed.addConverter(
    'String'
    'Number'
    (value, options) ->
      if options.trim
        value = value.trim()

      if not /^(\+|\-)?[0-9]+(\.?)[0-9]*$/.test(value)
        throw new TypeError("Unable to convert from #{value} to Number")

      value = parseFloat(value, options.base)

      if options.decimals?
        value = Math.round10(value, -options.decimals)

      return value
    {
      decimals: undefined
      trim: false
    }
    'decimals'
  )

  ko.typed.addConverter(
    'String',
    'Undefined',
    (value, options) ->
      if options.trim
        value = value.trim()

      if value.length != 0
        throw new TypeError("Unable to convert from #{value} to Undefined")

      return undefined
    {
      trim: false
    }
  )

  ko.typed.addConverter(
    'Undefined',
    'Date',
    (value) ->
      return new Date(NaN)
  )

  ko.typed.addConverter(
    'Undefined',
    'Moment',
    (value) ->
      return require('moment').invalid()
  )

  ko.typed.addConverter(
    'Undefined',
    'String',
    (value) ->
      return ''
  )

  return ko

applyKotr(ko)

module.exports = ko