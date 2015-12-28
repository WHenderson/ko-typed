assert = require('chai').assert

suite('type', () ->
  require('./single')

  require('./multiple')

  require('./options-pure')

  require('./options-defer-evaluation')

  require('./options-ex-read')

  require('./options-ex-write')

  require('./options-validation')
)
