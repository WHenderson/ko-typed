  typeNameToString = (value) ->
    if not value? or value.length == 0
      return undefined
    else if isAn.String.Literal(value)
      return value
    else
      return value.join('|')

  typeNameToArray = (value) ->
    value = typeNameToString(value)
    if isAn.String.Literal(value)
      return value.split('|')
    else
      return []

  isValidTypeName = (value) ->
    return /^[A-Z]/.test(value)

  isTyped = (value) ->
    return isAn.Function(value) and value.typeName? and value.typeNames? and value.typeCheck? and value.typeChecks?
