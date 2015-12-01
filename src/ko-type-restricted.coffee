# ko = require('knockout')
# isAn = require('is-an')

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

    result = ko.pureComputed({
      read: () ->
        internalValue = target()

        if not typeCheck(internalValue)
          throw new TypeError("Unexpected internal type. Expected #{typeName}, got #{isAn(internalValue)}")

        return internalValue

      write: (externalValue) ->
        if typeCheck(externalValue)
          target(externalValue)
        else
          throw new TypeError("Unexpected external type. Expected #{typeName}, received #{isAn(externalValue)}")
    })

    result.typeName = typeName
    result.typeNames = typeNames
    result.typeCheck = typeCheck
    result.typeChecks = typeChecks

    return result

  ko.extenders.convert = (target, options) ->
    # normalize options
    do ->
      if isAn.String(options) or isAn.Array(options)
        options = { type: options }

      finalOptions = {
        checkSelf: options.check ? () -> true
        read: options.read
        write: options.write
        checks: {}
        checkers: []
        isTyped: isTyped(target)
        ignoreDefaultConverters: options.ignoreDefaultConverters
      }

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
      finalOptions.check = (value) -> finalOptions.checkers.every((checker) -> checker(value))

      options = finalOptions

    result = ko.pureComputed({
      read: () ->
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

        foundIntMatch = false

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

            foundIntMatch = true

            # get the options
            intTypeOptions = extTypeOptions[intTypeName] ? {}

            # try specific conversions
            if tryRead(intTypeOptions.read, intTypeOptions.readOptions)
              if intTypeOptions.check(externalValue)
                return externalValue

            # try no conversion
            if extTypeName == intTypeName
              if not intTypeOptions.check? or intTypeOptions.check(internalValue)
                externalValue = internalValue
                return externalValue

            # try default conversion
            if not options.ignoreDefaultConverters
              if tryRead(ko.extenders.convert.getConverter(intTypeName, extTypeName), intTypeOptions.readOptions)
                if not intTypeOptions.check? or intTypeOptions.check(externalValue)
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

        if not foundIntMatch
          throw new TypeError("Unable to convert from internal type #{isAn(internalValue)}")

        if options.type?
          throw new TypeError("Unable to convert from internal type #{isAn(internalValue)} to external type #{options.type}")
        else
          throw new TypeError("Unable to convert from internal type #{isAn(internalValue)}")

      write: (externalValue) ->

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

        foundExtMatch = false

        # Look for specific conversion
        for extTypeName in options.types
          extTypeOptions = options[extTypeName]

          if not extTypeOptions.check(externalValue)
            continue

          foundExtMatch = true

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
              if tryWrite(ko.extenders.convert.getConverter(extTypeName, intTypeName), intTypeOptions.writeOptions)
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

        if not foundExtMatch
          throw new TypeError("Invalid external type. Got #{isAn(externalValue)}")

        if options.isTyped
          throw new TypeError("Unable to convert from external type #{isAn(externalValue)} to internal type #{target.typeName}")
        else
          throw new TypeError("Unable to convert from external type #{isAn(externalValue)}")

    })

    if options.type?
      result.typeName = options.type
      result.typeNames = options.types
      result.typeCheck = options.check
      result.typeChecks = options.checks

    return result


  ko.extenders.convert.converters = {}
  ko.extenders.convert.addConverter = (fromTypeName, toTypeName, converter) ->
    ko.extenders.convert.converters[fromTypeName] ?= {}
    ko.extenders.convert.converters[fromTypeName][toTypeName] = converter
    return @
  ko.extenders.convert.getConverter = (fromTypeName, toTypeName) ->
    ko.extenders.convert.converters[fromTypeName]?[toTypeName]

  ko.extenders.convert.addConverter('String', 'Undefined', (value) ->
    if value.length != 0
      throw new TypeError('Expected empty string')
    return undefined
  )
  ko.extenders.convert.addConverter('Undefined', 'String', (value) ->
    return ''
  )

  # ToDo: these are placeholders
  ko.extenders.convert.addConverter('Number', 'String', (value) ->
    value.toString(10)
  )
  ko.extenders.convert.addConverter('String', 'Number', (value) ->
    if not /^(0|[1-9][0-9]*)$/.test(value)
      throw new TypeError('Expected an integer')
    parseInt(value, 10)
  )

