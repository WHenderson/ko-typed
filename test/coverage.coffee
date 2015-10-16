assert = require('chai').assert

suite('coverage', () ->
  ko = null
  isAn = null
  setup(() ->
    ko = require('../dist/ko-type-restricted.coffee')
    isAn = require('is-an')
  )

  test('basic', () ->
    error = undefined
    base = ko.observable()
    restricted = base.extend({ type: 'Number' })

    restricted(10)
    assert.equal(base(), 10)

    try
      restricted('fail')
    catch ex
      error = ex

    assert.isDefined(error)
    assert.equal(base(), 10)

    restricted(1.0)
    assert.equal(base(), 1.0)

    return
  )

  test('basic validation', () ->
    error = undefined
    base = ko.observable()
    base.error = ko.observable()
    restricted = base.extend({ type: 'Number' })

    assert.isDefined(restricted.error)

    try
      restricted('fail')
    catch ex
      error = ex

    assert.isDefined(error?)
    assert.equal(restricted.error(), error.message)

    return
  )

  test('custom function', () ->
    error = undefined
    restricted = ko.observable().extend({ type: (value) -> value == 'X' })

    restricted('X')
    assert.equal(restricted(), 'X')

    try
      restricted('fail')
    catch ex
      error = ex

    assert.isDefined(error)
    assert.equal(error.message, 'Invalid type')
    assert.equal(restricted(), 'X')

    return
  )

  test('custom (no info)', () ->
    try
      restricted = ko.observable().extend({ type: { }})
    catch ex
      error = ex

    assert.isDefined(ex)

    return
  )

  test('custom (name)', () ->
    restricted = ko.observable().extend({ type: { name: 'Number.Literal' }})

    restricted(10)

    try
      restricted(new Number(20))
    catch ex
      error = ex

    assert.isDefined(error)
    assert.equal(restricted(), 10)

    return
  )

  test('custom (check)', () ->
    restricted = ko.observable().extend({ type: { check: isAn.Number.Literal }})

    restricted(10)

    try
      restricted(new Number(20))
    catch ex
      error = ex

    assert.isDefined(error)
    assert.equal(restricted(), 10)

    return
  )

  test('custom (options)', () ->
    errorMessage = null
    restricted = ko.observable().extend({ type: {
      name: 'Number.Literal'
      message: 'nope'
      assert: (r,u,m) -> errorMessage = m
      allowUndefined: false
      allowNull: true
    }})

    restricted(10)

    restricted(new Number(20))
    assert.equal(errorMessage, 'nope')
    assert.equal(restricted(), 10)

    errorMessage = null
    restricted(undefined)
    assert.equal(errorMessage, 'nope')
    assert.equal(restricted(), 10)

    errorMessage = null
    restricted(null)
    assert.equal(errorMessage, null)
    assert.equal(restricted(), null)

    return
  )

  test('invalid', () ->
    try
      ko.observable().extend({ type: null })
    catch ex
      error = ex

    assert.isDefined(error)
    assert.equal(error.message, 'Invalid options')

    return
  )

  test('replace global assert', (cb) ->
    try
      errorMessage = undefined
      originalAssertSetup = ko.extenders.type.assertSetup
      ko.extenders.type.assertSetup = (message...) ->
        errorMessage = message

      restricted = ko.observable().extend({ type: {} })

      assert.deepEqual(errorMessage, ['unable to find type checking function'], 'xxx')

      restricted(10)
      # no error, no restrictions

    finally
      ko.extenders.type.assertSetup = originalAssertSetup

    cb()
  )
)
