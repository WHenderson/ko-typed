assert = require('chai').assert

assert.writeDoesNotThrow = (base, baseValue, extended, extendedValue, errorArgs...) ->
  extended(extendedValue)
  assert.error(extended.writeError(), errorArgs...)
  assert.strictEqual(base(), baseValue)

assert.writeThrows  = (base, baseValue, extended, extendedValue, catches, errorArgs...) ->
  oldError = extended.readError()
  assert.throws(
    () -> extended(extendedValue)
    errorArgs...
  )
  if catches
    assert.error(extended.writeError(), errorArgs...)
  else
    assert.strictEqual(extended.writeError(), oldError)
  assert.strictEqual(base(), baseValue)

