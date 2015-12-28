assert = require('chai').assert

assert.error = (error, args...) ->
  if args.length == 0
    assert.noError(error)
  else
    assert.throws(
      () -> throw error
      args...
    )

assert.noError = (error) ->
  assert.strictEqual(error, undefined)
