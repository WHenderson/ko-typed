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

    if {}.hasOwnProperty.call(options, 'default')
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
            result.typeReadError(ex.message)

            if options.defaultFunc?
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
            result.typeWriteError(ex.message)

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

    if options.validate
      validate(result, options.message)

    if options.pure and not options.deferEvaluation
      # force immediate read
      result()

    return result

  ko.extenders.type.options = {
    validate: true
    message: undefined
    noThrow: false
    # default
    # defaultFunc
    pure: true
    deferEvaluation: true
  }

