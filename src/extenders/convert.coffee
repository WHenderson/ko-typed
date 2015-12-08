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
      finalOptions.check = (value) ->
        finalOptions.checkSelf(value) and ((finalOptions.checkers.length == 0) or finalOptions.checkers.some((checker) -> checker(value)))

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
              if tryRead(ko.typeRestricted.getConverter(intTypeName, extTypeName), intTypeOptions.readOptions)
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
              if tryWrite(ko.typeRestricted.getConverter(extTypeName, intTypeName), intTypeOptions.writeOptions)
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
    })

    result.typeName = options.type
    result.typeNames = options.types
    result.typeCheck = options.check
    result.typeChecks = options.checks

    return result
