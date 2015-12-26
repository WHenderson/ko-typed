assert = require('chai').assert

suite('validation', () ->
  test('off', () ->
    base = ko.observable()
    typed = base.extend({ type: { type: 'Undefined', validate: false }})

    assert.notOk(ko.validation.utils.isValidatable(typed))
  )

  test('off (no target)', () ->
    base = ko.observable()
    typed = base.extend({ type: { type: 'Undefined', validate: true, validation: { target: false, result: false } }})

    assert.notOk(ko.validation.utils.isValidatable(typed))
  )

  test('off (no read/write)', () ->
    base = ko.observable()
    typed = base.extend({ type: { type: 'Undefined', validate: true, validation: { read: false, write: false } }})

    assert.notOk(ko.validation.utils.isValidatable(typed))
  )

  test('on', () ->
    base = ko.observable()
    typed = base.extend({ type: { type: 'Undefined', validate: true }})

    assert.ok(ko.validation.utils.isValidatable(typed))
  )

  test('read', () ->
    base = ko.observable()
    typed = base.extend({ type: { type: 'Undefined', validate: true, validation: { read: true, write: false, defer: false }, useDefault: true }})

    assert.ok(ko.validation.utils.isValidatable(typed))
    assert.strictEqual(typed.error(), null)
    base('test')
    assert.strictEqual(typed.error(), 'Unexpected internal type. Expected Undefined, got String')
  )

  test('write', () ->
    base = ko.observable()
    typed = base.extend({ type: { type: 'Undefined', validate: true, validation: { read: false, write: true, defer: false }, noThrow: true }})

    assert.ok(ko.validation.utils.isValidatable(typed))
    assert.strictEqual(typed.error(), null)
    typed('test')
    assert.strictEqual(typed.error(), 'Unexpected external type. Expected Undefined, received String')
  )

  test('defer', () ->
    base = ko.observable('invalid')
    typed = base.extend({ type: { type: 'Undefined', validate: true, validation: { read: true, write: false, defer: true}, useDefault: true }})

    step = 0

    assert.notOk(ko.validation.utils.isValidatable(typed))


    console.log(++step);
    typed()

    assert.ok(ko.validation.utils.isValidatable(typed))
    assert.strictEqual(typed.error(), 'Unexpected internal type. Expected Undefined, got String')



    console.log(++step);
    base(10)
    console.log(++step);
    typed()
    console.log(++step);

    assert.ok(ko.validation.utils.isValidatable(typed))
    assert.strictEqual(typed.error(), 'Unexpected internal type. Expected Undefined, got Number')
  )
)
