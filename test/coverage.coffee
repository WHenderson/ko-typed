assert = require('chai').assert
util = require('util')

require('./coverage/common')

suite('coverage', () ->
  setup(() ->
    # give the code coverage tool time to work
    @timeout(10000)

    require('knockout')

    # Use compiled javascript for debugging
    if typeof v8debug != 'object'
      global.ko = require('../dist/ko-typed.applied.coffee')
    else
      global.ko = require('../index.js')

    global.isAn = require('is-an')
  )

  require('./coverage/type')

  require('./coverage/convert')

  require('./coverage/converters')
)
