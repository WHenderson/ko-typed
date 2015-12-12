  validate = (target, options) ->
    if not options.validate
      return

    rule = undefined

    errorCheck = () ->
      # Try https://github.com/Knockout-Contrib/Knockout-Validation
      if ko.validation? and ko.validation.utils.isValidatable(target)
        message = options.message ? (target.typeWriteError() ? target.typeReadError())?.message
        if not rule?
          rule = {
            message: message
            validator: () ->
              not target.typeWriteError()? and not target.typeReadError()?
          }
          ko.validation.addAnonymousRule(target, rule)
        else
          rule.message = message
          target.rules.valueHasMutated()

    target.typeWriteError.subscribe(errorCheck)
    target.typeReadError.subscribe(errorCheck)

    if ko.validation?
      target.extend({ validatable: true })

    if not options.deferEvaluation
      errorCheck()
