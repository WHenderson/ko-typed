  ko.extenders.convert = (target, options) ->
    # normalize options
    do ->
      if isAn.String(options) or isAn.Array(options)
        options = { type: options }

      # merge options
      options = extend({}, ko.typed.options, ko.extenders.convert.options, options)

      normal = {
        checkSelf: options.check ? () -> true
        read: options.read
        write: options.write
        checks: {}
        checkers: []
        isTyped: isTyped(target)
        ignoreDefaultConverters: options.ignoreDefaultConverters
        pure: options.pure
        deferEvaluation: options.deferEvaluation
      }

      normalizeExRead(normal, ko.typed.options, ko.extenders.convert.options, options)
      normalizeExWrite(normal, ko.typed.options, ko.extenders.convert.options, options)
      normalizeValidation(normal, ko.typed.options, ko.extenders.convert.options, options)

      normal.checkers.push(normal.checkSelf)

      # Gather all external types
      normal.types = typeNameToArray(options.type)
      for own extTypeName of options
        if not isValidTypeName(extTypeName)
          continue

        # Add external type
        if normal.types.indexOf(extTypeName) == -1
          normal.types.push(extTypeName)

      # Expand each External Type
      for extTypeName in normal.types
        extTypeOptions = options[extTypeName] ? {}

        normal[extTypeName] = {
          checkSelf: extTypeOptions.check ? isAn(extTypeName, { returnChecker: true }) ? () -> true
          read: extTypeOptions.read
          write: extTypeOptions.write
          types: typeNameToArray(extTypeOptions.type)
        }

        checkParent = normal.checkSelf
        normal.checkers.push(normal[extTypeName].checkSelf)
        normal.checks[extTypeName] = normal[extTypeName].check = do (extTypeName) ->
          (value) -> normal.checkSelf(value) and normal[extTypeName].checkSelf(value)

        # Gather all internal types
        for own intTypeName of extTypeOptions
          if not isValidTypeName(intTypeName)
            continue

          # Add internal type
          if normal[extTypeName].types.indexOf(intTypeName) == -1
            normal[extTypeName].types.push(intTypeName)

        # Expand all internal types
        for intTypeName in normal[extTypeName].types
          intTypeOptions = options[extTypeName]?[intTypeName] ? {}

          normal[extTypeName][intTypeName] = {
            checkSelf: intTypeOptions.check
            read: intTypeOptions.read
            write: intTypeOptions.write
          }

          if not normal[extTypeName][intTypeName].checkSelf?
            normal[extTypeName][intTypeName].check = normal[extTypeName][intTypeName].checkSelf = normal[extTypeName].checkSelf
          else
            normal[extTypeName][intTypeName].check = do (extTypeName, intTypeName) ->
              (value) -> normal[extTypeName].check(value) and normal[extTypeName][intTypeName].checkSelf(value)

        normal[extTypeName].type = typeNameToString(normal[extTypeName].types)

      normal.type = typeNameToString(normal.types)
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
      )

      write: wrapWrite(
        options,
        target,
        writeError,
        (externalValue) ->
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
        result()
      catch ex
        result.dispose()
        throw ex

    return result

  ko.extenders.convert.options = {
  }

