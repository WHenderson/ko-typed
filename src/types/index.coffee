  ko.typeRestricted = {}

  do ->
    ko.typeRestricted._converters = converters = {}

    ko.typeRestricted.addConverter = (fromTypeName, toTypeName, converter, defaultOptions, defaultOption) ->
      console?.assert?(isValidTypeName(fromTypeName), "Invalid typeName #{fromTypeName}")
      console?.assert?(isValidTypeName(toTypeName), "Invalid typeName #{fromTypeName}")

      if defaultOptions?
        if defaultOption?
          wrapper = (value, options) ->
            if options? and not isAn.Object(options)
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

      return ko.typeRestricted

    ko.typeRestricted.getConverter = (fromTypeName, toTypeName) ->
      converters[fromTypeName]?[toTypeName]

    ko.typeRestricted.removeConverter = (fromTypeName, toTypeName) ->
      if converters[fromTypeName]?[toTypeName]?
        delete converters[fromTypeName]?[toTypeName]

      return ko.typeRestricted

    return

