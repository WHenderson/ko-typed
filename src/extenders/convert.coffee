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

