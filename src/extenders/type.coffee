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
        try
          if typeCheck(externalValue)
            target(externalValue)
          else
            throw new TypeError("Unexpected external type. Expected #{typeName}, received #{isAn(externalValue)}")
        catch ex
          if ex instanceof TypeError
            result.typeError(ex.message)
          throw ex

        result.typeError(undefined)
    })

    result.typeName = typeName
    result.typeNames = typeNames
    result.typeCheck = typeCheck
    result.typeChecks = typeChecks

    result.typeError = ko.observable()

    if options.validate
      validate(result, options.message)

    return result

  ko.extenders.type.options = {
    validate: true
    message: undefined
  }
