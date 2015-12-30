assert = require('chai').assert

assert.read = (observable, expectedValue, errorArgs...) ->
  assert.strictEqual(observable(), expectedValue)
  assert.error(observable.readError?(), errorArgs...)

  return assert

assert.readThrows = (observable, catches, errorArgs...) ->
  oldError = observable.readError()
  assert.throws(
    () -> observable()
    errorArgs...
  )
  if catches
    assert.error(observable.readError(), errorArgs...)
  else
    assert.strictEqual(observable.readError(), oldError)

  return assert
