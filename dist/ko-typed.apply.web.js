;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['is-an'], factory);
  } else {
    root.applyKotr = factory(root.isAn);
  }
}(this, function (isAn) {
var applyKotr,
  slice = [].slice,
  hasProp = {}.hasOwnProperty;

applyKotr = function(ko) {
  var extend, fnFalse, fnIdentity, fnTrue, isTyped, isValidTypeName, normalizeEx, normalizeExRead, normalizeExWrite, normalizeValidation, typeNameToArray, typeNameToDistinctArray, typeNameToString, validate, wrapRead, wrapWrite;
  ko.typed = {};
  fnTrue = function() {
    return true;
  };
  fnFalse = function() {
    return false;
  };
  fnIdentity = function(x) {
    return x;
  };
  typeNameToString = function(value) {
    if ((value == null) || value.length === 0) {
      return void 0;
    } else if (isAn.String.Literal(value)) {
      return value;
    } else {
      return value.join('|');
    }
  };
  typeNameToArray = function(value) {
    value = typeNameToString(value);
    if (isAn.String.Literal(value)) {
      return value.split('|');
    } else {
      return [];
    }
  };
  typeNameToDistinctArray = function(value) {
    var i, len, result, typeName;
    value = typeNameToArray(value);
    result = [];
    for (i = 0, len = value.length; i < len; i++) {
      typeName = value[i];
      if (result.indexOf(typeName) === -1) {
        result.push(typeName);
      }
    }
    return result;
  };
  isValidTypeName = function(value) {
    return /^[A-Z]/.test(value);
  };
  isTyped = function(value) {
    return isAn.Function(value) && (value.typeName != null) && (value.typeNames != null) && (value.typeCheck != null) && (value.typeChecks != null);
  };
  ko.typed.options = {
    validation: {
      enable: false,
      read: true,
      write: true,
      target: false,
      result: true,
      message: void 0
    },
    exRead: {
      "catch": true,
      catchTrue: function(ex) {
        return ex instanceof TypeError;
      },
      catchFalse: fnFalse,
      useDefault: false,
      defaultValue: void 0,
      defaultFunc: void 0
    },
    exWrite: {
      "catch": true,
      catchTrue: function(ex) {
        return ex instanceof TypeError;
      },
      catchFalse: fnFalse,
      noThrow: false,
      useDefault: false,
      defaultValue: void 0,
      defaultFunc: void 0
    },
    pure: true,
    deferEvaluation: true
  };
  extend = function() {
    var i, len, object, objects, root;
    root = arguments[0], objects = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    for (i = 0, len = objects.length; i < len; i++) {
      object = objects[i];
      root = ko.utils.extend(root, object);
    }
    return root;
  };
  normalizeEx = function() {
    var key, name, object, objects, opt, root;
    name = arguments[0], root = arguments[1], objects = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    root[name] = opt = extend.apply(null, [{}].concat(slice.call((function() {
      var results;
      results = [];
      for (key in objects) {
        if (!hasProp.call(objects, key)) continue;
        object = objects[key];
        results.push(object != null ? object[name] : void 0);
      }
      return results;
    })())));
    if (opt["catch"] === true) {
      opt["catch"] = opt.catchTrue;
    } else if (opt["catch"] === false) {
      opt["catch"] = opt.catchFalse;
    }
    if (opt.useDefault && (opt.defaultFunc == null)) {
      opt.defaultFunc = function() {
        return opt.defaultValue;
      };
    }
    return opt;
  };
  normalizeExRead = function() {
    var objects, root;
    root = arguments[0], objects = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return normalizeEx.apply(null, ['exRead', root].concat(slice.call(objects)));
  };
  normalizeExWrite = function() {
    var objects, root;
    root = arguments[0], objects = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return normalizeEx.apply(null, ['exWrite', root].concat(slice.call(objects)));
  };
  normalizeValidation = function() {
    var key, norm, object, objects, opt, root;
    root = arguments[0], objects = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    norm = function(v) {
      if (v === true) {
        return {
          enable: true
        };
      } else if (v === false) {
        return {
          enable: false
        };
      } else {
        return v;
      }
    };
    root['validation'] = opt = extend.apply(null, [{}].concat(slice.call((function() {
      var results;
      results = [];
      for (key in objects) {
        if (!hasProp.call(objects, key)) continue;
        object = objects[key];
        results.push(norm(object != null ? object['validation'] : void 0));
      }
      return results;
    })())));
    return opt;
  };
  wrapRead = function(options, target, readError, read) {
    return function() {
      var error, ex;
      try {
        return read();
      } catch (error) {
        ex = error;
        if (options.exRead["catch"](ex)) {
          readError(ex);
          if (options.exRead.useDefault) {
            return options.exRead.defaultFunc();
          }
        }
        throw ex;
      } finally {
        if (ex == null) {
          readError(void 0);
        }
      }
    };
  };
  wrapWrite = function(options, target, writeError, write) {
    return function(value) {
      var error, ex;
      try {
        return write(value);
      } catch (error) {
        ex = error;
        if (options.exWrite["catch"](ex)) {
          writeError(ex);
          if (options.exWrite.useDefault) {
            target(options.exWrite.defaultFunc());
          }
        }
        if (!options.exWrite.noThrow) {
          throw ex;
        }
      } finally {
        if (ex == null) {
          writeError(void 0);
        }
      }
    };
  };
  validate = function(target, result, options) {
    var applyValidation, message, validation;
    if (!options.validation.enable) {
      return;
    }
    validation = options.validation;
    if ((!validation.target && !validation.result) || (!validation.read && !validation.write)) {
      return;
    }
    if (ko.validation != null) {

      /*
      Note that using ko validation will force an immediate evaluation of the targetted observables
       */
      if (options.validation.read && options.validation.write) {
        message = function() {
          var ref, ref1, ref2;
          return (ref = (ref1 = result.writeError()) != null ? ref1.message : void 0) != null ? ref : (ref2 = result.readError()) != null ? ref2.message : void 0;
        };
      } else if (options.validation.read) {
        message = function() {
          var ref;
          return (ref = result.readError()) != null ? ref.message : void 0;
        };
      } else {
        message = function() {
          var ref;
          return (ref = result.writeError()) != null ? ref.message : void 0;
        };
      }
      applyValidation = function(base) {
        var rule;
        base.extend({
          validatable: {
            enable: true
          }
        });
        rule = {
          message: void 0,
          validator: function() {
            var m, ref;
            m = message();
            if (m == null) {
              rule.message = void 0;
              return true;
            } else {
              rule.message = (ref = validation.message) != null ? ref : m;
              return false;
            }
          }
        };
        ko.validation.addAnonymousRule(base, rule);
      };
      if (validation.target) {
        applyValidation(target);
      }
      if (validation.result) {
        applyValidation(result);
      }
    }
  };
  ko.extenders.type = function(target, options) {
    var error, ex, name, normal, readError, ref, result, typeCheck, typeCheckSimple, typeChecks, typeChecksSimple, typeName, typeNames, writeError;
    if (isAn.String.Literal(options) || isAn.Array(options)) {
      options = {
        type: options
      };
    } else if (isAn.Function(options)) {
      options = {
        type: options.typeName,
        check: options
      };
    }
    normal = extend({}, ko.typed.options, ko.extenders.type.options, options);
    normalizeExRead(normal, ko.typed.options, ko.extenders.type.options, options);
    normalizeExWrite(normal, ko.typed.options, ko.extenders.type.options, options);
    normalizeValidation(normal, ko.typed.options, ko.extenders.type.options, options);
    options = normal;
    typeNames = typeNameToArray(options.type);
    typeNames.push.apply(typeNames, (function() {
      var results;
      results = [];
      for (name in options) {
        if (!hasProp.call(options, name)) continue;
        if (isValidTypeName(name)) {
          results.push(name);
        }
      }
      return results;
    })());
    typeNames = typeNameToDistinctArray(typeNames);
    typeName = typeNameToString(typeNames);
    typeChecksSimple = {};
    (function() {
      var i, len, ref, results;
      results = [];
      for (i = 0, len = typeNames.length; i < len; i++) {
        name = typeNames[i];
        results.push(typeChecksSimple[name] = (ref = options[name]) != null ? ref : isAn(name, {
          returnChecker: true
        }));
      }
      return results;
    })();
    typeCheckSimple = (ref = options.check) != null ? ref : (function() {
      return true;
    });
    typeChecks = {};
    (function() {
      var check, results;
      results = [];
      for (name in typeChecksSimple) {
        check = typeChecksSimple[name];
        results.push((function(check) {
          return typeChecks[name] = function(value) {
            return check(value) && typeCheckSimple(value);
          };
        })(check));
      }
      return results;
    })();
    typeCheck = (function() {
      return function(value) {
        return typeCheckSimple(value) && ((typeNames.length === 0) || (typeNames.some(function(name) {
          return typeChecksSimple[name](value);
        })));
      };
    })();
    readError = ko.observable();
    writeError = ko.observable();
    result = ko.computed({
      pure: options.pure,
      deferEvaluation: true,
      read: wrapRead(options, target, readError, function() {
        var internalValue;
        internalValue = target();
        if (!typeCheck(internalValue)) {
          throw new TypeError("Unexpected internal type. Expected " + typeName + ", got " + (isAn(internalValue)));
        }
        return internalValue;
      }),
      write: wrapWrite(options, target, writeError, function(externalValue) {
        if (typeCheck(externalValue)) {
          target(externalValue);
        } else {
          throw new TypeError("Unexpected external type. Expected " + typeName + ", received " + (isAn(externalValue)));
        }
      })
    });
    result.typeName = typeName;
    result.typeNames = typeNames;
    result.typeCheck = typeCheck;
    result.typeChecks = typeChecks;
    result.readError = readError;
    result.writeError = writeError;
    validate(target, result, options);
    if (!options.deferEvaluation) {
      try {
        result.peek();
      } catch (error) {
        ex = error;
        result.dispose();
        throw ex;
      }
    }
    return result;
  };
  ko.extenders.type.options = {};
  ko.extenders.convert = function(target, options) {
    var error, ex, readError, result, writeError;
    if (options === false) {
      return target;
    }
    (function() {
      var checker, extTypeName, extTypeOptions, i, intTypeName, intTypeOptions, len, normal, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7;
      if (isAn.String(options) || isAn.Array(options)) {
        options = {
          type: options
        };
      } else if (options === true) {
        options = {};
      }
      options = extend({}, ko.typed.options, ko.extenders.convert.options, options);
      normal = {
        checkSelf: (ref = options.check) != null ? ref : fnTrue,
        read: options.read,
        write: options.write,
        checks: {},
        checkers: [],
        isTyped: isTyped(target),
        ignoreDefaultConverters: options.ignoreDefaultConverters,
        pure: options.pure,
        deferEvaluation: options.deferEvaluation,
        types: typeNameToDistinctArray(options.type)
      };
      normalizeExRead(normal, ko.typed.options, ko.extenders.convert.options, options);
      normalizeExWrite(normal, ko.typed.options, ko.extenders.convert.options, options);
      normalizeValidation(normal, ko.typed.options, ko.extenders.convert.options, options);
      for (extTypeName in options) {
        if (!hasProp.call(options, extTypeName)) continue;
        extTypeOptions = options[extTypeName];
        if (!isValidTypeName(extTypeName)) {
          continue;
        }
        extTypeOptions = (ref1 = options[extTypeName]) != null ? ref1 : {};
        normal[extTypeName] = {
          checkSelf: extTypeOptions.check,
          read: extTypeOptions.read,
          write: extTypeOptions.write,
          types: typeNameToDistinctArray(extTypeOptions.type)
        };
        for (intTypeName in extTypeOptions) {
          if (!hasProp.call(extTypeOptions, intTypeName)) continue;
          if (!isValidTypeName(intTypeName)) {
            continue;
          }
          intTypeOptions = (ref2 = (ref3 = options[extTypeName]) != null ? ref3[intTypeName] : void 0) != null ? ref2 : {};
          normal[extTypeName][intTypeName] = {
            read: intTypeOptions.read,
            write: intTypeOptions.write
          };
        }
      }
      normal.type = typeNameToString(normal.types);
      ref4 = normal.types;
      for (i = 0, len = ref4.length; i < len; i++) {
        extTypeName = ref4[i];
        checker = (ref5 = (ref6 = (ref7 = normal[extTypeName]) != null ? ref7.checkSelf : void 0) != null ? ref6 : isAn(extTypeName, {
          returnChecker: true
        })) != null ? ref5 : fnTrue;
        normal.checks[extTypeName] = (function(checker) {
          return function(value) {
            return normal.checkSelf(value) && checker(value);
          };
        })(checker);
        normal.checkers.push(normal.checks[extTypeName]);
      }
      normal.check = function(value) {
        return normal.checkSelf(value) && ((normal.checkers.length === 0) || normal.checkers.some(function(checker) {
          return checker(value);
        }));
      };
      return options = normal;
    })();
    readError = ko.observable();
    writeError = ko.observable();
    result = ko.computed({
      pure: options.pure,
      deferEvaluation: true,
      read: wrapRead(options, target, readError, function() {
        var base1, extTypeName, extTypeNames, extTypeOptions, externalValue, i, intTypeName, intTypeNames, intTypeOptions, internalValue, j, k, len, len1, len2, ref, ref1, ref2, ref3, tryRead;
        internalValue = target();
        externalValue = void 0;
        tryRead = function(read, readOptions) {
          var error, ex;
          if (read != null) {
            try {
              externalValue = read(internalValue, readOptions);
            } catch (error) {
              ex = error;
              if (!(ex instanceof TypeError)) {
                throw ex;
              }
            }
            if (ex == null) {
              if (options.check(externalValue)) {
                return true;
              }
            }
          }
          return false;
        };
        extTypeNames = options.types;
        if (extTypeNames.length === 0) {
          extTypeNames = [isAn(internalValue)];
        }
        for (i = 0, len = extTypeNames.length; i < len; i++) {
          extTypeName = extTypeNames[i];
          extTypeOptions = (ref = options[extTypeName]) != null ? ref : {};
          intTypeNames = (ref1 = extTypeOptions.types) != null ? ref1 : [];
          if (intTypeNames.length === 0) {
            if (options.isTyped) {
              intTypeNames = target.typeNames;
            } else {
              intTypeNames = [isAn(internalValue)];
            }
          }
          for (j = 0, len1 = intTypeNames.length; j < len1; j++) {
            intTypeName = intTypeNames[j];
            if (options.isTyped && !(typeof (base1 = target.typeChecks)[intTypeName] === "function" ? base1[intTypeName](internalValue) : void 0)) {
              continue;
            }
            intTypeOptions = (ref2 = extTypeOptions[intTypeName]) != null ? ref2 : {};
            if (intTypeOptions.read != null) {
              if (tryRead(intTypeOptions.read, intTypeOptions.readOptions)) {
                return externalValue;
              }
            } else if (intTypeName === extTypeName) {
              if ((extTypeOptions.read == null) && (options.read == null) && tryRead(fnIdentity)) {
                return externalValue;
              }
            } else if (!options.ignoreDefaultConverters) {
              if (tryRead(ko.typed.getConverter(intTypeName, extTypeName), intTypeOptions.readOptions)) {
                return externalValue;
              }
            }
          }
        }
        for (k = 0, len2 = extTypeNames.length; k < len2; k++) {
          extTypeName = extTypeNames[k];
          extTypeOptions = (ref3 = options[extTypeName]) != null ? ref3 : {};
          if (tryRead(extTypeOptions.read, extTypeOptions.readOptions)) {
            return externalValue;
          }
        }
        if (tryRead(options.read, options.readOptions)) {
          return externalValue;
        }
        if (options.type != null) {
          throw new TypeError("Unable to convert from internal type " + (isAn(internalValue)) + " to external type " + options.type);
        } else {
          throw new TypeError("Unable to convert from internal type " + (isAn(internalValue)));
        }
      }),
      write: wrapWrite(options, target, writeError, function(externalValue) {
        var extTypeName, extTypeNames, extTypeOptions, i, intTypeName, intTypeNames, intTypeOptions, j, k, len, len1, len2, ref, ref1, ref2, ref3, tryWrite;
        tryWrite = function(write, writeOptions) {
          var error, ex, internalValue;
          if (write != null) {
            try {
              internalValue = write(externalValue, writeOptions);
            } catch (error) {
              ex = error;
              if (!(ex instanceof TypeError)) {
                throw ex;
              }
            }
            if (ex == null) {
              target(internalValue);
              return true;
            }
          }
          return false;
        };
        if ((options.checkSelf == null) || options.checkSelf(externalValue)) {
          extTypeNames = options.types;
          if (extTypeNames.length === 0) {
            extTypeNames = [isAn(externalValue)];
          }
          for (i = 0, len = extTypeNames.length; i < len; i++) {
            extTypeName = extTypeNames[i];
            extTypeOptions = (ref = options[extTypeName]) != null ? ref : {};
            if (((extTypeOptions.checkSelf != null) && !extTypeOptions.checkSelf(externalValue)) || ((extTypeOptions.checkSelf == null) && !isAn(externalValue, extTypeName))) {
              continue;
            }
            intTypeNames = (ref1 = extTypeOptions.types) != null ? ref1 : [];
            if (intTypeNames.length === 0) {
              if (options.isTyped) {
                intTypeNames = target.typeNames;
              } else {
                intTypeNames = [isAn(externalValue)];
              }
            }
            for (j = 0, len1 = intTypeNames.length; j < len1; j++) {
              intTypeName = intTypeNames[j];
              intTypeOptions = (ref2 = extTypeOptions[intTypeName]) != null ? ref2 : {};
              if (intTypeOptions.write != null) {
                if (tryWrite(intTypeOptions.write, intTypeOptions.writeOptions)) {
                  return;
                }
              } else if (extTypeName === intTypeName) {
                if ((extTypeOptions.write == null) && (options.write == null) && (!options.isTyped || target.typeChecks[extTypeName](externalValue)) && tryWrite(fnIdentity)) {
                  return;
                }
              } else if (!options.ignoreDefaultConverters) {
                if (tryWrite(ko.typed.getConverter(extTypeName, intTypeName), intTypeOptions.writeOptions)) {
                  return;
                }
              }
            }
          }
          for (k = 0, len2 = extTypeNames.length; k < len2; k++) {
            extTypeName = extTypeNames[k];
            extTypeOptions = (ref3 = options[extTypeName]) != null ? ref3 : {};
            if (((extTypeOptions.checkSelf != null) && !extTypeOptions.checkSelf(externalValue)) || ((extTypeOptions.checkSelf == null) && !isAn(externalValue, extTypeName))) {
              continue;
            }
            if (tryWrite(extTypeOptions.write, extTypeOptions.writeOptions)) {
              return;
            }
          }
          if (tryWrite(options.write, options.writeOptions)) {
            return;
          }
        }
        if (options.isTyped) {
          throw new TypeError("Unable to convert from external type " + (isAn(externalValue)) + " to internal type " + target.typeName);
        } else {
          throw new TypeError("Unable to convert from external type " + (isAn(externalValue)));
        }
      })
    });
    result.typeName = options.type;
    result.typeNames = options.types;
    result.typeCheck = options.check;
    result.typeChecks = options.checks;
    result.readError = readError;
    result.writeError = writeError;
    validate(target, result, options);
    if (!options.deferEvaluation) {
      try {
        result.peek();
      } catch (error) {
        ex = error;
        result.dispose();
        throw ex;
      }
    }
    return result;
  };
  ko.extenders.convert.options = {};
  (function() {
    var converters;
    ko.typed._converters = converters = {};
    ko.typed.addConverter = function(fromTypeName, toTypeName, converter, defaultOptions, defaultOption) {
      var wrapper;
      if (typeof console !== "undefined" && console !== null) {
        if (typeof console.assert === "function") {
          console.assert(isValidTypeName(fromTypeName), "Invalid typeName " + fromTypeName);
        }
      }
      if (typeof console !== "undefined" && console !== null) {
        if (typeof console.assert === "function") {
          console.assert(isValidTypeName(toTypeName), "Invalid typeName " + fromTypeName);
        }
      }
      if (defaultOptions != null) {
        if (defaultOption != null) {
          wrapper = function(value, options) {
            var o;
            if (arguments.length === 2 && !isAn.Object(options)) {
              o = {};
              o[defaultOption] = options;
              options = o;
            }
            return converter(value, ko.utils.extend(ko.utils.extend({}, wrapper.options), options));
          };
        } else {
          wrapper = function(value, options) {
            return converter(value, ko.utils.extend(ko.utils.extend({}, wrapper.options), options));
          };
        }
      } else {
        wrapper = function(value) {
          return converter(value);
        };
      }
      wrapper.options = defaultOptions;
      if (converters[fromTypeName] == null) {
        converters[fromTypeName] = {};
      }
      converters[fromTypeName][toTypeName] = wrapper;
      return ko.typed;
    };
    ko.typed.getConverter = function(fromTypeName, toTypeName) {
      var ref;
      return (ref = converters[fromTypeName]) != null ? ref[toTypeName] : void 0;
    };
    ko.typed.removeConverter = function(fromTypeName, toTypeName) {
      var ref, ref1;
      if (((ref = converters[fromTypeName]) != null ? ref[toTypeName] : void 0) != null) {
        if ((ref1 = converters[fromTypeName]) != null) {
          delete ref1[toTypeName];
        }
      }
      return ko.typed;
    };
  })();
  (function() {
    var decimalAdjust;
    decimalAdjust = function(type, value, exp) {
      if ((exp == null) || +exp === 0) {
        return type(value);
      }
      value = +value;
      exp = +exp;
      if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
      }
      value = value.toString().split('e');
      value = type(+(value[0] + 'e' + (value[1] ? +value[1] - exp : -exp)));
      value = value.toString().split('e');
      return +(value[0] + 'e' + (value[1] ? +value[1] + exp : exp));
    };

    /* !pragma coverage-skip-next */
    if (Math.round10 == null) {
      Math.round10 = function(value, exp) {
        return decimalAdjust(Math.round, value, exp);
      };
    }

    /* !pragma coverage-skip-next */
    if (Math.floor10 == null) {
      Math.floor10 = function(value, exp) {
        return decimalAdjust(Math.floor, value, exp);
      };
    }

    /* !pragma coverage-skip-next */
    if (Math.ceil10 == null) {
      Math.ceil10 = function(value, exp) {
        return decimalAdjust(Math.ceil, value, exp);
      };
    }
  })();
  ko.typed.addConverter('Boolean', 'Number.Integer', function(value, options) {
    if (value) {
      return options.truthy;
    } else {
      return options.falsey;
    }
  }, {
    truthy: 1,
    falsey: 0
  }, 'truthy');
  ko.typed.addConverter('Boolean', 'Number', function(value, options) {
    if (value) {
      return options.truthy;
    } else {
      return options.falsey;
    }
  }, {
    truthy: 1,
    falsey: 0
  }, 'truthy');
  ko.typed.addConverter('Boolean', 'String', function(value, options) {
    value = value ? options.truthy : options.falsey;
    if (options.upperCase) {
      value = value.toUpperCase();
    }
    return value;
  }, {
    upperCase: false,
    truthy: 'true',
    falsey: 'false'
  }, 'upperCase');
  ko.typed.addConverter('Date', 'Moment', function(value, options) {
    return (typeof moment !== "undefined" && moment !== null ? moment : require('moment'))(value);
  });
  ko.typed.addConverter('Date', 'String', function(value, options) {
    var method;
    if (isNaN(value.valueOf())) {
      return '';
    }
    method = options.formats[options.format];
    return value[method].apply(value, options.params);
  }, {
    formats: {
      date: 'toDateString',
      iso: 'toISOString',
      json: 'toJSON',
      localeDate: 'toLocaleDateString',
      localeTime: 'toLocaleTimeString',
      locale: 'toLocaleString',
      time: 'toTimeString',
      utc: 'toUTCString',
      "default": 'toString'
    },
    format: 'default',
    params: []
  }, 'format');
  ko.typed.addConverter('Date', 'Undefined', function(value, options) {
    if (!isNaN(value.valueOf())) {
      throw new TypeError('Unable to convert from valid Date to Undefined');
    }
    return void 0;
  });
  ko.typed.addConverter('Moment', 'Date', function(value, options) {
    return value.toDate();
  });
  ko.typed.addConverter('Moment', 'String', function(value, options) {
    if (!value.isValid()) {
      return '';
    }
    return value.locale(options.locale).format(options.format);
  }, {
    locale: 'en',
    format: 'L'
  }, 'format');
  ko.typed.addConverter('Moment', 'Undefined', function(value, options) {
    if (value.isValid()) {
      throw new TypeError('Unable to convert from valid Moment to Undefined');
    }
    return void 0;
  });
  ko.typed.addConverter('Number', 'Boolean', function(value, options) {
    if ((options.falsey != null) && value === options.falsey) {
      return false;
    } else if ((options.truthy != null) && value === options.truthy) {
      return true;
    } else if (options.falsey == null) {
      return false;
    } else if (options.truthy == null) {
      return true;
    }
    throw new TypeError("Cannot convert from " + value + " to Boolean");
  }, {
    truthy: void 0,
    falsey: 0
  });
  ko.typed.addConverter('Number', 'Number.Integer', function(value, options) {
    var mode;
    if (options.mode == null) {
      if (!isAn.Number.Integer(value)) {
        throw new TypeError('Cannot convert from Number to Number.Integer. Number is not an integer');
      }
      return value;
    } else if (typeof options.mode === 'string') {
      mode = Math[options.mode];
    } else {
      mode = options.mode;
    }
    return mode(value);
  }, {
    mode: void 0
  }, 'mode');
  ko.typed.addConverter('Number', 'String', function(value, options) {
    if (options.decimals != null) {
      value = Math.round10(value, -options.decimals);
      value = value.toFixed(options.decimals);
    } else {
      value = value.toString();
    }
    return value;
  }, {
    decimals: void 0
  }, 'decimals');
  ko.typed.addConverter('Number.Integer', 'Boolean', function(value, options) {
    if ((options.falsey != null) && value === options.falsey) {
      return false;
    } else if ((options.truthy != null) && value === options.truthy) {
      return true;
    } else if (options.falsey == null) {
      return false;
    } else if (options.truthy == null) {
      return true;
    }
    throw new TypeError("Cannot convert from " + value + " to Boolean");
  }, {
    truthy: void 0,
    falsey: 0
  });
  ko.typed.addConverter('Number.Integer', 'Number', function(value, options) {
    return value;
  });
  ko.typed.addConverter('Number.Integer', 'String', function(value, options) {
    value = value.toString(options.base);
    if (options.upperCase) {
      value = value.toUpperCase();
    }
    return value;
  }, {
    base: 10,
    upperCase: false
  }, 'base');
  ko.typed.addConverter('String', 'Boolean', function(value, options) {
    var falsey, i, j, len, len1, ref, ref1, truthy;
    if (options.trim) {
      value = value.trim();
    }
    if (options.ignoreCase) {
      value = value.toLowerCase();
    }
    if (options.strict) {
      if (value === options.truthy[0]) {
        return true;
      } else if (value === options.falsey[0]) {
        return false;
      }
    } else {
      ref = options.truthy;
      for (i = 0, len = ref.length; i < len; i++) {
        truthy = ref[i];
        if (value === truthy) {
          return true;
        }
      }
      ref1 = options.falsey;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        falsey = ref1[j];
        if (value === falsey) {
          return false;
        }
      }
    }
    throw new TypeError("Cannot convert from " + value + " to Boolean");
  }, {
    ignoreCase: true,
    strict: false,
    truthy: ['true', 't', '1', '-1', 'yes', 'y'],
    falsey: ['false', 'f', '0', 'no', 'n'],
    trim: false
  }, 'strict');
  ko.typed.addConverter('String', 'Date', function(value, options) {
    var date, match, num, time, tz;
    if (options.trim) {
      value = value.trim();
    }
    if (options.strict) {
      match = value.match(options.format);
      if (match == null) {
        throw TypeError('Unable to convert from String to Date');
      }
      num = function(value, def) {
        if ((value != null) && value !== '') {
          return parseFloat(value);
        } else {
          return def;
        }
      };
      tz = void 0;
      if ((match[7] != null) && match[7] !== '') {
        tz = (num(match[options.formatDict.tzHours]) * 60 + num(match[options.formatDict.tzMinutes])) * 60 * 1000;
        if (match[options.formatDict.tzSign] === '-') {
          tz *= -1;
        }
      }
      if (options.utc || (tz != null)) {
        time = Date.UTC(num(match[options.formatDict.year], 0), num(match[options.formatDict.month], 1) - 1, num(match[options.formatDict.day], 1), num(match[options.formatDict.hours], 0), num(match[options.formatDict.minutes], 0), num(match[options.formatDict.seconds], 0));
        if (tz != null) {
          time += tz;
        }
        date = new Date(time);
      } else {
        date = new Date(num(match[options.formatDict.year], 0), num(match[options.formatDict.month], 1) - 1, num(match[options.formatDict.day], 1), num(match[options.formatDict.hours], 0), num(match[options.formatDict.minutes], 0), num(match[options.formatDict.seconds], 0));
        date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
      }
    } else {
      date = new Date(value);
    }
    if (isNaN(date.valueOf())) {
      throw TypeError('Unable to convert from String to Date');
    }
    return date;
  }, {
    format: /^([0-9]{4})-([0-9]{2})-([0-9]{2})(?:(?:T|\s)([0-9]{2}):([0-9]{2})(?::([0-9]{2}(?:.[0-9]+)?))?(?:(\+|\-)([0-9]{2}):([0-9]{2}))?)?$/,
    formatDict: {
      year: 1,
      month: 2,
      day: 3,
      hours: 4,
      minutes: 5,
      seconds: 6,
      tzSign: 7,
      tzHours: 8,
      tzMinutes: 9
    },
    utc: false,
    strict: true,
    trim: false
  });
  ko.typed.addConverter('String', 'Moment', function(value, options) {
    var result;
    if (options.trim) {
      value = value.trim();
    }
    result = (typeof moment !== "undefined" && moment !== null ? moment : require('moment'))(value, options.format, options.language, options.strict);
    if (!result.isValid()) {
      throw new TypeError('Unable to convert from String to Moment');
    }
    return result;
  }, {
    strict: false,
    language: 'en',
    format: 'L',
    trim: false
  }, 'format');
  ko.typed.addConverter('String', 'Number.Integer', function(value, options) {
    var chars, error, ex, ref;
    if (options.trim) {
      value = value.trim();
    }
    if (options.base === 10 && !options.strict) {
      try {
        return ko.typed.getConverter('String', 'Number')(value, 0);
      } catch (error) {
        ex = error;
        throw new TypeError("Unable to convert from " + value + " to Number.Integer");
      }
    }
    chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    if (!RegExp("^(\\-|\\+)?[" + (chars.slice(0, (ref = options.base) != null ? ref : 10)) + "]+$", !options.strict ? 'i' : void 0).test(value)) {
      throw new TypeError("Unable to convert from " + value + " to Number.Integer");
    }
    return parseInt(value, options.base);
  }, {
    base: 10,
    strict: false,
    trim: false
  }, 'base');
  ko.typed.addConverter('String', 'Number', function(value, options) {
    if (options.trim) {
      value = value.trim();
    }
    if (!/^(\+|\-)?[0-9]+(\.?)[0-9]*$/.test(value)) {
      throw new TypeError("Unable to convert from " + value + " to Number");
    }
    value = parseFloat(value, options.base);
    if (options.decimals != null) {
      value = Math.round10(value, -options.decimals);
    }
    return value;
  }, {
    decimals: void 0,
    trim: false
  }, 'decimals');
  ko.typed.addConverter('String', 'Undefined', function(value, options) {
    if (options.trim) {
      value = value.trim();
    }
    if (value.length !== 0) {
      throw new TypeError("Unable to convert from " + value + " to Undefined");
    }
    return void 0;
  }, {
    trim: false
  });
  ko.typed.addConverter('Undefined', 'Date', function(value) {
    return new Date(NaN);
  });
  ko.typed.addConverter('Undefined', 'Moment', function(value) {
    return require('moment').invalid();
  });
  ko.typed.addConverter('Undefined', 'String', function(value) {
    return '';
  });
  return ko;
};

return applyKotr;
}));

//# sourceMappingURL=data:application/json;base64,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O01BQ0UsS0FBQSxHQUFRLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBYixFQUFvQixDQUFDLE9BQU8sQ0FBQyxRQUE3QixFQURWOztBQUdBLFdBQU87RUFaVCxDQUhGLEVBZ0JFO0lBQ0UsUUFBQSxFQUFVLE1BRFo7SUFFRSxJQUFBLEVBQU0sS0FGUjtHQWhCRixFQW9CRSxVQXBCRjtFQXVCQSxFQUFFLENBQUMsS0FBSyxDQUFDLFlBQVQsQ0FDRSxRQURGLEVBRUUsV0FGRixFQUdFLFNBQUMsS0FBRCxFQUFRLE9BQVI7SUFDRSxJQUFHLE9BQU8sQ0FBQyxJQUFYO01BQ0UsS0FBQSxHQUFRLEtBQUssQ0FBQyxJQUFOLENBQUEsRUFEVjs7SUFHQSxJQUFHLEtBQUssQ0FBQyxNQUFOLEtBQWdCLENBQW5CO0FBQ0UsWUFBVSxJQUFBLFNBQUEsQ0FBVSx5QkFBQSxHQUEwQixLQUExQixHQUFnQyxlQUExQyxFQURaOztBQUdBLFdBQU87RUFQVCxDQUhGLEVBV0U7SUFDRSxJQUFBLEVBQU0sS0FEUjtHQVhGO0VBZ0JBLEVBQUUsQ0FBQyxLQUFLLENBQUMsWUFBVCxDQUNFLFdBREYsRUFFRSxNQUZGLEVBR0UsU0FBQyxLQUFEO0FBQ0UsV0FBVyxJQUFBLElBQUEsQ0FBSyxHQUFMO0VBRGIsQ0FIRjtFQU9BLEVBQUUsQ0FBQyxLQUFLLENBQUMsWUFBVCxDQUNFLFdBREYsRUFFRSxRQUZGLEVBR0UsU0FBQyxLQUFEO0FBQ0UsV0FBTyxPQUFBLENBQVEsUUFBUixDQUFpQixDQUFDLE9BQWxCLENBQUE7RUFEVCxDQUhGO0VBT0EsRUFBRSxDQUFDLEtBQUssQ0FBQyxZQUFULENBQ0UsV0FERixFQUVFLFFBRkYsRUFHRSxTQUFDLEtBQUQ7QUFDRSxXQUFPO0VBRFQsQ0FIRjtBQU9BLFNBQU87QUFybUNHIiwiZmlsZSI6ImtvLXR5cGVkLmFwcGx5LndlYi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImFwcGx5S290ciA9IChrbykgLT5cclxuICBrby50eXBlZCA9IHt9XHJcblxyXG4gIGZuVHJ1ZSA9ICgpIC0+IHRydWVcclxuICBmbkZhbHNlID0gKCkgLT4gZmFsc2VcclxuICBmbklkZW50aXR5ID0gKHgpIC0+IHhcclxuXHJcbiAgdHlwZU5hbWVUb1N0cmluZyA9ICh2YWx1ZSkgLT5cclxuICAgIGlmIG5vdCB2YWx1ZT8gb3IgdmFsdWUubGVuZ3RoID09IDBcclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gICAgZWxzZSBpZiBpc0FuLlN0cmluZy5MaXRlcmFsKHZhbHVlKVxyXG4gICAgICByZXR1cm4gdmFsdWVcclxuICAgIGVsc2VcclxuICAgICAgcmV0dXJuIHZhbHVlLmpvaW4oJ3wnKVxyXG5cclxuICB0eXBlTmFtZVRvQXJyYXkgPSAodmFsdWUpIC0+XHJcbiAgICB2YWx1ZSA9IHR5cGVOYW1lVG9TdHJpbmcodmFsdWUpXHJcbiAgICBpZiBpc0FuLlN0cmluZy5MaXRlcmFsKHZhbHVlKVxyXG4gICAgICByZXR1cm4gdmFsdWUuc3BsaXQoJ3wnKVxyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm4gW11cclxuXHJcbiAgdHlwZU5hbWVUb0Rpc3RpbmN0QXJyYXkgPSAodmFsdWUpIC0+XHJcbiAgICB2YWx1ZSA9IHR5cGVOYW1lVG9BcnJheSh2YWx1ZSlcclxuXHJcbiAgICByZXN1bHQgPSBbXVxyXG4gICAgZm9yIHR5cGVOYW1lIGluIHZhbHVlXHJcbiAgICAgIGlmIHJlc3VsdC5pbmRleE9mKHR5cGVOYW1lKSA9PSAtMVxyXG4gICAgICAgIHJlc3VsdC5wdXNoKHR5cGVOYW1lKVxyXG5cclxuICAgIHJldHVybiByZXN1bHRcclxuXHJcbiAgaXNWYWxpZFR5cGVOYW1lID0gKHZhbHVlKSAtPlxyXG4gICAgcmV0dXJuIC9eW0EtWl0vLnRlc3QodmFsdWUpXHJcblxyXG4gIGlzVHlwZWQgPSAodmFsdWUpIC0+XHJcbiAgICByZXR1cm4gaXNBbi5GdW5jdGlvbih2YWx1ZSkgYW5kIHZhbHVlLnR5cGVOYW1lPyBhbmQgdmFsdWUudHlwZU5hbWVzPyBhbmQgdmFsdWUudHlwZUNoZWNrPyBhbmQgdmFsdWUudHlwZUNoZWNrcz9cclxuXHJcbiAga28udHlwZWQub3B0aW9ucyA9IHtcclxuICAgICMgdmFsaWRhdGlvbiBvcHRpb25zXHJcbiAgICB2YWxpZGF0aW9uOiB7XHJcbiAgICAgICMgdHVybiB2YWxpZGF0aW9uIG9uL29mZlxyXG4gICAgICBlbmFibGU6IGZhbHNlXHJcblxyXG4gICAgICAjIHZhbGlkYXRlIG9uIHJlYWRcclxuICAgICAgcmVhZDogdHJ1ZVxyXG5cclxuICAgICAgIyB2YWxpZGF0ZSBvbiB3cml0ZVxyXG4gICAgICB3cml0ZTogdHJ1ZVxyXG5cclxuICAgICAgIyB2YWxpZGF0ZSB0aGUgdW5kZXJseWluZyBvYnNlcnZhYmxlXHJcbiAgICAgIHRhcmdldDogZmFsc2VcclxuXHJcbiAgICAgICMgdmFsaWRhdGUgdGhlIHJlc3VsdGluZyBvYnNlcnZhYmxlXHJcbiAgICAgIHJlc3VsdDogdHJ1ZVxyXG5cclxuICAgICAgIyB0aGUgbWVzc2FnZSB0byB1c2UgKGRlZmF1bHRzIHRvIHRoZSBtZXNzYWdlIGZyb20gdGhlIHRocm93biBleGNlcHRpb24pXHJcbiAgICAgIG1lc3NhZ2U6IHVuZGVmaW5lZFxyXG4gICAgfVxyXG5cclxuICAgIGV4UmVhZDoge1xyXG4gICAgICAjIENhdGNoIGV4Y2VwdGlvbnMuIE1heSBhbHNvIGJlIGEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBleGNlcHRpb24gc2hvdWxkIGJlIGNhdWdodFxyXG4gICAgICBjYXRjaDogdHJ1ZVxyXG5cclxuICAgICAgIyBkZWZhdWx0IGNhdGNoIGZ1bmN0aW9uIHRvIHVzZSB3aGVuIGNhdGNoIGlzIHRydWUvZmFsc2VcclxuICAgICAgY2F0Y2hUcnVlOiAoZXgpIC0+IGV4IGluc3RhbmNlb2YgVHlwZUVycm9yXHJcbiAgICAgIGNhdGNoRmFsc2U6IGZuRmFsc2VcclxuXHJcbiAgICAgICMgRG8gbm90IHRocm93IGV4Y2VwdGlvbnMgd2hlbiByZWFkaW5nLiBVc2UgZGVmYXVsdCB2YWx1ZS9mdW5jIGluc3RlYWRcclxuICAgICAgdXNlRGVmYXVsdDogZmFsc2VcclxuXHJcbiAgICAgICMgRGVmYXVsdCB2YWx1ZSB0byB1c2Ugd2hlbiBhbiBleGNlcHRpb24gaXMgY2F1Z2h0XHJcbiAgICAgIGRlZmF1bHRWYWx1ZTogdW5kZWZpbmVkXHJcblxyXG4gICAgICAjIENvbXB1dGUgYSBkZWZhdWx0IHZhbHVlIHdoZW4gYW4gZXhjZXB0aW9uIGlzIGNhdWdodC4gT3ZlcnJpZGVzIGRlZmF1bHRWYWx1ZVxyXG4gICAgICBkZWZhdWx0RnVuYzogdW5kZWZpbmVkXHJcbiAgICB9XHJcbiAgICBleFdyaXRlOiB7XHJcbiAgICAgICMgQ2F0Y2ggZXhjZXB0aW9ucy4gTWF5IGFsc28gYmUgYSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIGV4Y2VwdGlvbiBzaG91bGQgYmUgY2F1Z2h0XHJcbiAgICAgIGNhdGNoOiB0cnVlXHJcblxyXG4gICAgICAjIGRlZmF1bHQgY2F0Y2ggZnVuY3Rpb24gdG8gdXNlIHdoZW4gY2F0Y2ggaXMgdHJ1ZS9mYWxzZVxyXG4gICAgICBjYXRjaFRydWU6IChleCkgLT4gZXggaW5zdGFuY2VvZiBUeXBlRXJyb3JcclxuICAgICAgY2F0Y2hGYWxzZTogZm5GYWxzZVxyXG5cclxuICAgICAgIyBEbyBub3QgdGhyb3cgZXhjZXB0aW9ucyB3aGVuIHdyaXRpbmdcclxuICAgICAgbm9UaHJvdzogZmFsc2VcclxuXHJcbiAgICAgICMgRG8gbm90IGxlYXZlIHRhcmdldCB1bnNldC4gU2V0IHRoZSB0YXJnZXQgdG8gdGhpcyB2YWx1ZSBvbiBlcnJvclxyXG4gICAgICB1c2VEZWZhdWx0OiBmYWxzZVxyXG5cclxuICAgICAgIyBEZWZhdWx0IHZhbHVlIHRvIHVzZSB3aGVuIGFuIGV4Y2VwdGlvbiBpcyBjYXVnaHRcclxuICAgICAgZGVmYXVsdFZhbHVlOiB1bmRlZmluZWRcclxuXHJcbiAgICAgICMgQ29tcHV0ZSBhIGRlZmF1bHQgdmFsdWUgd2hlbiBhbiBleGNlcHRpb24gaXMgY2F1Z2h0LiBPdmVycmlkZXMgZGVmYXVsdFZhbHVlXHJcbiAgICAgIGRlZmF1bHRGdW5jOiB1bmRlZmluZWRcclxuICAgIH1cclxuXHJcbiAgICAjIHVzZSBwdXJlIGNvbXB1dGVkIG9ic2VydmFibGVzXHJcbiAgICBwdXJlOiB0cnVlXHJcblxyXG4gICAgIyBkbyBub3QgYXR0ZW1wdCB0byByZWFkIHRoZSB2YWx1ZSBpbW1lZGlhdGVseVxyXG4gICAgZGVmZXJFdmFsdWF0aW9uOiB0cnVlXHJcbiAgfVxyXG5cclxuICBleHRlbmQgPSAocm9vdCwgb2JqZWN0cy4uLikgLT5cclxuICAgIGZvciBvYmplY3QgaW4gb2JqZWN0c1xyXG4gICAgICByb290ID0ga28udXRpbHMuZXh0ZW5kKHJvb3QsIG9iamVjdClcclxuICAgIHJldHVybiByb290XHJcblxyXG4gIG5vcm1hbGl6ZUV4ID0gKG5hbWUsIHJvb3QsIG9iamVjdHMuLi4pIC0+XHJcbiAgICByb290W25hbWVdID0gb3B0ID0gZXh0ZW5kKHt9LCAob2JqZWN0P1tuYW1lXSBmb3Igb3duIGtleSwgb2JqZWN0IG9mIG9iamVjdHMpLi4uKVxyXG5cclxuICAgICMgZm9yY2UgY2F0Y2ggdG8gYmUgYSBmdW5jdGlvblxyXG4gICAgaWYgb3B0LmNhdGNoID09IHRydWVcclxuICAgICAgb3B0LmNhdGNoID0gb3B0LmNhdGNoVHJ1ZVxyXG4gICAgZWxzZSBpZiBvcHQuY2F0Y2ggPT0gZmFsc2VcclxuICAgICAgb3B0LmNhdGNoID0gb3B0LmNhdGNoRmFsc2VcclxuXHJcbiAgICAjIGZvcmNlIGRlZmF1bHRGdW5jXHJcbiAgICBpZiBvcHQudXNlRGVmYXVsdCBhbmQgbm90IG9wdC5kZWZhdWx0RnVuYz9cclxuICAgICAgb3B0LmRlZmF1bHRGdW5jID0gKCkgLT4gb3B0LmRlZmF1bHRWYWx1ZVxyXG5cclxuICAgIHJldHVybiBvcHRcclxuXHJcbiAgbm9ybWFsaXplRXhSZWFkID0gKHJvb3QsIG9iamVjdHMuLi4pIC0+XHJcbiAgICBub3JtYWxpemVFeCgnZXhSZWFkJywgcm9vdCwgb2JqZWN0cy4uLilcclxuXHJcbiAgbm9ybWFsaXplRXhXcml0ZSA9IChyb290LCBvYmplY3RzLi4uKSAtPlxyXG4gICAgbm9ybWFsaXplRXgoJ2V4V3JpdGUnLCByb290LCBvYmplY3RzLi4uKVxyXG5cclxuICBub3JtYWxpemVWYWxpZGF0aW9uID0gKHJvb3QsIG9iamVjdHMuLi4pIC0+XHJcbiAgICBub3JtID0gKHYpIC0+XHJcbiAgICAgIGlmIHYgPT0gdHJ1ZVxyXG4gICAgICAgIHJldHVybiB7IGVuYWJsZTogdHJ1ZSB9XHJcbiAgICAgIGVsc2UgaWYgdiA9PSBmYWxzZVxyXG4gICAgICAgIHJldHVybiB7IGVuYWJsZTogZmFsc2UgfVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgcmV0dXJuIHZcclxuXHJcbiAgICByb290Wyd2YWxpZGF0aW9uJ10gPSBvcHQgPSBleHRlbmQoe30sIChub3JtKG9iamVjdD9bJ3ZhbGlkYXRpb24nXSkgZm9yIG93biBrZXksIG9iamVjdCBvZiBvYmplY3RzKS4uLilcclxuXHJcbiAgICByZXR1cm4gb3B0XHJcblxyXG4gIHdyYXBSZWFkID0gKG9wdGlvbnMsIHRhcmdldCwgcmVhZEVycm9yLCByZWFkKSAtPlxyXG4gICAgcmV0dXJuICgpIC0+XHJcbiAgICAgIHRyeVxyXG4gICAgICAgIHJldHVybiByZWFkKClcclxuICAgICAgY2F0Y2ggZXhcclxuICAgICAgICBpZiBvcHRpb25zLmV4UmVhZC5jYXRjaChleClcclxuICAgICAgICAgIHJlYWRFcnJvcihleClcclxuXHJcbiAgICAgICAgICBpZiBvcHRpb25zLmV4UmVhZC51c2VEZWZhdWx0XHJcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmV4UmVhZC5kZWZhdWx0RnVuYygpXHJcblxyXG4gICAgICAgIHRocm93IGV4XHJcbiAgICAgIGZpbmFsbHlcclxuICAgICAgICBpZiBub3QgZXg/XHJcbiAgICAgICAgICByZWFkRXJyb3IodW5kZWZpbmVkKVxyXG5cclxuICB3cmFwV3JpdGUgPSAob3B0aW9ucywgdGFyZ2V0LCB3cml0ZUVycm9yLCB3cml0ZSkgLT5cclxuICAgIHJldHVybiAodmFsdWUpIC0+XHJcbiAgICAgIHRyeVxyXG4gICAgICAgIHdyaXRlKHZhbHVlKVxyXG4gICAgICBjYXRjaCBleFxyXG4gICAgICAgIGlmIG9wdGlvbnMuZXhXcml0ZS5jYXRjaChleClcclxuICAgICAgICAgIHdyaXRlRXJyb3IoZXgpXHJcblxyXG4gICAgICAgICAgaWYgb3B0aW9ucy5leFdyaXRlLnVzZURlZmF1bHRcclxuICAgICAgICAgICAgdGFyZ2V0KG9wdGlvbnMuZXhXcml0ZS5kZWZhdWx0RnVuYygpKVxyXG5cclxuICAgICAgICBpZiBub3Qgb3B0aW9ucy5leFdyaXRlLm5vVGhyb3dcclxuICAgICAgICAgIHRocm93IGV4XHJcbiAgICAgIGZpbmFsbHlcclxuICAgICAgICBpZiBub3QgZXg/XHJcbiAgICAgICAgICB3cml0ZUVycm9yKHVuZGVmaW5lZClcclxuXHJcbiAgdmFsaWRhdGUgPSAodGFyZ2V0LCByZXN1bHQsIG9wdGlvbnMpIC0+XHJcbiAgICBpZiBub3Qgb3B0aW9ucy52YWxpZGF0aW9uLmVuYWJsZVxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICB2YWxpZGF0aW9uID0gb3B0aW9ucy52YWxpZGF0aW9uXHJcblxyXG4gICAgaWYgKG5vdCB2YWxpZGF0aW9uLnRhcmdldCBhbmQgbm90IHZhbGlkYXRpb24ucmVzdWx0KSBvciAobm90IHZhbGlkYXRpb24ucmVhZCBhbmQgbm90IHZhbGlkYXRpb24ud3JpdGUpXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIGlmIGtvLnZhbGlkYXRpb24/XHJcbiAgICAgICMjI1xyXG4gICAgICBOb3RlIHRoYXQgdXNpbmcga28gdmFsaWRhdGlvbiB3aWxsIGZvcmNlIGFuIGltbWVkaWF0ZSBldmFsdWF0aW9uIG9mIHRoZSB0YXJnZXR0ZWQgb2JzZXJ2YWJsZXNcclxuICAgICAgIyMjXHJcbiAgICAgIGlmIG9wdGlvbnMudmFsaWRhdGlvbi5yZWFkIGFuZCBvcHRpb25zLnZhbGlkYXRpb24ud3JpdGVcclxuICAgICAgICBtZXNzYWdlID0gKCkgLT4gcmVzdWx0LndyaXRlRXJyb3IoKT8ubWVzc2FnZSA/IHJlc3VsdC5yZWFkRXJyb3IoKT8ubWVzc2FnZVxyXG4gICAgICBlbHNlIGlmIG9wdGlvbnMudmFsaWRhdGlvbi5yZWFkXHJcbiAgICAgICAgbWVzc2FnZSA9ICgpIC0+IHJlc3VsdC5yZWFkRXJyb3IoKT8ubWVzc2FnZVxyXG4gICAgICBlbHNlICNpZiBvcHRpb25zLnZhbGlkYXRpb24ud3JpdGVcclxuICAgICAgICBtZXNzYWdlID0gKCkgLT4gcmVzdWx0LndyaXRlRXJyb3IoKT8ubWVzc2FnZVxyXG5cclxuICAgICAgYXBwbHlWYWxpZGF0aW9uID0gKGJhc2UpIC0+XHJcbiAgICAgICAgYmFzZS5leHRlbmQoeyB2YWxpZGF0YWJsZTogeyBlbmFibGU6IHRydWUgfSB9KVxyXG5cclxuICAgICAgICBydWxlID0ge1xyXG4gICAgICAgICAgbWVzc2FnZTogdW5kZWZpbmVkXHJcbiAgICAgICAgICB2YWxpZGF0b3I6ICgpIC0+XHJcbiAgICAgICAgICAgIG0gPSBtZXNzYWdlKClcclxuICAgICAgICAgICAgaWYgbm90IG0/XHJcbiAgICAgICAgICAgICAgcnVsZS5tZXNzYWdlID0gdW5kZWZpbmVkXHJcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgIHJ1bGUubWVzc2FnZSA9IHZhbGlkYXRpb24ubWVzc2FnZSA/IG1cclxuICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGtvLnZhbGlkYXRpb24uYWRkQW5vbnltb3VzUnVsZShiYXNlLCBydWxlKVxyXG5cclxuICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgIGlmIHZhbGlkYXRpb24udGFyZ2V0XHJcbiAgICAgICAgYXBwbHlWYWxpZGF0aW9uKHRhcmdldClcclxuXHJcbiAgICAgIGlmIHZhbGlkYXRpb24ucmVzdWx0XHJcbiAgICAgICAgYXBwbHlWYWxpZGF0aW9uKHJlc3VsdClcclxuXHJcbiAgICByZXR1cm5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuICBrby5leHRlbmRlcnMudHlwZSA9ICh0YXJnZXQsIG9wdGlvbnMpIC0+XHJcbiAgICAjIFJlcXVpcmVzXHJcbiAgICAjIHR5cGVOYW1lIDogU3RyaW5nXHJcbiAgICAjIHR5cGVOYW1lcyA6IEFycmF5IG9mIFN0cmluZ1xyXG4gICAgIyB0eXBlQ2hlY2sgOiBmdW5jdGlvbiAodmFsdWUpIHsgLi4uIH1cclxuICAgICMgdHlwZUNoZWNrcyA6IHsgdHlwZU5hbWU6IGZ1bmN0aW9uIGlzVHlwZSh2YWx1ZSkgeyAuLi4gfSwgLi4uIH1cclxuXHJcbiAgICBpZiBpc0FuLlN0cmluZy5MaXRlcmFsKG9wdGlvbnMpIG9yIGlzQW4uQXJyYXkob3B0aW9ucylcclxuICAgICAgIyAuZXh0ZW5kKHsgdHlwZTogJ1R5cGVOYW1lfFR5cGVOYW1lfFR5cGVOYW1lJyB9KVxyXG4gICAgICAjIC5leHRlbmQoeyB0eXBlOiBbJ1R5cGVOYW1lJywnVHlwZU5hbWUnLC4uLl0gfSlcclxuICAgICAgb3B0aW9ucyA9IHsgdHlwZTogb3B0aW9ucyB9XHJcbiAgICBlbHNlIGlmIGlzQW4uRnVuY3Rpb24ob3B0aW9ucylcclxuICAgICAgIyAuZXh0ZW5kKHsgdHlwZTogZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB0cnVlfGZhbHNlOyB9IH0pXHJcbiAgICAgIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgdHlwZTogb3B0aW9ucy50eXBlTmFtZVxyXG4gICAgICAgIGNoZWNrOiBvcHRpb25zXHJcbiAgICAgIH1cclxuXHJcbiAgICBub3JtYWwgPSBleHRlbmQoe30sIGtvLnR5cGVkLm9wdGlvbnMsIGtvLmV4dGVuZGVycy50eXBlLm9wdGlvbnMsIG9wdGlvbnMpXHJcbiAgICBub3JtYWxpemVFeFJlYWQobm9ybWFsLCBrby50eXBlZC5vcHRpb25zLCBrby5leHRlbmRlcnMudHlwZS5vcHRpb25zLCBvcHRpb25zKVxyXG4gICAgbm9ybWFsaXplRXhXcml0ZShub3JtYWwsIGtvLnR5cGVkLm9wdGlvbnMsIGtvLmV4dGVuZGVycy50eXBlLm9wdGlvbnMsIG9wdGlvbnMpXHJcbiAgICBub3JtYWxpemVWYWxpZGF0aW9uKG5vcm1hbCwga28udHlwZWQub3B0aW9ucywga28uZXh0ZW5kZXJzLnR5cGUub3B0aW9ucywgb3B0aW9ucylcclxuICAgIG9wdGlvbnMgPSBub3JtYWxcclxuXHJcbiAgICAjIEdhdGhlciB0eXBlIG5hbWVzXHJcbiAgICB0eXBlTmFtZXMgPSB0eXBlTmFtZVRvQXJyYXkob3B0aW9ucy50eXBlKVxyXG4gICAgdHlwZU5hbWVzLnB1c2goKG5hbWUgZm9yIG93biBuYW1lIG9mIG9wdGlvbnMgd2hlbiBpc1ZhbGlkVHlwZU5hbWUobmFtZSkpLi4uKVxyXG4gICAgdHlwZU5hbWVzID0gdHlwZU5hbWVUb0Rpc3RpbmN0QXJyYXkodHlwZU5hbWVzKVxyXG4gICAgdHlwZU5hbWUgPSB0eXBlTmFtZVRvU3RyaW5nKHR5cGVOYW1lcylcclxuXHJcbiAgICAjIHNpbXBsZSBjaGVja3NcclxuICAgIHR5cGVDaGVja3NTaW1wbGUgPSB7fVxyXG4gICAgZG8gLT5cclxuICAgICAgZm9yIG5hbWUgaW4gdHlwZU5hbWVzXHJcbiAgICAgICAgdHlwZUNoZWNrc1NpbXBsZVtuYW1lXSA9IG9wdGlvbnNbbmFtZV0gPyBpc0FuKG5hbWUsIHsgcmV0dXJuQ2hlY2tlcjogdHJ1ZSB9KVxyXG5cclxuICAgICMgc2ltcGxlIGNoZWNrXHJcbiAgICB0eXBlQ2hlY2tTaW1wbGUgPSBvcHRpb25zLmNoZWNrID8gKCgpIC0+IHRydWUpXHJcblxyXG4gICAgIyBjaGVja3NcclxuICAgIHR5cGVDaGVja3MgPSB7fVxyXG4gICAgZG8gLT5cclxuICAgICAgZm9yIG5hbWUsIGNoZWNrIG9mIHR5cGVDaGVja3NTaW1wbGVcclxuICAgICAgICBkbyAoY2hlY2spIC0+XHJcbiAgICAgICAgICB0eXBlQ2hlY2tzW25hbWVdID0gKHZhbHVlKSAtPlxyXG4gICAgICAgICAgICBjaGVjayh2YWx1ZSkgYW5kIHR5cGVDaGVja1NpbXBsZSh2YWx1ZSlcclxuXHJcbiAgICAjIGNoZWNrXHJcbiAgICB0eXBlQ2hlY2sgPSBkbyAtPlxyXG4gICAgICByZXR1cm4gKHZhbHVlKSAtPlxyXG4gICAgICAgIHR5cGVDaGVja1NpbXBsZSh2YWx1ZSkgYW5kICgodHlwZU5hbWVzLmxlbmd0aCA9PSAwKSBvciAodHlwZU5hbWVzLnNvbWUoKG5hbWUpIC0+IHR5cGVDaGVja3NTaW1wbGVbbmFtZV0odmFsdWUpKSkpXHJcblxyXG4gICAgcmVhZEVycm9yID0ga28ub2JzZXJ2YWJsZSgpXHJcbiAgICB3cml0ZUVycm9yID0ga28ub2JzZXJ2YWJsZSgpXHJcblxyXG4gICAgcmVzdWx0ID0ga28uY29tcHV0ZWQoe1xyXG4gICAgICBwdXJlOiBvcHRpb25zLnB1cmVcclxuICAgICAgZGVmZXJFdmFsdWF0aW9uOiB0cnVlXHJcblxyXG4gICAgICByZWFkOiB3cmFwUmVhZChcclxuICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgIHRhcmdldCxcclxuICAgICAgICByZWFkRXJyb3IsXHJcbiAgICAgICAgKCkgLT5cclxuICAgICAgICAgIGludGVybmFsVmFsdWUgPSB0YXJnZXQoKVxyXG5cclxuICAgICAgICAgIGlmIG5vdCB0eXBlQ2hlY2soaW50ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuZXhwZWN0ZWQgaW50ZXJuYWwgdHlwZS4gRXhwZWN0ZWQgI3t0eXBlTmFtZX0sIGdvdCAje2lzQW4oaW50ZXJuYWxWYWx1ZSl9XCIpXHJcblxyXG4gICAgICAgICAgcmV0dXJuIGludGVybmFsVmFsdWVcclxuICAgICAgKVxyXG4gICAgICB3cml0ZTogd3JhcFdyaXRlKFxyXG4gICAgICAgIG9wdGlvbnMsXHJcbiAgICAgICAgdGFyZ2V0LFxyXG4gICAgICAgIHdyaXRlRXJyb3IsXHJcbiAgICAgICAgKGV4dGVybmFsVmFsdWUpIC0+XHJcbiAgICAgICAgICBpZiB0eXBlQ2hlY2soZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgdGFyZ2V0KGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmV4cGVjdGVkIGV4dGVybmFsIHR5cGUuIEV4cGVjdGVkICN7dHlwZU5hbWV9LCByZWNlaXZlZCAje2lzQW4oZXh0ZXJuYWxWYWx1ZSl9XCIpXHJcblxyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgIClcclxuICAgIH0pXHJcblxyXG4gICAgcmVzdWx0LnR5cGVOYW1lID0gdHlwZU5hbWVcclxuICAgIHJlc3VsdC50eXBlTmFtZXMgPSB0eXBlTmFtZXNcclxuICAgIHJlc3VsdC50eXBlQ2hlY2sgPSB0eXBlQ2hlY2tcclxuICAgIHJlc3VsdC50eXBlQ2hlY2tzID0gdHlwZUNoZWNrc1xyXG5cclxuICAgIHJlc3VsdC5yZWFkRXJyb3IgPSByZWFkRXJyb3JcclxuICAgIHJlc3VsdC53cml0ZUVycm9yID0gd3JpdGVFcnJvclxyXG5cclxuICAgIHZhbGlkYXRlKHRhcmdldCwgcmVzdWx0LCBvcHRpb25zKVxyXG5cclxuICAgIGlmIG5vdCBvcHRpb25zLmRlZmVyRXZhbHVhdGlvblxyXG4gICAgICB0cnlcclxuICAgICAgICByZXN1bHQucGVlaygpXHJcbiAgICAgIGNhdGNoIGV4XHJcbiAgICAgICAgcmVzdWx0LmRpc3Bvc2UoKVxyXG4gICAgICAgIHRocm93IGV4XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG5cclxuICBrby5leHRlbmRlcnMudHlwZS5vcHRpb25zID0ge1xyXG4gIH1cclxuXHJcblxyXG4gIGtvLmV4dGVuZGVycy5jb252ZXJ0ID0gKHRhcmdldCwgb3B0aW9ucykgLT5cclxuICAgIGlmIG9wdGlvbnMgPT0gZmFsc2VcclxuICAgICAgcmV0dXJuIHRhcmdldFxyXG5cclxuICAgICMgbm9ybWFsaXplIG9wdGlvbnNcclxuICAgIGRvIC0+XHJcbiAgICAgIGlmIGlzQW4uU3RyaW5nKG9wdGlvbnMpIG9yIGlzQW4uQXJyYXkob3B0aW9ucylcclxuICAgICAgICBvcHRpb25zID0geyB0eXBlOiBvcHRpb25zIH1cclxuICAgICAgZWxzZSBpZiBvcHRpb25zID09IHRydWVcclxuICAgICAgICBvcHRpb25zID0ge31cclxuXHJcbiAgICAgICMgbWVyZ2Ugb3B0aW9uc1xyXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKHt9LCBrby50eXBlZC5vcHRpb25zLCBrby5leHRlbmRlcnMuY29udmVydC5vcHRpb25zLCBvcHRpb25zKVxyXG5cclxuICAgICAgbm9ybWFsID0ge1xyXG4gICAgICAgIGNoZWNrU2VsZjogb3B0aW9ucy5jaGVjayA/IGZuVHJ1ZVxyXG4gICAgICAgIHJlYWQ6IG9wdGlvbnMucmVhZFxyXG4gICAgICAgIHdyaXRlOiBvcHRpb25zLndyaXRlXHJcbiAgICAgICAgY2hlY2tzOiB7fVxyXG4gICAgICAgIGNoZWNrZXJzOiBbXVxyXG4gICAgICAgIGlzVHlwZWQ6IGlzVHlwZWQodGFyZ2V0KVxyXG4gICAgICAgIGlnbm9yZURlZmF1bHRDb252ZXJ0ZXJzOiBvcHRpb25zLmlnbm9yZURlZmF1bHRDb252ZXJ0ZXJzXHJcbiAgICAgICAgcHVyZTogb3B0aW9ucy5wdXJlXHJcbiAgICAgICAgZGVmZXJFdmFsdWF0aW9uOiBvcHRpb25zLmRlZmVyRXZhbHVhdGlvblxyXG4gICAgICAgIHR5cGVzOiB0eXBlTmFtZVRvRGlzdGluY3RBcnJheShvcHRpb25zLnR5cGUpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG5vcm1hbGl6ZUV4UmVhZChub3JtYWwsIGtvLnR5cGVkLm9wdGlvbnMsIGtvLmV4dGVuZGVycy5jb252ZXJ0Lm9wdGlvbnMsIG9wdGlvbnMpXHJcbiAgICAgIG5vcm1hbGl6ZUV4V3JpdGUobm9ybWFsLCBrby50eXBlZC5vcHRpb25zLCBrby5leHRlbmRlcnMuY29udmVydC5vcHRpb25zLCBvcHRpb25zKVxyXG4gICAgICBub3JtYWxpemVWYWxpZGF0aW9uKG5vcm1hbCwga28udHlwZWQub3B0aW9ucywga28uZXh0ZW5kZXJzLmNvbnZlcnQub3B0aW9ucywgb3B0aW9ucylcclxuXHJcbiAgICAgICMgRXhwYW5kIGVhY2ggRXh0ZXJuYWwgVHlwZVxyXG4gICAgICBmb3Igb3duIGV4dFR5cGVOYW1lLCBleHRUeXBlT3B0aW9ucyBvZiBvcHRpb25zXHJcbiAgICAgICAgaWYgbm90IGlzVmFsaWRUeXBlTmFtZShleHRUeXBlTmFtZSlcclxuICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICAgIGV4dFR5cGVPcHRpb25zID0gb3B0aW9uc1tleHRUeXBlTmFtZV0gPyB7fVxyXG5cclxuICAgICAgICBub3JtYWxbZXh0VHlwZU5hbWVdID0ge1xyXG4gICAgICAgICAgY2hlY2tTZWxmOiBleHRUeXBlT3B0aW9ucy5jaGVja1xyXG4gICAgICAgICAgcmVhZDogZXh0VHlwZU9wdGlvbnMucmVhZFxyXG4gICAgICAgICAgd3JpdGU6IGV4dFR5cGVPcHRpb25zLndyaXRlXHJcbiAgICAgICAgICB0eXBlczogdHlwZU5hbWVUb0Rpc3RpbmN0QXJyYXkoZXh0VHlwZU9wdGlvbnMudHlwZSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICMgRXhwYW5kIGFsbCBpbnRlcm5hbCB0eXBlc1xyXG4gICAgICAgIGZvciBvd24gaW50VHlwZU5hbWUgb2YgZXh0VHlwZU9wdGlvbnNcclxuICAgICAgICAgIGlmIG5vdCBpc1ZhbGlkVHlwZU5hbWUoaW50VHlwZU5hbWUpXHJcbiAgICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICAgICAgaW50VHlwZU9wdGlvbnMgPSBvcHRpb25zW2V4dFR5cGVOYW1lXT9baW50VHlwZU5hbWVdID8ge31cclxuXHJcbiAgICAgICAgICBub3JtYWxbZXh0VHlwZU5hbWVdW2ludFR5cGVOYW1lXSA9IHtcclxuICAgICAgICAgICAgcmVhZDogaW50VHlwZU9wdGlvbnMucmVhZFxyXG4gICAgICAgICAgICB3cml0ZTogaW50VHlwZU9wdGlvbnMud3JpdGVcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgIG5vcm1hbC50eXBlID0gdHlwZU5hbWVUb1N0cmluZyhub3JtYWwudHlwZXMpXHJcblxyXG4gICAgICBmb3IgZXh0VHlwZU5hbWUgaW4gbm9ybWFsLnR5cGVzXHJcbiAgICAgICAgY2hlY2tlciA9IG5vcm1hbFtleHRUeXBlTmFtZV0/LmNoZWNrU2VsZiA/IGlzQW4oZXh0VHlwZU5hbWUsIHsgcmV0dXJuQ2hlY2tlcjogdHJ1ZSB9KSA/IGZuVHJ1ZVxyXG4gICAgICAgIG5vcm1hbC5jaGVja3NbZXh0VHlwZU5hbWVdID0gZG8gKGNoZWNrZXIpIC0+XHJcbiAgICAgICAgICAodmFsdWUpIC0+IG5vcm1hbC5jaGVja1NlbGYodmFsdWUpIGFuZCBjaGVja2VyKHZhbHVlKVxyXG4gICAgICAgIG5vcm1hbC5jaGVja2Vycy5wdXNoKG5vcm1hbC5jaGVja3NbZXh0VHlwZU5hbWVdKVxyXG5cclxuICAgICAgbm9ybWFsLmNoZWNrID0gKHZhbHVlKSAtPlxyXG4gICAgICAgIG5vcm1hbC5jaGVja1NlbGYodmFsdWUpIGFuZCAoKG5vcm1hbC5jaGVja2Vycy5sZW5ndGggPT0gMCkgb3Igbm9ybWFsLmNoZWNrZXJzLnNvbWUoKGNoZWNrZXIpIC0+IGNoZWNrZXIodmFsdWUpKSlcclxuXHJcbiAgICAgIG9wdGlvbnMgPSBub3JtYWxcclxuXHJcblxyXG4gICAgcmVhZEVycm9yID0ga28ub2JzZXJ2YWJsZSgpXHJcbiAgICB3cml0ZUVycm9yID0ga28ub2JzZXJ2YWJsZSgpXHJcblxyXG4gICAgcmVzdWx0ID0ga28uY29tcHV0ZWQoe1xyXG4gICAgICBwdXJlOiBvcHRpb25zLnB1cmVcclxuICAgICAgZGVmZXJFdmFsdWF0aW9uOiB0cnVlXHJcblxyXG4gICAgICByZWFkOiB3cmFwUmVhZChcclxuICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgIHRhcmdldCxcclxuICAgICAgICByZWFkRXJyb3IsXHJcbiAgICAgICAgKCkgLT5cclxuICAgICAgICAgIGludGVybmFsVmFsdWUgPSB0YXJnZXQoKVxyXG4gICAgICAgICAgZXh0ZXJuYWxWYWx1ZSA9IHVuZGVmaW5lZFxyXG5cclxuICAgICAgICAgICMgVHJ5IGV4YWN0IGludGVybmFsIHR5cGUgbWF0Y2hcclxuICAgICAgICAgIHRyeVJlYWQgPSAocmVhZCwgcmVhZE9wdGlvbnMpIC0+XHJcbiAgICAgICAgICAgIGlmIHJlYWQ/XHJcbiAgICAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgICAgICBleHRlcm5hbFZhbHVlID0gcmVhZChpbnRlcm5hbFZhbHVlLCByZWFkT3B0aW9ucylcclxuICAgICAgICAgICAgICBjYXRjaCBleFxyXG4gICAgICAgICAgICAgICAgaWYgZXggbm90IGluc3RhbmNlb2YgVHlwZUVycm9yXHJcbiAgICAgICAgICAgICAgICAgIHRocm93IGV4XHJcblxyXG4gICAgICAgICAgICAgIGlmIG5vdCBleD9cclxuICAgICAgICAgICAgICAgIGlmIG9wdGlvbnMuY2hlY2soZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgICAgIGV4dFR5cGVOYW1lcyA9IG9wdGlvbnMudHlwZXNcclxuICAgICAgICAgIGlmIGV4dFR5cGVOYW1lcy5sZW5ndGggPT0gMFxyXG4gICAgICAgICAgICBleHRUeXBlTmFtZXMgPSBbaXNBbihpbnRlcm5hbFZhbHVlKV1cclxuXHJcbiAgICAgICAgICAjIExvb2sgZm9yIHNwZWNpZmljIGNvbnZlcnNpb25cclxuICAgICAgICAgIGZvciBleHRUeXBlTmFtZSBpbiBleHRUeXBlTmFtZXNcclxuICAgICAgICAgICAgZXh0VHlwZU9wdGlvbnMgPSBvcHRpb25zW2V4dFR5cGVOYW1lXSA/IHt9XHJcblxyXG4gICAgICAgICAgICAjIGludGVybmFsIHR5cGVzXHJcbiAgICAgICAgICAgIGludFR5cGVOYW1lcyA9IGV4dFR5cGVPcHRpb25zLnR5cGVzID8gW11cclxuICAgICAgICAgICAgaWYgaW50VHlwZU5hbWVzLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgICAgICAgaWYgb3B0aW9ucy5pc1R5cGVkXHJcbiAgICAgICAgICAgICAgICAjIGdvIGJ5IHRhcmdldCBvcmRlclxyXG4gICAgICAgICAgICAgICAgaW50VHlwZU5hbWVzID0gdGFyZ2V0LnR5cGVOYW1lc1xyXG4gICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICMgZ28gYnkgaW5mZXJyZWQgb3JkZXJcclxuICAgICAgICAgICAgICAgIGludFR5cGVOYW1lcyA9IFtpc0FuKGludGVybmFsVmFsdWUpXVxyXG5cclxuICAgICAgICAgICAgZm9yIGludFR5cGVOYW1lIGluIGludFR5cGVOYW1lc1xyXG4gICAgICAgICAgICAgICMgY2hlY2sgaW50ZXJuYWwgdHlwZVxyXG4gICAgICAgICAgICAgIGlmIG9wdGlvbnMuaXNUeXBlZCBhbmQgbm90IHRhcmdldC50eXBlQ2hlY2tzW2ludFR5cGVOYW1lXT8oaW50ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICAgICAgICAgICMgZ2V0IHRoZSBvcHRpb25zXHJcbiAgICAgICAgICAgICAgaW50VHlwZU9wdGlvbnMgPSBleHRUeXBlT3B0aW9uc1tpbnRUeXBlTmFtZV0gPyB7fVxyXG5cclxuICAgICAgICAgICAgICAjIHRyeSBjdXN0b20gY29udmVyc2lvblxyXG4gICAgICAgICAgICAgIGlmIGludFR5cGVPcHRpb25zLnJlYWQ/XHJcbiAgICAgICAgICAgICAgICBpZiB0cnlSZWFkKGludFR5cGVPcHRpb25zLnJlYWQsIGludFR5cGVPcHRpb25zLnJlYWRPcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gZXh0ZXJuYWxWYWx1ZVxyXG4gICAgICAgICAgICAgICMgdHJ5IG5vIGNvbnZlcnNpb25cclxuICAgICAgICAgICAgICBlbHNlIGlmIGludFR5cGVOYW1lID09IGV4dFR5cGVOYW1lXHJcbiAgICAgICAgICAgICAgICBpZiBub3QgZXh0VHlwZU9wdGlvbnMucmVhZD8gYW5kIG5vdCBvcHRpb25zLnJlYWQ/IGFuZCB0cnlSZWFkKGZuSWRlbnRpdHkpXHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBleHRlcm5hbFZhbHVlXHJcbiAgICAgICAgICAgICAgZWxzZSBpZiBub3Qgb3B0aW9ucy5pZ25vcmVEZWZhdWx0Q29udmVydGVyc1xyXG4gICAgICAgICAgICAgICAgIyB0cnkgZGVmYXVsdCBjb252ZXJzaW9uXHJcbiAgICAgICAgICAgICAgICBpZiB0cnlSZWFkKGtvLnR5cGVkLmdldENvbnZlcnRlcihpbnRUeXBlTmFtZSwgZXh0VHlwZU5hbWUpLCBpbnRUeXBlT3B0aW9ucy5yZWFkT3B0aW9ucylcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4dGVybmFsVmFsdWVcclxuXHJcbiAgICAgICAgICAjIExvb2sgZm9yIG9uZS1zaWRlZCBjb252ZXJzaW9uXHJcbiAgICAgICAgICBmb3IgZXh0VHlwZU5hbWUgaW4gZXh0VHlwZU5hbWVzXHJcbiAgICAgICAgICAgIGV4dFR5cGVPcHRpb25zID0gb3B0aW9uc1tleHRUeXBlTmFtZV0gPyB7fVxyXG5cclxuICAgICAgICAgICAgIyB0cnkgY3VzdG9tIGNvbnZlcnNpb25cclxuICAgICAgICAgICAgaWYgdHJ5UmVhZChleHRUeXBlT3B0aW9ucy5yZWFkLCBleHRUeXBlT3B0aW9ucy5yZWFkT3B0aW9ucylcclxuICAgICAgICAgICAgICByZXR1cm4gZXh0ZXJuYWxWYWx1ZVxyXG5cclxuICAgICAgICAgICMgTG9vayBmb3IgZ2VuZXJpYyBjb252ZXJzaW9uXHJcbiAgICAgICAgICBpZiB0cnlSZWFkKG9wdGlvbnMucmVhZCwgb3B0aW9ucy5yZWFkT3B0aW9ucylcclxuICAgICAgICAgICAgcmV0dXJuIGV4dGVybmFsVmFsdWVcclxuXHJcbiAgICAgICAgICBpZiBvcHRpb25zLnR5cGU/XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tIGludGVybmFsIHR5cGUgI3tpc0FuKGludGVybmFsVmFsdWUpfSB0byBleHRlcm5hbCB0eXBlICN7b3B0aW9ucy50eXBlfVwiKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSBpbnRlcm5hbCB0eXBlICN7aXNBbihpbnRlcm5hbFZhbHVlKX1cIilcclxuICAgICAgKVxyXG5cclxuICAgICAgd3JpdGU6IHdyYXBXcml0ZShcclxuICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgIHRhcmdldCxcclxuICAgICAgICB3cml0ZUVycm9yLFxyXG4gICAgICAgIChleHRlcm5hbFZhbHVlKSAtPlxyXG4gICAgICAgICAgdHJ5V3JpdGUgPSAod3JpdGUsIHdyaXRlT3B0aW9ucykgLT5cclxuICAgICAgICAgICAgaWYgd3JpdGU/XHJcbiAgICAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgICAgICBpbnRlcm5hbFZhbHVlID0gd3JpdGUoZXh0ZXJuYWxWYWx1ZSwgd3JpdGVPcHRpb25zKVxyXG4gICAgICAgICAgICAgIGNhdGNoIGV4XHJcbiAgICAgICAgICAgICAgICBpZiBleCBub3QgaW5zdGFuY2VvZiBUeXBlRXJyb3JcclxuICAgICAgICAgICAgICAgICAgdGhyb3cgZXhcclxuXHJcbiAgICAgICAgICAgICAgaWYgbm90IGV4P1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0KGludGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgICAgICAgaWYgbm90IG9wdGlvbnMuY2hlY2tTZWxmPyBvciBvcHRpb25zLmNoZWNrU2VsZihleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICBleHRUeXBlTmFtZXMgPSBvcHRpb25zLnR5cGVzXHJcbiAgICAgICAgICAgIGlmIGV4dFR5cGVOYW1lcy5sZW5ndGggPT0gMFxyXG4gICAgICAgICAgICAgIGV4dFR5cGVOYW1lcyA9IFtpc0FuKGV4dGVybmFsVmFsdWUpXVxyXG5cclxuICAgICAgICAgICAgIyBMb29rIGZvciBzcGVjaWZpYyBjb252ZXJzaW9uXHJcbiAgICAgICAgICAgIGZvciBleHRUeXBlTmFtZSBpbiBleHRUeXBlTmFtZXNcclxuICAgICAgICAgICAgICBleHRUeXBlT3B0aW9ucyA9IG9wdGlvbnNbZXh0VHlwZU5hbWVdID8ge31cclxuXHJcbiAgICAgICAgICAgICAgaWYgKGV4dFR5cGVPcHRpb25zLmNoZWNrU2VsZj8gYW5kIG5vdCBleHRUeXBlT3B0aW9ucy5jaGVja1NlbGYoZXh0ZXJuYWxWYWx1ZSkpIG9yIChub3QgZXh0VHlwZU9wdGlvbnMuY2hlY2tTZWxmPyBhbmQgbm90IGlzQW4oZXh0ZXJuYWxWYWx1ZSwgZXh0VHlwZU5hbWUpKVxyXG4gICAgICAgICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgICAgICAgICAgIyBpbnRlcm5hbCB0eXBlc1xyXG4gICAgICAgICAgICAgIGludFR5cGVOYW1lcyA9IGV4dFR5cGVPcHRpb25zLnR5cGVzID8gW11cclxuICAgICAgICAgICAgICBpZiBpbnRUeXBlTmFtZXMubGVuZ3RoID09IDBcclxuICAgICAgICAgICAgICAgIGlmIG9wdGlvbnMuaXNUeXBlZFxyXG4gICAgICAgICAgICAgICAgICAjIGdvIGJ5IHRhcmdldCBvcmRlclxyXG4gICAgICAgICAgICAgICAgICBpbnRUeXBlTmFtZXMgPSB0YXJnZXQudHlwZU5hbWVzXHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICMgZ28gYnkgaW5mZXJyZWQgb3JkZXJcclxuICAgICAgICAgICAgICAgICAgaW50VHlwZU5hbWVzID0gW2lzQW4oZXh0ZXJuYWxWYWx1ZSldXHJcblxyXG4gICAgICAgICAgICAgIGZvciBpbnRUeXBlTmFtZSBpbiBpbnRUeXBlTmFtZXNcclxuICAgICAgICAgICAgICAgIGludFR5cGVPcHRpb25zID0gZXh0VHlwZU9wdGlvbnNbaW50VHlwZU5hbWVdID8ge31cclxuXHJcbiAgICAgICAgICAgICAgICAjIHRyeSBjdXN0b20gY29udmVyc2lvblxyXG4gICAgICAgICAgICAgICAgaWYgaW50VHlwZU9wdGlvbnMud3JpdGU/XHJcbiAgICAgICAgICAgICAgICAgIGlmIHRyeVdyaXRlKGludFR5cGVPcHRpb25zLndyaXRlLCBpbnRUeXBlT3B0aW9ucy53cml0ZU9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICAjIHRyeSBubyBjb252ZXJzaW9uXHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGV4dFR5cGVOYW1lID09IGludFR5cGVOYW1lXHJcbiAgICAgICAgICAgICAgICAgIGlmIG5vdCBleHRUeXBlT3B0aW9ucy53cml0ZT8gYW5kIG5vdCBvcHRpb25zLndyaXRlPyBhbmQgKG5vdCBvcHRpb25zLmlzVHlwZWQgb3IgdGFyZ2V0LnR5cGVDaGVja3NbZXh0VHlwZU5hbWVdKGV4dGVybmFsVmFsdWUpKSBhbmQgdHJ5V3JpdGUoZm5JZGVudGl0eSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgICMgdHJ5IGRlZmF1bHQgY29udmVyc2lvblxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBub3Qgb3B0aW9ucy5pZ25vcmVEZWZhdWx0Q29udmVydGVyc1xyXG4gICAgICAgICAgICAgICAgICBpZiB0cnlXcml0ZShrby50eXBlZC5nZXRDb252ZXJ0ZXIoZXh0VHlwZU5hbWUsIGludFR5cGVOYW1lKSwgaW50VHlwZU9wdGlvbnMud3JpdGVPcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG5cclxuICAgICAgICAgICAgIyBMb29rIGZvciBvbmUtc2lkZWQgY29udmVyc2lvblxyXG4gICAgICAgICAgICBmb3IgZXh0VHlwZU5hbWUgaW4gZXh0VHlwZU5hbWVzXHJcbiAgICAgICAgICAgICAgZXh0VHlwZU9wdGlvbnMgPSBvcHRpb25zW2V4dFR5cGVOYW1lXSA/IHt9XHJcblxyXG4gICAgICAgICAgICAgIGlmIChleHRUeXBlT3B0aW9ucy5jaGVja1NlbGY/IGFuZCBub3QgZXh0VHlwZU9wdGlvbnMuY2hlY2tTZWxmKGV4dGVybmFsVmFsdWUpKSBvciAobm90IGV4dFR5cGVPcHRpb25zLmNoZWNrU2VsZj8gYW5kIG5vdCBpc0FuKGV4dGVybmFsVmFsdWUsIGV4dFR5cGVOYW1lKSlcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICAgICAgICAgICMgdHJ5IGN1c3RvbSBjb252ZXJzaW9uXHJcbiAgICAgICAgICAgICAgaWYgdHJ5V3JpdGUoZXh0VHlwZU9wdGlvbnMud3JpdGUsIGV4dFR5cGVPcHRpb25zLndyaXRlT3B0aW9ucylcclxuICAgICAgICAgICAgICAgIHJldHVyblxyXG5cclxuICAgICAgICAgICAgIyBMb29rIGZvciBnZW5lcmljIGNvbnZlcnNpb25cclxuICAgICAgICAgICAgaWYgdHJ5V3JpdGUob3B0aW9ucy53cml0ZSwgb3B0aW9ucy53cml0ZU9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgICAgaWYgb3B0aW9ucy5pc1R5cGVkXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tIGV4dGVybmFsIHR5cGUgI3tpc0FuKGV4dGVybmFsVmFsdWUpfSB0byBpbnRlcm5hbCB0eXBlICN7dGFyZ2V0LnR5cGVOYW1lfVwiKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSBleHRlcm5hbCB0eXBlICN7aXNBbihleHRlcm5hbFZhbHVlKX1cIilcclxuICAgICAgKVxyXG4gICAgfSlcclxuXHJcbiAgICByZXN1bHQudHlwZU5hbWUgPSBvcHRpb25zLnR5cGVcclxuICAgIHJlc3VsdC50eXBlTmFtZXMgPSBvcHRpb25zLnR5cGVzXHJcbiAgICByZXN1bHQudHlwZUNoZWNrID0gb3B0aW9ucy5jaGVja1xyXG4gICAgcmVzdWx0LnR5cGVDaGVja3MgPSBvcHRpb25zLmNoZWNrc1xyXG5cclxuICAgIHJlc3VsdC5yZWFkRXJyb3IgPSByZWFkRXJyb3JcclxuICAgIHJlc3VsdC53cml0ZUVycm9yID0gd3JpdGVFcnJvclxyXG5cclxuICAgIHZhbGlkYXRlKHRhcmdldCwgcmVzdWx0LCBvcHRpb25zKVxyXG5cclxuICAgIGlmIG5vdCBvcHRpb25zLmRlZmVyRXZhbHVhdGlvblxyXG4gICAgICB0cnlcclxuICAgICAgICByZXN1bHQucGVlaygpXHJcbiAgICAgIGNhdGNoIGV4XHJcbiAgICAgICAgcmVzdWx0LmRpc3Bvc2UoKVxyXG4gICAgICAgIHRocm93IGV4XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG5cclxuICBrby5leHRlbmRlcnMuY29udmVydC5vcHRpb25zID0ge1xyXG4gIH1cclxuXHJcblxyXG4gIGRvIC0+XHJcbiAgICBrby50eXBlZC5fY29udmVydGVycyA9IGNvbnZlcnRlcnMgPSB7fVxyXG5cclxuICAgIGtvLnR5cGVkLmFkZENvbnZlcnRlciA9IChmcm9tVHlwZU5hbWUsIHRvVHlwZU5hbWUsIGNvbnZlcnRlciwgZGVmYXVsdE9wdGlvbnMsIGRlZmF1bHRPcHRpb24pIC0+XHJcbiAgICAgIGNvbnNvbGU/LmFzc2VydD8oaXNWYWxpZFR5cGVOYW1lKGZyb21UeXBlTmFtZSksIFwiSW52YWxpZCB0eXBlTmFtZSAje2Zyb21UeXBlTmFtZX1cIilcclxuICAgICAgY29uc29sZT8uYXNzZXJ0Pyhpc1ZhbGlkVHlwZU5hbWUodG9UeXBlTmFtZSksIFwiSW52YWxpZCB0eXBlTmFtZSAje2Zyb21UeXBlTmFtZX1cIilcclxuXHJcbiAgICAgIGlmIGRlZmF1bHRPcHRpb25zP1xyXG4gICAgICAgIGlmIGRlZmF1bHRPcHRpb24/XHJcbiAgICAgICAgICB3cmFwcGVyID0gKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICAgICAgICBpZiBhcmd1bWVudHMubGVuZ3RoID09IDIgYW5kIG5vdCBpc0FuLk9iamVjdChvcHRpb25zKVxyXG4gICAgICAgICAgICAgIG8gPSB7fVxyXG4gICAgICAgICAgICAgIG9bZGVmYXVsdE9wdGlvbl0gPSBvcHRpb25zXHJcbiAgICAgICAgICAgICAgb3B0aW9ucyA9IG9cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBjb252ZXJ0ZXIodmFsdWUsIGtvLnV0aWxzLmV4dGVuZChrby51dGlscy5leHRlbmQoe30sIHdyYXBwZXIub3B0aW9ucyksIG9wdGlvbnMpKVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIHdyYXBwZXIgPSAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgICAgICAgIHJldHVybiBjb252ZXJ0ZXIodmFsdWUsIGtvLnV0aWxzLmV4dGVuZChrby51dGlscy5leHRlbmQoe30sIHdyYXBwZXIub3B0aW9ucyksIG9wdGlvbnMpKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgd3JhcHBlciA9ICh2YWx1ZSkgLT5cclxuICAgICAgICAgIHJldHVybiBjb252ZXJ0ZXIodmFsdWUpXHJcblxyXG4gICAgICB3cmFwcGVyLm9wdGlvbnMgPSBkZWZhdWx0T3B0aW9uc1xyXG5cclxuICAgICAgY29udmVydGVyc1tmcm9tVHlwZU5hbWVdID89IHt9XHJcbiAgICAgIGNvbnZlcnRlcnNbZnJvbVR5cGVOYW1lXVt0b1R5cGVOYW1lXSA9IHdyYXBwZXJcclxuXHJcbiAgICAgIHJldHVybiBrby50eXBlZFxyXG5cclxuICAgIGtvLnR5cGVkLmdldENvbnZlcnRlciA9IChmcm9tVHlwZU5hbWUsIHRvVHlwZU5hbWUpIC0+XHJcbiAgICAgIGNvbnZlcnRlcnNbZnJvbVR5cGVOYW1lXT9bdG9UeXBlTmFtZV1cclxuXHJcbiAgICBrby50eXBlZC5yZW1vdmVDb252ZXJ0ZXIgPSAoZnJvbVR5cGVOYW1lLCB0b1R5cGVOYW1lKSAtPlxyXG4gICAgICBpZiBjb252ZXJ0ZXJzW2Zyb21UeXBlTmFtZV0/W3RvVHlwZU5hbWVdP1xyXG4gICAgICAgIGRlbGV0ZSBjb252ZXJ0ZXJzW2Zyb21UeXBlTmFtZV0/W3RvVHlwZU5hbWVdXHJcblxyXG4gICAgICByZXR1cm4ga28udHlwZWRcclxuXHJcbiAgICByZXR1cm5cclxuXHJcblxyXG4gIGRvIC0+XHJcbiAgICAjIyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9NYXRoL3JvdW5kXHJcbiAgICBkZWNpbWFsQWRqdXN0ID0gKHR5cGUsIHZhbHVlLCBleHApIC0+XHJcbiAgICAgICMgaWYgZXhwIGlzIHVuZGVmaW5lZCBvciB6ZXJvXHJcbiAgICAgIGlmIG5vdCBleHA/IG9yICtleHAgPT0gMFxyXG4gICAgICAgIHJldHVybiB0eXBlKHZhbHVlKVxyXG5cclxuICAgICAgdmFsdWUgPSArdmFsdWVcclxuICAgICAgZXhwID0gK2V4cFxyXG5cclxuICAgICAgIyBJZiB0aGUgdmFsdWUgaXQgbm90IGEgbnVtYmVyIG9mIHRoZSBleHAgaXMgbm90IGFuIGludGVnZXJcclxuICAgICAgaWYgKGlzTmFOKHZhbHVlKSBvciBub3QgKHR5cGVvZiBleHAgPT0gJ251bWJlcicgYW5kIGV4cCAlIDEgPT0gMCkpXHJcbiAgICAgICAgcmV0dXJuIE5hTlxyXG5cclxuICAgICAgIyBTaGlmdFxyXG4gICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCkuc3BsaXQoJ2UnKVxyXG4gICAgICB2YWx1ZSA9IHR5cGUoKyh2YWx1ZVswXSArICdlJyArIChpZiB2YWx1ZVsxXSB0aGVuICgrdmFsdWVbMV0gLSBleHApIGVsc2UgLWV4cCkpKVxyXG5cclxuICAgICAgIyBTaGlmdCBiYWNrXHJcbiAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKS5zcGxpdCgnZScpXHJcbiAgICAgIHJldHVybiAoKyh2YWx1ZVswXSArICdlJyArIChpZiB2YWx1ZVsxXSB0aGVuICgrdmFsdWVbMV0gKyBleHApIGVsc2UgZXhwKSkpXHJcblxyXG4gICAgIyMjICFwcmFnbWEgY292ZXJhZ2Utc2tpcC1uZXh0ICMjI1xyXG4gICAgaWYgbm90IE1hdGgucm91bmQxMD9cclxuICAgICAgTWF0aC5yb3VuZDEwID0gKHZhbHVlLCBleHApIC0+XHJcbiAgICAgICAgcmV0dXJuIGRlY2ltYWxBZGp1c3QoTWF0aC5yb3VuZCwgdmFsdWUsIGV4cClcclxuXHJcbiAgICAjIyMgIXByYWdtYSBjb3ZlcmFnZS1za2lwLW5leHQgIyMjXHJcbiAgICBpZiBub3QgTWF0aC5mbG9vcjEwP1xyXG4gICAgICBNYXRoLmZsb29yMTAgPSAodmFsdWUsIGV4cCkgLT5cclxuICAgICAgICByZXR1cm4gZGVjaW1hbEFkanVzdChNYXRoLmZsb29yLCB2YWx1ZSwgZXhwKVxyXG5cclxuICAgICMjIyAhcHJhZ21hIGNvdmVyYWdlLXNraXAtbmV4dCAjIyNcclxuICAgIGlmIG5vdCBNYXRoLmNlaWwxMD9cclxuICAgICAgTWF0aC5jZWlsMTAgPSAodmFsdWUsIGV4cCkgLT5cclxuICAgICAgICByZXR1cm4gZGVjaW1hbEFkanVzdChNYXRoLmNlaWwsIHZhbHVlLCBleHApXHJcblxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdCb29sZWFuJ1xyXG4gICAgJ051bWJlci5JbnRlZ2VyJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICByZXR1cm4gaWYgdmFsdWUgdGhlbiBvcHRpb25zLnRydXRoeSBlbHNlIG9wdGlvbnMuZmFsc2V5XHJcbiAgICB7XHJcbiAgICAgIHRydXRoeTogMVxyXG4gICAgICBmYWxzZXk6IDBcclxuICAgIH1cclxuICAgICd0cnV0aHknXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnQm9vbGVhbidcclxuICAgICdOdW1iZXInXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIHJldHVybiBpZiB2YWx1ZSB0aGVuIG9wdGlvbnMudHJ1dGh5IGVsc2Ugb3B0aW9ucy5mYWxzZXlcclxuICAgIHtcclxuICAgICAgdHJ1dGh5OiAxXHJcbiAgICAgIGZhbHNleTogMFxyXG4gICAgfVxyXG4gICAgJ3RydXRoeSdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdCb29sZWFuJ1xyXG4gICAgJ1N0cmluZydcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgdmFsdWUgPSBpZiB2YWx1ZSB0aGVuIG9wdGlvbnMudHJ1dGh5IGVsc2Ugb3B0aW9ucy5mYWxzZXlcclxuXHJcbiAgICAgIGlmIG9wdGlvbnMudXBwZXJDYXNlXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1VwcGVyQ2FzZSgpXHJcblxyXG4gICAgICByZXR1cm4gdmFsdWVcclxuICAgIHtcclxuICAgICAgdXBwZXJDYXNlOiBmYWxzZVxyXG4gICAgICB0cnV0aHk6ICd0cnVlJ1xyXG4gICAgICBmYWxzZXk6ICdmYWxzZSdcclxuICAgIH1cclxuICAgICd1cHBlckNhc2UnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnRGF0ZSdcclxuICAgICdNb21lbnQnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIChtb21lbnQgPyByZXF1aXJlKCdtb21lbnQnKSkodmFsdWUpXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnRGF0ZSdcclxuICAgICdTdHJpbmcnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIGlzTmFOKHZhbHVlLnZhbHVlT2YoKSlcclxuICAgICAgICByZXR1cm4gJydcclxuXHJcbiAgICAgIG1ldGhvZCA9IG9wdGlvbnMuZm9ybWF0c1tvcHRpb25zLmZvcm1hdF1cclxuICAgICAgcmV0dXJuIHZhbHVlW21ldGhvZF0uYXBwbHkodmFsdWUsIG9wdGlvbnMucGFyYW1zKVxyXG5cclxuICAgIHtcclxuICAgICAgZm9ybWF0czoge1xyXG4gICAgICAgIGRhdGU6ICd0b0RhdGVTdHJpbmcnXHJcbiAgICAgICAgaXNvOiAndG9JU09TdHJpbmcnXHJcbiAgICAgICAganNvbjogJ3RvSlNPTidcclxuICAgICAgICBsb2NhbGVEYXRlOiAndG9Mb2NhbGVEYXRlU3RyaW5nJ1xyXG4gICAgICAgIGxvY2FsZVRpbWU6ICd0b0xvY2FsZVRpbWVTdHJpbmcnXHJcbiAgICAgICAgbG9jYWxlOiAndG9Mb2NhbGVTdHJpbmcnXHJcbiAgICAgICAgdGltZTogJ3RvVGltZVN0cmluZydcclxuICAgICAgICB1dGM6ICd0b1VUQ1N0cmluZydcclxuICAgICAgICBkZWZhdWx0OiAndG9TdHJpbmcnXHJcbiAgICAgIH1cclxuICAgICAgZm9ybWF0OiAnZGVmYXVsdCdcclxuICAgICAgcGFyYW1zOiBbXVxyXG4gICAgfVxyXG4gICAgJ2Zvcm1hdCdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdEYXRlJyxcclxuICAgICdVbmRlZmluZWQnLFxyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBub3QgaXNOYU4odmFsdWUudmFsdWVPZigpKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VuYWJsZSB0byBjb252ZXJ0IGZyb20gdmFsaWQgRGF0ZSB0byBVbmRlZmluZWQnKVxyXG5cclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ01vbWVudCdcclxuICAgICdEYXRlJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICB2YWx1ZS50b0RhdGUoKVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ01vbWVudCdcclxuICAgICdTdHJpbmcnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG5vdCB2YWx1ZS5pc1ZhbGlkKClcclxuICAgICAgICByZXR1cm4gJydcclxuXHJcbiAgICAgIHJldHVybiB2YWx1ZS5sb2NhbGUob3B0aW9ucy5sb2NhbGUpLmZvcm1hdChvcHRpb25zLmZvcm1hdClcclxuICAgIHtcclxuICAgICAgbG9jYWxlOiAnZW4nXHJcbiAgICAgIGZvcm1hdDogJ0wnXHJcbiAgICB9XHJcbiAgICAnZm9ybWF0J1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ01vbWVudCcsXHJcbiAgICAnVW5kZWZpbmVkJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgdmFsdWUuaXNWYWxpZCgpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSB2YWxpZCBNb21lbnQgdG8gVW5kZWZpbmVkJylcclxuXHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdOdW1iZXInXHJcbiAgICAnQm9vbGVhbidcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy5mYWxzZXk/IGFuZCB2YWx1ZSA9PSBvcHRpb25zLmZhbHNleVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICBlbHNlIGlmIG9wdGlvbnMudHJ1dGh5PyBhbmQgdmFsdWUgPT0gb3B0aW9ucy50cnV0aHlcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICBlbHNlIGlmIG5vdCBvcHRpb25zLmZhbHNleT9cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgZWxzZSBpZiBub3Qgb3B0aW9ucy50cnV0aHk/XHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY29udmVydCBmcm9tICN7dmFsdWV9IHRvIEJvb2xlYW5cIilcclxuICAgIHtcclxuICAgICAgdHJ1dGh5OiB1bmRlZmluZWRcclxuICAgICAgZmFsc2V5OiAwXHJcbiAgICB9XHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTnVtYmVyJ1xyXG4gICAgJ051bWJlci5JbnRlZ2VyJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBub3Qgb3B0aW9ucy5tb2RlP1xyXG4gICAgICAgIGlmIG5vdCBpc0FuLk51bWJlci5JbnRlZ2VyKHZhbHVlKVxyXG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNvbnZlcnQgZnJvbSBOdW1iZXIgdG8gTnVtYmVyLkludGVnZXIuIE51bWJlciBpcyBub3QgYW4gaW50ZWdlcicpXHJcbiAgICAgICAgcmV0dXJuIHZhbHVlXHJcbiAgICAgIGVsc2UgaWYgdHlwZW9mIG9wdGlvbnMubW9kZSA9PSAnc3RyaW5nJ1xyXG4gICAgICAgIG1vZGUgPSBNYXRoW29wdGlvbnMubW9kZV1cclxuICAgICAgZWxzZVxyXG4gICAgICAgIG1vZGUgPSBvcHRpb25zLm1vZGVcclxuXHJcbiAgICAgIHJldHVybiBtb2RlKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICBtb2RlOiB1bmRlZmluZWRcclxuICAgIH1cclxuICAgICdtb2RlJ1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ051bWJlcidcclxuICAgICdTdHJpbmcnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMuZGVjaW1hbHM/XHJcbiAgICAgICAgdmFsdWUgPSBNYXRoLnJvdW5kMTAodmFsdWUsIC1vcHRpb25zLmRlY2ltYWxzKVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudG9GaXhlZChvcHRpb25zLmRlY2ltYWxzKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpXHJcblxyXG4gICAgICByZXR1cm4gdmFsdWVcclxuICAgIHtcclxuICAgICAgZGVjaW1hbHM6IHVuZGVmaW5lZFxyXG4gICAgfVxyXG4gICAgJ2RlY2ltYWxzJ1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ051bWJlci5JbnRlZ2VyJ1xyXG4gICAgJ0Jvb2xlYW4nXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMuZmFsc2V5PyBhbmQgdmFsdWUgPT0gb3B0aW9ucy5mYWxzZXlcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgZWxzZSBpZiBvcHRpb25zLnRydXRoeT8gYW5kIHZhbHVlID09IG9wdGlvbnMudHJ1dGh5XHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgZWxzZSBpZiBub3Qgb3B0aW9ucy5mYWxzZXk/XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIGVsc2UgaWYgbm90IG9wdGlvbnMudHJ1dGh5P1xyXG4gICAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBCb29sZWFuXCIpXHJcbiAgICB7XHJcbiAgICAgIHRydXRoeTogdW5kZWZpbmVkXHJcbiAgICAgIGZhbHNleTogMFxyXG4gICAgfVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ051bWJlci5JbnRlZ2VyJ1xyXG4gICAgJ051bWJlcicsXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIHJldHVybiB2YWx1ZVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ051bWJlci5JbnRlZ2VyJ1xyXG4gICAgJ1N0cmluZycsXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcob3B0aW9ucy5iYXNlKVxyXG4gICAgICBpZiBvcHRpb25zLnVwcGVyQ2FzZVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudG9VcHBlckNhc2UoKVxyXG5cclxuICAgICAgcmV0dXJuIHZhbHVlXHJcbiAgICB7XHJcbiAgICAgIGJhc2U6IDEwXHJcbiAgICAgIHVwcGVyQ2FzZTogZmFsc2VcclxuICAgIH1cclxuICAgICdiYXNlJ1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1N0cmluZycsXHJcbiAgICAnQm9vbGVhbicsXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMudHJpbVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudHJpbSgpXHJcblxyXG4gICAgICBpZiBvcHRpb25zLmlnbm9yZUNhc2VcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvTG93ZXJDYXNlKClcclxuXHJcbiAgICAgIGlmIG9wdGlvbnMuc3RyaWN0XHJcbiAgICAgICAgaWYgdmFsdWUgPT0gb3B0aW9ucy50cnV0aHlbMF1cclxuICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgZWxzZSBpZiB2YWx1ZSA9PSBvcHRpb25zLmZhbHNleVswXVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBmb3IgdHJ1dGh5IGluIG9wdGlvbnMudHJ1dGh5XHJcbiAgICAgICAgICBpZiB2YWx1ZSA9PSB0cnV0aHlcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgICAgICAgZm9yIGZhbHNleSBpbiBvcHRpb25zLmZhbHNleVxyXG4gICAgICAgICAgaWYgdmFsdWUgPT0gZmFsc2V5XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjb252ZXJ0IGZyb20gI3t2YWx1ZX0gdG8gQm9vbGVhblwiKVxyXG4gICAge1xyXG4gICAgICBpZ25vcmVDYXNlOiB0cnVlXHJcbiAgICAgIHN0cmljdDogZmFsc2VcclxuICAgICAgdHJ1dGh5OiBbXHJcbiAgICAgICAgJ3RydWUnXHJcbiAgICAgICAgJ3QnXHJcbiAgICAgICAgJzEnXHJcbiAgICAgICAgJy0xJ1xyXG4gICAgICAgICd5ZXMnXHJcbiAgICAgICAgJ3knXHJcbiAgICAgIF1cclxuICAgICAgZmFsc2V5OiBbXHJcbiAgICAgICAgJ2ZhbHNlJ1xyXG4gICAgICAgICdmJ1xyXG4gICAgICAgICcwJ1xyXG4gICAgICAgICdubydcclxuICAgICAgICAnbidcclxuICAgICAgXVxyXG4gICAgICB0cmltOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgJ3N0cmljdCdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdTdHJpbmcnXHJcbiAgICAnRGF0ZSdcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy50cmltXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50cmltKClcclxuXHJcbiAgICAgIGlmIG9wdGlvbnMuc3RyaWN0XHJcbiAgICAgICAgbWF0Y2ggPSB2YWx1ZS5tYXRjaChvcHRpb25zLmZvcm1hdClcclxuICAgICAgICBpZiBub3QgbWF0Y2g/XHJcbiAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuYWJsZSB0byBjb252ZXJ0IGZyb20gU3RyaW5nIHRvIERhdGUnKVxyXG5cclxuICAgICAgICBudW0gPSAodmFsdWUsIGRlZikgLT5cclxuICAgICAgICAgIGlmICh2YWx1ZT8gYW5kIHZhbHVlICE9ICcnKSB0aGVuIHBhcnNlRmxvYXQodmFsdWUpIGVsc2UgZGVmXHJcblxyXG4gICAgICAgIHR6ID0gdW5kZWZpbmVkXHJcbiAgICAgICAgaWYgbWF0Y2hbN10/IGFuZCBtYXRjaFs3XSAhPSAnJ1xyXG4gICAgICAgICAgdHogPSAobnVtKG1hdGNoW29wdGlvbnMuZm9ybWF0RGljdC50ekhvdXJzXSkgKiA2MCArIG51bShtYXRjaFtvcHRpb25zLmZvcm1hdERpY3QudHpNaW51dGVzXSkpICogNjAgKiAxMDAwXHJcbiAgICAgICAgICBpZiBtYXRjaFtvcHRpb25zLmZvcm1hdERpY3QudHpTaWduXSA9PSAnLSdcclxuICAgICAgICAgICAgdHogKj0gLTFcclxuXHJcbiAgICAgICAgaWYgb3B0aW9ucy51dGMgb3IgdHo/XHJcbiAgICAgICAgICB0aW1lID0gRGF0ZS5VVEMoXHJcbiAgICAgICAgICAgIG51bShtYXRjaFtvcHRpb25zLmZvcm1hdERpY3QueWVhcl0sIDApXHJcbiAgICAgICAgICAgIG51bShtYXRjaFtvcHRpb25zLmZvcm1hdERpY3QubW9udGhdLCAxKSAtIDFcclxuICAgICAgICAgICAgbnVtKG1hdGNoW29wdGlvbnMuZm9ybWF0RGljdC5kYXldLCAxKVxyXG4gICAgICAgICAgICBudW0obWF0Y2hbb3B0aW9ucy5mb3JtYXREaWN0LmhvdXJzXSwgMClcclxuICAgICAgICAgICAgbnVtKG1hdGNoW29wdGlvbnMuZm9ybWF0RGljdC5taW51dGVzXSwgMClcclxuICAgICAgICAgICAgbnVtKG1hdGNoW29wdGlvbnMuZm9ybWF0RGljdC5zZWNvbmRzXSwgMClcclxuICAgICAgICAgIClcclxuXHJcbiAgICAgICAgICBpZiB0ej9cclxuICAgICAgICAgICAgdGltZSArPSB0elxyXG5cclxuICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZSh0aW1lKVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZShcclxuICAgICAgICAgICAgbnVtKG1hdGNoW29wdGlvbnMuZm9ybWF0RGljdC55ZWFyXSwgMClcclxuICAgICAgICAgICAgbnVtKG1hdGNoW29wdGlvbnMuZm9ybWF0RGljdC5tb250aF0sIDEpIC0gMVxyXG4gICAgICAgICAgICBudW0obWF0Y2hbb3B0aW9ucy5mb3JtYXREaWN0LmRheV0sIDEpXHJcbiAgICAgICAgICAgIG51bShtYXRjaFtvcHRpb25zLmZvcm1hdERpY3QuaG91cnNdLCAwKVxyXG4gICAgICAgICAgICBudW0obWF0Y2hbb3B0aW9ucy5mb3JtYXREaWN0Lm1pbnV0ZXNdLCAwKVxyXG4gICAgICAgICAgICBudW0obWF0Y2hbb3B0aW9ucy5mb3JtYXREaWN0LnNlY29uZHNdLCAwKVxyXG4gICAgICAgICAgKVxyXG5cclxuICAgICAgICAgIGRhdGUuc2V0VGltZShkYXRlLmdldFRpbWUoKSAtIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKSAqIDYwICogMTAwMClcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSlcclxuXHJcbiAgICAgIGlmIGlzTmFOKGRhdGUudmFsdWVPZigpKVxyXG4gICAgICAgIHRocm93IFR5cGVFcnJvcignVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSBTdHJpbmcgdG8gRGF0ZScpXHJcblxyXG4gICAgICByZXR1cm4gZGF0ZVxyXG4gICAge1xyXG4gICAgICAjIGh0dHBzOi8vd3d3LmRlYnVnZ2V4LmNvbS9yL0ZuRGY5MGhxbkd1bDFaWXUvMFxyXG4gICAgICBmb3JtYXQ6IC9eKFswLTldezR9KS0oWzAtOV17Mn0pLShbMC05XXsyfSkoPzooPzpUfFxccykoWzAtOV17Mn0pOihbMC05XXsyfSkoPzo6KFswLTldezJ9KD86LlswLTldKyk/KSk/KD86KFxcK3xcXC0pKFswLTldezJ9KTooWzAtOV17Mn0pKT8pPyQvXHJcbiAgICAgIGZvcm1hdERpY3Q6IHtcclxuICAgICAgICB5ZWFyOiAxXHJcbiAgICAgICAgbW9udGg6IDJcclxuICAgICAgICBkYXk6IDNcclxuICAgICAgICBob3VyczogNFxyXG4gICAgICAgIG1pbnV0ZXM6IDVcclxuICAgICAgICBzZWNvbmRzOiA2XHJcbiAgICAgICAgdHpTaWduOiA3XHJcbiAgICAgICAgdHpIb3VyczogOFxyXG4gICAgICAgIHR6TWludXRlczogOVxyXG4gICAgICB9XHJcbiAgICAgIHV0YzogZmFsc2VcclxuICAgICAgc3RyaWN0OiB0cnVlXHJcbiAgICAgIHRyaW06IGZhbHNlXHJcbiAgICB9XHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnU3RyaW5nJ1xyXG4gICAgJ01vbWVudCdcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy50cmltXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50cmltKClcclxuXHJcbiAgICAgIHJlc3VsdCA9IChtb21lbnQgPyByZXF1aXJlKCdtb21lbnQnKSkodmFsdWUsIG9wdGlvbnMuZm9ybWF0LCBvcHRpb25zLmxhbmd1YWdlLCBvcHRpb25zLnN0cmljdClcclxuICAgICAgaWYgbm90IHJlc3VsdC5pc1ZhbGlkKClcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmFibGUgdG8gY29udmVydCBmcm9tIFN0cmluZyB0byBNb21lbnQnKVxyXG5cclxuICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAge1xyXG4gICAgICBzdHJpY3Q6IGZhbHNlXHJcbiAgICAgIGxhbmd1YWdlOiAnZW4nXHJcbiAgICAgIGZvcm1hdDogJ0wnXHJcbiAgICAgIHRyaW06IGZhbHNlXHJcbiAgICB9XHJcbiAgICAnZm9ybWF0J1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1N0cmluZycsXHJcbiAgICAnTnVtYmVyLkludGVnZXInLFxyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLnRyaW1cclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRyaW0oKVxyXG5cclxuICAgICAgaWYgb3B0aW9ucy5iYXNlID09IDEwIGFuZCBub3Qgb3B0aW9ucy5zdHJpY3RcclxuICAgICAgICB0cnlcclxuICAgICAgICAgIHJldHVybiBrby50eXBlZC5nZXRDb252ZXJ0ZXIoJ1N0cmluZycsICdOdW1iZXInKSh2YWx1ZSwgMClcclxuICAgICAgICBjYXRjaCBleFxyXG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gI3t2YWx1ZX0gdG8gTnVtYmVyLkludGVnZXJcIilcclxuXHJcbiAgICAgIGNoYXJzID0gJzAxMjM0NTY3ODlhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eidcclxuICAgICAgaWYgbm90IFJlZ0V4cChcIl4oXFxcXC18XFxcXCspP1sje2NoYXJzLnNsaWNlKDAsIG9wdGlvbnMuYmFzZSA/IDEwKX1dKyRcIiwgaWYgbm90IG9wdGlvbnMuc3RyaWN0IHRoZW4gJ2knKS50ZXN0KHZhbHVlKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tICN7dmFsdWV9IHRvIE51bWJlci5JbnRlZ2VyXCIpXHJcblxyXG4gICAgICByZXR1cm4gcGFyc2VJbnQodmFsdWUsIG9wdGlvbnMuYmFzZSlcclxuICAgIHtcclxuICAgICAgYmFzZTogMTBcclxuICAgICAgc3RyaWN0OiBmYWxzZVxyXG4gICAgICB0cmltOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgJ2Jhc2UnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnU3RyaW5nJ1xyXG4gICAgJ051bWJlcidcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy50cmltXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50cmltKClcclxuXHJcbiAgICAgIGlmIG5vdCAvXihcXCt8XFwtKT9bMC05XSsoXFwuPylbMC05XSokLy50ZXN0KHZhbHVlKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tICN7dmFsdWV9IHRvIE51bWJlclwiKVxyXG5cclxuICAgICAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlLCBvcHRpb25zLmJhc2UpXHJcblxyXG4gICAgICBpZiBvcHRpb25zLmRlY2ltYWxzP1xyXG4gICAgICAgIHZhbHVlID0gTWF0aC5yb3VuZDEwKHZhbHVlLCAtb3B0aW9ucy5kZWNpbWFscylcclxuXHJcbiAgICAgIHJldHVybiB2YWx1ZVxyXG4gICAge1xyXG4gICAgICBkZWNpbWFsczogdW5kZWZpbmVkXHJcbiAgICAgIHRyaW06IGZhbHNlXHJcbiAgICB9XHJcbiAgICAnZGVjaW1hbHMnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnU3RyaW5nJyxcclxuICAgICdVbmRlZmluZWQnLFxyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLnRyaW1cclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRyaW0oKVxyXG5cclxuICAgICAgaWYgdmFsdWUubGVuZ3RoICE9IDBcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBVbmRlZmluZWRcIilcclxuXHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuICAgIHtcclxuICAgICAgdHJpbTogZmFsc2VcclxuICAgIH1cclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdVbmRlZmluZWQnLFxyXG4gICAgJ0RhdGUnLFxyXG4gICAgKHZhbHVlKSAtPlxyXG4gICAgICByZXR1cm4gbmV3IERhdGUoTmFOKVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1VuZGVmaW5lZCcsXHJcbiAgICAnTW9tZW50JyxcclxuICAgICh2YWx1ZSkgLT5cclxuICAgICAgcmV0dXJuIHJlcXVpcmUoJ21vbWVudCcpLmludmFsaWQoKVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1VuZGVmaW5lZCcsXHJcbiAgICAnU3RyaW5nJyxcclxuICAgICh2YWx1ZSkgLT5cclxuICAgICAgcmV0dXJuICcnXHJcbiAgKVxyXG5cclxuICByZXR1cm4ga29cclxuIl19
