suite('validation', () ->
  test('simple', () ->
    base = ko.observable(10).extend({ type: 'Number' })
    convert = base.extend({ convert: 'Number.Integer' }).extend({ validatable: true })

    convert(10)

    convert(20)
  )
)
