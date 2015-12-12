suite('validation', () ->
  test('simple', () ->
    base = ko.observable(10).extend({ type: 'Number' })
    convert = base.extend({ convert: 'Number.Integer' }).extend({ validatable: true })

    convert(10)

    convert(20)
  )

  ###
  TODO: Add option for "no-throw"
  TODO: Add option for "read-ignore"?
  TODO: Add option for "check immediate"
  TODO: Fix/Add unit tests for same
  TODO: Add option for default read value
  TODO: Add option for defaultFunc read value
  ###
)
