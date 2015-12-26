  ko.typed.options = {
    # validation options
    validation: {
      # turn validation on/off
      enabled: true

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

      # the message to use when there is an error and no message is available
      defaultMessage: 'is invalid'
    }

    exRead: {
      # Catch exceptions. May also be a function which returns true if the given exception should be caught
      catch: true

      # default catch function to use when catch is true
      catchFunc: (ex) -> ex instanceof TypeError

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

      # default catch function to use when catch is true
      catchFunc: (ex) -> ex instanceof TypeError

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
      opt.catch = opt.catchFunc ? () -> true
    else if opt.catch == false
      opt.catch = () -> false

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
        return { enabled: true }
      else if v == false
        return { enabled: false }
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
    if not options.validate
      return

    validation = options.validation

    if (not validation.target and not validation.result) or (not validation.read and not validation.write)
      return

    if ko.validation?
      if options.validation.read and options.validation.write
        message = () -> result.typeWriteError()?.message ? result.typeReadError()?.message
      else if options.validation.read
        message = () -> result.typeReadError()?.message
      else #if options.validation.write
        message = () -> result.typeWriteError()?.message

      applyValidation = (base) ->
        base.extend({ validatable: { enable: true, deferEvaluation: options.deferEvaluation } })

        rule = {
          message: undefined
          validator: () ->
            rule.message = message()
            return not rule.message?
        }

        ko.validation.addAnonymousRule(base, rule)

        return

      if validation.target
        applyValidation(target)

      if validation.result
        applyValidation(result)

    return





