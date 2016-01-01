;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['is-an'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('is-an'));
  } else {
    root.applyKotr = factory(root.isAn);
  }
}(this, function(isAn) {
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

//# sourceMappingURL=data:application/json;base64,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QUg7TUFDRSxLQUFBLEdBQVEsSUFBSSxDQUFDLE9BQUwsQ0FBYSxLQUFiLEVBQW9CLENBQUMsT0FBTyxDQUFDLFFBQTdCLEVBRFY7O0FBR0EsV0FBTztFQVpULENBSEYsRUFnQkU7SUFDRSxRQUFBLEVBQVUsTUFEWjtJQUVFLElBQUEsRUFBTSxLQUZSO0dBaEJGLEVBb0JFLFVBcEJGO0VBdUJBLEVBQUUsQ0FBQyxLQUFLLENBQUMsWUFBVCxDQUNFLFFBREYsRUFFRSxXQUZGLEVBR0UsU0FBQyxLQUFELEVBQVEsT0FBUjtJQUNFLElBQUcsT0FBTyxDQUFDLElBQVg7TUFDRSxLQUFBLEdBQVEsS0FBSyxDQUFDLElBQU4sQ0FBQSxFQURWOztJQUdBLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBbkI7QUFDRSxZQUFVLElBQUEsU0FBQSxDQUFVLHlCQUFBLEdBQTBCLEtBQTFCLEdBQWdDLGVBQTFDLEVBRFo7O0FBR0EsV0FBTztFQVBULENBSEYsRUFXRTtJQUNFLElBQUEsRUFBTSxLQURSO0dBWEY7RUFnQkEsRUFBRSxDQUFDLEtBQUssQ0FBQyxZQUFULENBQ0UsV0FERixFQUVFLE1BRkYsRUFHRSxTQUFDLEtBQUQ7QUFDRSxXQUFXLElBQUEsSUFBQSxDQUFLLEdBQUw7RUFEYixDQUhGO0VBT0EsRUFBRSxDQUFDLEtBQUssQ0FBQyxZQUFULENBQ0UsV0FERixFQUVFLFFBRkYsRUFHRSxTQUFDLEtBQUQ7QUFDRSxXQUFPLE9BQUEsQ0FBUSxRQUFSLENBQWlCLENBQUMsT0FBbEIsQ0FBQTtFQURULENBSEY7RUFPQSxFQUFFLENBQUMsS0FBSyxDQUFDLFlBQVQsQ0FDRSxXQURGLEVBRUUsUUFGRixFQUdFLFNBQUMsS0FBRDtBQUNFLFdBQU87RUFEVCxDQUhGO0FBT0EsU0FBTztBQXJtQ0ciLCJmaWxlIjoia28tdHlwZWQuYXBwbHkudW1kLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiYXBwbHlLb3RyID0gKGtvKSAtPlxyXG4gIGtvLnR5cGVkID0ge31cclxuXHJcbiAgZm5UcnVlID0gKCkgLT4gdHJ1ZVxyXG4gIGZuRmFsc2UgPSAoKSAtPiBmYWxzZVxyXG4gIGZuSWRlbnRpdHkgPSAoeCkgLT4geFxyXG5cclxuICB0eXBlTmFtZVRvU3RyaW5nID0gKHZhbHVlKSAtPlxyXG4gICAgaWYgbm90IHZhbHVlPyBvciB2YWx1ZS5sZW5ndGggPT0gMFxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXHJcbiAgICBlbHNlIGlmIGlzQW4uU3RyaW5nLkxpdGVyYWwodmFsdWUpXHJcbiAgICAgIHJldHVybiB2YWx1ZVxyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm4gdmFsdWUuam9pbignfCcpXHJcblxyXG4gIHR5cGVOYW1lVG9BcnJheSA9ICh2YWx1ZSkgLT5cclxuICAgIHZhbHVlID0gdHlwZU5hbWVUb1N0cmluZyh2YWx1ZSlcclxuICAgIGlmIGlzQW4uU3RyaW5nLkxpdGVyYWwodmFsdWUpXHJcbiAgICAgIHJldHVybiB2YWx1ZS5zcGxpdCgnfCcpXHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVybiBbXVxyXG5cclxuICB0eXBlTmFtZVRvRGlzdGluY3RBcnJheSA9ICh2YWx1ZSkgLT5cclxuICAgIHZhbHVlID0gdHlwZU5hbWVUb0FycmF5KHZhbHVlKVxyXG5cclxuICAgIHJlc3VsdCA9IFtdXHJcbiAgICBmb3IgdHlwZU5hbWUgaW4gdmFsdWVcclxuICAgICAgaWYgcmVzdWx0LmluZGV4T2YodHlwZU5hbWUpID09IC0xXHJcbiAgICAgICAgcmVzdWx0LnB1c2godHlwZU5hbWUpXHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG5cclxuICBpc1ZhbGlkVHlwZU5hbWUgPSAodmFsdWUpIC0+XHJcbiAgICByZXR1cm4gL15bQS1aXS8udGVzdCh2YWx1ZSlcclxuXHJcbiAgaXNUeXBlZCA9ICh2YWx1ZSkgLT5cclxuICAgIHJldHVybiBpc0FuLkZ1bmN0aW9uKHZhbHVlKSBhbmQgdmFsdWUudHlwZU5hbWU/IGFuZCB2YWx1ZS50eXBlTmFtZXM/IGFuZCB2YWx1ZS50eXBlQ2hlY2s/IGFuZCB2YWx1ZS50eXBlQ2hlY2tzP1xyXG5cclxuICBrby50eXBlZC5vcHRpb25zID0ge1xyXG4gICAgIyB2YWxpZGF0aW9uIG9wdGlvbnNcclxuICAgIHZhbGlkYXRpb246IHtcclxuICAgICAgIyB0dXJuIHZhbGlkYXRpb24gb24vb2ZmXHJcbiAgICAgIGVuYWJsZTogZmFsc2VcclxuXHJcbiAgICAgICMgdmFsaWRhdGUgb24gcmVhZFxyXG4gICAgICByZWFkOiB0cnVlXHJcblxyXG4gICAgICAjIHZhbGlkYXRlIG9uIHdyaXRlXHJcbiAgICAgIHdyaXRlOiB0cnVlXHJcblxyXG4gICAgICAjIHZhbGlkYXRlIHRoZSB1bmRlcmx5aW5nIG9ic2VydmFibGVcclxuICAgICAgdGFyZ2V0OiBmYWxzZVxyXG5cclxuICAgICAgIyB2YWxpZGF0ZSB0aGUgcmVzdWx0aW5nIG9ic2VydmFibGVcclxuICAgICAgcmVzdWx0OiB0cnVlXHJcblxyXG4gICAgICAjIHRoZSBtZXNzYWdlIHRvIHVzZSAoZGVmYXVsdHMgdG8gdGhlIG1lc3NhZ2UgZnJvbSB0aGUgdGhyb3duIGV4Y2VwdGlvbilcclxuICAgICAgbWVzc2FnZTogdW5kZWZpbmVkXHJcbiAgICB9XHJcblxyXG4gICAgZXhSZWFkOiB7XHJcbiAgICAgICMgQ2F0Y2ggZXhjZXB0aW9ucy4gTWF5IGFsc28gYmUgYSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIGV4Y2VwdGlvbiBzaG91bGQgYmUgY2F1Z2h0XHJcbiAgICAgIGNhdGNoOiB0cnVlXHJcblxyXG4gICAgICAjIGRlZmF1bHQgY2F0Y2ggZnVuY3Rpb24gdG8gdXNlIHdoZW4gY2F0Y2ggaXMgdHJ1ZS9mYWxzZVxyXG4gICAgICBjYXRjaFRydWU6IChleCkgLT4gZXggaW5zdGFuY2VvZiBUeXBlRXJyb3JcclxuICAgICAgY2F0Y2hGYWxzZTogZm5GYWxzZVxyXG5cclxuICAgICAgIyBEbyBub3QgdGhyb3cgZXhjZXB0aW9ucyB3aGVuIHJlYWRpbmcuIFVzZSBkZWZhdWx0IHZhbHVlL2Z1bmMgaW5zdGVhZFxyXG4gICAgICB1c2VEZWZhdWx0OiBmYWxzZVxyXG5cclxuICAgICAgIyBEZWZhdWx0IHZhbHVlIHRvIHVzZSB3aGVuIGFuIGV4Y2VwdGlvbiBpcyBjYXVnaHRcclxuICAgICAgZGVmYXVsdFZhbHVlOiB1bmRlZmluZWRcclxuXHJcbiAgICAgICMgQ29tcHV0ZSBhIGRlZmF1bHQgdmFsdWUgd2hlbiBhbiBleGNlcHRpb24gaXMgY2F1Z2h0LiBPdmVycmlkZXMgZGVmYXVsdFZhbHVlXHJcbiAgICAgIGRlZmF1bHRGdW5jOiB1bmRlZmluZWRcclxuICAgIH1cclxuICAgIGV4V3JpdGU6IHtcclxuICAgICAgIyBDYXRjaCBleGNlcHRpb25zLiBNYXkgYWxzbyBiZSBhIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gZXhjZXB0aW9uIHNob3VsZCBiZSBjYXVnaHRcclxuICAgICAgY2F0Y2g6IHRydWVcclxuXHJcbiAgICAgICMgZGVmYXVsdCBjYXRjaCBmdW5jdGlvbiB0byB1c2Ugd2hlbiBjYXRjaCBpcyB0cnVlL2ZhbHNlXHJcbiAgICAgIGNhdGNoVHJ1ZTogKGV4KSAtPiBleCBpbnN0YW5jZW9mIFR5cGVFcnJvclxyXG4gICAgICBjYXRjaEZhbHNlOiBmbkZhbHNlXHJcblxyXG4gICAgICAjIERvIG5vdCB0aHJvdyBleGNlcHRpb25zIHdoZW4gd3JpdGluZ1xyXG4gICAgICBub1Rocm93OiBmYWxzZVxyXG5cclxuICAgICAgIyBEbyBub3QgbGVhdmUgdGFyZ2V0IHVuc2V0LiBTZXQgdGhlIHRhcmdldCB0byB0aGlzIHZhbHVlIG9uIGVycm9yXHJcbiAgICAgIHVzZURlZmF1bHQ6IGZhbHNlXHJcblxyXG4gICAgICAjIERlZmF1bHQgdmFsdWUgdG8gdXNlIHdoZW4gYW4gZXhjZXB0aW9uIGlzIGNhdWdodFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IHVuZGVmaW5lZFxyXG5cclxuICAgICAgIyBDb21wdXRlIGEgZGVmYXVsdCB2YWx1ZSB3aGVuIGFuIGV4Y2VwdGlvbiBpcyBjYXVnaHQuIE92ZXJyaWRlcyBkZWZhdWx0VmFsdWVcclxuICAgICAgZGVmYXVsdEZ1bmM6IHVuZGVmaW5lZFxyXG4gICAgfVxyXG5cclxuICAgICMgdXNlIHB1cmUgY29tcHV0ZWQgb2JzZXJ2YWJsZXNcclxuICAgIHB1cmU6IHRydWVcclxuXHJcbiAgICAjIGRvIG5vdCBhdHRlbXB0IHRvIHJlYWQgdGhlIHZhbHVlIGltbWVkaWF0ZWx5XHJcbiAgICBkZWZlckV2YWx1YXRpb246IHRydWVcclxuICB9XHJcblxyXG4gIGV4dGVuZCA9IChyb290LCBvYmplY3RzLi4uKSAtPlxyXG4gICAgZm9yIG9iamVjdCBpbiBvYmplY3RzXHJcbiAgICAgIHJvb3QgPSBrby51dGlscy5leHRlbmQocm9vdCwgb2JqZWN0KVxyXG4gICAgcmV0dXJuIHJvb3RcclxuXHJcbiAgbm9ybWFsaXplRXggPSAobmFtZSwgcm9vdCwgb2JqZWN0cy4uLikgLT5cclxuICAgIHJvb3RbbmFtZV0gPSBvcHQgPSBleHRlbmQoe30sIChvYmplY3Q/W25hbWVdIGZvciBvd24ga2V5LCBvYmplY3Qgb2Ygb2JqZWN0cykuLi4pXHJcblxyXG4gICAgIyBmb3JjZSBjYXRjaCB0byBiZSBhIGZ1bmN0aW9uXHJcbiAgICBpZiBvcHQuY2F0Y2ggPT0gdHJ1ZVxyXG4gICAgICBvcHQuY2F0Y2ggPSBvcHQuY2F0Y2hUcnVlXHJcbiAgICBlbHNlIGlmIG9wdC5jYXRjaCA9PSBmYWxzZVxyXG4gICAgICBvcHQuY2F0Y2ggPSBvcHQuY2F0Y2hGYWxzZVxyXG5cclxuICAgICMgZm9yY2UgZGVmYXVsdEZ1bmNcclxuICAgIGlmIG9wdC51c2VEZWZhdWx0IGFuZCBub3Qgb3B0LmRlZmF1bHRGdW5jP1xyXG4gICAgICBvcHQuZGVmYXVsdEZ1bmMgPSAoKSAtPiBvcHQuZGVmYXVsdFZhbHVlXHJcblxyXG4gICAgcmV0dXJuIG9wdFxyXG5cclxuICBub3JtYWxpemVFeFJlYWQgPSAocm9vdCwgb2JqZWN0cy4uLikgLT5cclxuICAgIG5vcm1hbGl6ZUV4KCdleFJlYWQnLCByb290LCBvYmplY3RzLi4uKVxyXG5cclxuICBub3JtYWxpemVFeFdyaXRlID0gKHJvb3QsIG9iamVjdHMuLi4pIC0+XHJcbiAgICBub3JtYWxpemVFeCgnZXhXcml0ZScsIHJvb3QsIG9iamVjdHMuLi4pXHJcblxyXG4gIG5vcm1hbGl6ZVZhbGlkYXRpb24gPSAocm9vdCwgb2JqZWN0cy4uLikgLT5cclxuICAgIG5vcm0gPSAodikgLT5cclxuICAgICAgaWYgdiA9PSB0cnVlXHJcbiAgICAgICAgcmV0dXJuIHsgZW5hYmxlOiB0cnVlIH1cclxuICAgICAgZWxzZSBpZiB2ID09IGZhbHNlXHJcbiAgICAgICAgcmV0dXJuIHsgZW5hYmxlOiBmYWxzZSB9XHJcbiAgICAgIGVsc2VcclxuICAgICAgICByZXR1cm4gdlxyXG5cclxuICAgIHJvb3RbJ3ZhbGlkYXRpb24nXSA9IG9wdCA9IGV4dGVuZCh7fSwgKG5vcm0ob2JqZWN0P1sndmFsaWRhdGlvbiddKSBmb3Igb3duIGtleSwgb2JqZWN0IG9mIG9iamVjdHMpLi4uKVxyXG5cclxuICAgIHJldHVybiBvcHRcclxuXHJcbiAgd3JhcFJlYWQgPSAob3B0aW9ucywgdGFyZ2V0LCByZWFkRXJyb3IsIHJlYWQpIC0+XHJcbiAgICByZXR1cm4gKCkgLT5cclxuICAgICAgdHJ5XHJcbiAgICAgICAgcmV0dXJuIHJlYWQoKVxyXG4gICAgICBjYXRjaCBleFxyXG4gICAgICAgIGlmIG9wdGlvbnMuZXhSZWFkLmNhdGNoKGV4KVxyXG4gICAgICAgICAgcmVhZEVycm9yKGV4KVxyXG5cclxuICAgICAgICAgIGlmIG9wdGlvbnMuZXhSZWFkLnVzZURlZmF1bHRcclxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZXhSZWFkLmRlZmF1bHRGdW5jKClcclxuXHJcbiAgICAgICAgdGhyb3cgZXhcclxuICAgICAgZmluYWxseVxyXG4gICAgICAgIGlmIG5vdCBleD9cclxuICAgICAgICAgIHJlYWRFcnJvcih1bmRlZmluZWQpXHJcblxyXG4gIHdyYXBXcml0ZSA9IChvcHRpb25zLCB0YXJnZXQsIHdyaXRlRXJyb3IsIHdyaXRlKSAtPlxyXG4gICAgcmV0dXJuICh2YWx1ZSkgLT5cclxuICAgICAgdHJ5XHJcbiAgICAgICAgd3JpdGUodmFsdWUpXHJcbiAgICAgIGNhdGNoIGV4XHJcbiAgICAgICAgaWYgb3B0aW9ucy5leFdyaXRlLmNhdGNoKGV4KVxyXG4gICAgICAgICAgd3JpdGVFcnJvcihleClcclxuXHJcbiAgICAgICAgICBpZiBvcHRpb25zLmV4V3JpdGUudXNlRGVmYXVsdFxyXG4gICAgICAgICAgICB0YXJnZXQob3B0aW9ucy5leFdyaXRlLmRlZmF1bHRGdW5jKCkpXHJcblxyXG4gICAgICAgIGlmIG5vdCBvcHRpb25zLmV4V3JpdGUubm9UaHJvd1xyXG4gICAgICAgICAgdGhyb3cgZXhcclxuICAgICAgZmluYWxseVxyXG4gICAgICAgIGlmIG5vdCBleD9cclxuICAgICAgICAgIHdyaXRlRXJyb3IodW5kZWZpbmVkKVxyXG5cclxuICB2YWxpZGF0ZSA9ICh0YXJnZXQsIHJlc3VsdCwgb3B0aW9ucykgLT5cclxuICAgIGlmIG5vdCBvcHRpb25zLnZhbGlkYXRpb24uZW5hYmxlXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIHZhbGlkYXRpb24gPSBvcHRpb25zLnZhbGlkYXRpb25cclxuXHJcbiAgICBpZiAobm90IHZhbGlkYXRpb24udGFyZ2V0IGFuZCBub3QgdmFsaWRhdGlvbi5yZXN1bHQpIG9yIChub3QgdmFsaWRhdGlvbi5yZWFkIGFuZCBub3QgdmFsaWRhdGlvbi53cml0ZSlcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgaWYga28udmFsaWRhdGlvbj9cclxuICAgICAgIyMjXHJcbiAgICAgIE5vdGUgdGhhdCB1c2luZyBrbyB2YWxpZGF0aW9uIHdpbGwgZm9yY2UgYW4gaW1tZWRpYXRlIGV2YWx1YXRpb24gb2YgdGhlIHRhcmdldHRlZCBvYnNlcnZhYmxlc1xyXG4gICAgICAjIyNcclxuICAgICAgaWYgb3B0aW9ucy52YWxpZGF0aW9uLnJlYWQgYW5kIG9wdGlvbnMudmFsaWRhdGlvbi53cml0ZVxyXG4gICAgICAgIG1lc3NhZ2UgPSAoKSAtPiByZXN1bHQud3JpdGVFcnJvcigpPy5tZXNzYWdlID8gcmVzdWx0LnJlYWRFcnJvcigpPy5tZXNzYWdlXHJcbiAgICAgIGVsc2UgaWYgb3B0aW9ucy52YWxpZGF0aW9uLnJlYWRcclxuICAgICAgICBtZXNzYWdlID0gKCkgLT4gcmVzdWx0LnJlYWRFcnJvcigpPy5tZXNzYWdlXHJcbiAgICAgIGVsc2UgI2lmIG9wdGlvbnMudmFsaWRhdGlvbi53cml0ZVxyXG4gICAgICAgIG1lc3NhZ2UgPSAoKSAtPiByZXN1bHQud3JpdGVFcnJvcigpPy5tZXNzYWdlXHJcblxyXG4gICAgICBhcHBseVZhbGlkYXRpb24gPSAoYmFzZSkgLT5cclxuICAgICAgICBiYXNlLmV4dGVuZCh7IHZhbGlkYXRhYmxlOiB7IGVuYWJsZTogdHJ1ZSB9IH0pXHJcblxyXG4gICAgICAgIHJ1bGUgPSB7XHJcbiAgICAgICAgICBtZXNzYWdlOiB1bmRlZmluZWRcclxuICAgICAgICAgIHZhbGlkYXRvcjogKCkgLT5cclxuICAgICAgICAgICAgbSA9IG1lc3NhZ2UoKVxyXG4gICAgICAgICAgICBpZiBub3QgbT9cclxuICAgICAgICAgICAgICBydWxlLm1lc3NhZ2UgPSB1bmRlZmluZWRcclxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgcnVsZS5tZXNzYWdlID0gdmFsaWRhdGlvbi5tZXNzYWdlID8gbVxyXG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAga28udmFsaWRhdGlvbi5hZGRBbm9ueW1vdXNSdWxlKGJhc2UsIHJ1bGUpXHJcblxyXG4gICAgICAgIHJldHVyblxyXG5cclxuICAgICAgaWYgdmFsaWRhdGlvbi50YXJnZXRcclxuICAgICAgICBhcHBseVZhbGlkYXRpb24odGFyZ2V0KVxyXG5cclxuICAgICAgaWYgdmFsaWRhdGlvbi5yZXN1bHRcclxuICAgICAgICBhcHBseVZhbGlkYXRpb24ocmVzdWx0KVxyXG5cclxuICAgIHJldHVyblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG4gIGtvLmV4dGVuZGVycy50eXBlID0gKHRhcmdldCwgb3B0aW9ucykgLT5cclxuICAgICMgUmVxdWlyZXNcclxuICAgICMgdHlwZU5hbWUgOiBTdHJpbmdcclxuICAgICMgdHlwZU5hbWVzIDogQXJyYXkgb2YgU3RyaW5nXHJcbiAgICAjIHR5cGVDaGVjayA6IGZ1bmN0aW9uICh2YWx1ZSkgeyAuLi4gfVxyXG4gICAgIyB0eXBlQ2hlY2tzIDogeyB0eXBlTmFtZTogZnVuY3Rpb24gaXNUeXBlKHZhbHVlKSB7IC4uLiB9LCAuLi4gfVxyXG5cclxuICAgIGlmIGlzQW4uU3RyaW5nLkxpdGVyYWwob3B0aW9ucykgb3IgaXNBbi5BcnJheShvcHRpb25zKVxyXG4gICAgICAjIC5leHRlbmQoeyB0eXBlOiAnVHlwZU5hbWV8VHlwZU5hbWV8VHlwZU5hbWUnIH0pXHJcbiAgICAgICMgLmV4dGVuZCh7IHR5cGU6IFsnVHlwZU5hbWUnLCdUeXBlTmFtZScsLi4uXSB9KVxyXG4gICAgICBvcHRpb25zID0geyB0eXBlOiBvcHRpb25zIH1cclxuICAgIGVsc2UgaWYgaXNBbi5GdW5jdGlvbihvcHRpb25zKVxyXG4gICAgICAjIC5leHRlbmQoeyB0eXBlOiBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIHRydWV8ZmFsc2U7IH0gfSlcclxuICAgICAgb3B0aW9ucyA9IHtcclxuICAgICAgICB0eXBlOiBvcHRpb25zLnR5cGVOYW1lXHJcbiAgICAgICAgY2hlY2s6IG9wdGlvbnNcclxuICAgICAgfVxyXG5cclxuICAgIG5vcm1hbCA9IGV4dGVuZCh7fSwga28udHlwZWQub3B0aW9ucywga28uZXh0ZW5kZXJzLnR5cGUub3B0aW9ucywgb3B0aW9ucylcclxuICAgIG5vcm1hbGl6ZUV4UmVhZChub3JtYWwsIGtvLnR5cGVkLm9wdGlvbnMsIGtvLmV4dGVuZGVycy50eXBlLm9wdGlvbnMsIG9wdGlvbnMpXHJcbiAgICBub3JtYWxpemVFeFdyaXRlKG5vcm1hbCwga28udHlwZWQub3B0aW9ucywga28uZXh0ZW5kZXJzLnR5cGUub3B0aW9ucywgb3B0aW9ucylcclxuICAgIG5vcm1hbGl6ZVZhbGlkYXRpb24obm9ybWFsLCBrby50eXBlZC5vcHRpb25zLCBrby5leHRlbmRlcnMudHlwZS5vcHRpb25zLCBvcHRpb25zKVxyXG4gICAgb3B0aW9ucyA9IG5vcm1hbFxyXG5cclxuICAgICMgR2F0aGVyIHR5cGUgbmFtZXNcclxuICAgIHR5cGVOYW1lcyA9IHR5cGVOYW1lVG9BcnJheShvcHRpb25zLnR5cGUpXHJcbiAgICB0eXBlTmFtZXMucHVzaCgobmFtZSBmb3Igb3duIG5hbWUgb2Ygb3B0aW9ucyB3aGVuIGlzVmFsaWRUeXBlTmFtZShuYW1lKSkuLi4pXHJcbiAgICB0eXBlTmFtZXMgPSB0eXBlTmFtZVRvRGlzdGluY3RBcnJheSh0eXBlTmFtZXMpXHJcbiAgICB0eXBlTmFtZSA9IHR5cGVOYW1lVG9TdHJpbmcodHlwZU5hbWVzKVxyXG5cclxuICAgICMgc2ltcGxlIGNoZWNrc1xyXG4gICAgdHlwZUNoZWNrc1NpbXBsZSA9IHt9XHJcbiAgICBkbyAtPlxyXG4gICAgICBmb3IgbmFtZSBpbiB0eXBlTmFtZXNcclxuICAgICAgICB0eXBlQ2hlY2tzU2ltcGxlW25hbWVdID0gb3B0aW9uc1tuYW1lXSA/IGlzQW4obmFtZSwgeyByZXR1cm5DaGVja2VyOiB0cnVlIH0pXHJcblxyXG4gICAgIyBzaW1wbGUgY2hlY2tcclxuICAgIHR5cGVDaGVja1NpbXBsZSA9IG9wdGlvbnMuY2hlY2sgPyAoKCkgLT4gdHJ1ZSlcclxuXHJcbiAgICAjIGNoZWNrc1xyXG4gICAgdHlwZUNoZWNrcyA9IHt9XHJcbiAgICBkbyAtPlxyXG4gICAgICBmb3IgbmFtZSwgY2hlY2sgb2YgdHlwZUNoZWNrc1NpbXBsZVxyXG4gICAgICAgIGRvIChjaGVjaykgLT5cclxuICAgICAgICAgIHR5cGVDaGVja3NbbmFtZV0gPSAodmFsdWUpIC0+XHJcbiAgICAgICAgICAgIGNoZWNrKHZhbHVlKSBhbmQgdHlwZUNoZWNrU2ltcGxlKHZhbHVlKVxyXG5cclxuICAgICMgY2hlY2tcclxuICAgIHR5cGVDaGVjayA9IGRvIC0+XHJcbiAgICAgIHJldHVybiAodmFsdWUpIC0+XHJcbiAgICAgICAgdHlwZUNoZWNrU2ltcGxlKHZhbHVlKSBhbmQgKCh0eXBlTmFtZXMubGVuZ3RoID09IDApIG9yICh0eXBlTmFtZXMuc29tZSgobmFtZSkgLT4gdHlwZUNoZWNrc1NpbXBsZVtuYW1lXSh2YWx1ZSkpKSlcclxuXHJcbiAgICByZWFkRXJyb3IgPSBrby5vYnNlcnZhYmxlKClcclxuICAgIHdyaXRlRXJyb3IgPSBrby5vYnNlcnZhYmxlKClcclxuXHJcbiAgICByZXN1bHQgPSBrby5jb21wdXRlZCh7XHJcbiAgICAgIHB1cmU6IG9wdGlvbnMucHVyZVxyXG4gICAgICBkZWZlckV2YWx1YXRpb246IHRydWVcclxuXHJcbiAgICAgIHJlYWQ6IHdyYXBSZWFkKFxyXG4gICAgICAgIG9wdGlvbnMsXHJcbiAgICAgICAgdGFyZ2V0LFxyXG4gICAgICAgIHJlYWRFcnJvcixcclxuICAgICAgICAoKSAtPlxyXG4gICAgICAgICAgaW50ZXJuYWxWYWx1ZSA9IHRhcmdldCgpXHJcblxyXG4gICAgICAgICAgaWYgbm90IHR5cGVDaGVjayhpbnRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5leHBlY3RlZCBpbnRlcm5hbCB0eXBlLiBFeHBlY3RlZCAje3R5cGVOYW1lfSwgZ290ICN7aXNBbihpbnRlcm5hbFZhbHVlKX1cIilcclxuXHJcbiAgICAgICAgICByZXR1cm4gaW50ZXJuYWxWYWx1ZVxyXG4gICAgICApXHJcbiAgICAgIHdyaXRlOiB3cmFwV3JpdGUoXHJcbiAgICAgICAgb3B0aW9ucyxcclxuICAgICAgICB0YXJnZXQsXHJcbiAgICAgICAgd3JpdGVFcnJvcixcclxuICAgICAgICAoZXh0ZXJuYWxWYWx1ZSkgLT5cclxuICAgICAgICAgIGlmIHR5cGVDaGVjayhleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICB0YXJnZXQoZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuZXhwZWN0ZWQgZXh0ZXJuYWwgdHlwZS4gRXhwZWN0ZWQgI3t0eXBlTmFtZX0sIHJlY2VpdmVkICN7aXNBbihleHRlcm5hbFZhbHVlKX1cIilcclxuXHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgKVxyXG4gICAgfSlcclxuXHJcbiAgICByZXN1bHQudHlwZU5hbWUgPSB0eXBlTmFtZVxyXG4gICAgcmVzdWx0LnR5cGVOYW1lcyA9IHR5cGVOYW1lc1xyXG4gICAgcmVzdWx0LnR5cGVDaGVjayA9IHR5cGVDaGVja1xyXG4gICAgcmVzdWx0LnR5cGVDaGVja3MgPSB0eXBlQ2hlY2tzXHJcblxyXG4gICAgcmVzdWx0LnJlYWRFcnJvciA9IHJlYWRFcnJvclxyXG4gICAgcmVzdWx0LndyaXRlRXJyb3IgPSB3cml0ZUVycm9yXHJcblxyXG4gICAgdmFsaWRhdGUodGFyZ2V0LCByZXN1bHQsIG9wdGlvbnMpXHJcblxyXG4gICAgaWYgbm90IG9wdGlvbnMuZGVmZXJFdmFsdWF0aW9uXHJcbiAgICAgIHRyeVxyXG4gICAgICAgIHJlc3VsdC5wZWVrKClcclxuICAgICAgY2F0Y2ggZXhcclxuICAgICAgICByZXN1bHQuZGlzcG9zZSgpXHJcbiAgICAgICAgdGhyb3cgZXhcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcblxyXG4gIGtvLmV4dGVuZGVycy50eXBlLm9wdGlvbnMgPSB7XHJcbiAgfVxyXG5cclxuXHJcbiAga28uZXh0ZW5kZXJzLmNvbnZlcnQgPSAodGFyZ2V0LCBvcHRpb25zKSAtPlxyXG4gICAgaWYgb3B0aW9ucyA9PSBmYWxzZVxyXG4gICAgICByZXR1cm4gdGFyZ2V0XHJcblxyXG4gICAgIyBub3JtYWxpemUgb3B0aW9uc1xyXG4gICAgZG8gLT5cclxuICAgICAgaWYgaXNBbi5TdHJpbmcob3B0aW9ucykgb3IgaXNBbi5BcnJheShvcHRpb25zKVxyXG4gICAgICAgIG9wdGlvbnMgPSB7IHR5cGU6IG9wdGlvbnMgfVxyXG4gICAgICBlbHNlIGlmIG9wdGlvbnMgPT0gdHJ1ZVxyXG4gICAgICAgIG9wdGlvbnMgPSB7fVxyXG5cclxuICAgICAgIyBtZXJnZSBvcHRpb25zXHJcbiAgICAgIG9wdGlvbnMgPSBleHRlbmQoe30sIGtvLnR5cGVkLm9wdGlvbnMsIGtvLmV4dGVuZGVycy5jb252ZXJ0Lm9wdGlvbnMsIG9wdGlvbnMpXHJcblxyXG4gICAgICBub3JtYWwgPSB7XHJcbiAgICAgICAgY2hlY2tTZWxmOiBvcHRpb25zLmNoZWNrID8gZm5UcnVlXHJcbiAgICAgICAgcmVhZDogb3B0aW9ucy5yZWFkXHJcbiAgICAgICAgd3JpdGU6IG9wdGlvbnMud3JpdGVcclxuICAgICAgICBjaGVja3M6IHt9XHJcbiAgICAgICAgY2hlY2tlcnM6IFtdXHJcbiAgICAgICAgaXNUeXBlZDogaXNUeXBlZCh0YXJnZXQpXHJcbiAgICAgICAgaWdub3JlRGVmYXVsdENvbnZlcnRlcnM6IG9wdGlvbnMuaWdub3JlRGVmYXVsdENvbnZlcnRlcnNcclxuICAgICAgICBwdXJlOiBvcHRpb25zLnB1cmVcclxuICAgICAgICBkZWZlckV2YWx1YXRpb246IG9wdGlvbnMuZGVmZXJFdmFsdWF0aW9uXHJcbiAgICAgICAgdHlwZXM6IHR5cGVOYW1lVG9EaXN0aW5jdEFycmF5KG9wdGlvbnMudHlwZSlcclxuICAgICAgfVxyXG5cclxuICAgICAgbm9ybWFsaXplRXhSZWFkKG5vcm1hbCwga28udHlwZWQub3B0aW9ucywga28uZXh0ZW5kZXJzLmNvbnZlcnQub3B0aW9ucywgb3B0aW9ucylcclxuICAgICAgbm9ybWFsaXplRXhXcml0ZShub3JtYWwsIGtvLnR5cGVkLm9wdGlvbnMsIGtvLmV4dGVuZGVycy5jb252ZXJ0Lm9wdGlvbnMsIG9wdGlvbnMpXHJcbiAgICAgIG5vcm1hbGl6ZVZhbGlkYXRpb24obm9ybWFsLCBrby50eXBlZC5vcHRpb25zLCBrby5leHRlbmRlcnMuY29udmVydC5vcHRpb25zLCBvcHRpb25zKVxyXG5cclxuICAgICAgIyBFeHBhbmQgZWFjaCBFeHRlcm5hbCBUeXBlXHJcbiAgICAgIGZvciBvd24gZXh0VHlwZU5hbWUsIGV4dFR5cGVPcHRpb25zIG9mIG9wdGlvbnNcclxuICAgICAgICBpZiBub3QgaXNWYWxpZFR5cGVOYW1lKGV4dFR5cGVOYW1lKVxyXG4gICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgICAgZXh0VHlwZU9wdGlvbnMgPSBvcHRpb25zW2V4dFR5cGVOYW1lXSA/IHt9XHJcblxyXG4gICAgICAgIG5vcm1hbFtleHRUeXBlTmFtZV0gPSB7XHJcbiAgICAgICAgICBjaGVja1NlbGY6IGV4dFR5cGVPcHRpb25zLmNoZWNrXHJcbiAgICAgICAgICByZWFkOiBleHRUeXBlT3B0aW9ucy5yZWFkXHJcbiAgICAgICAgICB3cml0ZTogZXh0VHlwZU9wdGlvbnMud3JpdGVcclxuICAgICAgICAgIHR5cGVzOiB0eXBlTmFtZVRvRGlzdGluY3RBcnJheShleHRUeXBlT3B0aW9ucy50eXBlKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgIyBFeHBhbmQgYWxsIGludGVybmFsIHR5cGVzXHJcbiAgICAgICAgZm9yIG93biBpbnRUeXBlTmFtZSBvZiBleHRUeXBlT3B0aW9uc1xyXG4gICAgICAgICAgaWYgbm90IGlzVmFsaWRUeXBlTmFtZShpbnRUeXBlTmFtZSlcclxuICAgICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgICAgICBpbnRUeXBlT3B0aW9ucyA9IG9wdGlvbnNbZXh0VHlwZU5hbWVdP1tpbnRUeXBlTmFtZV0gPyB7fVxyXG5cclxuICAgICAgICAgIG5vcm1hbFtleHRUeXBlTmFtZV1baW50VHlwZU5hbWVdID0ge1xyXG4gICAgICAgICAgICByZWFkOiBpbnRUeXBlT3B0aW9ucy5yZWFkXHJcbiAgICAgICAgICAgIHdyaXRlOiBpbnRUeXBlT3B0aW9ucy53cml0ZVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgbm9ybWFsLnR5cGUgPSB0eXBlTmFtZVRvU3RyaW5nKG5vcm1hbC50eXBlcylcclxuXHJcbiAgICAgIGZvciBleHRUeXBlTmFtZSBpbiBub3JtYWwudHlwZXNcclxuICAgICAgICBjaGVja2VyID0gbm9ybWFsW2V4dFR5cGVOYW1lXT8uY2hlY2tTZWxmID8gaXNBbihleHRUeXBlTmFtZSwgeyByZXR1cm5DaGVja2VyOiB0cnVlIH0pID8gZm5UcnVlXHJcbiAgICAgICAgbm9ybWFsLmNoZWNrc1tleHRUeXBlTmFtZV0gPSBkbyAoY2hlY2tlcikgLT5cclxuICAgICAgICAgICh2YWx1ZSkgLT4gbm9ybWFsLmNoZWNrU2VsZih2YWx1ZSkgYW5kIGNoZWNrZXIodmFsdWUpXHJcbiAgICAgICAgbm9ybWFsLmNoZWNrZXJzLnB1c2gobm9ybWFsLmNoZWNrc1tleHRUeXBlTmFtZV0pXHJcblxyXG4gICAgICBub3JtYWwuY2hlY2sgPSAodmFsdWUpIC0+XHJcbiAgICAgICAgbm9ybWFsLmNoZWNrU2VsZih2YWx1ZSkgYW5kICgobm9ybWFsLmNoZWNrZXJzLmxlbmd0aCA9PSAwKSBvciBub3JtYWwuY2hlY2tlcnMuc29tZSgoY2hlY2tlcikgLT4gY2hlY2tlcih2YWx1ZSkpKVxyXG5cclxuICAgICAgb3B0aW9ucyA9IG5vcm1hbFxyXG5cclxuXHJcbiAgICByZWFkRXJyb3IgPSBrby5vYnNlcnZhYmxlKClcclxuICAgIHdyaXRlRXJyb3IgPSBrby5vYnNlcnZhYmxlKClcclxuXHJcbiAgICByZXN1bHQgPSBrby5jb21wdXRlZCh7XHJcbiAgICAgIHB1cmU6IG9wdGlvbnMucHVyZVxyXG4gICAgICBkZWZlckV2YWx1YXRpb246IHRydWVcclxuXHJcbiAgICAgIHJlYWQ6IHdyYXBSZWFkKFxyXG4gICAgICAgIG9wdGlvbnMsXHJcbiAgICAgICAgdGFyZ2V0LFxyXG4gICAgICAgIHJlYWRFcnJvcixcclxuICAgICAgICAoKSAtPlxyXG4gICAgICAgICAgaW50ZXJuYWxWYWx1ZSA9IHRhcmdldCgpXHJcbiAgICAgICAgICBleHRlcm5hbFZhbHVlID0gdW5kZWZpbmVkXHJcblxyXG4gICAgICAgICAgIyBUcnkgZXhhY3QgaW50ZXJuYWwgdHlwZSBtYXRjaFxyXG4gICAgICAgICAgdHJ5UmVhZCA9IChyZWFkLCByZWFkT3B0aW9ucykgLT5cclxuICAgICAgICAgICAgaWYgcmVhZD9cclxuICAgICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgICAgIGV4dGVybmFsVmFsdWUgPSByZWFkKGludGVybmFsVmFsdWUsIHJlYWRPcHRpb25zKVxyXG4gICAgICAgICAgICAgIGNhdGNoIGV4XHJcbiAgICAgICAgICAgICAgICBpZiBleCBub3QgaW5zdGFuY2VvZiBUeXBlRXJyb3JcclxuICAgICAgICAgICAgICAgICAgdGhyb3cgZXhcclxuXHJcbiAgICAgICAgICAgICAgaWYgbm90IGV4P1xyXG4gICAgICAgICAgICAgICAgaWYgb3B0aW9ucy5jaGVjayhleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgICAgICAgZXh0VHlwZU5hbWVzID0gb3B0aW9ucy50eXBlc1xyXG4gICAgICAgICAgaWYgZXh0VHlwZU5hbWVzLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgICAgIGV4dFR5cGVOYW1lcyA9IFtpc0FuKGludGVybmFsVmFsdWUpXVxyXG5cclxuICAgICAgICAgICMgTG9vayBmb3Igc3BlY2lmaWMgY29udmVyc2lvblxyXG4gICAgICAgICAgZm9yIGV4dFR5cGVOYW1lIGluIGV4dFR5cGVOYW1lc1xyXG4gICAgICAgICAgICBleHRUeXBlT3B0aW9ucyA9IG9wdGlvbnNbZXh0VHlwZU5hbWVdID8ge31cclxuXHJcbiAgICAgICAgICAgICMgaW50ZXJuYWwgdHlwZXNcclxuICAgICAgICAgICAgaW50VHlwZU5hbWVzID0gZXh0VHlwZU9wdGlvbnMudHlwZXMgPyBbXVxyXG4gICAgICAgICAgICBpZiBpbnRUeXBlTmFtZXMubGVuZ3RoID09IDBcclxuICAgICAgICAgICAgICBpZiBvcHRpb25zLmlzVHlwZWRcclxuICAgICAgICAgICAgICAgICMgZ28gYnkgdGFyZ2V0IG9yZGVyXHJcbiAgICAgICAgICAgICAgICBpbnRUeXBlTmFtZXMgPSB0YXJnZXQudHlwZU5hbWVzXHJcbiAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgIyBnbyBieSBpbmZlcnJlZCBvcmRlclxyXG4gICAgICAgICAgICAgICAgaW50VHlwZU5hbWVzID0gW2lzQW4oaW50ZXJuYWxWYWx1ZSldXHJcblxyXG4gICAgICAgICAgICBmb3IgaW50VHlwZU5hbWUgaW4gaW50VHlwZU5hbWVzXHJcbiAgICAgICAgICAgICAgIyBjaGVjayBpbnRlcm5hbCB0eXBlXHJcbiAgICAgICAgICAgICAgaWYgb3B0aW9ucy5pc1R5cGVkIGFuZCBub3QgdGFyZ2V0LnR5cGVDaGVja3NbaW50VHlwZU5hbWVdPyhpbnRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgICAgICAgICAgIyBnZXQgdGhlIG9wdGlvbnNcclxuICAgICAgICAgICAgICBpbnRUeXBlT3B0aW9ucyA9IGV4dFR5cGVPcHRpb25zW2ludFR5cGVOYW1lXSA/IHt9XHJcblxyXG4gICAgICAgICAgICAgICMgdHJ5IGN1c3RvbSBjb252ZXJzaW9uXHJcbiAgICAgICAgICAgICAgaWYgaW50VHlwZU9wdGlvbnMucmVhZD9cclxuICAgICAgICAgICAgICAgIGlmIHRyeVJlYWQoaW50VHlwZU9wdGlvbnMucmVhZCwgaW50VHlwZU9wdGlvbnMucmVhZE9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBleHRlcm5hbFZhbHVlXHJcbiAgICAgICAgICAgICAgIyB0cnkgbm8gY29udmVyc2lvblxyXG4gICAgICAgICAgICAgIGVsc2UgaWYgaW50VHlwZU5hbWUgPT0gZXh0VHlwZU5hbWVcclxuICAgICAgICAgICAgICAgIGlmIG5vdCBleHRUeXBlT3B0aW9ucy5yZWFkPyBhbmQgbm90IG9wdGlvbnMucmVhZD8gYW5kIHRyeVJlYWQoZm5JZGVudGl0eSlcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4dGVybmFsVmFsdWVcclxuICAgICAgICAgICAgICBlbHNlIGlmIG5vdCBvcHRpb25zLmlnbm9yZURlZmF1bHRDb252ZXJ0ZXJzXHJcbiAgICAgICAgICAgICAgICAjIHRyeSBkZWZhdWx0IGNvbnZlcnNpb25cclxuICAgICAgICAgICAgICAgIGlmIHRyeVJlYWQoa28udHlwZWQuZ2V0Q29udmVydGVyKGludFR5cGVOYW1lLCBleHRUeXBlTmFtZSksIGludFR5cGVPcHRpb25zLnJlYWRPcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gZXh0ZXJuYWxWYWx1ZVxyXG5cclxuICAgICAgICAgICMgTG9vayBmb3Igb25lLXNpZGVkIGNvbnZlcnNpb25cclxuICAgICAgICAgIGZvciBleHRUeXBlTmFtZSBpbiBleHRUeXBlTmFtZXNcclxuICAgICAgICAgICAgZXh0VHlwZU9wdGlvbnMgPSBvcHRpb25zW2V4dFR5cGVOYW1lXSA/IHt9XHJcblxyXG4gICAgICAgICAgICAjIHRyeSBjdXN0b20gY29udmVyc2lvblxyXG4gICAgICAgICAgICBpZiB0cnlSZWFkKGV4dFR5cGVPcHRpb25zLnJlYWQsIGV4dFR5cGVPcHRpb25zLnJlYWRPcHRpb25zKVxyXG4gICAgICAgICAgICAgIHJldHVybiBleHRlcm5hbFZhbHVlXHJcblxyXG4gICAgICAgICAgIyBMb29rIGZvciBnZW5lcmljIGNvbnZlcnNpb25cclxuICAgICAgICAgIGlmIHRyeVJlYWQob3B0aW9ucy5yZWFkLCBvcHRpb25zLnJlYWRPcHRpb25zKVxyXG4gICAgICAgICAgICByZXR1cm4gZXh0ZXJuYWxWYWx1ZVxyXG5cclxuICAgICAgICAgIGlmIG9wdGlvbnMudHlwZT9cclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gaW50ZXJuYWwgdHlwZSAje2lzQW4oaW50ZXJuYWxWYWx1ZSl9IHRvIGV4dGVybmFsIHR5cGUgI3tvcHRpb25zLnR5cGV9XCIpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tIGludGVybmFsIHR5cGUgI3tpc0FuKGludGVybmFsVmFsdWUpfVwiKVxyXG4gICAgICApXHJcblxyXG4gICAgICB3cml0ZTogd3JhcFdyaXRlKFxyXG4gICAgICAgIG9wdGlvbnMsXHJcbiAgICAgICAgdGFyZ2V0LFxyXG4gICAgICAgIHdyaXRlRXJyb3IsXHJcbiAgICAgICAgKGV4dGVybmFsVmFsdWUpIC0+XHJcbiAgICAgICAgICB0cnlXcml0ZSA9ICh3cml0ZSwgd3JpdGVPcHRpb25zKSAtPlxyXG4gICAgICAgICAgICBpZiB3cml0ZT9cclxuICAgICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgICAgIGludGVybmFsVmFsdWUgPSB3cml0ZShleHRlcm5hbFZhbHVlLCB3cml0ZU9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgY2F0Y2ggZXhcclxuICAgICAgICAgICAgICAgIGlmIGV4IG5vdCBpbnN0YW5jZW9mIFR5cGVFcnJvclxyXG4gICAgICAgICAgICAgICAgICB0aHJvdyBleFxyXG5cclxuICAgICAgICAgICAgICBpZiBub3QgZXg/XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQoaW50ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICAgICAgICBpZiBub3Qgb3B0aW9ucy5jaGVja1NlbGY/IG9yIG9wdGlvbnMuY2hlY2tTZWxmKGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgIGV4dFR5cGVOYW1lcyA9IG9wdGlvbnMudHlwZXNcclxuICAgICAgICAgICAgaWYgZXh0VHlwZU5hbWVzLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgICAgICAgZXh0VHlwZU5hbWVzID0gW2lzQW4oZXh0ZXJuYWxWYWx1ZSldXHJcblxyXG4gICAgICAgICAgICAjIExvb2sgZm9yIHNwZWNpZmljIGNvbnZlcnNpb25cclxuICAgICAgICAgICAgZm9yIGV4dFR5cGVOYW1lIGluIGV4dFR5cGVOYW1lc1xyXG4gICAgICAgICAgICAgIGV4dFR5cGVPcHRpb25zID0gb3B0aW9uc1tleHRUeXBlTmFtZV0gPyB7fVxyXG5cclxuICAgICAgICAgICAgICBpZiAoZXh0VHlwZU9wdGlvbnMuY2hlY2tTZWxmPyBhbmQgbm90IGV4dFR5cGVPcHRpb25zLmNoZWNrU2VsZihleHRlcm5hbFZhbHVlKSkgb3IgKG5vdCBleHRUeXBlT3B0aW9ucy5jaGVja1NlbGY/IGFuZCBub3QgaXNBbihleHRlcm5hbFZhbHVlLCBleHRUeXBlTmFtZSkpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAgICAgICAjIGludGVybmFsIHR5cGVzXHJcbiAgICAgICAgICAgICAgaW50VHlwZU5hbWVzID0gZXh0VHlwZU9wdGlvbnMudHlwZXMgPyBbXVxyXG4gICAgICAgICAgICAgIGlmIGludFR5cGVOYW1lcy5sZW5ndGggPT0gMFxyXG4gICAgICAgICAgICAgICAgaWYgb3B0aW9ucy5pc1R5cGVkXHJcbiAgICAgICAgICAgICAgICAgICMgZ28gYnkgdGFyZ2V0IG9yZGVyXHJcbiAgICAgICAgICAgICAgICAgIGludFR5cGVOYW1lcyA9IHRhcmdldC50eXBlTmFtZXNcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgIyBnbyBieSBpbmZlcnJlZCBvcmRlclxyXG4gICAgICAgICAgICAgICAgICBpbnRUeXBlTmFtZXMgPSBbaXNBbihleHRlcm5hbFZhbHVlKV1cclxuXHJcbiAgICAgICAgICAgICAgZm9yIGludFR5cGVOYW1lIGluIGludFR5cGVOYW1lc1xyXG4gICAgICAgICAgICAgICAgaW50VHlwZU9wdGlvbnMgPSBleHRUeXBlT3B0aW9uc1tpbnRUeXBlTmFtZV0gPyB7fVxyXG5cclxuICAgICAgICAgICAgICAgICMgdHJ5IGN1c3RvbSBjb252ZXJzaW9uXHJcbiAgICAgICAgICAgICAgICBpZiBpbnRUeXBlT3B0aW9ucy53cml0ZT9cclxuICAgICAgICAgICAgICAgICAgaWYgdHJ5V3JpdGUoaW50VHlwZU9wdGlvbnMud3JpdGUsIGludFR5cGVPcHRpb25zLndyaXRlT3B0aW9ucylcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgICMgdHJ5IG5vIGNvbnZlcnNpb25cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgZXh0VHlwZU5hbWUgPT0gaW50VHlwZU5hbWVcclxuICAgICAgICAgICAgICAgICAgaWYgbm90IGV4dFR5cGVPcHRpb25zLndyaXRlPyBhbmQgbm90IG9wdGlvbnMud3JpdGU/IGFuZCAobm90IG9wdGlvbnMuaXNUeXBlZCBvciB0YXJnZXQudHlwZUNoZWNrc1tleHRUeXBlTmFtZV0oZXh0ZXJuYWxWYWx1ZSkpIGFuZCB0cnlXcml0ZShmbklkZW50aXR5KVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgIyB0cnkgZGVmYXVsdCBjb252ZXJzaW9uXHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG5vdCBvcHRpb25zLmlnbm9yZURlZmF1bHRDb252ZXJ0ZXJzXHJcbiAgICAgICAgICAgICAgICAgIGlmIHRyeVdyaXRlKGtvLnR5cGVkLmdldENvbnZlcnRlcihleHRUeXBlTmFtZSwgaW50VHlwZU5hbWUpLCBpbnRUeXBlT3B0aW9ucy53cml0ZU9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgICAgICAjIExvb2sgZm9yIG9uZS1zaWRlZCBjb252ZXJzaW9uXHJcbiAgICAgICAgICAgIGZvciBleHRUeXBlTmFtZSBpbiBleHRUeXBlTmFtZXNcclxuICAgICAgICAgICAgICBleHRUeXBlT3B0aW9ucyA9IG9wdGlvbnNbZXh0VHlwZU5hbWVdID8ge31cclxuXHJcbiAgICAgICAgICAgICAgaWYgKGV4dFR5cGVPcHRpb25zLmNoZWNrU2VsZj8gYW5kIG5vdCBleHRUeXBlT3B0aW9ucy5jaGVja1NlbGYoZXh0ZXJuYWxWYWx1ZSkpIG9yIChub3QgZXh0VHlwZU9wdGlvbnMuY2hlY2tTZWxmPyBhbmQgbm90IGlzQW4oZXh0ZXJuYWxWYWx1ZSwgZXh0VHlwZU5hbWUpKVxyXG4gICAgICAgICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgICAgICAgICAgIyB0cnkgY3VzdG9tIGNvbnZlcnNpb25cclxuICAgICAgICAgICAgICBpZiB0cnlXcml0ZShleHRUeXBlT3B0aW9ucy53cml0ZSwgZXh0VHlwZU9wdGlvbnMud3JpdGVPcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgICAgICAjIExvb2sgZm9yIGdlbmVyaWMgY29udmVyc2lvblxyXG4gICAgICAgICAgICBpZiB0cnlXcml0ZShvcHRpb25zLndyaXRlLCBvcHRpb25zLndyaXRlT3B0aW9ucylcclxuICAgICAgICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgICAgICBpZiBvcHRpb25zLmlzVHlwZWRcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gZXh0ZXJuYWwgdHlwZSAje2lzQW4oZXh0ZXJuYWxWYWx1ZSl9IHRvIGludGVybmFsIHR5cGUgI3t0YXJnZXQudHlwZU5hbWV9XCIpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tIGV4dGVybmFsIHR5cGUgI3tpc0FuKGV4dGVybmFsVmFsdWUpfVwiKVxyXG4gICAgICApXHJcbiAgICB9KVxyXG5cclxuICAgIHJlc3VsdC50eXBlTmFtZSA9IG9wdGlvbnMudHlwZVxyXG4gICAgcmVzdWx0LnR5cGVOYW1lcyA9IG9wdGlvbnMudHlwZXNcclxuICAgIHJlc3VsdC50eXBlQ2hlY2sgPSBvcHRpb25zLmNoZWNrXHJcbiAgICByZXN1bHQudHlwZUNoZWNrcyA9IG9wdGlvbnMuY2hlY2tzXHJcblxyXG4gICAgcmVzdWx0LnJlYWRFcnJvciA9IHJlYWRFcnJvclxyXG4gICAgcmVzdWx0LndyaXRlRXJyb3IgPSB3cml0ZUVycm9yXHJcblxyXG4gICAgdmFsaWRhdGUodGFyZ2V0LCByZXN1bHQsIG9wdGlvbnMpXHJcblxyXG4gICAgaWYgbm90IG9wdGlvbnMuZGVmZXJFdmFsdWF0aW9uXHJcbiAgICAgIHRyeVxyXG4gICAgICAgIHJlc3VsdC5wZWVrKClcclxuICAgICAgY2F0Y2ggZXhcclxuICAgICAgICByZXN1bHQuZGlzcG9zZSgpXHJcbiAgICAgICAgdGhyb3cgZXhcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcblxyXG4gIGtvLmV4dGVuZGVycy5jb252ZXJ0Lm9wdGlvbnMgPSB7XHJcbiAgfVxyXG5cclxuXHJcbiAgZG8gLT5cclxuICAgIGtvLnR5cGVkLl9jb252ZXJ0ZXJzID0gY29udmVydGVycyA9IHt9XHJcblxyXG4gICAga28udHlwZWQuYWRkQ29udmVydGVyID0gKGZyb21UeXBlTmFtZSwgdG9UeXBlTmFtZSwgY29udmVydGVyLCBkZWZhdWx0T3B0aW9ucywgZGVmYXVsdE9wdGlvbikgLT5cclxuICAgICAgY29uc29sZT8uYXNzZXJ0Pyhpc1ZhbGlkVHlwZU5hbWUoZnJvbVR5cGVOYW1lKSwgXCJJbnZhbGlkIHR5cGVOYW1lICN7ZnJvbVR5cGVOYW1lfVwiKVxyXG4gICAgICBjb25zb2xlPy5hc3NlcnQ/KGlzVmFsaWRUeXBlTmFtZSh0b1R5cGVOYW1lKSwgXCJJbnZhbGlkIHR5cGVOYW1lICN7ZnJvbVR5cGVOYW1lfVwiKVxyXG5cclxuICAgICAgaWYgZGVmYXVsdE9wdGlvbnM/XHJcbiAgICAgICAgaWYgZGVmYXVsdE9wdGlvbj9cclxuICAgICAgICAgIHdyYXBwZXIgPSAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgICAgICAgIGlmIGFyZ3VtZW50cy5sZW5ndGggPT0gMiBhbmQgbm90IGlzQW4uT2JqZWN0KG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgbyA9IHt9XHJcbiAgICAgICAgICAgICAgb1tkZWZhdWx0T3B0aW9uXSA9IG9wdGlvbnNcclxuICAgICAgICAgICAgICBvcHRpb25zID0gb1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGNvbnZlcnRlcih2YWx1ZSwga28udXRpbHMuZXh0ZW5kKGtvLnV0aWxzLmV4dGVuZCh7fSwgd3JhcHBlci5vcHRpb25zKSwgb3B0aW9ucykpXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgd3JhcHBlciA9ICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgICAgICAgcmV0dXJuIGNvbnZlcnRlcih2YWx1ZSwga28udXRpbHMuZXh0ZW5kKGtvLnV0aWxzLmV4dGVuZCh7fSwgd3JhcHBlci5vcHRpb25zKSwgb3B0aW9ucykpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICB3cmFwcGVyID0gKHZhbHVlKSAtPlxyXG4gICAgICAgICAgcmV0dXJuIGNvbnZlcnRlcih2YWx1ZSlcclxuXHJcbiAgICAgIHdyYXBwZXIub3B0aW9ucyA9IGRlZmF1bHRPcHRpb25zXHJcblxyXG4gICAgICBjb252ZXJ0ZXJzW2Zyb21UeXBlTmFtZV0gPz0ge31cclxuICAgICAgY29udmVydGVyc1tmcm9tVHlwZU5hbWVdW3RvVHlwZU5hbWVdID0gd3JhcHBlclxyXG5cclxuICAgICAgcmV0dXJuIGtvLnR5cGVkXHJcblxyXG4gICAga28udHlwZWQuZ2V0Q29udmVydGVyID0gKGZyb21UeXBlTmFtZSwgdG9UeXBlTmFtZSkgLT5cclxuICAgICAgY29udmVydGVyc1tmcm9tVHlwZU5hbWVdP1t0b1R5cGVOYW1lXVxyXG5cclxuICAgIGtvLnR5cGVkLnJlbW92ZUNvbnZlcnRlciA9IChmcm9tVHlwZU5hbWUsIHRvVHlwZU5hbWUpIC0+XHJcbiAgICAgIGlmIGNvbnZlcnRlcnNbZnJvbVR5cGVOYW1lXT9bdG9UeXBlTmFtZV0/XHJcbiAgICAgICAgZGVsZXRlIGNvbnZlcnRlcnNbZnJvbVR5cGVOYW1lXT9bdG9UeXBlTmFtZV1cclxuXHJcbiAgICAgIHJldHVybiBrby50eXBlZFxyXG5cclxuICAgIHJldHVyblxyXG5cclxuXHJcbiAgZG8gLT5cclxuICAgICMjIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL01hdGgvcm91bmRcclxuICAgIGRlY2ltYWxBZGp1c3QgPSAodHlwZSwgdmFsdWUsIGV4cCkgLT5cclxuICAgICAgIyBpZiBleHAgaXMgdW5kZWZpbmVkIG9yIHplcm9cclxuICAgICAgaWYgbm90IGV4cD8gb3IgK2V4cCA9PSAwXHJcbiAgICAgICAgcmV0dXJuIHR5cGUodmFsdWUpXHJcblxyXG4gICAgICB2YWx1ZSA9ICt2YWx1ZVxyXG4gICAgICBleHAgPSArZXhwXHJcblxyXG4gICAgICAjIElmIHRoZSB2YWx1ZSBpdCBub3QgYSBudW1iZXIgb2YgdGhlIGV4cCBpcyBub3QgYW4gaW50ZWdlclxyXG4gICAgICBpZiAoaXNOYU4odmFsdWUpIG9yIG5vdCAodHlwZW9mIGV4cCA9PSAnbnVtYmVyJyBhbmQgZXhwICUgMSA9PSAwKSlcclxuICAgICAgICByZXR1cm4gTmFOXHJcblxyXG4gICAgICAjIFNoaWZ0XHJcbiAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKS5zcGxpdCgnZScpXHJcbiAgICAgIHZhbHVlID0gdHlwZSgrKHZhbHVlWzBdICsgJ2UnICsgKGlmIHZhbHVlWzFdIHRoZW4gKCt2YWx1ZVsxXSAtIGV4cCkgZWxzZSAtZXhwKSkpXHJcblxyXG4gICAgICAjIFNoaWZ0IGJhY2tcclxuICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpLnNwbGl0KCdlJylcclxuICAgICAgcmV0dXJuICgrKHZhbHVlWzBdICsgJ2UnICsgKGlmIHZhbHVlWzFdIHRoZW4gKCt2YWx1ZVsxXSArIGV4cCkgZWxzZSBleHApKSlcclxuXHJcbiAgICAjIyMgIXByYWdtYSBjb3ZlcmFnZS1za2lwLW5leHQgIyMjXHJcbiAgICBpZiBub3QgTWF0aC5yb3VuZDEwP1xyXG4gICAgICBNYXRoLnJvdW5kMTAgPSAodmFsdWUsIGV4cCkgLT5cclxuICAgICAgICByZXR1cm4gZGVjaW1hbEFkanVzdChNYXRoLnJvdW5kLCB2YWx1ZSwgZXhwKVxyXG5cclxuICAgICMjIyAhcHJhZ21hIGNvdmVyYWdlLXNraXAtbmV4dCAjIyNcclxuICAgIGlmIG5vdCBNYXRoLmZsb29yMTA/XHJcbiAgICAgIE1hdGguZmxvb3IxMCA9ICh2YWx1ZSwgZXhwKSAtPlxyXG4gICAgICAgIHJldHVybiBkZWNpbWFsQWRqdXN0KE1hdGguZmxvb3IsIHZhbHVlLCBleHApXHJcblxyXG4gICAgIyMjICFwcmFnbWEgY292ZXJhZ2Utc2tpcC1uZXh0ICMjI1xyXG4gICAgaWYgbm90IE1hdGguY2VpbDEwP1xyXG4gICAgICBNYXRoLmNlaWwxMCA9ICh2YWx1ZSwgZXhwKSAtPlxyXG4gICAgICAgIHJldHVybiBkZWNpbWFsQWRqdXN0KE1hdGguY2VpbCwgdmFsdWUsIGV4cClcclxuXHJcbiAgICByZXR1cm5cclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ0Jvb2xlYW4nXHJcbiAgICAnTnVtYmVyLkludGVnZXInXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIHJldHVybiBpZiB2YWx1ZSB0aGVuIG9wdGlvbnMudHJ1dGh5IGVsc2Ugb3B0aW9ucy5mYWxzZXlcclxuICAgIHtcclxuICAgICAgdHJ1dGh5OiAxXHJcbiAgICAgIGZhbHNleTogMFxyXG4gICAgfVxyXG4gICAgJ3RydXRoeSdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdCb29sZWFuJ1xyXG4gICAgJ051bWJlcidcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgcmV0dXJuIGlmIHZhbHVlIHRoZW4gb3B0aW9ucy50cnV0aHkgZWxzZSBvcHRpb25zLmZhbHNleVxyXG4gICAge1xyXG4gICAgICB0cnV0aHk6IDFcclxuICAgICAgZmFsc2V5OiAwXHJcbiAgICB9XHJcbiAgICAndHJ1dGh5J1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ0Jvb2xlYW4nXHJcbiAgICAnU3RyaW5nJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICB2YWx1ZSA9IGlmIHZhbHVlIHRoZW4gb3B0aW9ucy50cnV0aHkgZWxzZSBvcHRpb25zLmZhbHNleVxyXG5cclxuICAgICAgaWYgb3B0aW9ucy51cHBlckNhc2VcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvVXBwZXJDYXNlKClcclxuXHJcbiAgICAgIHJldHVybiB2YWx1ZVxyXG4gICAge1xyXG4gICAgICB1cHBlckNhc2U6IGZhbHNlXHJcbiAgICAgIHRydXRoeTogJ3RydWUnXHJcbiAgICAgIGZhbHNleTogJ2ZhbHNlJ1xyXG4gICAgfVxyXG4gICAgJ3VwcGVyQ2FzZSdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdEYXRlJ1xyXG4gICAgJ01vbWVudCdcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgKG1vbWVudCA/IHJlcXVpcmUoJ21vbWVudCcpKSh2YWx1ZSlcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdEYXRlJ1xyXG4gICAgJ1N0cmluZydcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgaXNOYU4odmFsdWUudmFsdWVPZigpKVxyXG4gICAgICAgIHJldHVybiAnJ1xyXG5cclxuICAgICAgbWV0aG9kID0gb3B0aW9ucy5mb3JtYXRzW29wdGlvbnMuZm9ybWF0XVxyXG4gICAgICByZXR1cm4gdmFsdWVbbWV0aG9kXS5hcHBseSh2YWx1ZSwgb3B0aW9ucy5wYXJhbXMpXHJcblxyXG4gICAge1xyXG4gICAgICBmb3JtYXRzOiB7XHJcbiAgICAgICAgZGF0ZTogJ3RvRGF0ZVN0cmluZydcclxuICAgICAgICBpc286ICd0b0lTT1N0cmluZydcclxuICAgICAgICBqc29uOiAndG9KU09OJ1xyXG4gICAgICAgIGxvY2FsZURhdGU6ICd0b0xvY2FsZURhdGVTdHJpbmcnXHJcbiAgICAgICAgbG9jYWxlVGltZTogJ3RvTG9jYWxlVGltZVN0cmluZydcclxuICAgICAgICBsb2NhbGU6ICd0b0xvY2FsZVN0cmluZydcclxuICAgICAgICB0aW1lOiAndG9UaW1lU3RyaW5nJ1xyXG4gICAgICAgIHV0YzogJ3RvVVRDU3RyaW5nJ1xyXG4gICAgICAgIGRlZmF1bHQ6ICd0b1N0cmluZydcclxuICAgICAgfVxyXG4gICAgICBmb3JtYXQ6ICdkZWZhdWx0J1xyXG4gICAgICBwYXJhbXM6IFtdXHJcbiAgICB9XHJcbiAgICAnZm9ybWF0J1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ0RhdGUnLFxyXG4gICAgJ1VuZGVmaW5lZCcsXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG5vdCBpc05hTih2YWx1ZS52YWx1ZU9mKCkpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSB2YWxpZCBEYXRlIHRvIFVuZGVmaW5lZCcpXHJcblxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTW9tZW50J1xyXG4gICAgJ0RhdGUnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIHZhbHVlLnRvRGF0ZSgpXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTW9tZW50J1xyXG4gICAgJ1N0cmluZydcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgbm90IHZhbHVlLmlzVmFsaWQoKVxyXG4gICAgICAgIHJldHVybiAnJ1xyXG5cclxuICAgICAgcmV0dXJuIHZhbHVlLmxvY2FsZShvcHRpb25zLmxvY2FsZSkuZm9ybWF0KG9wdGlvbnMuZm9ybWF0KVxyXG4gICAge1xyXG4gICAgICBsb2NhbGU6ICdlbidcclxuICAgICAgZm9ybWF0OiAnTCdcclxuICAgIH1cclxuICAgICdmb3JtYXQnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTW9tZW50JyxcclxuICAgICdVbmRlZmluZWQnLFxyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiB2YWx1ZS5pc1ZhbGlkKClcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmFibGUgdG8gY29udmVydCBmcm9tIHZhbGlkIE1vbWVudCB0byBVbmRlZmluZWQnKVxyXG5cclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ051bWJlcidcclxuICAgICdCb29sZWFuJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLmZhbHNleT8gYW5kIHZhbHVlID09IG9wdGlvbnMuZmFsc2V5XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIGVsc2UgaWYgb3B0aW9ucy50cnV0aHk/IGFuZCB2YWx1ZSA9PSBvcHRpb25zLnRydXRoeVxyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgIGVsc2UgaWYgbm90IG9wdGlvbnMuZmFsc2V5P1xyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICBlbHNlIGlmIG5vdCBvcHRpb25zLnRydXRoeT9cclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjb252ZXJ0IGZyb20gI3t2YWx1ZX0gdG8gQm9vbGVhblwiKVxyXG4gICAge1xyXG4gICAgICB0cnV0aHk6IHVuZGVmaW5lZFxyXG4gICAgICBmYWxzZXk6IDBcclxuICAgIH1cclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdOdW1iZXInXHJcbiAgICAnTnVtYmVyLkludGVnZXInXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG5vdCBvcHRpb25zLm1vZGU/XHJcbiAgICAgICAgaWYgbm90IGlzQW4uTnVtYmVyLkludGVnZXIodmFsdWUpXHJcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCBmcm9tIE51bWJlciB0byBOdW1iZXIuSW50ZWdlci4gTnVtYmVyIGlzIG5vdCBhbiBpbnRlZ2VyJylcclxuICAgICAgICByZXR1cm4gdmFsdWVcclxuICAgICAgZWxzZSBpZiB0eXBlb2Ygb3B0aW9ucy5tb2RlID09ICdzdHJpbmcnXHJcbiAgICAgICAgbW9kZSA9IE1hdGhbb3B0aW9ucy5tb2RlXVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgbW9kZSA9IG9wdGlvbnMubW9kZVxyXG5cclxuICAgICAgcmV0dXJuIG1vZGUodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgIG1vZGU6IHVuZGVmaW5lZFxyXG4gICAgfVxyXG4gICAgJ21vZGUnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTnVtYmVyJ1xyXG4gICAgJ1N0cmluZydcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy5kZWNpbWFscz9cclxuICAgICAgICB2YWx1ZSA9IE1hdGgucm91bmQxMCh2YWx1ZSwgLW9wdGlvbnMuZGVjaW1hbHMpXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50b0ZpeGVkKG9wdGlvbnMuZGVjaW1hbHMpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKClcclxuXHJcbiAgICAgIHJldHVybiB2YWx1ZVxyXG4gICAge1xyXG4gICAgICBkZWNpbWFsczogdW5kZWZpbmVkXHJcbiAgICB9XHJcbiAgICAnZGVjaW1hbHMnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTnVtYmVyLkludGVnZXInXHJcbiAgICAnQm9vbGVhbidcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy5mYWxzZXk/IGFuZCB2YWx1ZSA9PSBvcHRpb25zLmZhbHNleVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICBlbHNlIGlmIG9wdGlvbnMudHJ1dGh5PyBhbmQgdmFsdWUgPT0gb3B0aW9ucy50cnV0aHlcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICBlbHNlIGlmIG5vdCBvcHRpb25zLmZhbHNleT9cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgZWxzZSBpZiBub3Qgb3B0aW9ucy50cnV0aHk/XHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY29udmVydCBmcm9tICN7dmFsdWV9IHRvIEJvb2xlYW5cIilcclxuICAgIHtcclxuICAgICAgdHJ1dGh5OiB1bmRlZmluZWRcclxuICAgICAgZmFsc2V5OiAwXHJcbiAgICB9XHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTnVtYmVyLkludGVnZXInXHJcbiAgICAnTnVtYmVyJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgcmV0dXJuIHZhbHVlXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTnVtYmVyLkludGVnZXInXHJcbiAgICAnU3RyaW5nJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZyhvcHRpb25zLmJhc2UpXHJcbiAgICAgIGlmIG9wdGlvbnMudXBwZXJDYXNlXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1VwcGVyQ2FzZSgpXHJcblxyXG4gICAgICByZXR1cm4gdmFsdWVcclxuICAgIHtcclxuICAgICAgYmFzZTogMTBcclxuICAgICAgdXBwZXJDYXNlOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgJ2Jhc2UnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnU3RyaW5nJyxcclxuICAgICdCb29sZWFuJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy50cmltXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50cmltKClcclxuXHJcbiAgICAgIGlmIG9wdGlvbnMuaWdub3JlQ2FzZVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudG9Mb3dlckNhc2UoKVxyXG5cclxuICAgICAgaWYgb3B0aW9ucy5zdHJpY3RcclxuICAgICAgICBpZiB2YWx1ZSA9PSBvcHRpb25zLnRydXRoeVswXVxyXG4gICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICBlbHNlIGlmIHZhbHVlID09IG9wdGlvbnMuZmFsc2V5WzBdXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGZvciB0cnV0aHkgaW4gb3B0aW9ucy50cnV0aHlcclxuICAgICAgICAgIGlmIHZhbHVlID09IHRydXRoeVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgICAgICBmb3IgZmFsc2V5IGluIG9wdGlvbnMuZmFsc2V5XHJcbiAgICAgICAgICBpZiB2YWx1ZSA9PSBmYWxzZXlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBCb29sZWFuXCIpXHJcbiAgICB7XHJcbiAgICAgIGlnbm9yZUNhc2U6IHRydWVcclxuICAgICAgc3RyaWN0OiBmYWxzZVxyXG4gICAgICB0cnV0aHk6IFtcclxuICAgICAgICAndHJ1ZSdcclxuICAgICAgICAndCdcclxuICAgICAgICAnMSdcclxuICAgICAgICAnLTEnXHJcbiAgICAgICAgJ3llcydcclxuICAgICAgICAneSdcclxuICAgICAgXVxyXG4gICAgICBmYWxzZXk6IFtcclxuICAgICAgICAnZmFsc2UnXHJcbiAgICAgICAgJ2YnXHJcbiAgICAgICAgJzAnXHJcbiAgICAgICAgJ25vJ1xyXG4gICAgICAgICduJ1xyXG4gICAgICBdXHJcbiAgICAgIHRyaW06IGZhbHNlXHJcbiAgICB9XHJcbiAgICAnc3RyaWN0J1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1N0cmluZydcclxuICAgICdEYXRlJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLnRyaW1cclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRyaW0oKVxyXG5cclxuICAgICAgaWYgb3B0aW9ucy5zdHJpY3RcclxuICAgICAgICBtYXRjaCA9IHZhbHVlLm1hdGNoKG9wdGlvbnMuZm9ybWF0KVxyXG4gICAgICAgIGlmIG5vdCBtYXRjaD9cclxuICAgICAgICAgIHRocm93IFR5cGVFcnJvcignVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSBTdHJpbmcgdG8gRGF0ZScpXHJcblxyXG4gICAgICAgIG51bSA9ICh2YWx1ZSwgZGVmKSAtPlxyXG4gICAgICAgICAgaWYgKHZhbHVlPyBhbmQgdmFsdWUgIT0gJycpIHRoZW4gcGFyc2VGbG9hdCh2YWx1ZSkgZWxzZSBkZWZcclxuXHJcbiAgICAgICAgdHogPSB1bmRlZmluZWRcclxuICAgICAgICBpZiBtYXRjaFs3XT8gYW5kIG1hdGNoWzddICE9ICcnXHJcbiAgICAgICAgICB0eiA9IChudW0obWF0Y2hbb3B0aW9ucy5mb3JtYXREaWN0LnR6SG91cnNdKSAqIDYwICsgbnVtKG1hdGNoW29wdGlvbnMuZm9ybWF0RGljdC50ek1pbnV0ZXNdKSkgKiA2MCAqIDEwMDBcclxuICAgICAgICAgIGlmIG1hdGNoW29wdGlvbnMuZm9ybWF0RGljdC50elNpZ25dID09ICctJ1xyXG4gICAgICAgICAgICB0eiAqPSAtMVxyXG5cclxuICAgICAgICBpZiBvcHRpb25zLnV0YyBvciB0ej9cclxuICAgICAgICAgIHRpbWUgPSBEYXRlLlVUQyhcclxuICAgICAgICAgICAgbnVtKG1hdGNoW29wdGlvbnMuZm9ybWF0RGljdC55ZWFyXSwgMClcclxuICAgICAgICAgICAgbnVtKG1hdGNoW29wdGlvbnMuZm9ybWF0RGljdC5tb250aF0sIDEpIC0gMVxyXG4gICAgICAgICAgICBudW0obWF0Y2hbb3B0aW9ucy5mb3JtYXREaWN0LmRheV0sIDEpXHJcbiAgICAgICAgICAgIG51bShtYXRjaFtvcHRpb25zLmZvcm1hdERpY3QuaG91cnNdLCAwKVxyXG4gICAgICAgICAgICBudW0obWF0Y2hbb3B0aW9ucy5mb3JtYXREaWN0Lm1pbnV0ZXNdLCAwKVxyXG4gICAgICAgICAgICBudW0obWF0Y2hbb3B0aW9ucy5mb3JtYXREaWN0LnNlY29uZHNdLCAwKVxyXG4gICAgICAgICAgKVxyXG5cclxuICAgICAgICAgIGlmIHR6P1xyXG4gICAgICAgICAgICB0aW1lICs9IHR6XHJcblxyXG4gICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKHRpbWUpXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKFxyXG4gICAgICAgICAgICBudW0obWF0Y2hbb3B0aW9ucy5mb3JtYXREaWN0LnllYXJdLCAwKVxyXG4gICAgICAgICAgICBudW0obWF0Y2hbb3B0aW9ucy5mb3JtYXREaWN0Lm1vbnRoXSwgMSkgLSAxXHJcbiAgICAgICAgICAgIG51bShtYXRjaFtvcHRpb25zLmZvcm1hdERpY3QuZGF5XSwgMSlcclxuICAgICAgICAgICAgbnVtKG1hdGNoW29wdGlvbnMuZm9ybWF0RGljdC5ob3Vyc10sIDApXHJcbiAgICAgICAgICAgIG51bShtYXRjaFtvcHRpb25zLmZvcm1hdERpY3QubWludXRlc10sIDApXHJcbiAgICAgICAgICAgIG51bShtYXRjaFtvcHRpb25zLmZvcm1hdERpY3Quc2Vjb25kc10sIDApXHJcbiAgICAgICAgICApXHJcblxyXG4gICAgICAgICAgZGF0ZS5zZXRUaW1lKGRhdGUuZ2V0VGltZSgpIC0gZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpICogNjAgKiAxMDAwKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKHZhbHVlKVxyXG5cclxuICAgICAgaWYgaXNOYU4oZGF0ZS52YWx1ZU9mKCkpXHJcbiAgICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmFibGUgdG8gY29udmVydCBmcm9tIFN0cmluZyB0byBEYXRlJylcclxuXHJcbiAgICAgIHJldHVybiBkYXRlXHJcbiAgICB7XHJcbiAgICAgICMgaHR0cHM6Ly93d3cuZGVidWdnZXguY29tL3IvRm5EZjkwaHFuR3VsMVpZdS8wXHJcbiAgICAgIGZvcm1hdDogL14oWzAtOV17NH0pLShbMC05XXsyfSktKFswLTldezJ9KSg/Oig/OlR8XFxzKShbMC05XXsyfSk6KFswLTldezJ9KSg/OjooWzAtOV17Mn0oPzouWzAtOV0rKT8pKT8oPzooXFwrfFxcLSkoWzAtOV17Mn0pOihbMC05XXsyfSkpPyk/JC9cclxuICAgICAgZm9ybWF0RGljdDoge1xyXG4gICAgICAgIHllYXI6IDFcclxuICAgICAgICBtb250aDogMlxyXG4gICAgICAgIGRheTogM1xyXG4gICAgICAgIGhvdXJzOiA0XHJcbiAgICAgICAgbWludXRlczogNVxyXG4gICAgICAgIHNlY29uZHM6IDZcclxuICAgICAgICB0elNpZ246IDdcclxuICAgICAgICB0ekhvdXJzOiA4XHJcbiAgICAgICAgdHpNaW51dGVzOiA5XHJcbiAgICAgIH1cclxuICAgICAgdXRjOiBmYWxzZVxyXG4gICAgICBzdHJpY3Q6IHRydWVcclxuICAgICAgdHJpbTogZmFsc2VcclxuICAgIH1cclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdTdHJpbmcnXHJcbiAgICAnTW9tZW50J1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLnRyaW1cclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRyaW0oKVxyXG5cclxuICAgICAgcmVzdWx0ID0gKG1vbWVudCA/IHJlcXVpcmUoJ21vbWVudCcpKSh2YWx1ZSwgb3B0aW9ucy5mb3JtYXQsIG9wdGlvbnMubGFuZ3VhZ2UsIG9wdGlvbnMuc3RyaWN0KVxyXG4gICAgICBpZiBub3QgcmVzdWx0LmlzVmFsaWQoKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VuYWJsZSB0byBjb252ZXJ0IGZyb20gU3RyaW5nIHRvIE1vbWVudCcpXHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICB7XHJcbiAgICAgIHN0cmljdDogZmFsc2VcclxuICAgICAgbGFuZ3VhZ2U6ICdlbidcclxuICAgICAgZm9ybWF0OiAnTCdcclxuICAgICAgdHJpbTogZmFsc2VcclxuICAgIH1cclxuICAgICdmb3JtYXQnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnU3RyaW5nJyxcclxuICAgICdOdW1iZXIuSW50ZWdlcicsXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMudHJpbVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudHJpbSgpXHJcblxyXG4gICAgICBpZiBvcHRpb25zLmJhc2UgPT0gMTAgYW5kIG5vdCBvcHRpb25zLnN0cmljdFxyXG4gICAgICAgIHRyeVxyXG4gICAgICAgICAgcmV0dXJuIGtvLnR5cGVkLmdldENvbnZlcnRlcignU3RyaW5nJywgJ051bWJlcicpKHZhbHVlLCAwKVxyXG4gICAgICAgIGNhdGNoIGV4XHJcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBOdW1iZXIuSW50ZWdlclwiKVxyXG5cclxuICAgICAgY2hhcnMgPSAnMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6J1xyXG4gICAgICBpZiBub3QgUmVnRXhwKFwiXihcXFxcLXxcXFxcKyk/WyN7Y2hhcnMuc2xpY2UoMCwgb3B0aW9ucy5iYXNlID8gMTApfV0rJFwiLCBpZiBub3Qgb3B0aW9ucy5zdHJpY3QgdGhlbiAnaScpLnRlc3QodmFsdWUpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gI3t2YWx1ZX0gdG8gTnVtYmVyLkludGVnZXJcIilcclxuXHJcbiAgICAgIHJldHVybiBwYXJzZUludCh2YWx1ZSwgb3B0aW9ucy5iYXNlKVxyXG4gICAge1xyXG4gICAgICBiYXNlOiAxMFxyXG4gICAgICBzdHJpY3Q6IGZhbHNlXHJcbiAgICAgIHRyaW06IGZhbHNlXHJcbiAgICB9XHJcbiAgICAnYmFzZSdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdTdHJpbmcnXHJcbiAgICAnTnVtYmVyJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLnRyaW1cclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRyaW0oKVxyXG5cclxuICAgICAgaWYgbm90IC9eKFxcK3xcXC0pP1swLTldKyhcXC4/KVswLTldKiQvLnRlc3QodmFsdWUpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gI3t2YWx1ZX0gdG8gTnVtYmVyXCIpXHJcblxyXG4gICAgICB2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUsIG9wdGlvbnMuYmFzZSlcclxuXHJcbiAgICAgIGlmIG9wdGlvbnMuZGVjaW1hbHM/XHJcbiAgICAgICAgdmFsdWUgPSBNYXRoLnJvdW5kMTAodmFsdWUsIC1vcHRpb25zLmRlY2ltYWxzKVxyXG5cclxuICAgICAgcmV0dXJuIHZhbHVlXHJcbiAgICB7XHJcbiAgICAgIGRlY2ltYWxzOiB1bmRlZmluZWRcclxuICAgICAgdHJpbTogZmFsc2VcclxuICAgIH1cclxuICAgICdkZWNpbWFscydcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdTdHJpbmcnLFxyXG4gICAgJ1VuZGVmaW5lZCcsXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMudHJpbVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudHJpbSgpXHJcblxyXG4gICAgICBpZiB2YWx1ZS5sZW5ndGggIT0gMFxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tICN7dmFsdWV9IHRvIFVuZGVmaW5lZFwiKVxyXG5cclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gICAge1xyXG4gICAgICB0cmltOiBmYWxzZVxyXG4gICAgfVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1VuZGVmaW5lZCcsXHJcbiAgICAnRGF0ZScsXHJcbiAgICAodmFsdWUpIC0+XHJcbiAgICAgIHJldHVybiBuZXcgRGF0ZShOYU4pXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnVW5kZWZpbmVkJyxcclxuICAgICdNb21lbnQnLFxyXG4gICAgKHZhbHVlKSAtPlxyXG4gICAgICByZXR1cm4gcmVxdWlyZSgnbW9tZW50JykuaW52YWxpZCgpXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnVW5kZWZpbmVkJyxcclxuICAgICdTdHJpbmcnLFxyXG4gICAgKHZhbHVlKSAtPlxyXG4gICAgICByZXR1cm4gJydcclxuICApXHJcblxyXG4gIHJldHVybiBrb1xyXG4iXX0=
