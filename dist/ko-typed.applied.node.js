(function (ko, isAn){
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

applyKotr(ko);

module.exports = ko;
})(require('knockout'), require('is-an'));

//# sourceMappingURL=data:application/json;base64,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RSxLQUFBLEdBQVEsSUFBSSxDQUFDLE9BQUwsQ0FBYSxLQUFiLEVBQW9CLENBQUMsT0FBTyxDQUFDLFFBQTdCLEVBRFY7O0FBR0EsV0FBTztFQVpULENBSEYsRUFnQkU7SUFDRSxRQUFBLEVBQVUsTUFEWjtJQUVFLElBQUEsRUFBTSxLQUZSO0dBaEJGLEVBb0JFLFVBcEJGO0VBdUJBLEVBQUUsQ0FBQyxLQUFLLENBQUMsWUFBVCxDQUNFLFFBREYsRUFFRSxXQUZGLEVBR0UsU0FBQyxLQUFELEVBQVEsT0FBUjtJQUNFLElBQUcsT0FBTyxDQUFDLElBQVg7TUFDRSxLQUFBLEdBQVEsS0FBSyxDQUFDLElBQU4sQ0FBQSxFQURWOztJQUdBLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBbkI7QUFDRSxZQUFVLElBQUEsU0FBQSxDQUFVLHlCQUFBLEdBQTBCLEtBQTFCLEdBQWdDLGVBQTFDLEVBRFo7O0FBR0EsV0FBTztFQVBULENBSEYsRUFXRTtJQUNFLElBQUEsRUFBTSxLQURSO0dBWEY7RUFnQkEsRUFBRSxDQUFDLEtBQUssQ0FBQyxZQUFULENBQ0UsV0FERixFQUVFLE1BRkYsRUFHRSxTQUFDLEtBQUQ7QUFDRSxXQUFXLElBQUEsSUFBQSxDQUFLLEdBQUw7RUFEYixDQUhGO0VBT0EsRUFBRSxDQUFDLEtBQUssQ0FBQyxZQUFULENBQ0UsV0FERixFQUVFLFFBRkYsRUFHRSxTQUFDLEtBQUQ7QUFDRSxXQUFPLE9BQUEsQ0FBUSxRQUFSLENBQWlCLENBQUMsT0FBbEIsQ0FBQTtFQURULENBSEY7RUFPQSxFQUFFLENBQUMsS0FBSyxDQUFDLFlBQVQsQ0FDRSxXQURGLEVBRUUsUUFGRixFQUdFLFNBQUMsS0FBRDtBQUNFLFdBQU87RUFEVCxDQUhGO0FBT0EsU0FBTztBQXJtQ0c7O0FBdW1DWixTQUFBLENBQVUsRUFBViIsImZpbGUiOiJrby10eXBlZC5hcHBsaWVkLm5vZGUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJhcHBseUtvdHIgPSAoa28pIC0+XHJcbiAga28udHlwZWQgPSB7fVxyXG5cclxuICBmblRydWUgPSAoKSAtPiB0cnVlXHJcbiAgZm5GYWxzZSA9ICgpIC0+IGZhbHNlXHJcbiAgZm5JZGVudGl0eSA9ICh4KSAtPiB4XHJcblxyXG4gIHR5cGVOYW1lVG9TdHJpbmcgPSAodmFsdWUpIC0+XHJcbiAgICBpZiBub3QgdmFsdWU/IG9yIHZhbHVlLmxlbmd0aCA9PSAwXHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuICAgIGVsc2UgaWYgaXNBbi5TdHJpbmcuTGl0ZXJhbCh2YWx1ZSlcclxuICAgICAgcmV0dXJuIHZhbHVlXHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVybiB2YWx1ZS5qb2luKCd8JylcclxuXHJcbiAgdHlwZU5hbWVUb0FycmF5ID0gKHZhbHVlKSAtPlxyXG4gICAgdmFsdWUgPSB0eXBlTmFtZVRvU3RyaW5nKHZhbHVlKVxyXG4gICAgaWYgaXNBbi5TdHJpbmcuTGl0ZXJhbCh2YWx1ZSlcclxuICAgICAgcmV0dXJuIHZhbHVlLnNwbGl0KCd8JylcclxuICAgIGVsc2VcclxuICAgICAgcmV0dXJuIFtdXHJcblxyXG4gIHR5cGVOYW1lVG9EaXN0aW5jdEFycmF5ID0gKHZhbHVlKSAtPlxyXG4gICAgdmFsdWUgPSB0eXBlTmFtZVRvQXJyYXkodmFsdWUpXHJcblxyXG4gICAgcmVzdWx0ID0gW11cclxuICAgIGZvciB0eXBlTmFtZSBpbiB2YWx1ZVxyXG4gICAgICBpZiByZXN1bHQuaW5kZXhPZih0eXBlTmFtZSkgPT0gLTFcclxuICAgICAgICByZXN1bHQucHVzaCh0eXBlTmFtZSlcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcblxyXG4gIGlzVmFsaWRUeXBlTmFtZSA9ICh2YWx1ZSkgLT5cclxuICAgIHJldHVybiAvXltBLVpdLy50ZXN0KHZhbHVlKVxyXG5cclxuICBpc1R5cGVkID0gKHZhbHVlKSAtPlxyXG4gICAgcmV0dXJuIGlzQW4uRnVuY3Rpb24odmFsdWUpIGFuZCB2YWx1ZS50eXBlTmFtZT8gYW5kIHZhbHVlLnR5cGVOYW1lcz8gYW5kIHZhbHVlLnR5cGVDaGVjaz8gYW5kIHZhbHVlLnR5cGVDaGVja3M/XHJcblxyXG4gIGtvLnR5cGVkLm9wdGlvbnMgPSB7XHJcbiAgICAjIHZhbGlkYXRpb24gb3B0aW9uc1xyXG4gICAgdmFsaWRhdGlvbjoge1xyXG4gICAgICAjIHR1cm4gdmFsaWRhdGlvbiBvbi9vZmZcclxuICAgICAgZW5hYmxlOiBmYWxzZVxyXG5cclxuICAgICAgIyB2YWxpZGF0ZSBvbiByZWFkXHJcbiAgICAgIHJlYWQ6IHRydWVcclxuXHJcbiAgICAgICMgdmFsaWRhdGUgb24gd3JpdGVcclxuICAgICAgd3JpdGU6IHRydWVcclxuXHJcbiAgICAgICMgdmFsaWRhdGUgdGhlIHVuZGVybHlpbmcgb2JzZXJ2YWJsZVxyXG4gICAgICB0YXJnZXQ6IGZhbHNlXHJcblxyXG4gICAgICAjIHZhbGlkYXRlIHRoZSByZXN1bHRpbmcgb2JzZXJ2YWJsZVxyXG4gICAgICByZXN1bHQ6IHRydWVcclxuXHJcbiAgICAgICMgdGhlIG1lc3NhZ2UgdG8gdXNlIChkZWZhdWx0cyB0byB0aGUgbWVzc2FnZSBmcm9tIHRoZSB0aHJvd24gZXhjZXB0aW9uKVxyXG4gICAgICBtZXNzYWdlOiB1bmRlZmluZWRcclxuICAgIH1cclxuXHJcbiAgICBleFJlYWQ6IHtcclxuICAgICAgIyBDYXRjaCBleGNlcHRpb25zLiBNYXkgYWxzbyBiZSBhIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gZXhjZXB0aW9uIHNob3VsZCBiZSBjYXVnaHRcclxuICAgICAgY2F0Y2g6IHRydWVcclxuXHJcbiAgICAgICMgZGVmYXVsdCBjYXRjaCBmdW5jdGlvbiB0byB1c2Ugd2hlbiBjYXRjaCBpcyB0cnVlL2ZhbHNlXHJcbiAgICAgIGNhdGNoVHJ1ZTogKGV4KSAtPiBleCBpbnN0YW5jZW9mIFR5cGVFcnJvclxyXG4gICAgICBjYXRjaEZhbHNlOiBmbkZhbHNlXHJcblxyXG4gICAgICAjIERvIG5vdCB0aHJvdyBleGNlcHRpb25zIHdoZW4gcmVhZGluZy4gVXNlIGRlZmF1bHQgdmFsdWUvZnVuYyBpbnN0ZWFkXHJcbiAgICAgIHVzZURlZmF1bHQ6IGZhbHNlXHJcblxyXG4gICAgICAjIERlZmF1bHQgdmFsdWUgdG8gdXNlIHdoZW4gYW4gZXhjZXB0aW9uIGlzIGNhdWdodFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IHVuZGVmaW5lZFxyXG5cclxuICAgICAgIyBDb21wdXRlIGEgZGVmYXVsdCB2YWx1ZSB3aGVuIGFuIGV4Y2VwdGlvbiBpcyBjYXVnaHQuIE92ZXJyaWRlcyBkZWZhdWx0VmFsdWVcclxuICAgICAgZGVmYXVsdEZ1bmM6IHVuZGVmaW5lZFxyXG4gICAgfVxyXG4gICAgZXhXcml0ZToge1xyXG4gICAgICAjIENhdGNoIGV4Y2VwdGlvbnMuIE1heSBhbHNvIGJlIGEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBleGNlcHRpb24gc2hvdWxkIGJlIGNhdWdodFxyXG4gICAgICBjYXRjaDogdHJ1ZVxyXG5cclxuICAgICAgIyBkZWZhdWx0IGNhdGNoIGZ1bmN0aW9uIHRvIHVzZSB3aGVuIGNhdGNoIGlzIHRydWUvZmFsc2VcclxuICAgICAgY2F0Y2hUcnVlOiAoZXgpIC0+IGV4IGluc3RhbmNlb2YgVHlwZUVycm9yXHJcbiAgICAgIGNhdGNoRmFsc2U6IGZuRmFsc2VcclxuXHJcbiAgICAgICMgRG8gbm90IHRocm93IGV4Y2VwdGlvbnMgd2hlbiB3cml0aW5nXHJcbiAgICAgIG5vVGhyb3c6IGZhbHNlXHJcblxyXG4gICAgICAjIERvIG5vdCBsZWF2ZSB0YXJnZXQgdW5zZXQuIFNldCB0aGUgdGFyZ2V0IHRvIHRoaXMgdmFsdWUgb24gZXJyb3JcclxuICAgICAgdXNlRGVmYXVsdDogZmFsc2VcclxuXHJcbiAgICAgICMgRGVmYXVsdCB2YWx1ZSB0byB1c2Ugd2hlbiBhbiBleGNlcHRpb24gaXMgY2F1Z2h0XHJcbiAgICAgIGRlZmF1bHRWYWx1ZTogdW5kZWZpbmVkXHJcblxyXG4gICAgICAjIENvbXB1dGUgYSBkZWZhdWx0IHZhbHVlIHdoZW4gYW4gZXhjZXB0aW9uIGlzIGNhdWdodC4gT3ZlcnJpZGVzIGRlZmF1bHRWYWx1ZVxyXG4gICAgICBkZWZhdWx0RnVuYzogdW5kZWZpbmVkXHJcbiAgICB9XHJcblxyXG4gICAgIyB1c2UgcHVyZSBjb21wdXRlZCBvYnNlcnZhYmxlc1xyXG4gICAgcHVyZTogdHJ1ZVxyXG5cclxuICAgICMgZG8gbm90IGF0dGVtcHQgdG8gcmVhZCB0aGUgdmFsdWUgaW1tZWRpYXRlbHlcclxuICAgIGRlZmVyRXZhbHVhdGlvbjogdHJ1ZVxyXG4gIH1cclxuXHJcbiAgZXh0ZW5kID0gKHJvb3QsIG9iamVjdHMuLi4pIC0+XHJcbiAgICBmb3Igb2JqZWN0IGluIG9iamVjdHNcclxuICAgICAgcm9vdCA9IGtvLnV0aWxzLmV4dGVuZChyb290LCBvYmplY3QpXHJcbiAgICByZXR1cm4gcm9vdFxyXG5cclxuICBub3JtYWxpemVFeCA9IChuYW1lLCByb290LCBvYmplY3RzLi4uKSAtPlxyXG4gICAgcm9vdFtuYW1lXSA9IG9wdCA9IGV4dGVuZCh7fSwgKG9iamVjdD9bbmFtZV0gZm9yIG93biBrZXksIG9iamVjdCBvZiBvYmplY3RzKS4uLilcclxuXHJcbiAgICAjIGZvcmNlIGNhdGNoIHRvIGJlIGEgZnVuY3Rpb25cclxuICAgIGlmIG9wdC5jYXRjaCA9PSB0cnVlXHJcbiAgICAgIG9wdC5jYXRjaCA9IG9wdC5jYXRjaFRydWVcclxuICAgIGVsc2UgaWYgb3B0LmNhdGNoID09IGZhbHNlXHJcbiAgICAgIG9wdC5jYXRjaCA9IG9wdC5jYXRjaEZhbHNlXHJcblxyXG4gICAgIyBmb3JjZSBkZWZhdWx0RnVuY1xyXG4gICAgaWYgb3B0LnVzZURlZmF1bHQgYW5kIG5vdCBvcHQuZGVmYXVsdEZ1bmM/XHJcbiAgICAgIG9wdC5kZWZhdWx0RnVuYyA9ICgpIC0+IG9wdC5kZWZhdWx0VmFsdWVcclxuXHJcbiAgICByZXR1cm4gb3B0XHJcblxyXG4gIG5vcm1hbGl6ZUV4UmVhZCA9IChyb290LCBvYmplY3RzLi4uKSAtPlxyXG4gICAgbm9ybWFsaXplRXgoJ2V4UmVhZCcsIHJvb3QsIG9iamVjdHMuLi4pXHJcblxyXG4gIG5vcm1hbGl6ZUV4V3JpdGUgPSAocm9vdCwgb2JqZWN0cy4uLikgLT5cclxuICAgIG5vcm1hbGl6ZUV4KCdleFdyaXRlJywgcm9vdCwgb2JqZWN0cy4uLilcclxuXHJcbiAgbm9ybWFsaXplVmFsaWRhdGlvbiA9IChyb290LCBvYmplY3RzLi4uKSAtPlxyXG4gICAgbm9ybSA9ICh2KSAtPlxyXG4gICAgICBpZiB2ID09IHRydWVcclxuICAgICAgICByZXR1cm4geyBlbmFibGU6IHRydWUgfVxyXG4gICAgICBlbHNlIGlmIHYgPT0gZmFsc2VcclxuICAgICAgICByZXR1cm4geyBlbmFibGU6IGZhbHNlIH1cclxuICAgICAgZWxzZVxyXG4gICAgICAgIHJldHVybiB2XHJcblxyXG4gICAgcm9vdFsndmFsaWRhdGlvbiddID0gb3B0ID0gZXh0ZW5kKHt9LCAobm9ybShvYmplY3Q/Wyd2YWxpZGF0aW9uJ10pIGZvciBvd24ga2V5LCBvYmplY3Qgb2Ygb2JqZWN0cykuLi4pXHJcblxyXG4gICAgcmV0dXJuIG9wdFxyXG5cclxuICB3cmFwUmVhZCA9IChvcHRpb25zLCB0YXJnZXQsIHJlYWRFcnJvciwgcmVhZCkgLT5cclxuICAgIHJldHVybiAoKSAtPlxyXG4gICAgICB0cnlcclxuICAgICAgICByZXR1cm4gcmVhZCgpXHJcbiAgICAgIGNhdGNoIGV4XHJcbiAgICAgICAgaWYgb3B0aW9ucy5leFJlYWQuY2F0Y2goZXgpXHJcbiAgICAgICAgICByZWFkRXJyb3IoZXgpXHJcblxyXG4gICAgICAgICAgaWYgb3B0aW9ucy5leFJlYWQudXNlRGVmYXVsdFxyXG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5leFJlYWQuZGVmYXVsdEZ1bmMoKVxyXG5cclxuICAgICAgICB0aHJvdyBleFxyXG4gICAgICBmaW5hbGx5XHJcbiAgICAgICAgaWYgbm90IGV4P1xyXG4gICAgICAgICAgcmVhZEVycm9yKHVuZGVmaW5lZClcclxuXHJcbiAgd3JhcFdyaXRlID0gKG9wdGlvbnMsIHRhcmdldCwgd3JpdGVFcnJvciwgd3JpdGUpIC0+XHJcbiAgICByZXR1cm4gKHZhbHVlKSAtPlxyXG4gICAgICB0cnlcclxuICAgICAgICB3cml0ZSh2YWx1ZSlcclxuICAgICAgY2F0Y2ggZXhcclxuICAgICAgICBpZiBvcHRpb25zLmV4V3JpdGUuY2F0Y2goZXgpXHJcbiAgICAgICAgICB3cml0ZUVycm9yKGV4KVxyXG5cclxuICAgICAgICAgIGlmIG9wdGlvbnMuZXhXcml0ZS51c2VEZWZhdWx0XHJcbiAgICAgICAgICAgIHRhcmdldChvcHRpb25zLmV4V3JpdGUuZGVmYXVsdEZ1bmMoKSlcclxuXHJcbiAgICAgICAgaWYgbm90IG9wdGlvbnMuZXhXcml0ZS5ub1Rocm93XHJcbiAgICAgICAgICB0aHJvdyBleFxyXG4gICAgICBmaW5hbGx5XHJcbiAgICAgICAgaWYgbm90IGV4P1xyXG4gICAgICAgICAgd3JpdGVFcnJvcih1bmRlZmluZWQpXHJcblxyXG4gIHZhbGlkYXRlID0gKHRhcmdldCwgcmVzdWx0LCBvcHRpb25zKSAtPlxyXG4gICAgaWYgbm90IG9wdGlvbnMudmFsaWRhdGlvbi5lbmFibGVcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgdmFsaWRhdGlvbiA9IG9wdGlvbnMudmFsaWRhdGlvblxyXG5cclxuICAgIGlmIChub3QgdmFsaWRhdGlvbi50YXJnZXQgYW5kIG5vdCB2YWxpZGF0aW9uLnJlc3VsdCkgb3IgKG5vdCB2YWxpZGF0aW9uLnJlYWQgYW5kIG5vdCB2YWxpZGF0aW9uLndyaXRlKVxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBpZiBrby52YWxpZGF0aW9uP1xyXG4gICAgICAjIyNcclxuICAgICAgTm90ZSB0aGF0IHVzaW5nIGtvIHZhbGlkYXRpb24gd2lsbCBmb3JjZSBhbiBpbW1lZGlhdGUgZXZhbHVhdGlvbiBvZiB0aGUgdGFyZ2V0dGVkIG9ic2VydmFibGVzXHJcbiAgICAgICMjI1xyXG4gICAgICBpZiBvcHRpb25zLnZhbGlkYXRpb24ucmVhZCBhbmQgb3B0aW9ucy52YWxpZGF0aW9uLndyaXRlXHJcbiAgICAgICAgbWVzc2FnZSA9ICgpIC0+IHJlc3VsdC53cml0ZUVycm9yKCk/Lm1lc3NhZ2UgPyByZXN1bHQucmVhZEVycm9yKCk/Lm1lc3NhZ2VcclxuICAgICAgZWxzZSBpZiBvcHRpb25zLnZhbGlkYXRpb24ucmVhZFxyXG4gICAgICAgIG1lc3NhZ2UgPSAoKSAtPiByZXN1bHQucmVhZEVycm9yKCk/Lm1lc3NhZ2VcclxuICAgICAgZWxzZSAjaWYgb3B0aW9ucy52YWxpZGF0aW9uLndyaXRlXHJcbiAgICAgICAgbWVzc2FnZSA9ICgpIC0+IHJlc3VsdC53cml0ZUVycm9yKCk/Lm1lc3NhZ2VcclxuXHJcbiAgICAgIGFwcGx5VmFsaWRhdGlvbiA9IChiYXNlKSAtPlxyXG4gICAgICAgIGJhc2UuZXh0ZW5kKHsgdmFsaWRhdGFibGU6IHsgZW5hYmxlOiB0cnVlIH0gfSlcclxuXHJcbiAgICAgICAgcnVsZSA9IHtcclxuICAgICAgICAgIG1lc3NhZ2U6IHVuZGVmaW5lZFxyXG4gICAgICAgICAgdmFsaWRhdG9yOiAoKSAtPlxyXG4gICAgICAgICAgICBtID0gbWVzc2FnZSgpXHJcbiAgICAgICAgICAgIGlmIG5vdCBtP1xyXG4gICAgICAgICAgICAgIHJ1bGUubWVzc2FnZSA9IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICBydWxlLm1lc3NhZ2UgPSB2YWxpZGF0aW9uLm1lc3NhZ2UgPyBtXHJcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBrby52YWxpZGF0aW9uLmFkZEFub255bW91c1J1bGUoYmFzZSwgcnVsZSlcclxuXHJcbiAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICBpZiB2YWxpZGF0aW9uLnRhcmdldFxyXG4gICAgICAgIGFwcGx5VmFsaWRhdGlvbih0YXJnZXQpXHJcblxyXG4gICAgICBpZiB2YWxpZGF0aW9uLnJlc3VsdFxyXG4gICAgICAgIGFwcGx5VmFsaWRhdGlvbihyZXN1bHQpXHJcblxyXG4gICAgcmV0dXJuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcbiAga28uZXh0ZW5kZXJzLnR5cGUgPSAodGFyZ2V0LCBvcHRpb25zKSAtPlxyXG4gICAgIyBSZXF1aXJlc1xyXG4gICAgIyB0eXBlTmFtZSA6IFN0cmluZ1xyXG4gICAgIyB0eXBlTmFtZXMgOiBBcnJheSBvZiBTdHJpbmdcclxuICAgICMgdHlwZUNoZWNrIDogZnVuY3Rpb24gKHZhbHVlKSB7IC4uLiB9XHJcbiAgICAjIHR5cGVDaGVja3MgOiB7IHR5cGVOYW1lOiBmdW5jdGlvbiBpc1R5cGUodmFsdWUpIHsgLi4uIH0sIC4uLiB9XHJcblxyXG4gICAgaWYgaXNBbi5TdHJpbmcuTGl0ZXJhbChvcHRpb25zKSBvciBpc0FuLkFycmF5KG9wdGlvbnMpXHJcbiAgICAgICMgLmV4dGVuZCh7IHR5cGU6ICdUeXBlTmFtZXxUeXBlTmFtZXxUeXBlTmFtZScgfSlcclxuICAgICAgIyAuZXh0ZW5kKHsgdHlwZTogWydUeXBlTmFtZScsJ1R5cGVOYW1lJywuLi5dIH0pXHJcbiAgICAgIG9wdGlvbnMgPSB7IHR5cGU6IG9wdGlvbnMgfVxyXG4gICAgZWxzZSBpZiBpc0FuLkZ1bmN0aW9uKG9wdGlvbnMpXHJcbiAgICAgICMgLmV4dGVuZCh7IHR5cGU6IGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdHJ1ZXxmYWxzZTsgfSB9KVxyXG4gICAgICBvcHRpb25zID0ge1xyXG4gICAgICAgIHR5cGU6IG9wdGlvbnMudHlwZU5hbWVcclxuICAgICAgICBjaGVjazogb3B0aW9uc1xyXG4gICAgICB9XHJcblxyXG4gICAgbm9ybWFsID0gZXh0ZW5kKHt9LCBrby50eXBlZC5vcHRpb25zLCBrby5leHRlbmRlcnMudHlwZS5vcHRpb25zLCBvcHRpb25zKVxyXG4gICAgbm9ybWFsaXplRXhSZWFkKG5vcm1hbCwga28udHlwZWQub3B0aW9ucywga28uZXh0ZW5kZXJzLnR5cGUub3B0aW9ucywgb3B0aW9ucylcclxuICAgIG5vcm1hbGl6ZUV4V3JpdGUobm9ybWFsLCBrby50eXBlZC5vcHRpb25zLCBrby5leHRlbmRlcnMudHlwZS5vcHRpb25zLCBvcHRpb25zKVxyXG4gICAgbm9ybWFsaXplVmFsaWRhdGlvbihub3JtYWwsIGtvLnR5cGVkLm9wdGlvbnMsIGtvLmV4dGVuZGVycy50eXBlLm9wdGlvbnMsIG9wdGlvbnMpXHJcbiAgICBvcHRpb25zID0gbm9ybWFsXHJcblxyXG4gICAgIyBHYXRoZXIgdHlwZSBuYW1lc1xyXG4gICAgdHlwZU5hbWVzID0gdHlwZU5hbWVUb0FycmF5KG9wdGlvbnMudHlwZSlcclxuICAgIHR5cGVOYW1lcy5wdXNoKChuYW1lIGZvciBvd24gbmFtZSBvZiBvcHRpb25zIHdoZW4gaXNWYWxpZFR5cGVOYW1lKG5hbWUpKS4uLilcclxuICAgIHR5cGVOYW1lcyA9IHR5cGVOYW1lVG9EaXN0aW5jdEFycmF5KHR5cGVOYW1lcylcclxuICAgIHR5cGVOYW1lID0gdHlwZU5hbWVUb1N0cmluZyh0eXBlTmFtZXMpXHJcblxyXG4gICAgIyBzaW1wbGUgY2hlY2tzXHJcbiAgICB0eXBlQ2hlY2tzU2ltcGxlID0ge31cclxuICAgIGRvIC0+XHJcbiAgICAgIGZvciBuYW1lIGluIHR5cGVOYW1lc1xyXG4gICAgICAgIHR5cGVDaGVja3NTaW1wbGVbbmFtZV0gPSBvcHRpb25zW25hbWVdID8gaXNBbihuYW1lLCB7IHJldHVybkNoZWNrZXI6IHRydWUgfSlcclxuXHJcbiAgICAjIHNpbXBsZSBjaGVja1xyXG4gICAgdHlwZUNoZWNrU2ltcGxlID0gb3B0aW9ucy5jaGVjayA/ICgoKSAtPiB0cnVlKVxyXG5cclxuICAgICMgY2hlY2tzXHJcbiAgICB0eXBlQ2hlY2tzID0ge31cclxuICAgIGRvIC0+XHJcbiAgICAgIGZvciBuYW1lLCBjaGVjayBvZiB0eXBlQ2hlY2tzU2ltcGxlXHJcbiAgICAgICAgZG8gKGNoZWNrKSAtPlxyXG4gICAgICAgICAgdHlwZUNoZWNrc1tuYW1lXSA9ICh2YWx1ZSkgLT5cclxuICAgICAgICAgICAgY2hlY2sodmFsdWUpIGFuZCB0eXBlQ2hlY2tTaW1wbGUodmFsdWUpXHJcblxyXG4gICAgIyBjaGVja1xyXG4gICAgdHlwZUNoZWNrID0gZG8gLT5cclxuICAgICAgcmV0dXJuICh2YWx1ZSkgLT5cclxuICAgICAgICB0eXBlQ2hlY2tTaW1wbGUodmFsdWUpIGFuZCAoKHR5cGVOYW1lcy5sZW5ndGggPT0gMCkgb3IgKHR5cGVOYW1lcy5zb21lKChuYW1lKSAtPiB0eXBlQ2hlY2tzU2ltcGxlW25hbWVdKHZhbHVlKSkpKVxyXG5cclxuICAgIHJlYWRFcnJvciA9IGtvLm9ic2VydmFibGUoKVxyXG4gICAgd3JpdGVFcnJvciA9IGtvLm9ic2VydmFibGUoKVxyXG5cclxuICAgIHJlc3VsdCA9IGtvLmNvbXB1dGVkKHtcclxuICAgICAgcHVyZTogb3B0aW9ucy5wdXJlXHJcbiAgICAgIGRlZmVyRXZhbHVhdGlvbjogdHJ1ZVxyXG5cclxuICAgICAgcmVhZDogd3JhcFJlYWQoXHJcbiAgICAgICAgb3B0aW9ucyxcclxuICAgICAgICB0YXJnZXQsXHJcbiAgICAgICAgcmVhZEVycm9yLFxyXG4gICAgICAgICgpIC0+XHJcbiAgICAgICAgICBpbnRlcm5hbFZhbHVlID0gdGFyZ2V0KClcclxuXHJcbiAgICAgICAgICBpZiBub3QgdHlwZUNoZWNrKGludGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmV4cGVjdGVkIGludGVybmFsIHR5cGUuIEV4cGVjdGVkICN7dHlwZU5hbWV9LCBnb3QgI3tpc0FuKGludGVybmFsVmFsdWUpfVwiKVxyXG5cclxuICAgICAgICAgIHJldHVybiBpbnRlcm5hbFZhbHVlXHJcbiAgICAgIClcclxuICAgICAgd3JpdGU6IHdyYXBXcml0ZShcclxuICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgIHRhcmdldCxcclxuICAgICAgICB3cml0ZUVycm9yLFxyXG4gICAgICAgIChleHRlcm5hbFZhbHVlKSAtPlxyXG4gICAgICAgICAgaWYgdHlwZUNoZWNrKGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgIHRhcmdldChleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5leHBlY3RlZCBleHRlcm5hbCB0eXBlLiBFeHBlY3RlZCAje3R5cGVOYW1lfSwgcmVjZWl2ZWQgI3tpc0FuKGV4dGVybmFsVmFsdWUpfVwiKVxyXG5cclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICApXHJcbiAgICB9KVxyXG5cclxuICAgIHJlc3VsdC50eXBlTmFtZSA9IHR5cGVOYW1lXHJcbiAgICByZXN1bHQudHlwZU5hbWVzID0gdHlwZU5hbWVzXHJcbiAgICByZXN1bHQudHlwZUNoZWNrID0gdHlwZUNoZWNrXHJcbiAgICByZXN1bHQudHlwZUNoZWNrcyA9IHR5cGVDaGVja3NcclxuXHJcbiAgICByZXN1bHQucmVhZEVycm9yID0gcmVhZEVycm9yXHJcbiAgICByZXN1bHQud3JpdGVFcnJvciA9IHdyaXRlRXJyb3JcclxuXHJcbiAgICB2YWxpZGF0ZSh0YXJnZXQsIHJlc3VsdCwgb3B0aW9ucylcclxuXHJcbiAgICBpZiBub3Qgb3B0aW9ucy5kZWZlckV2YWx1YXRpb25cclxuICAgICAgdHJ5XHJcbiAgICAgICAgcmVzdWx0LnBlZWsoKVxyXG4gICAgICBjYXRjaCBleFxyXG4gICAgICAgIHJlc3VsdC5kaXNwb3NlKClcclxuICAgICAgICB0aHJvdyBleFxyXG5cclxuICAgIHJldHVybiByZXN1bHRcclxuXHJcbiAga28uZXh0ZW5kZXJzLnR5cGUub3B0aW9ucyA9IHtcclxuICB9XHJcblxyXG5cclxuICBrby5leHRlbmRlcnMuY29udmVydCA9ICh0YXJnZXQsIG9wdGlvbnMpIC0+XHJcbiAgICBpZiBvcHRpb25zID09IGZhbHNlXHJcbiAgICAgIHJldHVybiB0YXJnZXRcclxuXHJcbiAgICAjIG5vcm1hbGl6ZSBvcHRpb25zXHJcbiAgICBkbyAtPlxyXG4gICAgICBpZiBpc0FuLlN0cmluZyhvcHRpb25zKSBvciBpc0FuLkFycmF5KG9wdGlvbnMpXHJcbiAgICAgICAgb3B0aW9ucyA9IHsgdHlwZTogb3B0aW9ucyB9XHJcbiAgICAgIGVsc2UgaWYgb3B0aW9ucyA9PSB0cnVlXHJcbiAgICAgICAgb3B0aW9ucyA9IHt9XHJcblxyXG4gICAgICAjIG1lcmdlIG9wdGlvbnNcclxuICAgICAgb3B0aW9ucyA9IGV4dGVuZCh7fSwga28udHlwZWQub3B0aW9ucywga28uZXh0ZW5kZXJzLmNvbnZlcnQub3B0aW9ucywgb3B0aW9ucylcclxuXHJcbiAgICAgIG5vcm1hbCA9IHtcclxuICAgICAgICBjaGVja1NlbGY6IG9wdGlvbnMuY2hlY2sgPyBmblRydWVcclxuICAgICAgICByZWFkOiBvcHRpb25zLnJlYWRcclxuICAgICAgICB3cml0ZTogb3B0aW9ucy53cml0ZVxyXG4gICAgICAgIGNoZWNrczoge31cclxuICAgICAgICBjaGVja2VyczogW11cclxuICAgICAgICBpc1R5cGVkOiBpc1R5cGVkKHRhcmdldClcclxuICAgICAgICBpZ25vcmVEZWZhdWx0Q29udmVydGVyczogb3B0aW9ucy5pZ25vcmVEZWZhdWx0Q29udmVydGVyc1xyXG4gICAgICAgIHB1cmU6IG9wdGlvbnMucHVyZVxyXG4gICAgICAgIGRlZmVyRXZhbHVhdGlvbjogb3B0aW9ucy5kZWZlckV2YWx1YXRpb25cclxuICAgICAgICB0eXBlczogdHlwZU5hbWVUb0Rpc3RpbmN0QXJyYXkob3B0aW9ucy50eXBlKVxyXG4gICAgICB9XHJcblxyXG4gICAgICBub3JtYWxpemVFeFJlYWQobm9ybWFsLCBrby50eXBlZC5vcHRpb25zLCBrby5leHRlbmRlcnMuY29udmVydC5vcHRpb25zLCBvcHRpb25zKVxyXG4gICAgICBub3JtYWxpemVFeFdyaXRlKG5vcm1hbCwga28udHlwZWQub3B0aW9ucywga28uZXh0ZW5kZXJzLmNvbnZlcnQub3B0aW9ucywgb3B0aW9ucylcclxuICAgICAgbm9ybWFsaXplVmFsaWRhdGlvbihub3JtYWwsIGtvLnR5cGVkLm9wdGlvbnMsIGtvLmV4dGVuZGVycy5jb252ZXJ0Lm9wdGlvbnMsIG9wdGlvbnMpXHJcblxyXG4gICAgICAjIEV4cGFuZCBlYWNoIEV4dGVybmFsIFR5cGVcclxuICAgICAgZm9yIG93biBleHRUeXBlTmFtZSwgZXh0VHlwZU9wdGlvbnMgb2Ygb3B0aW9uc1xyXG4gICAgICAgIGlmIG5vdCBpc1ZhbGlkVHlwZU5hbWUoZXh0VHlwZU5hbWUpXHJcbiAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICBleHRUeXBlT3B0aW9ucyA9IG9wdGlvbnNbZXh0VHlwZU5hbWVdID8ge31cclxuXHJcbiAgICAgICAgbm9ybWFsW2V4dFR5cGVOYW1lXSA9IHtcclxuICAgICAgICAgIGNoZWNrU2VsZjogZXh0VHlwZU9wdGlvbnMuY2hlY2tcclxuICAgICAgICAgIHJlYWQ6IGV4dFR5cGVPcHRpb25zLnJlYWRcclxuICAgICAgICAgIHdyaXRlOiBleHRUeXBlT3B0aW9ucy53cml0ZVxyXG4gICAgICAgICAgdHlwZXM6IHR5cGVOYW1lVG9EaXN0aW5jdEFycmF5KGV4dFR5cGVPcHRpb25zLnR5cGUpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAjIEV4cGFuZCBhbGwgaW50ZXJuYWwgdHlwZXNcclxuICAgICAgICBmb3Igb3duIGludFR5cGVOYW1lIG9mIGV4dFR5cGVPcHRpb25zXHJcbiAgICAgICAgICBpZiBub3QgaXNWYWxpZFR5cGVOYW1lKGludFR5cGVOYW1lKVxyXG4gICAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAgIGludFR5cGVPcHRpb25zID0gb3B0aW9uc1tleHRUeXBlTmFtZV0/W2ludFR5cGVOYW1lXSA/IHt9XHJcblxyXG4gICAgICAgICAgbm9ybWFsW2V4dFR5cGVOYW1lXVtpbnRUeXBlTmFtZV0gPSB7XHJcbiAgICAgICAgICAgIHJlYWQ6IGludFR5cGVPcHRpb25zLnJlYWRcclxuICAgICAgICAgICAgd3JpdGU6IGludFR5cGVPcHRpb25zLndyaXRlXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICBub3JtYWwudHlwZSA9IHR5cGVOYW1lVG9TdHJpbmcobm9ybWFsLnR5cGVzKVxyXG5cclxuICAgICAgZm9yIGV4dFR5cGVOYW1lIGluIG5vcm1hbC50eXBlc1xyXG4gICAgICAgIGNoZWNrZXIgPSBub3JtYWxbZXh0VHlwZU5hbWVdPy5jaGVja1NlbGYgPyBpc0FuKGV4dFR5cGVOYW1lLCB7IHJldHVybkNoZWNrZXI6IHRydWUgfSkgPyBmblRydWVcclxuICAgICAgICBub3JtYWwuY2hlY2tzW2V4dFR5cGVOYW1lXSA9IGRvIChjaGVja2VyKSAtPlxyXG4gICAgICAgICAgKHZhbHVlKSAtPiBub3JtYWwuY2hlY2tTZWxmKHZhbHVlKSBhbmQgY2hlY2tlcih2YWx1ZSlcclxuICAgICAgICBub3JtYWwuY2hlY2tlcnMucHVzaChub3JtYWwuY2hlY2tzW2V4dFR5cGVOYW1lXSlcclxuXHJcbiAgICAgIG5vcm1hbC5jaGVjayA9ICh2YWx1ZSkgLT5cclxuICAgICAgICBub3JtYWwuY2hlY2tTZWxmKHZhbHVlKSBhbmQgKChub3JtYWwuY2hlY2tlcnMubGVuZ3RoID09IDApIG9yIG5vcm1hbC5jaGVja2Vycy5zb21lKChjaGVja2VyKSAtPiBjaGVja2VyKHZhbHVlKSkpXHJcblxyXG4gICAgICBvcHRpb25zID0gbm9ybWFsXHJcblxyXG5cclxuICAgIHJlYWRFcnJvciA9IGtvLm9ic2VydmFibGUoKVxyXG4gICAgd3JpdGVFcnJvciA9IGtvLm9ic2VydmFibGUoKVxyXG5cclxuICAgIHJlc3VsdCA9IGtvLmNvbXB1dGVkKHtcclxuICAgICAgcHVyZTogb3B0aW9ucy5wdXJlXHJcbiAgICAgIGRlZmVyRXZhbHVhdGlvbjogdHJ1ZVxyXG5cclxuICAgICAgcmVhZDogd3JhcFJlYWQoXHJcbiAgICAgICAgb3B0aW9ucyxcclxuICAgICAgICB0YXJnZXQsXHJcbiAgICAgICAgcmVhZEVycm9yLFxyXG4gICAgICAgICgpIC0+XHJcbiAgICAgICAgICBpbnRlcm5hbFZhbHVlID0gdGFyZ2V0KClcclxuICAgICAgICAgIGV4dGVybmFsVmFsdWUgPSB1bmRlZmluZWRcclxuXHJcbiAgICAgICAgICAjIFRyeSBleGFjdCBpbnRlcm5hbCB0eXBlIG1hdGNoXHJcbiAgICAgICAgICB0cnlSZWFkID0gKHJlYWQsIHJlYWRPcHRpb25zKSAtPlxyXG4gICAgICAgICAgICBpZiByZWFkP1xyXG4gICAgICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICAgICAgZXh0ZXJuYWxWYWx1ZSA9IHJlYWQoaW50ZXJuYWxWYWx1ZSwgcmVhZE9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgY2F0Y2ggZXhcclxuICAgICAgICAgICAgICAgIGlmIGV4IG5vdCBpbnN0YW5jZW9mIFR5cGVFcnJvclxyXG4gICAgICAgICAgICAgICAgICB0aHJvdyBleFxyXG5cclxuICAgICAgICAgICAgICBpZiBub3QgZXg/XHJcbiAgICAgICAgICAgICAgICBpZiBvcHRpb25zLmNoZWNrKGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICAgICAgICBleHRUeXBlTmFtZXMgPSBvcHRpb25zLnR5cGVzXHJcbiAgICAgICAgICBpZiBleHRUeXBlTmFtZXMubGVuZ3RoID09IDBcclxuICAgICAgICAgICAgZXh0VHlwZU5hbWVzID0gW2lzQW4oaW50ZXJuYWxWYWx1ZSldXHJcblxyXG4gICAgICAgICAgIyBMb29rIGZvciBzcGVjaWZpYyBjb252ZXJzaW9uXHJcbiAgICAgICAgICBmb3IgZXh0VHlwZU5hbWUgaW4gZXh0VHlwZU5hbWVzXHJcbiAgICAgICAgICAgIGV4dFR5cGVPcHRpb25zID0gb3B0aW9uc1tleHRUeXBlTmFtZV0gPyB7fVxyXG5cclxuICAgICAgICAgICAgIyBpbnRlcm5hbCB0eXBlc1xyXG4gICAgICAgICAgICBpbnRUeXBlTmFtZXMgPSBleHRUeXBlT3B0aW9ucy50eXBlcyA/IFtdXHJcbiAgICAgICAgICAgIGlmIGludFR5cGVOYW1lcy5sZW5ndGggPT0gMFxyXG4gICAgICAgICAgICAgIGlmIG9wdGlvbnMuaXNUeXBlZFxyXG4gICAgICAgICAgICAgICAgIyBnbyBieSB0YXJnZXQgb3JkZXJcclxuICAgICAgICAgICAgICAgIGludFR5cGVOYW1lcyA9IHRhcmdldC50eXBlTmFtZXNcclxuICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAjIGdvIGJ5IGluZmVycmVkIG9yZGVyXHJcbiAgICAgICAgICAgICAgICBpbnRUeXBlTmFtZXMgPSBbaXNBbihpbnRlcm5hbFZhbHVlKV1cclxuXHJcbiAgICAgICAgICAgIGZvciBpbnRUeXBlTmFtZSBpbiBpbnRUeXBlTmFtZXNcclxuICAgICAgICAgICAgICAjIGNoZWNrIGludGVybmFsIHR5cGVcclxuICAgICAgICAgICAgICBpZiBvcHRpb25zLmlzVHlwZWQgYW5kIG5vdCB0YXJnZXQudHlwZUNoZWNrc1tpbnRUeXBlTmFtZV0/KGludGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAgICAgICAjIGdldCB0aGUgb3B0aW9uc1xyXG4gICAgICAgICAgICAgIGludFR5cGVPcHRpb25zID0gZXh0VHlwZU9wdGlvbnNbaW50VHlwZU5hbWVdID8ge31cclxuXHJcbiAgICAgICAgICAgICAgIyB0cnkgY3VzdG9tIGNvbnZlcnNpb25cclxuICAgICAgICAgICAgICBpZiBpbnRUeXBlT3B0aW9ucy5yZWFkP1xyXG4gICAgICAgICAgICAgICAgaWYgdHJ5UmVhZChpbnRUeXBlT3B0aW9ucy5yZWFkLCBpbnRUeXBlT3B0aW9ucy5yZWFkT3B0aW9ucylcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4dGVybmFsVmFsdWVcclxuICAgICAgICAgICAgICAjIHRyeSBubyBjb252ZXJzaW9uXHJcbiAgICAgICAgICAgICAgZWxzZSBpZiBpbnRUeXBlTmFtZSA9PSBleHRUeXBlTmFtZVxyXG4gICAgICAgICAgICAgICAgaWYgbm90IGV4dFR5cGVPcHRpb25zLnJlYWQ/IGFuZCBub3Qgb3B0aW9ucy5yZWFkPyBhbmQgdHJ5UmVhZChmbklkZW50aXR5KVxyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gZXh0ZXJuYWxWYWx1ZVxyXG4gICAgICAgICAgICAgIGVsc2UgaWYgbm90IG9wdGlvbnMuaWdub3JlRGVmYXVsdENvbnZlcnRlcnNcclxuICAgICAgICAgICAgICAgICMgdHJ5IGRlZmF1bHQgY29udmVyc2lvblxyXG4gICAgICAgICAgICAgICAgaWYgdHJ5UmVhZChrby50eXBlZC5nZXRDb252ZXJ0ZXIoaW50VHlwZU5hbWUsIGV4dFR5cGVOYW1lKSwgaW50VHlwZU9wdGlvbnMucmVhZE9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBleHRlcm5hbFZhbHVlXHJcblxyXG4gICAgICAgICAgIyBMb29rIGZvciBvbmUtc2lkZWQgY29udmVyc2lvblxyXG4gICAgICAgICAgZm9yIGV4dFR5cGVOYW1lIGluIGV4dFR5cGVOYW1lc1xyXG4gICAgICAgICAgICBleHRUeXBlT3B0aW9ucyA9IG9wdGlvbnNbZXh0VHlwZU5hbWVdID8ge31cclxuXHJcbiAgICAgICAgICAgICMgdHJ5IGN1c3RvbSBjb252ZXJzaW9uXHJcbiAgICAgICAgICAgIGlmIHRyeVJlYWQoZXh0VHlwZU9wdGlvbnMucmVhZCwgZXh0VHlwZU9wdGlvbnMucmVhZE9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgcmV0dXJuIGV4dGVybmFsVmFsdWVcclxuXHJcbiAgICAgICAgICAjIExvb2sgZm9yIGdlbmVyaWMgY29udmVyc2lvblxyXG4gICAgICAgICAgaWYgdHJ5UmVhZChvcHRpb25zLnJlYWQsIG9wdGlvbnMucmVhZE9wdGlvbnMpXHJcbiAgICAgICAgICAgIHJldHVybiBleHRlcm5hbFZhbHVlXHJcblxyXG4gICAgICAgICAgaWYgb3B0aW9ucy50eXBlP1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSBpbnRlcm5hbCB0eXBlICN7aXNBbihpbnRlcm5hbFZhbHVlKX0gdG8gZXh0ZXJuYWwgdHlwZSAje29wdGlvbnMudHlwZX1cIilcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gaW50ZXJuYWwgdHlwZSAje2lzQW4oaW50ZXJuYWxWYWx1ZSl9XCIpXHJcbiAgICAgIClcclxuXHJcbiAgICAgIHdyaXRlOiB3cmFwV3JpdGUoXHJcbiAgICAgICAgb3B0aW9ucyxcclxuICAgICAgICB0YXJnZXQsXHJcbiAgICAgICAgd3JpdGVFcnJvcixcclxuICAgICAgICAoZXh0ZXJuYWxWYWx1ZSkgLT5cclxuICAgICAgICAgIHRyeVdyaXRlID0gKHdyaXRlLCB3cml0ZU9wdGlvbnMpIC0+XHJcbiAgICAgICAgICAgIGlmIHdyaXRlP1xyXG4gICAgICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICAgICAgaW50ZXJuYWxWYWx1ZSA9IHdyaXRlKGV4dGVybmFsVmFsdWUsIHdyaXRlT3B0aW9ucylcclxuICAgICAgICAgICAgICBjYXRjaCBleFxyXG4gICAgICAgICAgICAgICAgaWYgZXggbm90IGluc3RhbmNlb2YgVHlwZUVycm9yXHJcbiAgICAgICAgICAgICAgICAgIHRocm93IGV4XHJcblxyXG4gICAgICAgICAgICAgIGlmIG5vdCBleD9cclxuICAgICAgICAgICAgICAgIHRhcmdldChpbnRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgICAgIGlmIG5vdCBvcHRpb25zLmNoZWNrU2VsZj8gb3Igb3B0aW9ucy5jaGVja1NlbGYoZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgZXh0VHlwZU5hbWVzID0gb3B0aW9ucy50eXBlc1xyXG4gICAgICAgICAgICBpZiBleHRUeXBlTmFtZXMubGVuZ3RoID09IDBcclxuICAgICAgICAgICAgICBleHRUeXBlTmFtZXMgPSBbaXNBbihleHRlcm5hbFZhbHVlKV1cclxuXHJcbiAgICAgICAgICAgICMgTG9vayBmb3Igc3BlY2lmaWMgY29udmVyc2lvblxyXG4gICAgICAgICAgICBmb3IgZXh0VHlwZU5hbWUgaW4gZXh0VHlwZU5hbWVzXHJcbiAgICAgICAgICAgICAgZXh0VHlwZU9wdGlvbnMgPSBvcHRpb25zW2V4dFR5cGVOYW1lXSA/IHt9XHJcblxyXG4gICAgICAgICAgICAgIGlmIChleHRUeXBlT3B0aW9ucy5jaGVja1NlbGY/IGFuZCBub3QgZXh0VHlwZU9wdGlvbnMuY2hlY2tTZWxmKGV4dGVybmFsVmFsdWUpKSBvciAobm90IGV4dFR5cGVPcHRpb25zLmNoZWNrU2VsZj8gYW5kIG5vdCBpc0FuKGV4dGVybmFsVmFsdWUsIGV4dFR5cGVOYW1lKSlcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICAgICAgICAgICMgaW50ZXJuYWwgdHlwZXNcclxuICAgICAgICAgICAgICBpbnRUeXBlTmFtZXMgPSBleHRUeXBlT3B0aW9ucy50eXBlcyA/IFtdXHJcbiAgICAgICAgICAgICAgaWYgaW50VHlwZU5hbWVzLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgICAgICAgICBpZiBvcHRpb25zLmlzVHlwZWRcclxuICAgICAgICAgICAgICAgICAgIyBnbyBieSB0YXJnZXQgb3JkZXJcclxuICAgICAgICAgICAgICAgICAgaW50VHlwZU5hbWVzID0gdGFyZ2V0LnR5cGVOYW1lc1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAjIGdvIGJ5IGluZmVycmVkIG9yZGVyXHJcbiAgICAgICAgICAgICAgICAgIGludFR5cGVOYW1lcyA9IFtpc0FuKGV4dGVybmFsVmFsdWUpXVxyXG5cclxuICAgICAgICAgICAgICBmb3IgaW50VHlwZU5hbWUgaW4gaW50VHlwZU5hbWVzXHJcbiAgICAgICAgICAgICAgICBpbnRUeXBlT3B0aW9ucyA9IGV4dFR5cGVPcHRpb25zW2ludFR5cGVOYW1lXSA/IHt9XHJcblxyXG4gICAgICAgICAgICAgICAgIyB0cnkgY3VzdG9tIGNvbnZlcnNpb25cclxuICAgICAgICAgICAgICAgIGlmIGludFR5cGVPcHRpb25zLndyaXRlP1xyXG4gICAgICAgICAgICAgICAgICBpZiB0cnlXcml0ZShpbnRUeXBlT3B0aW9ucy53cml0ZSwgaW50VHlwZU9wdGlvbnMud3JpdGVPcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgIyB0cnkgbm8gY29udmVyc2lvblxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBleHRUeXBlTmFtZSA9PSBpbnRUeXBlTmFtZVxyXG4gICAgICAgICAgICAgICAgICBpZiBub3QgZXh0VHlwZU9wdGlvbnMud3JpdGU/IGFuZCBub3Qgb3B0aW9ucy53cml0ZT8gYW5kIChub3Qgb3B0aW9ucy5pc1R5cGVkIG9yIHRhcmdldC50eXBlQ2hlY2tzW2V4dFR5cGVOYW1lXShleHRlcm5hbFZhbHVlKSkgYW5kIHRyeVdyaXRlKGZuSWRlbnRpdHkpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICAjIHRyeSBkZWZhdWx0IGNvbnZlcnNpb25cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgbm90IG9wdGlvbnMuaWdub3JlRGVmYXVsdENvbnZlcnRlcnNcclxuICAgICAgICAgICAgICAgICAgaWYgdHJ5V3JpdGUoa28udHlwZWQuZ2V0Q29udmVydGVyKGV4dFR5cGVOYW1lLCBpbnRUeXBlTmFtZSksIGludFR5cGVPcHRpb25zLndyaXRlT3B0aW9ucylcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgICAgICAgICMgTG9vayBmb3Igb25lLXNpZGVkIGNvbnZlcnNpb25cclxuICAgICAgICAgICAgZm9yIGV4dFR5cGVOYW1lIGluIGV4dFR5cGVOYW1lc1xyXG4gICAgICAgICAgICAgIGV4dFR5cGVPcHRpb25zID0gb3B0aW9uc1tleHRUeXBlTmFtZV0gPyB7fVxyXG5cclxuICAgICAgICAgICAgICBpZiAoZXh0VHlwZU9wdGlvbnMuY2hlY2tTZWxmPyBhbmQgbm90IGV4dFR5cGVPcHRpb25zLmNoZWNrU2VsZihleHRlcm5hbFZhbHVlKSkgb3IgKG5vdCBleHRUeXBlT3B0aW9ucy5jaGVja1NlbGY/IGFuZCBub3QgaXNBbihleHRlcm5hbFZhbHVlLCBleHRUeXBlTmFtZSkpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAgICAgICAjIHRyeSBjdXN0b20gY29udmVyc2lvblxyXG4gICAgICAgICAgICAgIGlmIHRyeVdyaXRlKGV4dFR5cGVPcHRpb25zLndyaXRlLCBleHRUeXBlT3B0aW9ucy53cml0ZU9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgICAgICAgICMgTG9vayBmb3IgZ2VuZXJpYyBjb252ZXJzaW9uXHJcbiAgICAgICAgICAgIGlmIHRyeVdyaXRlKG9wdGlvbnMud3JpdGUsIG9wdGlvbnMud3JpdGVPcHRpb25zKVxyXG4gICAgICAgICAgICAgIHJldHVyblxyXG5cclxuICAgICAgICAgIGlmIG9wdGlvbnMuaXNUeXBlZFxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSBleHRlcm5hbCB0eXBlICN7aXNBbihleHRlcm5hbFZhbHVlKX0gdG8gaW50ZXJuYWwgdHlwZSAje3RhcmdldC50eXBlTmFtZX1cIilcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gZXh0ZXJuYWwgdHlwZSAje2lzQW4oZXh0ZXJuYWxWYWx1ZSl9XCIpXHJcbiAgICAgIClcclxuICAgIH0pXHJcblxyXG4gICAgcmVzdWx0LnR5cGVOYW1lID0gb3B0aW9ucy50eXBlXHJcbiAgICByZXN1bHQudHlwZU5hbWVzID0gb3B0aW9ucy50eXBlc1xyXG4gICAgcmVzdWx0LnR5cGVDaGVjayA9IG9wdGlvbnMuY2hlY2tcclxuICAgIHJlc3VsdC50eXBlQ2hlY2tzID0gb3B0aW9ucy5jaGVja3NcclxuXHJcbiAgICByZXN1bHQucmVhZEVycm9yID0gcmVhZEVycm9yXHJcbiAgICByZXN1bHQud3JpdGVFcnJvciA9IHdyaXRlRXJyb3JcclxuXHJcbiAgICB2YWxpZGF0ZSh0YXJnZXQsIHJlc3VsdCwgb3B0aW9ucylcclxuXHJcbiAgICBpZiBub3Qgb3B0aW9ucy5kZWZlckV2YWx1YXRpb25cclxuICAgICAgdHJ5XHJcbiAgICAgICAgcmVzdWx0LnBlZWsoKVxyXG4gICAgICBjYXRjaCBleFxyXG4gICAgICAgIHJlc3VsdC5kaXNwb3NlKClcclxuICAgICAgICB0aHJvdyBleFxyXG5cclxuICAgIHJldHVybiByZXN1bHRcclxuXHJcbiAga28uZXh0ZW5kZXJzLmNvbnZlcnQub3B0aW9ucyA9IHtcclxuICB9XHJcblxyXG5cclxuICBkbyAtPlxyXG4gICAga28udHlwZWQuX2NvbnZlcnRlcnMgPSBjb252ZXJ0ZXJzID0ge31cclxuXHJcbiAgICBrby50eXBlZC5hZGRDb252ZXJ0ZXIgPSAoZnJvbVR5cGVOYW1lLCB0b1R5cGVOYW1lLCBjb252ZXJ0ZXIsIGRlZmF1bHRPcHRpb25zLCBkZWZhdWx0T3B0aW9uKSAtPlxyXG4gICAgICBjb25zb2xlPy5hc3NlcnQ/KGlzVmFsaWRUeXBlTmFtZShmcm9tVHlwZU5hbWUpLCBcIkludmFsaWQgdHlwZU5hbWUgI3tmcm9tVHlwZU5hbWV9XCIpXHJcbiAgICAgIGNvbnNvbGU/LmFzc2VydD8oaXNWYWxpZFR5cGVOYW1lKHRvVHlwZU5hbWUpLCBcIkludmFsaWQgdHlwZU5hbWUgI3tmcm9tVHlwZU5hbWV9XCIpXHJcblxyXG4gICAgICBpZiBkZWZhdWx0T3B0aW9ucz9cclxuICAgICAgICBpZiBkZWZhdWx0T3B0aW9uP1xyXG4gICAgICAgICAgd3JhcHBlciA9ICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgICAgICAgaWYgYXJndW1lbnRzLmxlbmd0aCA9PSAyIGFuZCBub3QgaXNBbi5PYmplY3Qob3B0aW9ucylcclxuICAgICAgICAgICAgICBvID0ge31cclxuICAgICAgICAgICAgICBvW2RlZmF1bHRPcHRpb25dID0gb3B0aW9uc1xyXG4gICAgICAgICAgICAgIG9wdGlvbnMgPSBvXHJcblxyXG4gICAgICAgICAgICByZXR1cm4gY29udmVydGVyKHZhbHVlLCBrby51dGlscy5leHRlbmQoa28udXRpbHMuZXh0ZW5kKHt9LCB3cmFwcGVyLm9wdGlvbnMpLCBvcHRpb25zKSlcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICB3cmFwcGVyID0gKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICAgICAgICByZXR1cm4gY29udmVydGVyKHZhbHVlLCBrby51dGlscy5leHRlbmQoa28udXRpbHMuZXh0ZW5kKHt9LCB3cmFwcGVyLm9wdGlvbnMpLCBvcHRpb25zKSlcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHdyYXBwZXIgPSAodmFsdWUpIC0+XHJcbiAgICAgICAgICByZXR1cm4gY29udmVydGVyKHZhbHVlKVxyXG5cclxuICAgICAgd3JhcHBlci5vcHRpb25zID0gZGVmYXVsdE9wdGlvbnNcclxuXHJcbiAgICAgIGNvbnZlcnRlcnNbZnJvbVR5cGVOYW1lXSA/PSB7fVxyXG4gICAgICBjb252ZXJ0ZXJzW2Zyb21UeXBlTmFtZV1bdG9UeXBlTmFtZV0gPSB3cmFwcGVyXHJcblxyXG4gICAgICByZXR1cm4ga28udHlwZWRcclxuXHJcbiAgICBrby50eXBlZC5nZXRDb252ZXJ0ZXIgPSAoZnJvbVR5cGVOYW1lLCB0b1R5cGVOYW1lKSAtPlxyXG4gICAgICBjb252ZXJ0ZXJzW2Zyb21UeXBlTmFtZV0/W3RvVHlwZU5hbWVdXHJcblxyXG4gICAga28udHlwZWQucmVtb3ZlQ29udmVydGVyID0gKGZyb21UeXBlTmFtZSwgdG9UeXBlTmFtZSkgLT5cclxuICAgICAgaWYgY29udmVydGVyc1tmcm9tVHlwZU5hbWVdP1t0b1R5cGVOYW1lXT9cclxuICAgICAgICBkZWxldGUgY29udmVydGVyc1tmcm9tVHlwZU5hbWVdP1t0b1R5cGVOYW1lXVxyXG5cclxuICAgICAgcmV0dXJuIGtvLnR5cGVkXHJcblxyXG4gICAgcmV0dXJuXHJcblxyXG5cclxuICBkbyAtPlxyXG4gICAgIyMgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvTWF0aC9yb3VuZFxyXG4gICAgZGVjaW1hbEFkanVzdCA9ICh0eXBlLCB2YWx1ZSwgZXhwKSAtPlxyXG4gICAgICAjIGlmIGV4cCBpcyB1bmRlZmluZWQgb3IgemVyb1xyXG4gICAgICBpZiBub3QgZXhwPyBvciArZXhwID09IDBcclxuICAgICAgICByZXR1cm4gdHlwZSh2YWx1ZSlcclxuXHJcbiAgICAgIHZhbHVlID0gK3ZhbHVlXHJcbiAgICAgIGV4cCA9ICtleHBcclxuXHJcbiAgICAgICMgSWYgdGhlIHZhbHVlIGl0IG5vdCBhIG51bWJlciBvZiB0aGUgZXhwIGlzIG5vdCBhbiBpbnRlZ2VyXHJcbiAgICAgIGlmIChpc05hTih2YWx1ZSkgb3Igbm90ICh0eXBlb2YgZXhwID09ICdudW1iZXInIGFuZCBleHAgJSAxID09IDApKVxyXG4gICAgICAgIHJldHVybiBOYU5cclxuXHJcbiAgICAgICMgU2hpZnRcclxuICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpLnNwbGl0KCdlJylcclxuICAgICAgdmFsdWUgPSB0eXBlKCsodmFsdWVbMF0gKyAnZScgKyAoaWYgdmFsdWVbMV0gdGhlbiAoK3ZhbHVlWzFdIC0gZXhwKSBlbHNlIC1leHApKSlcclxuXHJcbiAgICAgICMgU2hpZnQgYmFja1xyXG4gICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCkuc3BsaXQoJ2UnKVxyXG4gICAgICByZXR1cm4gKCsodmFsdWVbMF0gKyAnZScgKyAoaWYgdmFsdWVbMV0gdGhlbiAoK3ZhbHVlWzFdICsgZXhwKSBlbHNlIGV4cCkpKVxyXG5cclxuICAgICMjIyAhcHJhZ21hIGNvdmVyYWdlLXNraXAtbmV4dCAjIyNcclxuICAgIGlmIG5vdCBNYXRoLnJvdW5kMTA/XHJcbiAgICAgIE1hdGgucm91bmQxMCA9ICh2YWx1ZSwgZXhwKSAtPlxyXG4gICAgICAgIHJldHVybiBkZWNpbWFsQWRqdXN0KE1hdGgucm91bmQsIHZhbHVlLCBleHApXHJcblxyXG4gICAgIyMjICFwcmFnbWEgY292ZXJhZ2Utc2tpcC1uZXh0ICMjI1xyXG4gICAgaWYgbm90IE1hdGguZmxvb3IxMD9cclxuICAgICAgTWF0aC5mbG9vcjEwID0gKHZhbHVlLCBleHApIC0+XHJcbiAgICAgICAgcmV0dXJuIGRlY2ltYWxBZGp1c3QoTWF0aC5mbG9vciwgdmFsdWUsIGV4cClcclxuXHJcbiAgICAjIyMgIXByYWdtYSBjb3ZlcmFnZS1za2lwLW5leHQgIyMjXHJcbiAgICBpZiBub3QgTWF0aC5jZWlsMTA/XHJcbiAgICAgIE1hdGguY2VpbDEwID0gKHZhbHVlLCBleHApIC0+XHJcbiAgICAgICAgcmV0dXJuIGRlY2ltYWxBZGp1c3QoTWF0aC5jZWlsLCB2YWx1ZSwgZXhwKVxyXG5cclxuICAgIHJldHVyblxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnQm9vbGVhbidcclxuICAgICdOdW1iZXIuSW50ZWdlcidcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgcmV0dXJuIGlmIHZhbHVlIHRoZW4gb3B0aW9ucy50cnV0aHkgZWxzZSBvcHRpb25zLmZhbHNleVxyXG4gICAge1xyXG4gICAgICB0cnV0aHk6IDFcclxuICAgICAgZmFsc2V5OiAwXHJcbiAgICB9XHJcbiAgICAndHJ1dGh5J1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ0Jvb2xlYW4nXHJcbiAgICAnTnVtYmVyJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICByZXR1cm4gaWYgdmFsdWUgdGhlbiBvcHRpb25zLnRydXRoeSBlbHNlIG9wdGlvbnMuZmFsc2V5XHJcbiAgICB7XHJcbiAgICAgIHRydXRoeTogMVxyXG4gICAgICBmYWxzZXk6IDBcclxuICAgIH1cclxuICAgICd0cnV0aHknXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnQm9vbGVhbidcclxuICAgICdTdHJpbmcnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIHZhbHVlID0gaWYgdmFsdWUgdGhlbiBvcHRpb25zLnRydXRoeSBlbHNlIG9wdGlvbnMuZmFsc2V5XHJcblxyXG4gICAgICBpZiBvcHRpb25zLnVwcGVyQ2FzZVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudG9VcHBlckNhc2UoKVxyXG5cclxuICAgICAgcmV0dXJuIHZhbHVlXHJcbiAgICB7XHJcbiAgICAgIHVwcGVyQ2FzZTogZmFsc2VcclxuICAgICAgdHJ1dGh5OiAndHJ1ZSdcclxuICAgICAgZmFsc2V5OiAnZmFsc2UnXHJcbiAgICB9XHJcbiAgICAndXBwZXJDYXNlJ1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ0RhdGUnXHJcbiAgICAnTW9tZW50J1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICAobW9tZW50ID8gcmVxdWlyZSgnbW9tZW50JykpKHZhbHVlKVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ0RhdGUnXHJcbiAgICAnU3RyaW5nJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBpc05hTih2YWx1ZS52YWx1ZU9mKCkpXHJcbiAgICAgICAgcmV0dXJuICcnXHJcblxyXG4gICAgICBtZXRob2QgPSBvcHRpb25zLmZvcm1hdHNbb3B0aW9ucy5mb3JtYXRdXHJcbiAgICAgIHJldHVybiB2YWx1ZVttZXRob2RdLmFwcGx5KHZhbHVlLCBvcHRpb25zLnBhcmFtcylcclxuXHJcbiAgICB7XHJcbiAgICAgIGZvcm1hdHM6IHtcclxuICAgICAgICBkYXRlOiAndG9EYXRlU3RyaW5nJ1xyXG4gICAgICAgIGlzbzogJ3RvSVNPU3RyaW5nJ1xyXG4gICAgICAgIGpzb246ICd0b0pTT04nXHJcbiAgICAgICAgbG9jYWxlRGF0ZTogJ3RvTG9jYWxlRGF0ZVN0cmluZydcclxuICAgICAgICBsb2NhbGVUaW1lOiAndG9Mb2NhbGVUaW1lU3RyaW5nJ1xyXG4gICAgICAgIGxvY2FsZTogJ3RvTG9jYWxlU3RyaW5nJ1xyXG4gICAgICAgIHRpbWU6ICd0b1RpbWVTdHJpbmcnXHJcbiAgICAgICAgdXRjOiAndG9VVENTdHJpbmcnXHJcbiAgICAgICAgZGVmYXVsdDogJ3RvU3RyaW5nJ1xyXG4gICAgICB9XHJcbiAgICAgIGZvcm1hdDogJ2RlZmF1bHQnXHJcbiAgICAgIHBhcmFtczogW11cclxuICAgIH1cclxuICAgICdmb3JtYXQnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnRGF0ZScsXHJcbiAgICAnVW5kZWZpbmVkJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgbm90IGlzTmFOKHZhbHVlLnZhbHVlT2YoKSlcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmFibGUgdG8gY29udmVydCBmcm9tIHZhbGlkIERhdGUgdG8gVW5kZWZpbmVkJylcclxuXHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdNb21lbnQnXHJcbiAgICAnRGF0ZSdcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgdmFsdWUudG9EYXRlKClcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdNb21lbnQnXHJcbiAgICAnU3RyaW5nJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBub3QgdmFsdWUuaXNWYWxpZCgpXHJcbiAgICAgICAgcmV0dXJuICcnXHJcblxyXG4gICAgICByZXR1cm4gdmFsdWUubG9jYWxlKG9wdGlvbnMubG9jYWxlKS5mb3JtYXQob3B0aW9ucy5mb3JtYXQpXHJcbiAgICB7XHJcbiAgICAgIGxvY2FsZTogJ2VuJ1xyXG4gICAgICBmb3JtYXQ6ICdMJ1xyXG4gICAgfVxyXG4gICAgJ2Zvcm1hdCdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdNb21lbnQnLFxyXG4gICAgJ1VuZGVmaW5lZCcsXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIHZhbHVlLmlzVmFsaWQoKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VuYWJsZSB0byBjb252ZXJ0IGZyb20gdmFsaWQgTW9tZW50IHRvIFVuZGVmaW5lZCcpXHJcblxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTnVtYmVyJ1xyXG4gICAgJ0Jvb2xlYW4nXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMuZmFsc2V5PyBhbmQgdmFsdWUgPT0gb3B0aW9ucy5mYWxzZXlcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgZWxzZSBpZiBvcHRpb25zLnRydXRoeT8gYW5kIHZhbHVlID09IG9wdGlvbnMudHJ1dGh5XHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgZWxzZSBpZiBub3Qgb3B0aW9ucy5mYWxzZXk/XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIGVsc2UgaWYgbm90IG9wdGlvbnMudHJ1dGh5P1xyXG4gICAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBCb29sZWFuXCIpXHJcbiAgICB7XHJcbiAgICAgIHRydXRoeTogdW5kZWZpbmVkXHJcbiAgICAgIGZhbHNleTogMFxyXG4gICAgfVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ051bWJlcidcclxuICAgICdOdW1iZXIuSW50ZWdlcidcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgbm90IG9wdGlvbnMubW9kZT9cclxuICAgICAgICBpZiBub3QgaXNBbi5OdW1iZXIuSW50ZWdlcih2YWx1ZSlcclxuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IGZyb20gTnVtYmVyIHRvIE51bWJlci5JbnRlZ2VyLiBOdW1iZXIgaXMgbm90IGFuIGludGVnZXInKVxyXG4gICAgICAgIHJldHVybiB2YWx1ZVxyXG4gICAgICBlbHNlIGlmIHR5cGVvZiBvcHRpb25zLm1vZGUgPT0gJ3N0cmluZydcclxuICAgICAgICBtb2RlID0gTWF0aFtvcHRpb25zLm1vZGVdXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBtb2RlID0gb3B0aW9ucy5tb2RlXHJcblxyXG4gICAgICByZXR1cm4gbW9kZSh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgbW9kZTogdW5kZWZpbmVkXHJcbiAgICB9XHJcbiAgICAnbW9kZSdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdOdW1iZXInXHJcbiAgICAnU3RyaW5nJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLmRlY2ltYWxzP1xyXG4gICAgICAgIHZhbHVlID0gTWF0aC5yb3VuZDEwKHZhbHVlLCAtb3B0aW9ucy5kZWNpbWFscylcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvRml4ZWQob3B0aW9ucy5kZWNpbWFscylcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKVxyXG5cclxuICAgICAgcmV0dXJuIHZhbHVlXHJcbiAgICB7XHJcbiAgICAgIGRlY2ltYWxzOiB1bmRlZmluZWRcclxuICAgIH1cclxuICAgICdkZWNpbWFscydcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdOdW1iZXIuSW50ZWdlcidcclxuICAgICdCb29sZWFuJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLmZhbHNleT8gYW5kIHZhbHVlID09IG9wdGlvbnMuZmFsc2V5XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIGVsc2UgaWYgb3B0aW9ucy50cnV0aHk/IGFuZCB2YWx1ZSA9PSBvcHRpb25zLnRydXRoeVxyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgIGVsc2UgaWYgbm90IG9wdGlvbnMuZmFsc2V5P1xyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICBlbHNlIGlmIG5vdCBvcHRpb25zLnRydXRoeT9cclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjb252ZXJ0IGZyb20gI3t2YWx1ZX0gdG8gQm9vbGVhblwiKVxyXG4gICAge1xyXG4gICAgICB0cnV0aHk6IHVuZGVmaW5lZFxyXG4gICAgICBmYWxzZXk6IDBcclxuICAgIH1cclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdOdW1iZXIuSW50ZWdlcidcclxuICAgICdOdW1iZXInLFxyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICByZXR1cm4gdmFsdWVcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdOdW1iZXIuSW50ZWdlcidcclxuICAgICdTdHJpbmcnLFxyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKG9wdGlvbnMuYmFzZSlcclxuICAgICAgaWYgb3B0aW9ucy51cHBlckNhc2VcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvVXBwZXJDYXNlKClcclxuXHJcbiAgICAgIHJldHVybiB2YWx1ZVxyXG4gICAge1xyXG4gICAgICBiYXNlOiAxMFxyXG4gICAgICB1cHBlckNhc2U6IGZhbHNlXHJcbiAgICB9XHJcbiAgICAnYmFzZSdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdTdHJpbmcnLFxyXG4gICAgJ0Jvb2xlYW4nLFxyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLnRyaW1cclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRyaW0oKVxyXG5cclxuICAgICAgaWYgb3B0aW9ucy5pZ25vcmVDYXNlXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50b0xvd2VyQ2FzZSgpXHJcblxyXG4gICAgICBpZiBvcHRpb25zLnN0cmljdFxyXG4gICAgICAgIGlmIHZhbHVlID09IG9wdGlvbnMudHJ1dGh5WzBdXHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIGVsc2UgaWYgdmFsdWUgPT0gb3B0aW9ucy5mYWxzZXlbMF1cclxuICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgZm9yIHRydXRoeSBpbiBvcHRpb25zLnRydXRoeVxyXG4gICAgICAgICAgaWYgdmFsdWUgPT0gdHJ1dGh5XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICAgICAgIGZvciBmYWxzZXkgaW4gb3B0aW9ucy5mYWxzZXlcclxuICAgICAgICAgIGlmIHZhbHVlID09IGZhbHNleVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY29udmVydCBmcm9tICN7dmFsdWV9IHRvIEJvb2xlYW5cIilcclxuICAgIHtcclxuICAgICAgaWdub3JlQ2FzZTogdHJ1ZVxyXG4gICAgICBzdHJpY3Q6IGZhbHNlXHJcbiAgICAgIHRydXRoeTogW1xyXG4gICAgICAgICd0cnVlJ1xyXG4gICAgICAgICd0J1xyXG4gICAgICAgICcxJ1xyXG4gICAgICAgICctMSdcclxuICAgICAgICAneWVzJ1xyXG4gICAgICAgICd5J1xyXG4gICAgICBdXHJcbiAgICAgIGZhbHNleTogW1xyXG4gICAgICAgICdmYWxzZSdcclxuICAgICAgICAnZidcclxuICAgICAgICAnMCdcclxuICAgICAgICAnbm8nXHJcbiAgICAgICAgJ24nXHJcbiAgICAgIF1cclxuICAgICAgdHJpbTogZmFsc2VcclxuICAgIH1cclxuICAgICdzdHJpY3QnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnU3RyaW5nJ1xyXG4gICAgJ0RhdGUnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMudHJpbVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudHJpbSgpXHJcblxyXG4gICAgICBpZiBvcHRpb25zLnN0cmljdFxyXG4gICAgICAgIG1hdGNoID0gdmFsdWUubWF0Y2gob3B0aW9ucy5mb3JtYXQpXHJcbiAgICAgICAgaWYgbm90IG1hdGNoP1xyXG4gICAgICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmFibGUgdG8gY29udmVydCBmcm9tIFN0cmluZyB0byBEYXRlJylcclxuXHJcbiAgICAgICAgbnVtID0gKHZhbHVlLCBkZWYpIC0+XHJcbiAgICAgICAgICBpZiAodmFsdWU/IGFuZCB2YWx1ZSAhPSAnJykgdGhlbiBwYXJzZUZsb2F0KHZhbHVlKSBlbHNlIGRlZlxyXG5cclxuICAgICAgICB0eiA9IHVuZGVmaW5lZFxyXG4gICAgICAgIGlmIG1hdGNoWzddPyBhbmQgbWF0Y2hbN10gIT0gJydcclxuICAgICAgICAgIHR6ID0gKG51bShtYXRjaFtvcHRpb25zLmZvcm1hdERpY3QudHpIb3Vyc10pICogNjAgKyBudW0obWF0Y2hbb3B0aW9ucy5mb3JtYXREaWN0LnR6TWludXRlc10pKSAqIDYwICogMTAwMFxyXG4gICAgICAgICAgaWYgbWF0Y2hbb3B0aW9ucy5mb3JtYXREaWN0LnR6U2lnbl0gPT0gJy0nXHJcbiAgICAgICAgICAgIHR6ICo9IC0xXHJcblxyXG4gICAgICAgIGlmIG9wdGlvbnMudXRjIG9yIHR6P1xyXG4gICAgICAgICAgdGltZSA9IERhdGUuVVRDKFxyXG4gICAgICAgICAgICBudW0obWF0Y2hbb3B0aW9ucy5mb3JtYXREaWN0LnllYXJdLCAwKVxyXG4gICAgICAgICAgICBudW0obWF0Y2hbb3B0aW9ucy5mb3JtYXREaWN0Lm1vbnRoXSwgMSkgLSAxXHJcbiAgICAgICAgICAgIG51bShtYXRjaFtvcHRpb25zLmZvcm1hdERpY3QuZGF5XSwgMSlcclxuICAgICAgICAgICAgbnVtKG1hdGNoW29wdGlvbnMuZm9ybWF0RGljdC5ob3Vyc10sIDApXHJcbiAgICAgICAgICAgIG51bShtYXRjaFtvcHRpb25zLmZvcm1hdERpY3QubWludXRlc10sIDApXHJcbiAgICAgICAgICAgIG51bShtYXRjaFtvcHRpb25zLmZvcm1hdERpY3Quc2Vjb25kc10sIDApXHJcbiAgICAgICAgICApXHJcblxyXG4gICAgICAgICAgaWYgdHo/XHJcbiAgICAgICAgICAgIHRpbWUgKz0gdHpcclxuXHJcbiAgICAgICAgICBkYXRlID0gbmV3IERhdGUodGltZSlcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBkYXRlID0gbmV3IERhdGUoXHJcbiAgICAgICAgICAgIG51bShtYXRjaFtvcHRpb25zLmZvcm1hdERpY3QueWVhcl0sIDApXHJcbiAgICAgICAgICAgIG51bShtYXRjaFtvcHRpb25zLmZvcm1hdERpY3QubW9udGhdLCAxKSAtIDFcclxuICAgICAgICAgICAgbnVtKG1hdGNoW29wdGlvbnMuZm9ybWF0RGljdC5kYXldLCAxKVxyXG4gICAgICAgICAgICBudW0obWF0Y2hbb3B0aW9ucy5mb3JtYXREaWN0LmhvdXJzXSwgMClcclxuICAgICAgICAgICAgbnVtKG1hdGNoW29wdGlvbnMuZm9ybWF0RGljdC5taW51dGVzXSwgMClcclxuICAgICAgICAgICAgbnVtKG1hdGNoW29wdGlvbnMuZm9ybWF0RGljdC5zZWNvbmRzXSwgMClcclxuICAgICAgICAgIClcclxuXHJcbiAgICAgICAgICBkYXRlLnNldFRpbWUoZGF0ZS5nZXRUaW1lKCkgLSBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCkgKiA2MCAqIDEwMDApXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBkYXRlID0gbmV3IERhdGUodmFsdWUpXHJcblxyXG4gICAgICBpZiBpc05hTihkYXRlLnZhbHVlT2YoKSlcclxuICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuYWJsZSB0byBjb252ZXJ0IGZyb20gU3RyaW5nIHRvIERhdGUnKVxyXG5cclxuICAgICAgcmV0dXJuIGRhdGVcclxuICAgIHtcclxuICAgICAgIyBodHRwczovL3d3dy5kZWJ1Z2dleC5jb20vci9GbkRmOTBocW5HdWwxWll1LzBcclxuICAgICAgZm9ybWF0OiAvXihbMC05XXs0fSktKFswLTldezJ9KS0oWzAtOV17Mn0pKD86KD86VHxcXHMpKFswLTldezJ9KTooWzAtOV17Mn0pKD86OihbMC05XXsyfSg/Oi5bMC05XSspPykpPyg/OihcXCt8XFwtKShbMC05XXsyfSk6KFswLTldezJ9KSk/KT8kL1xyXG4gICAgICBmb3JtYXREaWN0OiB7XHJcbiAgICAgICAgeWVhcjogMVxyXG4gICAgICAgIG1vbnRoOiAyXHJcbiAgICAgICAgZGF5OiAzXHJcbiAgICAgICAgaG91cnM6IDRcclxuICAgICAgICBtaW51dGVzOiA1XHJcbiAgICAgICAgc2Vjb25kczogNlxyXG4gICAgICAgIHR6U2lnbjogN1xyXG4gICAgICAgIHR6SG91cnM6IDhcclxuICAgICAgICB0ek1pbnV0ZXM6IDlcclxuICAgICAgfVxyXG4gICAgICB1dGM6IGZhbHNlXHJcbiAgICAgIHN0cmljdDogdHJ1ZVxyXG4gICAgICB0cmltOiBmYWxzZVxyXG4gICAgfVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1N0cmluZydcclxuICAgICdNb21lbnQnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMudHJpbVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudHJpbSgpXHJcblxyXG4gICAgICByZXN1bHQgPSAobW9tZW50ID8gcmVxdWlyZSgnbW9tZW50JykpKHZhbHVlLCBvcHRpb25zLmZvcm1hdCwgb3B0aW9ucy5sYW5ndWFnZSwgb3B0aW9ucy5zdHJpY3QpXHJcbiAgICAgIGlmIG5vdCByZXN1bHQuaXNWYWxpZCgpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSBTdHJpbmcgdG8gTW9tZW50JylcclxuXHJcbiAgICAgIHJldHVybiByZXN1bHRcclxuICAgIHtcclxuICAgICAgc3RyaWN0OiBmYWxzZVxyXG4gICAgICBsYW5ndWFnZTogJ2VuJ1xyXG4gICAgICBmb3JtYXQ6ICdMJ1xyXG4gICAgICB0cmltOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgJ2Zvcm1hdCdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdTdHJpbmcnLFxyXG4gICAgJ051bWJlci5JbnRlZ2VyJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy50cmltXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50cmltKClcclxuXHJcbiAgICAgIGlmIG9wdGlvbnMuYmFzZSA9PSAxMCBhbmQgbm90IG9wdGlvbnMuc3RyaWN0XHJcbiAgICAgICAgdHJ5XHJcbiAgICAgICAgICByZXR1cm4ga28udHlwZWQuZ2V0Q29udmVydGVyKCdTdHJpbmcnLCAnTnVtYmVyJykodmFsdWUsIDApXHJcbiAgICAgICAgY2F0Y2ggZXhcclxuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tICN7dmFsdWV9IHRvIE51bWJlci5JbnRlZ2VyXCIpXHJcblxyXG4gICAgICBjaGFycyA9ICcwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXonXHJcbiAgICAgIGlmIG5vdCBSZWdFeHAoXCJeKFxcXFwtfFxcXFwrKT9bI3tjaGFycy5zbGljZSgwLCBvcHRpb25zLmJhc2UgPyAxMCl9XSskXCIsIGlmIG5vdCBvcHRpb25zLnN0cmljdCB0aGVuICdpJykudGVzdCh2YWx1ZSlcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBOdW1iZXIuSW50ZWdlclwiKVxyXG5cclxuICAgICAgcmV0dXJuIHBhcnNlSW50KHZhbHVlLCBvcHRpb25zLmJhc2UpXHJcbiAgICB7XHJcbiAgICAgIGJhc2U6IDEwXHJcbiAgICAgIHN0cmljdDogZmFsc2VcclxuICAgICAgdHJpbTogZmFsc2VcclxuICAgIH1cclxuICAgICdiYXNlJ1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1N0cmluZydcclxuICAgICdOdW1iZXInXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMudHJpbVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudHJpbSgpXHJcblxyXG4gICAgICBpZiBub3QgL14oXFwrfFxcLSk/WzAtOV0rKFxcLj8pWzAtOV0qJC8udGVzdCh2YWx1ZSlcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBOdW1iZXJcIilcclxuXHJcbiAgICAgIHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSwgb3B0aW9ucy5iYXNlKVxyXG5cclxuICAgICAgaWYgb3B0aW9ucy5kZWNpbWFscz9cclxuICAgICAgICB2YWx1ZSA9IE1hdGgucm91bmQxMCh2YWx1ZSwgLW9wdGlvbnMuZGVjaW1hbHMpXHJcblxyXG4gICAgICByZXR1cm4gdmFsdWVcclxuICAgIHtcclxuICAgICAgZGVjaW1hbHM6IHVuZGVmaW5lZFxyXG4gICAgICB0cmltOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgJ2RlY2ltYWxzJ1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1N0cmluZycsXHJcbiAgICAnVW5kZWZpbmVkJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy50cmltXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50cmltKClcclxuXHJcbiAgICAgIGlmIHZhbHVlLmxlbmd0aCAhPSAwXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gI3t2YWx1ZX0gdG8gVW5kZWZpbmVkXCIpXHJcblxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXHJcbiAgICB7XHJcbiAgICAgIHRyaW06IGZhbHNlXHJcbiAgICB9XHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnVW5kZWZpbmVkJyxcclxuICAgICdEYXRlJyxcclxuICAgICh2YWx1ZSkgLT5cclxuICAgICAgcmV0dXJuIG5ldyBEYXRlKE5hTilcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdVbmRlZmluZWQnLFxyXG4gICAgJ01vbWVudCcsXHJcbiAgICAodmFsdWUpIC0+XHJcbiAgICAgIHJldHVybiByZXF1aXJlKCdtb21lbnQnKS5pbnZhbGlkKClcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdVbmRlZmluZWQnLFxyXG4gICAgJ1N0cmluZycsXHJcbiAgICAodmFsdWUpIC0+XHJcbiAgICAgIHJldHVybiAnJ1xyXG4gIClcclxuXHJcbiAgcmV0dXJuIGtvXHJcblxyXG5hcHBseUtvdHIoa28pXHJcbiJdfQ==
