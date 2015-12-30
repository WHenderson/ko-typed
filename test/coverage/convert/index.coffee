assert = require('chai').assert

suite('convert', () ->

  require('./typed-combinations')

  require('./custom-convert')

  require('./errors')

  require('./options-defer-evaluation')

  require('./options-pure')
)
