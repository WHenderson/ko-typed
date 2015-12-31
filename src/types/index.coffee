  do ->
    ko.typed._converters = converters = {}

    ko.typed.addConverter = (fromTypeName, toTypeName, converter, defaultOptions, defaultOption) ->
      console?.assert?(isValidTypeName(fromTypeName), "Invalid typeName #{fromTypeName}")
      console?.assert?(isValidTypeName(toTypeName), "Invalid typeName #{fromTypeName}")

      if defaultOptions?
        if defaultOption?
          wrapper = (value, options) ->
            if arguments.length == 2 and not isAn.Object(options)
              o = {}
              o[defaultOption] = options
              options = o

            return converter(value, ko.utils.extend(ko.utils.extend({}, wrapper.options), options))
        else
          wrapper = (value, options) ->
            return converter(value, ko.utils.extend(ko.utils.extend({}, wrapper.options), options))
      else
        wrapper = (value) ->
          return converter(value)

      wrapper.options = defaultOptions

      converters[fromTypeName] ?= {}
      converters[fromTypeName][toTypeName] = wrapper

      return ko.typed

    ko.typed.getConverter = (fromTypeName, toTypeName) ->
      converters[fromTypeName]?[toTypeName]

    ko.typed.removeConverter = (fromTypeName, toTypeName) ->
      if converters[fromTypeName]?[toTypeName]?
        delete converters[fromTypeName]?[toTypeName]

      return ko.typed

    return

