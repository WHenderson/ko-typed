assert = require('chai').assert

assert.readDoesNotThrow = (base, baseValue, extended, extendedValue, errorArgs...) ->
  base(baseValue)
  assert.strictEqual(extended(), extendedValue)
  assert.error(extended.readError(), errorArgs...)


assert.readDoesNotThrow = (base, baseValue, extended, extendedValue, errorArgs...) ->
  base(baseValue)
  assert.strictEqual(extended(), extendedValue)
  assert.error(extended.readError(), errorArgs...)

assert.readThrows  = (base, baseValue, extended, catches, errorArgs...) ->
  base(baseValue)
  oldError = extended.readError()
  assert.throws(
    () -> extended()
    errorArgs...
  )
  if catches
    assert.error(extended.readError(), errorArgs...)
  else
    assert.strictEqual(extended.readError(), oldError)

