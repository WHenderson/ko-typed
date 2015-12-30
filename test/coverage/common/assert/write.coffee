assert = require('chai').assert

assert.write = (observable, value, errorArgs...) ->
  observable(value)
  assert.error(observable.writeError?(), errorArgs...)

  return assert

assert.writeThrows = (observable, value, catches, errorArgs...) ->
  oldError = observable.readError()
  assert.throws(
    () -> observable(value)
    errorArgs...
  )
  if catches
    assert.error(observable.writeError(), errorArgs...)
  else
    assert.strictEqual(observable.writeError(), oldError)

  return assert
