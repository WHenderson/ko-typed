assert = require('chai').assert
util = require('util')

suite('coverage', () ->
  setup(() ->
    # Use compiled javascript for debugging
    if typeof v8debug != 'object'
      global.ko = require('../dist/ko-typed.apply.coffee')(require('knockout'))
    else
      global.ko = require('../index.js')(require('knockout'))

    global.isAn = require('is-an')
  )

  require('./coverage/type')

  require('./coverage/convert')

  require('./coverage/converters')
)
