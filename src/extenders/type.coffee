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

    options = extend({}, ko.typed.options, ko.extenders.type.options, options)
    options.validation = extend({}, ko.typed.options.validation, ko.extenders.type.options.validation, options.validation)

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
      deferEvaluation: true

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

    validate(target, result, options)

    if not options.deferEvaluation
      try
        result()

        if result.typeReadError()?
          result.typeReadError.valueHasMutated()
      catch ex
        result.dispose()
        throw ex

    return result

  ko.extenders.type.options = {
  }

