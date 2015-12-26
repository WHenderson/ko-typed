assert = require('chai').assert

suite('read', () ->

  create = (options) ->
    return ko
    .pureComputed({
      read: () ->
        throw new Error('contrived read error')
    })
    .extend({ exception: options })

  test('catch', () ->
    assert.throws(
      () ->
        create({ read: { catch: false }})()
    )
    assert.doesNotThrow(
      () ->
        create({ read: { catch: true, useDefault: true }})()
    )
    assert.throws(
      () ->
        create({ read: { catch: true, useDefault: false }})()
    )

    assert.throws(
      () ->
        create({ read: { catch: (() -> false) }})()
    )
    assert.doesNotThrow(
      () ->
        create({ read: { catch: (() -> true), useDefault: true }})()
    )
    assert.throws(
      () ->
        create({ read: { catch: (() -> true), useDefault: false }})()
    )
  )

  test('defaults', () ->
    assert.strictEqual(
      create({ read: { catch: true, useDefault: true, defaultValue: 10 }})()
      10
    )
    assert.strictEqual(
      create({ read: { catch: true, useDefault: true, defaultFunc: () -> 10 }})()
      10
    )
  )

  test('readError', () ->
    contriveError = ko.observable(false)
    extended = ko.pureComputed({
      read: () ->
        if contriveError()
          debugger
          throw new Error('contrived read error')
        else
          return 10
    }).extend({ exception: { read: { catch: true, useDefault: true, defaultValue: -10 }}})

    assert.strictEqual(extended(), 10)

    contriveError(true)


    assert.strictEqual(extended(), -10)




  )
)
