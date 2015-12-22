  ko.typed.options = {
    # turn validation on/off
    validate: true

    # validation options
    validation: {
      # validate on read
      read: true

      # validate on write
      write: true

      # validate the underlying observable
      target: true

      # validate the resulting observab;e
      result: true

      # defer evaluation (do not establish validaty immediatly)
      defer: false

      # the message to use (defaults to the message from the thrown exception)
      message: undefined
    }

    # Do not throw TypeError on write
    noThrow: false

    # use pure computed observables
    pure: true

    # do not attempt to read the value immediately
    deferEvaluation: true

    # Do not throw TypeError when reading. Use default value instead
    useDefault: false

    # The default value to use
    default: undefined

    # A function to call which returns the default value to use. Overrides `default`
    defaultFunc: undefined
  }

  validate = (target, result, options) ->
    if not options.validate
      return

    validation = options.validation

    if not validation.read and not validation.write
      return

    if not validation.target and not validation.result
      return

    if options.validation.read and options.validation.write
      validator = () -> not result.typeWriteError()? and not result.typeReadError()?
    else if options.validation.read
      validator = () -> not result.typeReadError()?
    else if options.validation.write
      validator = () -> not result.typeWriteError()?
    else
      return

    subscriptions = []

    if ko.validation?

      if not validation.defer
        if validation.target
          target.extend({ validatable: true })
        if validation.result
          result.extend({ validatable: true })

      applyValidation = (base) ->
        subscribed = false

        rule = {
          message: undefined
          validator: validator
        }

        onError = (error) ->
          if ko.validation?
            if not ko.validation.utils.isValidatable(base)
              base.extend({ validatable: true })

            rule.message = validation.message ? error?.message ? rule.message ? 'is invalid'

            if not subscribed
              ko.validation.addAnonymousRule(base, rule)
              subscribed = true
            else
              base.rules.valueHasMutated()

          return

        if validation.read
          subscriptions.push(result.typeReadError.subscribe(onError))

        if validation.write
          subscriptions.push(result.typeWriteError.subscribe(onError))

        return

      if validation.target
        applyValidation(target)

      if validation.result
        applyValidation(result)

    if subscriptions.length?
      oldDispose = result.dispose
      result.dispose = () ->
        subscriptions.forEach(
          (subscription) ->
            subscription.dispose()
            return
        )
        return oldDispose.call(this, arguments)

    return





