  validate = (target, options) ->
    rule = undefined
    target.typeWriteError.subscribe(
      () ->
        # Try https://github.com/Knockout-Contrib/Knockout-Validation
        if ko.validation? and ko.validation.utils.isValidatable(target)
          message = options.message ? target.typeWriteError() ? target.typeReadError()
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
    )
