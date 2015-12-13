isAn = require('is-an')

applyKotr = (ko) ->


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

  isValidTypeName = (value) ->
    return /^[A-Z]/.test(value)

  isTyped = (value) ->
    return isAn.Function(value) and value.typeName? and value.typeNames? and value.typeCheck? and value.typeChecks?

  validate = (target, options) ->
    if not options.validate
      return

    rule = undefined

    errorCheck = () ->
      # Try https://github.com/Knockout-Contrib/Knockout-Validation
      if ko.validation? and ko.validation.utils.isValidatable(target)
        message = options.message ? (target.typeWriteError() ? target.typeReadError())?.message
        if not rule?
          rule = {
            message: message
            validator: () ->
              not target.typeWriteError()? and not target.typeReadError()?
          }
          ko.validation.addAnonymousRule(target, rule)
        else
          rule.message = message
          target.rules.valueHasMutated()

    target.typeWriteError.subscribe(errorCheck)
    target.typeReadError.subscribe(errorCheck)

    if ko.validation?
      target.extend({ validatable: true })

    if not options.deferEvaluation
      errorCheck()

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

    options = ko.utils.extend(ko.utils.extend({}, ko.extenders.type.options), options)

    if options.useDefault and not options.defaultFunc?
      options.defaultFunc = () -> options.default

    # Gather type names
    typeNames = typeNameToArray(options.type)

    do ->
      for own name, check of options
        if not isValidTypeName(name)
          continue
        if typeNames.indexOf(name) == -1
          typeNames.push(name)

    typeName = typeNameToString(typeNames)

    # checks
    typeChecks = {}
    do ->
      for name in typeNames
        typeChecks[name] = options[name] ? isAn(name, { returnChecker: true })

    # check
    typeCheck = do ->
      _check = options.check ? (() -> true)
      return (value) ->
        _check(value) and ((typeNames.length == 0) or (typeNames.some((name) -> typeChecks[name](value))))

    result = ko.computed({
      pure: options.pure
      deferEvaluation: options.deferEvaluation

      read: () ->
        try
          internalValue = target()

          if not typeCheck(internalValue)
            throw new TypeError("Unexpected internal type. Expected #{typeName}, got #{isAn(internalValue)}")

        catch ex
          if ex instanceof TypeError
            result.typeReadError(ex)

            if options.useDefault
              return options.defaultFunc()

          throw ex

        result.typeReadError(undefined)
        return internalValue

      write: (externalValue) ->
        try
          if typeCheck(externalValue)
            target(externalValue)
          else
            throw new TypeError("Unexpected external type. Expected #{typeName}, received #{isAn(externalValue)}")
        catch ex
          if ex instanceof TypeError
            result.typeWriteError(ex)

            if options.noThrow
              return

          throw ex

        result.typeWriteError(undefined)
    })

    result.typeName = typeName
    result.typeNames = typeNames
    result.typeCheck = typeCheck
    result.typeChecks = typeChecks

    result.typeWriteError = ko.observable()
    result.typeReadError = ko.observable()

    validate(result, options)

    if options.pure and not options.deferEvaluation
      # force immediate read
      result()

    return result

  ko.extenders.type.options = {
    validate: true
    message: undefined
    noThrow: false
    useDefault: false
    # default
    # defaultFunc
    pure: true
    deferEvaluation: true
  }


  ko.extenders.convert = (target, options) ->
    # normalize options
    do ->
      if isAn.String(options) or isAn.Array(options)
        options = { type: options }

      # merge options
      options = ko.utils.extend(ko.utils.extend({}, ko.extenders.convert.options), options)

      finalOptions = {
        checkSelf: options.check ? () -> true
        read: options.read
        write: options.write
        checks: {}
        checkers: []
        isTyped: isTyped(target)
        ignoreDefaultConverters: options.ignoreDefaultConverters
        pure: options.pure
        deferEvaluation: options.deferEvaluation
        defaultFunc: options.defaultFunc
        noThrow: options.noThrow
        message: options.message
        useDefault: options.useDefault
      }

      if finalOptions.useDefault and not options.defaultFunc?
        finalOptions.default = options.default
        finalOptions.defaultFunc = () -> finalOptions.default

      finalOptions.checkers.push(finalOptions.checkSelf)

      # Gather all external types
      finalOptions.types = typeNameToArray(options.type)
      for own extTypeName of options
        if not isValidTypeName(extTypeName)
          continue

        # Add external type
        if finalOptions.types.indexOf(extTypeName) == -1
          finalOptions.types.push(extTypeName)

      # Expand each External Type
      for extTypeName in finalOptions.types
        extTypeOptions = options[extTypeName] ? {}

        finalOptions[extTypeName] = {
          checkSelf: extTypeOptions.check ? isAn(extTypeName, { returnChecker: true }) ? () -> true
          read: extTypeOptions.read
          write: extTypeOptions.write
          types: typeNameToArray(extTypeOptions.type)
        }

        checkParent = finalOptions.checkSelf
        finalOptions.checkers.push(finalOptions[extTypeName].checkSelf)
        finalOptions.checks[extTypeName] = finalOptions[extTypeName].check = do (extTypeName) ->
          (value) -> finalOptions.checkSelf(value) and finalOptions[extTypeName].checkSelf(value)

        # Gather all internal types
        for own intTypeName of extTypeOptions
          if not isValidTypeName(intTypeName)
            continue

          # Add internal type
          if finalOptions[extTypeName].types.indexOf(intTypeName) == -1
            finalOptions[extTypeName].types.push(intTypeName)

        # Expand all internal types
        for intTypeName in finalOptions[extTypeName].types
          intTypeOptions = options[extTypeName]?[intTypeName] ? {}

          finalOptions[extTypeName][intTypeName] = {
            checkSelf: intTypeOptions.check
            read: intTypeOptions.read
            write: intTypeOptions.write
          }

          if not finalOptions[extTypeName][intTypeName].checkSelf?
            finalOptions[extTypeName][intTypeName].check = finalOptions[extTypeName][intTypeName].checkSelf = finalOptions[extTypeName].checkSelf
          else
            finalOptions[extTypeName][intTypeName].check = do (extTypeName, intTypeName) ->
              (value) -> finalOptions[extTypeName].check(value) and finalOptions[extTypeName][intTypeName].checkSelf(value)

        finalOptions[extTypeName].type = typeNameToString(finalOptions[extTypeName].types)

      finalOptions.type = typeNameToString(finalOptions.types)
      finalOptions.check = (value) ->
        finalOptions.checkSelf(value) and ((finalOptions.checkers.length == 0) or finalOptions.checkers.some((checker) -> checker(value)))

      options = finalOptions

    result = ko.computed({
      pure: options.pure
      deferEvaluation: options.deferEvaluation

      read: () ->
        try
          internalValue = target()
          externalValue = undefined

          # Try exact internal type match
          tryRead = (convert, options) ->
            if convert?
              try
                externalValue = convert(internalValue, options)
              catch ex
                if ex not instanceof TypeError
                  throw ex

              if not ex?
                return true

            return false

          # Look for specific conversion
          for extTypeName in options.types
            extTypeOptions = options[extTypeName]

            # go by our order
            intTypeNames = extTypeOptions.types

            if intTypeNames.length == 0 and not extTypeOptions.read?
              if options.isTyped
                # go by target order
                intTypeNames = target.typeNames
              else
                # go by inferred order
                intTypeNames = [isAn(internalValue)]

            for intTypeName in intTypeNames
              # check internal type
              if options.isTyped
                if not target.typeChecks[intTypeName]?(internalValue)
                  continue
              else
                if not isAn(internalValue, intTypeName)
                  continue

              # get the options
              intTypeOptions = extTypeOptions[intTypeName] ? { check: extTypeOptions.check }

              # try specific conversions
              if tryRead(intTypeOptions.read, intTypeOptions.readOptions)
                if intTypeOptions.check(externalValue)
                  return externalValue

              # try no conversion
              if extTypeName == intTypeName
                if intTypeOptions.check(internalValue)
                  externalValue = internalValue
                  return externalValue

              # try default conversion
              if not options.ignoreDefaultConverters
                if tryRead(ko.typed.getConverter(intTypeName, extTypeName), intTypeOptions.readOptions)
                  if intTypeOptions.check(externalValue)
                    return externalValue

          # Look for one-sided conversion
          for extTypeName in options.types
            extTypeOptions = options[extTypeName]

            if tryRead(extTypeOptions.read, extTypeOptions.readOptions)
              if extTypeOptions.check(externalValue)
                return externalValue

          # Look for generic conversion
          if tryRead(options.read, options.readOptions)
            if options.check(externalValue)
              return externalValue

          if options.types.length == 0
            if options.check(externalValue)
              externalValue = internalValue
              return externalValue

          if options.type?
            throw new TypeError("Unable to convert from internal type #{isAn(internalValue)} to external type #{options.type}")
          else
            throw new TypeError("Unable to convert from internal type #{isAn(internalValue)}")
        catch ex
          if ex instanceof TypeError
            result.typeReadError(ex)

            if options.useDefault
              return options.defaultFunc()

          throw ex
        finally
          if not ex?
            result.typeReadError(undefined)

      write: (externalValue) ->
        try
          tryWrite = (convert, options) ->
            if convert?
              try
                internalValue = convert(externalValue, options)
              catch ex
                if ex not instanceof TypeError
                  throw ex

              if not ex?
                target(internalValue)
                return true

            return false

          # Look for specific conversion
          for extTypeName in options.types
            extTypeOptions = options[extTypeName]

            if not extTypeOptions.check(externalValue)
              continue

            # go by our order
            intTypeNames = extTypeOptions.types

            if intTypeNames.length == 0 and not extTypeOptions.write?
              if options.isTyped
                # go by target order
                intTypeNames = target.typeNames
              else
                # go by inferred order
                intTypeNames = [isAn(externalValue)]

            for intTypeName in intTypeNames
              intTypeOptions = extTypeOptions[intTypeName] ? {}

              if intTypeOptions.check? and not intTypeOptions.check(externalValue)
                continue

              # try specific conversions
              if tryWrite(intTypeOptions.write, intTypeOptions.writeOptions)
                return

              # try no conversion
              if extTypeName == intTypeName
                target(externalValue)
                return

              # try default conversion
              if not options.ignoreDefaultConverters
                if tryWrite(ko.typed.getConverter(extTypeName, intTypeName), intTypeOptions.writeOptions)
                  return

          # Look for one-sided conversion
          for extTypeName in options.types
            extTypeOptions = options[extTypeName]

            if not extTypeOptions.check(externalValue)
              continue

            if tryWrite(extTypeOptions.write, extTypeOptions.writeOptions)
              return

          # Look for generic conversion
          if options.check(externalValue)
            if tryWrite(options.write, options.writeOptions)
              return

            if options.types.length == 0
              target(externalValue)
              return

          if options.isTyped
            throw new TypeError("Unable to convert from external type #{isAn(externalValue)} to internal type #{target.typeName}")
          else
            throw new TypeError("Unable to convert from external type #{isAn(externalValue)}")
        catch ex
          if ex instanceof TypeError
            result.typeWriteError(ex)

            if options.noThrow
              return

          throw ex
        finally
          if not ex?
            result.typeWriteError(undefined)
    })

    result.typeName = options.type
    result.typeNames = options.types
    result.typeCheck = options.check
    result.typeChecks = options.checks

    result.typeReadError = ko.observable()
    result.typeWriteError = ko.observable()

    validate(result, options)

    if options.pure and not options.deferEvaluation
      # force immediate read
      result()

    return result

  ko.extenders.convert.options = {
    validate: true
    message: undefined
    noThrow: false
    pure: true
    deferEvaluation: true
  }

  ko.typed = {}

  do ->
    ko.typed._converters = converters = {}

    ko.typed.addConverter = (fromTypeName, toTypeName, converter, defaultOptions, defaultOption) ->
      console?.assert?(isValidTypeName(fromTypeName), "Invalid typeName #{fromTypeName}")
      console?.assert?(isValidTypeName(toTypeName), "Invalid typeName #{fromTypeName}")

      if defaultOptions?
        if defaultOption?
          wrapper = (value, options) ->
            if options? and not isAn.Object(options)
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

    if not Math.round10?
      Math.round10 = (value, exp) ->
        return decimalAdjust(Math.round, value, exp)

    if not Math.floor10?
      Math.floor10 = (value, exp) ->
        return decimalAdjust(Math.floor, value, exp)

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
      strict: false
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
      if typeof options.mode == 'string'
        mode = Math[options.mode]
      else
        mode = options.mode

      return mode(value)
    {
      mode: 'round'
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

      date = new Date(value)
      if isNaN(date.valueOf())
        throw TypeError("Unable to convert from #{value} to Date")

      return date
    {
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
        throw new TypeError("Unable to convert from #{value} to Moment")

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
      return new Date('')
  )

  ko.typed.addConverter(
    'Undefined',
    'String',
    (value) ->
      return ''
  )

  ko.typed.addConverter(
    'Undefined',
    'Moment',
    (value) ->
      return require('moment')('')
  )

  return ko

module.exports = applyKotr