  validate = (target, message) ->
    rule = undefined
    target.typeError.subscribe(
      () ->
        # Try https://github.com/Knockout-Contrib/Knockout-Validation
        if ko.validation? and ko.validation.utils.isValidatable(target)
          if not rule?
            rule = {
              message: message ? target.typeError()
              validator: () ->
                not target.typeError()?
            }
            ko.validation.addAnonymousRule(target, rule)
          else
            rule.message = message ? target.typeError()
            target.rules.valueHasMutated()
    )
