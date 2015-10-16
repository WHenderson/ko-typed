# ko = require('knockout')
# isAn = require('is-an')

ko.extenders.type = (target, options) ->
  globalOptions = arguments.callee

  allowUndefined = true
  allowNull = false
  if isAn.String.Literal(options)
    typeName = options
    typeCheck = isAn(typeName, { returnChecker: true })
    errorMessage = undefined
  else if isAn.Function(options)
    typeCheck = options
    typeName = typeCheck.typeName
    errorMessage = undefined
  else if isAn.Object(options)
    typeCheck = options.check
    typeName = options.name ? typeCheck?.typeName
    if typeName? and not typeCheck?
      typeCheck = isAn(typeName, { returnChecker: true })
    errorMessage = options.message
    if options.assert?
      assert = options.assert
      errorAssert = () -> assert(result, target, errorMessage)
    allowUndefined = options.allowUndefined ? allowUndefined
    allowNull = options.allowNull ? allowNull
  else
    globalOptions.assertSetup('Invalid options')

  if not isAn.Function(typeCheck)
    globalOptions.assertSetup('unable to find type checking function')
    typeCheck = () -> true

  errorMessage ?= if typeName? then "Invalid type: expected #{typeName}" else 'Invalid type'
  errorAssert ?= () -> globalOptions.assertRuntime(result, target, errorMessage)

  result = ko.pureComputed({
    read: target
    write: (value) ->
      if (allowUndefined and isAn.Undefined(value)) or (allowNull and isAn.Null(value)) or typeCheck(value)
        target(value)
      else
        if isAn.Function(result.error)
          result.error(errorMessage)
        errorAssert()
  })

  if isAn.Function(target.error)
    result.error = target.error

  return result

ko.extenders.type.assertSetup = (message...) ->
  console.assert(false, message...)

ko.extenders.type.assertRuntime = (restricted, underlying, message...) ->
  console.assert(false, message...)
