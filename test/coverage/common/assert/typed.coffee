assert = require('chai').assert


# typeName
# validValue
# invalidValue
# validValues = {}
# invalidValues = {}
assert.typed = (typed, details) ->
  validValues = (v for own k,v of details.validValues)
  if {}.hasOwnProperty.call(details, 'validValue')
    validValues.push(details.validValue)

  invalidValues = []
  if {}.hasOwnProperty.call(details, 'invalidValues')
    invalidValues.push.apply(invalidValues, details.invalidValues)
  if {}.hasOwnProperty.call(details, 'invalidValue')
    invalidValues.push(details.invalidValue)

  typeNames = if details.typeName? then details.typeName.split('|') else []

  assert.ok(ko.isPureComputed(typed) || ko.isComputed(typed))

  assert.propertyVal(typed, 'typeName', details.typeName)

  assert.isDefined(typed.typeNames)
  assert.deepEqual(typed.typeNames, typeNames)

  assert.isDefined(typed.typeCheck)
  assert.isFunction(typed.typeCheck)
  for value in validValues
    assert.isTrue(typed.typeCheck(value))
  for value in invalidValues
    assert.isFalse(typed.typeCheck(value))

  assert.isDefined(typed.typeChecks)
  assert.isObject(typed.typeChecks)
  assert.deepEqual(Object.keys(typed.typeChecks).sort(), typeNames.sort())
  for typeName in typeNames
    if {}.hasOwnProperty.call(details.validValues, typeName)
      assert.isTrue(typed.typeChecks[typeName](details.validValues[typeName]))
    for value in invalidValues
      assert.isFalse(typed.typeChecks[typeName](value))

  assert.isDefined(typed.readError)
  assert.ok(ko.isObservable(typed.readError))
  assert.strictEqual(typed.readError(), undefined)

  assert.isDefined(typed.writeError)
  assert.ok(ko.isObservable(typed.writeError))
  assert.strictEqual(typed.writeError(), undefined)

  return assert
