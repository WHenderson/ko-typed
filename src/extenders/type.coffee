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

    writeError = ko.observable()
    readError = ko.observable()

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

    result.writeError = writeError
    result.readError = readError

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

