;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['knockout', 'is-an'], factory);
  } else {
    root.ko = factory(root.ko, root.isAn);
  }
}(this, function (ko, isAn) {
var applyKotr,
  hasProp = {}.hasOwnProperty;

applyKotr = function(ko) {
  var isTyped, isValidTypeName, typeNameToArray, typeNameToString, validate;
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
  isValidTypeName = function(value) {
    return /^[A-Z]/.test(value);
  };
  isTyped = function(value) {
    return isAn.Function(value) && (value.typeName != null) && (value.typeNames != null) && (value.typeCheck != null) && (value.typeChecks != null);
  };
  validate = function(target, options) {
    var errorCheck, rule;
    if (!options.validate) {
      return;
    }
    rule = void 0;
    errorCheck = function() {
      var message, ref, ref1, ref2;
      if ((ko.validation != null) && ko.validation.utils.isValidatable(target)) {
        message = (ref = options.message) != null ? ref : (ref1 = (ref2 = target.typeWriteError()) != null ? ref2 : target.typeReadError()) != null ? ref1.message : void 0;
        if (rule == null) {
          rule = {
            message: message,
            validator: function() {
              return (target.typeWriteError() == null) && (target.typeReadError() == null);
            }
          };
          return ko.validation.addAnonymousRule(target, rule);
        } else {
          rule.message = message;
          return target.rules.valueHasMutated();
        }
      }
    };
    target.typeWriteError.subscribe(errorCheck);
    target.typeReadError.subscribe(errorCheck);
    if (ko.validation != null) {
      target.extend({
        validatable: true
      });
    }
    if (!options.deferEvaluation) {
      return errorCheck();
    }
  };
  ko.extenders.type = function(target, options) {
    var result, typeCheck, typeChecks, typeName, typeNames;
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
    options = ko.utils.extend(ko.utils.extend({}, ko.extenders.type.options), options);
    if (options.useDefault && (options.defaultFunc == null)) {
      options.defaultFunc = function() {
        return options["default"];
      };
    }
    typeNames = typeNameToArray(options.type);
    (function() {
      var check, name, results;
      results = [];
      for (name in options) {
        if (!hasProp.call(options, name)) continue;
        check = options[name];
        if (!isValidTypeName(name)) {
          continue;
        }
        if (typeNames.indexOf(name) === -1) {
          results.push(typeNames.push(name));
        } else {
          results.push(void 0);
        }
      }
      return results;
    })();
    typeName = typeNameToString(typeNames);
    typeChecks = {};
    (function() {
      var i, len, name, ref, results;
      results = [];
      for (i = 0, len = typeNames.length; i < len; i++) {
        name = typeNames[i];
        results.push(typeChecks[name] = (ref = options[name]) != null ? ref : isAn(name, {
          returnChecker: true
        }));
      }
      return results;
    })();
    typeCheck = (function() {
      var _check, ref;
      _check = (ref = options.check) != null ? ref : (function() {
        return true;
      });
      return function(value) {
        return _check(value) && ((typeNames.length === 0) || (typeNames.some(function(name) {
          return typeChecks[name](value);
        })));
      };
    })();
    result = ko.computed({
      pure: options.pure,
      deferEvaluation: options.deferEvaluation,
      read: function() {
        var error, ex, internalValue;
        try {
          internalValue = target();
          if (!typeCheck(internalValue)) {
            throw new TypeError("Unexpected internal type. Expected " + typeName + ", got " + (isAn(internalValue)));
          }
        } catch (error) {
          ex = error;
          if (ex instanceof TypeError) {
            result.typeReadError(ex);
            if (options.useDefault) {
              return options.defaultFunc();
            }
          }
          throw ex;
        }
        result.typeReadError(void 0);
        return internalValue;
      },
      write: function(externalValue) {
        var error, ex;
        try {
          if (typeCheck(externalValue)) {
            target(externalValue);
          } else {
            throw new TypeError("Unexpected external type. Expected " + typeName + ", received " + (isAn(externalValue)));
          }
        } catch (error) {
          ex = error;
          if (ex instanceof TypeError) {
            result.typeWriteError(ex);
            if (options.noThrow) {
              return;
            }
          }
          throw ex;
        }
        return result.typeWriteError(void 0);
      }
    });
    result.typeName = typeName;
    result.typeNames = typeNames;
    result.typeCheck = typeCheck;
    result.typeChecks = typeChecks;
    result.typeWriteError = ko.observable();
    result.typeReadError = ko.observable();
    validate(result, options);
    if (options.pure && !options.deferEvaluation) {
      result();
    }
    return result;
  };
  ko.extenders.type.options = {
    validate: true,
    message: void 0,
    noThrow: false,
    useDefault: false,
    pure: true,
    deferEvaluation: true
  };
  ko.extenders.convert = function(target, options) {
    var result;
    (function() {
      var checkParent, extTypeName, extTypeOptions, finalOptions, i, intTypeName, intTypeOptions, j, len, len1, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7;
      if (isAn.String(options) || isAn.Array(options)) {
        options = {
          type: options
        };
      }
      options = ko.utils.extend(ko.utils.extend({}, ko.extenders.convert.options), options);
      finalOptions = {
        checkSelf: (ref = options.check) != null ? ref : function() {
          return true;
        },
        read: options.read,
        write: options.write,
        checks: {},
        checkers: [],
        isTyped: isTyped(target),
        ignoreDefaultConverters: options.ignoreDefaultConverters,
        pure: options.pure,
        deferEvaluation: options.deferEvaluation,
        defaultFunc: options.defaultFunc,
        noThrow: options.noThrow,
        message: options.message,
        useDefault: options.useDefault
      };
      if (finalOptions.useDefault && (options.defaultFunc == null)) {
        finalOptions["default"] = options["default"];
        finalOptions.defaultFunc = function() {
          return finalOptions["default"];
        };
      }
      finalOptions.checkers.push(finalOptions.checkSelf);
      finalOptions.types = typeNameToArray(options.type);
      for (extTypeName in options) {
        if (!hasProp.call(options, extTypeName)) continue;
        if (!isValidTypeName(extTypeName)) {
          continue;
        }
        if (finalOptions.types.indexOf(extTypeName) === -1) {
          finalOptions.types.push(extTypeName);
        }
      }
      ref1 = finalOptions.types;
      for (i = 0, len = ref1.length; i < len; i++) {
        extTypeName = ref1[i];
        extTypeOptions = (ref2 = options[extTypeName]) != null ? ref2 : {};
        finalOptions[extTypeName] = {
          checkSelf: (ref3 = (ref4 = extTypeOptions.check) != null ? ref4 : isAn(extTypeName, {
            returnChecker: true
          })) != null ? ref3 : function() {
            return true;
          },
          read: extTypeOptions.read,
          write: extTypeOptions.write,
          types: typeNameToArray(extTypeOptions.type)
        };
        checkParent = finalOptions.checkSelf;
        finalOptions.checkers.push(finalOptions[extTypeName].checkSelf);
        finalOptions.checks[extTypeName] = finalOptions[extTypeName].check = (function(extTypeName) {
          return function(value) {
            return finalOptions.checkSelf(value) && finalOptions[extTypeName].checkSelf(value);
          };
        })(extTypeName);
        for (intTypeName in extTypeOptions) {
          if (!hasProp.call(extTypeOptions, intTypeName)) continue;
          if (!isValidTypeName(intTypeName)) {
            continue;
          }
          if (finalOptions[extTypeName].types.indexOf(intTypeName) === -1) {
            finalOptions[extTypeName].types.push(intTypeName);
          }
        }
        ref5 = finalOptions[extTypeName].types;
        for (j = 0, len1 = ref5.length; j < len1; j++) {
          intTypeName = ref5[j];
          intTypeOptions = (ref6 = (ref7 = options[extTypeName]) != null ? ref7[intTypeName] : void 0) != null ? ref6 : {};
          finalOptions[extTypeName][intTypeName] = {
            checkSelf: intTypeOptions.check,
            read: intTypeOptions.read,
            write: intTypeOptions.write
          };
          if (finalOptions[extTypeName][intTypeName].checkSelf == null) {
            finalOptions[extTypeName][intTypeName].check = finalOptions[extTypeName][intTypeName].checkSelf = finalOptions[extTypeName].checkSelf;
          } else {
            finalOptions[extTypeName][intTypeName].check = (function(extTypeName, intTypeName) {
              return function(value) {
                return finalOptions[extTypeName].check(value) && finalOptions[extTypeName][intTypeName].checkSelf(value);
              };
            })(extTypeName, intTypeName);
          }
        }
        finalOptions[extTypeName].type = typeNameToString(finalOptions[extTypeName].types);
      }
      finalOptions.type = typeNameToString(finalOptions.types);
      finalOptions.check = function(value) {
        return finalOptions.checkSelf(value) && ((finalOptions.checkers.length === 0) || finalOptions.checkers.some(function(checker) {
          return checker(value);
        }));
      };
      return options = finalOptions;
    })();
    result = ko.computed({
      pure: options.pure,
      deferEvaluation: options.deferEvaluation,
      read: function() {
        var base, error, ex, extTypeName, extTypeOptions, externalValue, i, intTypeName, intTypeNames, intTypeOptions, internalValue, j, k, len, len1, len2, ref, ref1, ref2, tryRead;
        try {
          internalValue = target();
          externalValue = void 0;
          tryRead = function(convert, options) {
            var error, ex;
            if (convert != null) {
              try {
                externalValue = convert(internalValue, options);
              } catch (error) {
                ex = error;
                if (!(ex instanceof TypeError)) {
                  throw ex;
                }
              }
              if (ex == null) {
                return true;
              }
            }
            return false;
          };
          ref = options.types;
          for (i = 0, len = ref.length; i < len; i++) {
            extTypeName = ref[i];
            extTypeOptions = options[extTypeName];
            intTypeNames = extTypeOptions.types;
            if (intTypeNames.length === 0 && (extTypeOptions.read == null)) {
              if (options.isTyped) {
                intTypeNames = target.typeNames;
              } else {
                intTypeNames = [isAn(internalValue)];
              }
            }
            for (j = 0, len1 = intTypeNames.length; j < len1; j++) {
              intTypeName = intTypeNames[j];
              if (options.isTyped) {
                if (!(typeof (base = target.typeChecks)[intTypeName] === "function" ? base[intTypeName](internalValue) : void 0)) {
                  continue;
                }
              } else {
                if (!isAn(internalValue, intTypeName)) {
                  continue;
                }
              }
              intTypeOptions = (ref1 = extTypeOptions[intTypeName]) != null ? ref1 : {
                check: extTypeOptions.check
              };
              if (tryRead(intTypeOptions.read, intTypeOptions.readOptions)) {
                if (intTypeOptions.check(externalValue)) {
                  return externalValue;
                }
              }
              if (extTypeName === intTypeName) {
                if (intTypeOptions.check(internalValue)) {
                  externalValue = internalValue;
                  return externalValue;
                }
              }
              if (!options.ignoreDefaultConverters) {
                if (tryRead(ko.typed.getConverter(intTypeName, extTypeName), intTypeOptions.readOptions)) {
                  if (intTypeOptions.check(externalValue)) {
                    return externalValue;
                  }
                }
              }
            }
          }
          ref2 = options.types;
          for (k = 0, len2 = ref2.length; k < len2; k++) {
            extTypeName = ref2[k];
            extTypeOptions = options[extTypeName];
            if (tryRead(extTypeOptions.read, extTypeOptions.readOptions)) {
              if (extTypeOptions.check(externalValue)) {
                return externalValue;
              }
            }
          }
          if (tryRead(options.read, options.readOptions)) {
            if (options.check(externalValue)) {
              return externalValue;
            }
          }
          if (options.types.length === 0) {
            if (options.check(externalValue)) {
              externalValue = internalValue;
              return externalValue;
            }
          }
          if (options.type != null) {
            throw new TypeError("Unable to convert from internal type " + (isAn(internalValue)) + " to external type " + options.type);
          } else {
            throw new TypeError("Unable to convert from internal type " + (isAn(internalValue)));
          }
        } catch (error) {
          ex = error;
          if (ex instanceof TypeError) {
            result.typeReadError(ex);
            if (options.useDefault) {
              return options.defaultFunc();
            }
          }
          throw ex;
        } finally {
          if (ex == null) {
            result.typeReadError(void 0);
          }
        }
      },
      write: function(externalValue) {
        var error, ex, extTypeName, extTypeOptions, i, intTypeName, intTypeNames, intTypeOptions, j, k, len, len1, len2, ref, ref1, ref2, tryWrite;
        try {
          tryWrite = function(convert, options) {
            var error, ex, internalValue;
            if (convert != null) {
              try {
                internalValue = convert(externalValue, options);
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
          ref = options.types;
          for (i = 0, len = ref.length; i < len; i++) {
            extTypeName = ref[i];
            extTypeOptions = options[extTypeName];
            if (!extTypeOptions.check(externalValue)) {
              continue;
            }
            intTypeNames = extTypeOptions.types;
            if (intTypeNames.length === 0 && (extTypeOptions.write == null)) {
              if (options.isTyped) {
                intTypeNames = target.typeNames;
              } else {
                intTypeNames = [isAn(externalValue)];
              }
            }
            for (j = 0, len1 = intTypeNames.length; j < len1; j++) {
              intTypeName = intTypeNames[j];
              intTypeOptions = (ref1 = extTypeOptions[intTypeName]) != null ? ref1 : {};
              if ((intTypeOptions.check != null) && !intTypeOptions.check(externalValue)) {
                continue;
              }
              if (tryWrite(intTypeOptions.write, intTypeOptions.writeOptions)) {
                return;
              }
              if (extTypeName === intTypeName) {
                target(externalValue);
                return;
              }
              if (!options.ignoreDefaultConverters) {
                if (tryWrite(ko.typed.getConverter(extTypeName, intTypeName), intTypeOptions.writeOptions)) {
                  return;
                }
              }
            }
          }
          ref2 = options.types;
          for (k = 0, len2 = ref2.length; k < len2; k++) {
            extTypeName = ref2[k];
            extTypeOptions = options[extTypeName];
            if (!extTypeOptions.check(externalValue)) {
              continue;
            }
            if (tryWrite(extTypeOptions.write, extTypeOptions.writeOptions)) {
              return;
            }
          }
          if (options.check(externalValue)) {
            if (tryWrite(options.write, options.writeOptions)) {
              return;
            }
            if (options.types.length === 0) {
              target(externalValue);
              return;
            }
          }
          if (options.isTyped) {
            throw new TypeError("Unable to convert from external type " + (isAn(externalValue)) + " to internal type " + target.typeName);
          } else {
            throw new TypeError("Unable to convert from external type " + (isAn(externalValue)));
          }
        } catch (error) {
          ex = error;
          if (ex instanceof TypeError) {
            result.typeWriteError(ex);
            if (options.noThrow) {
              return;
            }
          }
          throw ex;
        } finally {
          if (ex == null) {
            result.typeWriteError(void 0);
          }
        }
      }
    });
    result.typeName = options.type;
    result.typeNames = options.types;
    result.typeCheck = options.check;
    result.typeChecks = options.checks;
    result.typeReadError = ko.observable();
    result.typeWriteError = ko.observable();
    validate(result, options);
    if (options.pure && !options.deferEvaluation) {
      result();
    }
    return result;
  };
  ko.extenders.convert.options = {
    validate: true,
    message: void 0,
    noThrow: false,
    pure: true,
    deferEvaluation: true
  };
  ko.typed = {};
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
            if ((options != null) && !isAn.Object(options)) {
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
    if (Math.round10 == null) {
      Math.round10 = function(value, exp) {
        return decimalAdjust(Math.round, value, exp);
      };
    }
    if (Math.floor10 == null) {
      Math.floor10 = function(value, exp) {
        return decimalAdjust(Math.floor, value, exp);
      };
    }
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
    strict: false,
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
    if (typeof options.mode === 'string') {
      mode = Math[options.mode];
    } else {
      mode = options.mode;
    }
    return mode(value);
  }, {
    mode: 'round'
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
    var date;
    if (options.trim) {
      value = value.trim();
    }
    date = new Date(value);
    if (isNaN(date.valueOf())) {
      throw TypeError("Unable to convert from " + value + " to Date");
    }
    return date;
  }, {
    trim: false
  });
  ko.typed.addConverter('String', 'Moment', function(value, options) {
    var result;
    if (options.trim) {
      value = value.trim();
    }
    result = (typeof moment !== "undefined" && moment !== null ? moment : require('moment'))(value, options.format, options.language, options.strict);
    if (!result.isValid()) {
      throw new TypeError("Unable to convert from " + value + " to Moment");
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
    return new Date('');
  });
  ko.typed.addConverter('Undefined', 'String', function(value) {
    return '';
  });
  ko.typed.addConverter('Undefined', 'Moment', function(value) {
    return require('moment')('');
  });
  return ko;
};

applyKotr(ko);

return ko;
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtvLXR5cGVkLmFwcGxpZWQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7T0FBQSxJQUFBLFNBQUE7RUFBQTs7QUFBQSxTQUFBLEdBQVksU0FBQyxFQUFEO0FBR1YsTUFBQTtFQUFBLGdCQUFBLEdBQW1CLFNBQUMsS0FBRDtJQUNqQixJQUFPLGVBQUosSUFBYyxLQUFLLENBQUMsTUFBTixLQUFnQixDQUFqQztBQUNFLGFBQU8sT0FEVDtLQUFBLE1BRUssSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsS0FBcEIsQ0FBSDtBQUNILGFBQU8sTUFESjtLQUFBLE1BQUE7QUFHSCxhQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBWCxFQUhKOztFQUhZO0VBUW5CLGVBQUEsR0FBa0IsU0FBQyxLQUFEO0lBQ2hCLEtBQUEsR0FBUSxnQkFBQSxDQUFpQixLQUFqQjtJQUNSLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLEtBQXBCLENBQUg7QUFDRSxhQUFPLEtBQUssQ0FBQyxLQUFOLENBQVksR0FBWixFQURUO0tBQUEsTUFBQTtBQUdFLGFBQU8sR0FIVDs7RUFGZ0I7RUFPbEIsZUFBQSxHQUFrQixTQUFDLEtBQUQ7QUFDaEIsV0FBTyxRQUFRLENBQUMsSUFBVCxDQUFjLEtBQWQ7RUFEUztFQUdsQixPQUFBLEdBQVUsU0FBQyxLQUFEO0FBQ1IsV0FBTyxJQUFJLENBQUMsUUFBTCxDQUFjLEtBQWQsQ0FBQSxJQUF5Qix3QkFBekIsSUFBNkMseUJBQTdDLElBQWtFLHlCQUFsRSxJQUF1RjtFQUR0RjtFQUdWLFFBQUEsR0FBVyxTQUFDLE1BQUQsRUFBUyxPQUFUO0FBQ1QsUUFBQTtJQUFBLElBQUcsQ0FBSSxPQUFPLENBQUMsUUFBZjtBQUNFLGFBREY7O0lBR0EsSUFBQSxHQUFPO0lBRVAsVUFBQSxHQUFhLFNBQUE7QUFFWCxVQUFBO01BQUEsSUFBRyx1QkFBQSxJQUFtQixFQUFFLENBQUMsVUFBVSxDQUFDLEtB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LEVBQUw7RUFEYixDQUhGO0VBT0EsRUFBRSxDQUFDLEtBQUssQ0FBQyxZQUFULENBQ0UsV0FERixFQUVFLFFBRkYsRUFHRSxTQUFDLEtBQUQ7QUFDRSxXQUFPO0VBRFQsQ0FIRjtFQU9BLEVBQUUsQ0FBQyxLQUFLLENBQUMsWUFBVCxDQUNFLFdBREYsRUFFRSxRQUZGLEVBR0UsU0FBQyxLQUFEO0FBQ0UsV0FBTyxPQUFBLENBQVEsUUFBUixDQUFBLENBQWtCLEVBQWxCO0VBRFQsQ0FIRjtBQU9BLFNBQU87QUEvNkJHOztBQWk3QlosU0FBQSxDQUFVLEVBQVYiLCJmaWxlIjoia28tdHlwZWQuYXBwbGllZC53ZWIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJhcHBseUtvdHIgPSAoa28pIC0+XHJcblxyXG5cclxuICB0eXBlTmFtZVRvU3RyaW5nID0gKHZhbHVlKSAtPlxyXG4gICAgaWYgbm90IHZhbHVlPyBvciB2YWx1ZS5sZW5ndGggPT0gMFxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXHJcbiAgICBlbHNlIGlmIGlzQW4uU3RyaW5nLkxpdGVyYWwodmFsdWUpXHJcbiAgICAgIHJldHVybiB2YWx1ZVxyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm4gdmFsdWUuam9pbignfCcpXHJcblxyXG4gIHR5cGVOYW1lVG9BcnJheSA9ICh2YWx1ZSkgLT5cclxuICAgIHZhbHVlID0gdHlwZU5hbWVUb1N0cmluZyh2YWx1ZSlcclxuICAgIGlmIGlzQW4uU3RyaW5nLkxpdGVyYWwodmFsdWUpXHJcbiAgICAgIHJldHVybiB2YWx1ZS5zcGxpdCgnfCcpXHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVybiBbXVxyXG5cclxuICBpc1ZhbGlkVHlwZU5hbWUgPSAodmFsdWUpIC0+XHJcbiAgICByZXR1cm4gL15bQS1aXS8udGVzdCh2YWx1ZSlcclxuXHJcbiAgaXNUeXBlZCA9ICh2YWx1ZSkgLT5cclxuICAgIHJldHVybiBpc0FuLkZ1bmN0aW9uKHZhbHVlKSBhbmQgdmFsdWUudHlwZU5hbWU/IGFuZCB2YWx1ZS50eXBlTmFtZXM/IGFuZCB2YWx1ZS50eXBlQ2hlY2s/IGFuZCB2YWx1ZS50eXBlQ2hlY2tzP1xyXG5cclxuICB2YWxpZGF0ZSA9ICh0YXJnZXQsIG9wdGlvbnMpIC0+XHJcbiAgICBpZiBub3Qgb3B0aW9ucy52YWxpZGF0ZVxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBydWxlID0gdW5kZWZpbmVkXHJcblxyXG4gICAgZXJyb3JDaGVjayA9ICgpIC0+XHJcbiAgICAgICMgVHJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9Lbm9ja291dC1Db250cmliL0tub2Nrb3V0LVZhbGlkYXRpb25cclxuICAgICAgaWYga28udmFsaWRhdGlvbj8gYW5kIGtvLnZhbGlkYXRpb24udXRpbHMuaXNWYWxpZGF0YWJsZSh0YXJnZXQpXHJcbiAgICAgICAgbWVzc2FnZSA9IG9wdGlvbnMubWVzc2FnZSA/ICh0YXJnZXQudHlwZVdyaXRlRXJyb3IoKSA/IHRhcmdldC50eXBlUmVhZEVycm9yKCkpPy5tZXNzYWdlXHJcbiAgICAgICAgaWYgbm90IHJ1bGU/XHJcbiAgICAgICAgICBydWxlID0ge1xyXG4gICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlXHJcbiAgICAgICAgICAgIHZhbGlkYXRvcjogKCkgLT5cclxuICAgICAgICAgICAgICBub3QgdGFyZ2V0LnR5cGVXcml0ZUVycm9yKCk/IGFuZCBub3QgdGFyZ2V0LnR5cGVSZWFkRXJyb3IoKT9cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGtvLnZhbGlkYXRpb24uYWRkQW5vbnltb3VzUnVsZSh0YXJnZXQsIHJ1bGUpXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgcnVsZS5tZXNzYWdlID0gbWVzc2FnZVxyXG4gICAgICAgICAgdGFyZ2V0LnJ1bGVzLnZhbHVlSGFzTXV0YXRlZCgpXHJcblxyXG4gICAgdGFyZ2V0LnR5cGVXcml0ZUVycm9yLnN1YnNjcmliZShlcnJvckNoZWNrKVxyXG4gICAgdGFyZ2V0LnR5cGVSZWFkRXJyb3Iuc3Vic2NyaWJlKGVycm9yQ2hlY2spXHJcblxyXG4gICAgaWYga28udmFsaWRhdGlvbj9cclxuICAgICAgdGFyZ2V0LmV4dGVuZCh7IHZhbGlkYXRhYmxlOiB0cnVlIH0pXHJcblxyXG4gICAgaWYgbm90IG9wdGlvbnMuZGVmZXJFdmFsdWF0aW9uXHJcbiAgICAgIGVycm9yQ2hlY2soKVxyXG5cclxuICBrby5leHRlbmRlcnMudHlwZSA9ICh0YXJnZXQsIG9wdGlvbnMpIC0+XHJcbiAgICAjIFJlcXVpcmVzXHJcbiAgICAjIHR5cGVOYW1lIDogU3RyaW5nXHJcbiAgICAjIHR5cGVOYW1lcyA6IEFycmF5IG9mIFN0cmluZ1xyXG4gICAgIyB0eXBlQ2hlY2sgOiBmdW5jdGlvbiAodmFsdWUpIHsgLi4uIH1cclxuICAgICMgdHlwZUNoZWNrcyA6IHsgdHlwZU5hbWU6IGZ1bmN0aW9uIGlzVHlwZSh2YWx1ZSkgeyAuLi4gfSwgLi4uIH1cclxuXHJcbiAgICBpZiBpc0FuLlN0cmluZy5MaXRlcmFsKG9wdGlvbnMpIG9yIGlzQW4uQXJyYXkob3B0aW9ucylcclxuICAgICAgIyAuZXh0ZW5kKHsgdHlwZTogJ1R5cGVOYW1lfFR5cGVOYW1lfFR5cGVOYW1lJyB9KVxyXG4gICAgICAjIC5leHRlbmQoeyB0eXBlOiBbJ1R5cGVOYW1lJywnVHlwZU5hbWUnLC4uLl0gfSlcclxuICAgICAgb3B0aW9ucyA9IHsgdHlwZTogb3B0aW9ucyB9XHJcbiAgICBlbHNlIGlmIGlzQW4uRnVuY3Rpb24ob3B0aW9ucylcclxuICAgICAgIyAuZXh0ZW5kKHsgdHlwZTogZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB0cnVlfGZhbHNlOyB9IH0pXHJcbiAgICAgIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgdHlwZTogb3B0aW9ucy50eXBlTmFtZVxyXG4gICAgICAgIGNoZWNrOiBvcHRpb25zXHJcbiAgICAgIH1cclxuXHJcbiAgICBvcHRpb25zID0ga28udXRpbHMuZXh0ZW5kKGtvLnV0aWxzLmV4dGVuZCh7fSwga28uZXh0ZW5kZXJzLnR5cGUub3B0aW9ucyksIG9wdGlvbnMpXHJcblxyXG4gICAgaWYgb3B0aW9ucy51c2VEZWZhdWx0IGFuZCBub3Qgb3B0aW9ucy5kZWZhdWx0RnVuYz9cclxuICAgICAgb3B0aW9ucy5kZWZhdWx0RnVuYyA9ICgpIC0+IG9wdGlvbnMuZGVmYXVsdFxyXG5cclxuICAgICMgR2F0aGVyIHR5cGUgbmFtZXNcclxuICAgIHR5cGVOYW1lcyA9IHR5cGVOYW1lVG9BcnJheShvcHRpb25zLnR5cGUpXHJcblxyXG4gICAgZG8gLT5cclxuICAgICAgZm9yIG93biBuYW1lLCBjaGVjayBvZiBvcHRpb25zXHJcbiAgICAgICAgaWYgbm90IGlzVmFsaWRUeXBlTmFtZShuYW1lKVxyXG4gICAgICAgICAgY29udGludWVcclxuICAgICAgICBpZiB0eXBlTmFtZXMuaW5kZXhPZihuYW1lKSA9PSAtMVxyXG4gICAgICAgICAgdHlwZU5hbWVzLnB1c2gobmFtZSlcclxuXHJcbiAgICB0eXBlTmFtZSA9IHR5cGVOYW1lVG9TdHJpbmcodHlwZU5hbWVzKVxyXG5cclxuICAgICMgY2hlY2tzXHJcbiAgICB0eXBlQ2hlY2tzID0ge31cclxuICAgIGRvIC0+XHJcbiAgICAgIGZvciBuYW1lIGluIHR5cGVOYW1lc1xyXG4gICAgICAgIHR5cGVDaGVja3NbbmFtZV0gPSBvcHRpb25zW25hbWVdID8gaXNBbihuYW1lLCB7IHJldHVybkNoZWNrZXI6IHRydWUgfSlcclxuXHJcbiAgICAjIGNoZWNrXHJcbiAgICB0eXBlQ2hlY2sgPSBkbyAtPlxyXG4gICAgICBfY2hlY2sgPSBvcHRpb25zLmNoZWNrID8gKCgpIC0+IHRydWUpXHJcbiAgICAgIHJldHVybiAodmFsdWUpIC0+XHJcbiAgICAgICAgX2NoZWNrKHZhbHVlKSBhbmQgKCh0eXBlTmFtZXMubGVuZ3RoID09IDApIG9yICh0eXBlTmFtZXMuc29tZSgobmFtZSkgLT4gdHlwZUNoZWNrc1tuYW1lXSh2YWx1ZSkpKSlcclxuXHJcbiAgICByZXN1bHQgPSBrby5jb21wdXRlZCh7XHJcbiAgICAgIHB1cmU6IG9wdGlvbnMucHVyZVxyXG4gICAgICBkZWZlckV2YWx1YXRpb246IG9wdGlvbnMuZGVmZXJFdmFsdWF0aW9uXHJcblxyXG4gICAgICByZWFkOiAoKSAtPlxyXG4gICAgICAgIHRyeVxyXG4gICAgICAgICAgaW50ZXJuYWxWYWx1ZSA9IHRhcmdldCgpXHJcblxyXG4gICAgICAgICAgaWYgbm90IHR5cGVDaGVjayhpbnRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5leHBlY3RlZCBpbnRlcm5hbCB0eXBlLiBFeHBlY3RlZCAje3R5cGVOYW1lfSwgZ290ICN7aXNBbihpbnRlcm5hbFZhbHVlKX1cIilcclxuXHJcbiAgICAgICAgY2F0Y2ggZXhcclxuICAgICAgICAgIGlmIGV4IGluc3RhbmNlb2YgVHlwZUVycm9yXHJcbiAgICAgICAgICAgIHJlc3VsdC50eXBlUmVhZEVycm9yKGV4KVxyXG5cclxuICAgICAgICAgICAgaWYgb3B0aW9ucy51c2VEZWZhdWx0XHJcbiAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZGVmYXVsdEZ1bmMoKVxyXG5cclxuICAgICAgICAgIHRocm93IGV4XHJcblxyXG4gICAgICAgIHJlc3VsdC50eXBlUmVhZEVycm9yKHVuZGVmaW5lZClcclxuICAgICAgICByZXR1cm4gaW50ZXJuYWxWYWx1ZVxyXG5cclxuICAgICAgd3JpdGU6IChleHRlcm5hbFZhbHVlKSAtPlxyXG4gICAgICAgIHRyeVxyXG4gICAgICAgICAgaWYgdHlwZUNoZWNrKGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgIHRhcmdldChleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5leHBlY3RlZCBleHRlcm5hbCB0eXBlLiBFeHBlY3RlZCAje3R5cGVOYW1lfSwgcmVjZWl2ZWQgI3tpc0FuKGV4dGVybmFsVmFsdWUpfVwiKVxyXG4gICAgICAgIGNhdGNoIGV4XHJcbiAgICAgICAgICBpZiBleCBpbnN0YW5jZW9mIFR5cGVFcnJvclxyXG4gICAgICAgICAgICByZXN1bHQudHlwZVdyaXRlRXJyb3IoZXgpXHJcblxyXG4gICAgICAgICAgICBpZiBvcHRpb25zLm5vVGhyb3dcclxuICAgICAgICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgICAgICB0aHJvdyBleFxyXG5cclxuICAgICAgICByZXN1bHQudHlwZVdyaXRlRXJyb3IodW5kZWZpbmVkKVxyXG4gICAgfSlcclxuXHJcbiAgICByZXN1bHQudHlwZU5hbWUgPSB0eXBlTmFtZVxyXG4gICAgcmVzdWx0LnR5cGVOYW1lcyA9IHR5cGVOYW1lc1xyXG4gICAgcmVzdWx0LnR5cGVDaGVjayA9IHR5cGVDaGVja1xyXG4gICAgcmVzdWx0LnR5cGVDaGVja3MgPSB0eXBlQ2hlY2tzXHJcblxyXG4gICAgcmVzdWx0LnR5cGVXcml0ZUVycm9yID0ga28ub2JzZXJ2YWJsZSgpXHJcbiAgICByZXN1bHQudHlwZVJlYWRFcnJvciA9IGtvLm9ic2VydmFibGUoKVxyXG5cclxuICAgIHZhbGlkYXRlKHJlc3VsdCwgb3B0aW9ucylcclxuXHJcbiAgICBpZiBvcHRpb25zLnB1cmUgYW5kIG5vdCBvcHRpb25zLmRlZmVyRXZhbHVhdGlvblxyXG4gICAgICAjIGZvcmNlIGltbWVkaWF0ZSByZWFkXHJcbiAgICAgIHJlc3VsdCgpXHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG5cclxuICBrby5leHRlbmRlcnMudHlwZS5vcHRpb25zID0ge1xyXG4gICAgdmFsaWRhdGU6IHRydWVcclxuICAgIG1lc3NhZ2U6IHVuZGVmaW5lZFxyXG4gICAgbm9UaHJvdzogZmFsc2VcclxuICAgIHVzZURlZmF1bHQ6IGZhbHNlXHJcbiAgICAjIGRlZmF1bHRcclxuICAgICMgZGVmYXVsdEZ1bmNcclxuICAgIHB1cmU6IHRydWVcclxuICAgIGRlZmVyRXZhbHVhdGlvbjogdHJ1ZVxyXG4gIH1cclxuXHJcblxyXG4gIGtvLmV4dGVuZGVycy5jb252ZXJ0ID0gKHRhcmdldCwgb3B0aW9ucykgLT5cclxuICAgICMgbm9ybWFsaXplIG9wdGlvbnNcclxuICAgIGRvIC0+XHJcbiAgICAgIGlmIGlzQW4uU3RyaW5nKG9wdGlvbnMpIG9yIGlzQW4uQXJyYXkob3B0aW9ucylcclxuICAgICAgICBvcHRpb25zID0geyB0eXBlOiBvcHRpb25zIH1cclxuXHJcbiAgICAgICMgbWVyZ2Ugb3B0aW9uc1xyXG4gICAgICBvcHRpb25zID0ga28udXRpbHMuZXh0ZW5kKGtvLnV0aWxzLmV4dGVuZCh7fSwga28uZXh0ZW5kZXJzLmNvbnZlcnQub3B0aW9ucyksIG9wdGlvbnMpXHJcblxyXG4gICAgICBmaW5hbE9wdGlvbnMgPSB7XHJcbiAgICAgICAgY2hlY2tTZWxmOiBvcHRpb25zLmNoZWNrID8gKCkgLT4gdHJ1ZVxyXG4gICAgICAgIHJlYWQ6IG9wdGlvbnMucmVhZFxyXG4gICAgICAgIHdyaXRlOiBvcHRpb25zLndyaXRlXHJcbiAgICAgICAgY2hlY2tzOiB7fVxyXG4gICAgICAgIGNoZWNrZXJzOiBbXVxyXG4gICAgICAgIGlzVHlwZWQ6IGlzVHlwZWQodGFyZ2V0KVxyXG4gICAgICAgIGlnbm9yZURlZmF1bHRDb252ZXJ0ZXJzOiBvcHRpb25zLmlnbm9yZURlZmF1bHRDb252ZXJ0ZXJzXHJcbiAgICAgICAgcHVyZTogb3B0aW9ucy5wdXJlXHJcbiAgICAgICAgZGVmZXJFdmFsdWF0aW9uOiBvcHRpb25zLmRlZmVyRXZhbHVhdGlvblxyXG4gICAgICAgIGRlZmF1bHRGdW5jOiBvcHRpb25zLmRlZmF1bHRGdW5jXHJcbiAgICAgICAgbm9UaHJvdzogb3B0aW9ucy5ub1Rocm93XHJcbiAgICAgICAgbWVzc2FnZTogb3B0aW9ucy5tZXNzYWdlXHJcbiAgICAgICAgdXNlRGVmYXVsdDogb3B0aW9ucy51c2VEZWZhdWx0XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIGZpbmFsT3B0aW9ucy51c2VEZWZhdWx0IGFuZCBub3Qgb3B0aW9ucy5kZWZhdWx0RnVuYz9cclxuICAgICAgICBmaW5hbE9wdGlvbnMuZGVmYXVsdCA9IG9wdGlvbnMuZGVmYXVsdFxyXG4gICAgICAgIGZpbmFsT3B0aW9ucy5kZWZhdWx0RnVuYyA9ICgpIC0+IGZpbmFsT3B0aW9ucy5kZWZhdWx0XHJcblxyXG4gICAgICBmaW5hbE9wdGlvbnMuY2hlY2tlcnMucHVzaChmaW5hbE9wdGlvbnMuY2hlY2tTZWxmKVxyXG5cclxuICAgICAgIyBHYXRoZXIgYWxsIGV4dGVybmFsIHR5cGVzXHJcbiAgICAgIGZpbmFsT3B0aW9ucy50eXBlcyA9IHR5cGVOYW1lVG9BcnJheShvcHRpb25zLnR5cGUpXHJcbiAgICAgIGZvciBvd24gZXh0VHlwZU5hbWUgb2Ygb3B0aW9uc1xyXG4gICAgICAgIGlmIG5vdCBpc1ZhbGlkVHlwZU5hbWUoZXh0VHlwZU5hbWUpXHJcbiAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAjIEFkZCBleHRlcm5hbCB0eXBlXHJcbiAgICAgICAgaWYgZmluYWxPcHRpb25zLnR5cGVzLmluZGV4T2YoZXh0VHlwZU5hbWUpID09IC0xXHJcbiAgICAgICAgICBmaW5hbE9wdGlvbnMudHlwZXMucHVzaChleHRUeXBlTmFtZSlcclxuXHJcbiAgICAgICMgRXhwYW5kIGVhY2ggRXh0ZXJuYWwgVHlwZVxyXG4gICAgICBmb3IgZXh0VHlwZU5hbWUgaW4gZmluYWxPcHRpb25zLnR5cGVzXHJcbiAgICAgICAgZXh0VHlwZU9wdGlvbnMgPSBvcHRpb25zW2V4dFR5cGVOYW1lXSA/IHt9XHJcblxyXG4gICAgICAgIGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV0gPSB7XHJcbiAgICAgICAgICBjaGVja1NlbGY6IGV4dFR5cGVPcHRpb25zLmNoZWNrID8gaXNBbihleHRUeXBlTmFtZSwgeyByZXR1cm5DaGVja2VyOiB0cnVlIH0pID8gKCkgLT4gdHJ1ZVxyXG4gICAgICAgICAgcmVhZDogZXh0VHlwZU9wdGlvbnMucmVhZFxyXG4gICAgICAgICAgd3JpdGU6IGV4dFR5cGVPcHRpb25zLndyaXRlXHJcbiAgICAgICAgICB0eXBlczogdHlwZU5hbWVUb0FycmF5KGV4dFR5cGVPcHRpb25zLnR5cGUpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjaGVja1BhcmVudCA9IGZpbmFsT3B0aW9ucy5jaGVja1NlbGZcclxuICAgICAgICBmaW5hbE9wdGlvbnMuY2hlY2tlcnMucHVzaChmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdLmNoZWNrU2VsZilcclxuICAgICAgICBmaW5hbE9wdGlvbnMuY2hlY2tzW2V4dFR5cGVOYW1lXSA9IGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV0uY2hlY2sgPSBkbyAoZXh0VHlwZU5hbWUpIC0+XHJcbiAgICAgICAgICAodmFsdWUpIC0+IGZpbmFsT3B0aW9ucy5jaGVja1NlbGYodmFsdWUpIGFuZCBmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdLmNoZWNrU2VsZih2YWx1ZSlcclxuXHJcbiAgICAgICAgIyBHYXRoZXIgYWxsIGludGVybmFsIHR5cGVzXHJcbiAgICAgICAgZm9yIG93biBpbnRUeXBlTmFtZSBvZiBleHRUeXBlT3B0aW9uc1xyXG4gICAgICAgICAgaWYgbm90IGlzVmFsaWRUeXBlTmFtZShpbnRUeXBlTmFtZSlcclxuICAgICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgICAgICAjIEFkZCBpbnRlcm5hbCB0eXBlXHJcbiAgICAgICAgICBpZiBmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdLnR5cGVzLmluZGV4T2YoaW50VHlwZU5hbWUpID09IC0xXHJcbiAgICAgICAgICAgIGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV0udHlwZXMucHVzaChpbnRUeXBlTmFtZSlcclxuXHJcbiAgICAgICAgIyBFeHBhbmQgYWxsIGludGVybmFsIHR5cGVzXHJcbiAgICAgICAgZm9yIGludFR5cGVOYW1lIGluIGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV0udHlwZXNcclxuICAgICAgICAgIGludFR5cGVPcHRpb25zID0gb3B0aW9uc1tleHRUeXBlTmFtZV0/W2ludFR5cGVOYW1lXSA/IHt9XHJcblxyXG4gICAgICAgICAgZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXVtpbnRUeXBlTmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGNoZWNrU2VsZjogaW50VHlwZU9wdGlvbnMuY2hlY2tcclxuICAgICAgICAgICAgcmVhZDogaW50VHlwZU9wdGlvbnMucmVhZFxyXG4gICAgICAgICAgICB3cml0ZTogaW50VHlwZU9wdGlvbnMud3JpdGVcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiBub3QgZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXVtpbnRUeXBlTmFtZV0uY2hlY2tTZWxmP1xyXG4gICAgICAgICAgICBmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdW2ludFR5cGVOYW1lXS5jaGVjayA9IGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV1baW50VHlwZU5hbWVdLmNoZWNrU2VsZiA9IGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV0uY2hlY2tTZWxmXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV1baW50VHlwZU5hbWVdLmNoZWNrID0gZG8gKGV4dFR5cGVOYW1lLCBpbnRUeXBlTmFtZSkgLT5cclxuICAgICAgICAgICAgICAodmFsdWUpIC0+IGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV0uY2hlY2sodmFsdWUpIGFuZCBmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdW2ludFR5cGVOYW1lXS5jaGVja1NlbGYodmFsdWUpXHJcblxyXG4gICAgICAgIGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV0udHlwZSA9IHR5cGVOYW1lVG9TdHJpbmcoZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXS50eXBlcylcclxuXHJcbiAgICAgIGZpbmFsT3B0aW9ucy50eXBlID0gdHlwZU5hbWVUb1N0cmluZyhmaW5hbE9wdGlvbnMudHlwZXMpXHJcbiAgICAgIGZpbmFsT3B0aW9ucy5jaGVjayA9ICh2YWx1ZSkgLT5cclxuICAgICAgICBmaW5hbE9wdGlvbnMuY2hlY2tTZWxmKHZhbHVlKSBhbmQgKChmaW5hbE9wdGlvbnMuY2hlY2tlcnMubGVuZ3RoID09IDApIG9yIGZpbmFsT3B0aW9ucy5jaGVja2Vycy5zb21lKChjaGVja2VyKSAtPiBjaGVja2VyKHZhbHVlKSkpXHJcblxyXG4gICAgICBvcHRpb25zID0gZmluYWxPcHRpb25zXHJcblxyXG4gICAgcmVzdWx0ID0ga28uY29tcHV0ZWQoe1xyXG4gICAgICBwdXJlOiBvcHRpb25zLnB1cmVcclxuICAgICAgZGVmZXJFdmFsdWF0aW9uOiBvcHRpb25zLmRlZmVyRXZhbHVhdGlvblxyXG5cclxuICAgICAgcmVhZDogKCkgLT5cclxuICAgICAgICB0cnlcclxuICAgICAgICAgIGludGVybmFsVmFsdWUgPSB0YXJnZXQoKVxyXG4gICAgICAgICAgZXh0ZXJuYWxWYWx1ZSA9IHVuZGVmaW5lZFxyXG5cclxuICAgICAgICAgICMgVHJ5IGV4YWN0IGludGVybmFsIHR5cGUgbWF0Y2hcclxuICAgICAgICAgIHRyeVJlYWQgPSAoY29udmVydCwgb3B0aW9ucykgLT5cclxuICAgICAgICAgICAgaWYgY29udmVydD9cclxuICAgICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgICAgIGV4dGVybmFsVmFsdWUgPSBjb252ZXJ0KGludGVybmFsVmFsdWUsIG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgY2F0Y2ggZXhcclxuICAgICAgICAgICAgICAgIGlmIGV4IG5vdCBpbnN0YW5jZW9mIFR5cGVFcnJvclxyXG4gICAgICAgICAgICAgICAgICB0aHJvdyBleFxyXG5cclxuICAgICAgICAgICAgICBpZiBub3QgZXg/XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgICAgICAgIyBMb29rIGZvciBzcGVjaWZpYyBjb252ZXJzaW9uXHJcbiAgICAgICAgICBmb3IgZXh0VHlwZU5hbWUgaW4gb3B0aW9ucy50eXBlc1xyXG4gICAgICAgICAgICBleHRUeXBlT3B0aW9ucyA9IG9wdGlvbnNbZXh0VHlwZU5hbWVdXHJcblxyXG4gICAgICAgICAgICAjIGdvIGJ5IG91ciBvcmRlclxyXG4gICAgICAgICAgICBpbnRUeXBlTmFtZXMgPSBleHRUeXBlT3B0aW9ucy50eXBlc1xyXG5cclxuICAgICAgICAgICAgaWYgaW50VHlwZU5hbWVzLmxlbmd0aCA9PSAwIGFuZCBub3QgZXh0VHlwZU9wdGlvbnMucmVhZD9cclxuICAgICAgICAgICAgICBpZiBvcHRpb25zLmlzVHlwZWRcclxuICAgICAgICAgICAgICAgICMgZ28gYnkgdGFyZ2V0IG9yZGVyXHJcbiAgICAgICAgICAgICAgICBpbnRUeXBlTmFtZXMgPSB0YXJnZXQudHlwZU5hbWVzXHJcbiAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgIyBnbyBieSBpbmZlcnJlZCBvcmRlclxyXG4gICAgICAgICAgICAgICAgaW50VHlwZU5hbWVzID0gW2lzQW4oaW50ZXJuYWxWYWx1ZSldXHJcblxyXG4gICAgICAgICAgICBmb3IgaW50VHlwZU5hbWUgaW4gaW50VHlwZU5hbWVzXHJcbiAgICAgICAgICAgICAgIyBjaGVjayBpbnRlcm5hbCB0eXBlXHJcbiAgICAgICAgICAgICAgaWYgb3B0aW9ucy5pc1R5cGVkXHJcbiAgICAgICAgICAgICAgICBpZiBub3QgdGFyZ2V0LnR5cGVDaGVja3NbaW50VHlwZU5hbWVdPyhpbnRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGlmIG5vdCBpc0FuKGludGVybmFsVmFsdWUsIGludFR5cGVOYW1lKVxyXG4gICAgICAgICAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAgICAgICAjIGdldCB0aGUgb3B0aW9uc1xyXG4gICAgICAgICAgICAgIGludFR5cGVPcHRpb25zID0gZXh0VHlwZU9wdGlvbnNbaW50VHlwZU5hbWVdID8geyBjaGVjazogZXh0VHlwZU9wdGlvbnMuY2hlY2sgfVxyXG5cclxuICAgICAgICAgICAgICAjIHRyeSBzcGVjaWZpYyBjb252ZXJzaW9uc1xyXG4gICAgICAgICAgICAgIGlmIHRyeVJlYWQoaW50VHlwZU9wdGlvbnMucmVhZCwgaW50VHlwZU9wdGlvbnMucmVhZE9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICBpZiBpbnRUeXBlT3B0aW9ucy5jaGVjayhleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gZXh0ZXJuYWxWYWx1ZVxyXG5cclxuICAgICAgICAgICAgICAjIHRyeSBubyBjb252ZXJzaW9uXHJcbiAgICAgICAgICAgICAgaWYgZXh0VHlwZU5hbWUgPT0gaW50VHlwZU5hbWVcclxuICAgICAgICAgICAgICAgIGlmIGludFR5cGVPcHRpb25zLmNoZWNrKGludGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgICAgIGV4dGVybmFsVmFsdWUgPSBpbnRlcm5hbFZhbHVlXHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBleHRlcm5hbFZhbHVlXHJcblxyXG4gICAgICAgICAgICAgICMgdHJ5IGRlZmF1bHQgY29udmVyc2lvblxyXG4gICAgICAgICAgICAgIGlmIG5vdCBvcHRpb25zLmlnbm9yZURlZmF1bHRDb252ZXJ0ZXJzXHJcbiAgICAgICAgICAgICAgICBpZiB0cnlSZWFkKGtvLnR5cGVkLmdldENvbnZlcnRlcihpbnRUeXBlTmFtZSwgZXh0VHlwZU5hbWUpLCBpbnRUeXBlT3B0aW9ucy5yZWFkT3B0aW9ucylcclxuICAgICAgICAgICAgICAgICAgaWYgaW50VHlwZU9wdGlvbnMuY2hlY2soZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXh0ZXJuYWxWYWx1ZVxyXG5cclxuICAgICAgICAgICMgTG9vayBmb3Igb25lLXNpZGVkIGNvbnZlcnNpb25cclxuICAgICAgICAgIGZvciBleHRUeXBlTmFtZSBpbiBvcHRpb25zLnR5cGVzXHJcbiAgICAgICAgICAgIGV4dFR5cGVPcHRpb25zID0gb3B0aW9uc1tleHRUeXBlTmFtZV1cclxuXHJcbiAgICAgICAgICAgIGlmIHRyeVJlYWQoZXh0VHlwZU9wdGlvbnMucmVhZCwgZXh0VHlwZU9wdGlvbnMucmVhZE9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgaWYgZXh0VHlwZU9wdGlvbnMuY2hlY2soZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBleHRlcm5hbFZhbHVlXHJcblxyXG4gICAgICAgICAgIyBMb29rIGZvciBnZW5lcmljIGNvbnZlcnNpb25cclxuICAgICAgICAgIGlmIHRyeVJlYWQob3B0aW9ucy5yZWFkLCBvcHRpb25zLnJlYWRPcHRpb25zKVxyXG4gICAgICAgICAgICBpZiBvcHRpb25zLmNoZWNrKGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgcmV0dXJuIGV4dGVybmFsVmFsdWVcclxuXHJcbiAgICAgICAgICBpZiBvcHRpb25zLnR5cGVzLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgICAgIGlmIG9wdGlvbnMuY2hlY2soZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICBleHRlcm5hbFZhbHVlID0gaW50ZXJuYWxWYWx1ZVxyXG4gICAgICAgICAgICAgIHJldHVybiBleHRlcm5hbFZhbHVlXHJcblxyXG4gICAgICAgICAgaWYgb3B0aW9ucy50eXBlP1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSBpbnRlcm5hbCB0eXBlICN7aXNBbihpbnRlcm5hbFZhbHVlKX0gdG8gZXh0ZXJuYWwgdHlwZSAje29wdGlvbnMudHlwZX1cIilcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gaW50ZXJuYWwgdHlwZSAje2lzQW4oaW50ZXJuYWxWYWx1ZSl9XCIpXHJcbiAgICAgICAgY2F0Y2ggZXhcclxuICAgICAgICAgIGlmIGV4IGluc3RhbmNlb2YgVHlwZUVycm9yXHJcbiAgICAgICAgICAgIHJlc3VsdC50eXBlUmVhZEVycm9yKGV4KVxyXG5cclxuICAgICAgICAgICAgaWYgb3B0aW9ucy51c2VEZWZhdWx0XHJcbiAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZGVmYXVsdEZ1bmMoKVxyXG5cclxuICAgICAgICAgIHRocm93IGV4XHJcbiAgICAgICAgZmluYWxseVxyXG4gICAgICAgICAgaWYgbm90IGV4P1xyXG4gICAgICAgICAgICByZXN1bHQudHlwZVJlYWRFcnJvcih1bmRlZmluZWQpXHJcblxyXG4gICAgICB3cml0ZTogKGV4dGVybmFsVmFsdWUpIC0+XHJcbiAgICAgICAgdHJ5XHJcbiAgICAgICAgICB0cnlXcml0ZSA9IChjb252ZXJ0LCBvcHRpb25zKSAtPlxyXG4gICAgICAgICAgICBpZiBjb252ZXJ0P1xyXG4gICAgICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICAgICAgaW50ZXJuYWxWYWx1ZSA9IGNvbnZlcnQoZXh0ZXJuYWxWYWx1ZSwgb3B0aW9ucylcclxuICAgICAgICAgICAgICBjYXRjaCBleFxyXG4gICAgICAgICAgICAgICAgaWYgZXggbm90IGluc3RhbmNlb2YgVHlwZUVycm9yXHJcbiAgICAgICAgICAgICAgICAgIHRocm93IGV4XHJcblxyXG4gICAgICAgICAgICAgIGlmIG5vdCBleD9cclxuICAgICAgICAgICAgICAgIHRhcmdldChpbnRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgICAgICMgTG9vayBmb3Igc3BlY2lmaWMgY29udmVyc2lvblxyXG4gICAgICAgICAgZm9yIGV4dFR5cGVOYW1lIGluIG9wdGlvbnMudHlwZXNcclxuICAgICAgICAgICAgZXh0VHlwZU9wdGlvbnMgPSBvcHRpb25zW2V4dFR5cGVOYW1lXVxyXG5cclxuICAgICAgICAgICAgaWYgbm90IGV4dFR5cGVPcHRpb25zLmNoZWNrKGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgICAgICAgICMgZ28gYnkgb3VyIG9yZGVyXHJcbiAgICAgICAgICAgIGludFR5cGVOYW1lcyA9IGV4dFR5cGVPcHRpb25zLnR5cGVzXHJcblxyXG4gICAgICAgICAgICBpZiBpbnRUeXBlTmFtZXMubGVuZ3RoID09IDAgYW5kIG5vdCBleHRUeXBlT3B0aW9ucy53cml0ZT9cclxuICAgICAgICAgICAgICBpZiBvcHRpb25zLmlzVHlwZWRcclxuICAgICAgICAgICAgICAgICMgZ28gYnkgdGFyZ2V0IG9yZGVyXHJcbiAgICAgICAgICAgICAgICBpbnRUeXBlTmFtZXMgPSB0YXJnZXQudHlwZU5hbWVzXHJcbiAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgIyBnbyBieSBpbmZlcnJlZCBvcmRlclxyXG4gICAgICAgICAgICAgICAgaW50VHlwZU5hbWVzID0gW2lzQW4oZXh0ZXJuYWxWYWx1ZSldXHJcblxyXG4gICAgICAgICAgICBmb3IgaW50VHlwZU5hbWUgaW4gaW50VHlwZU5hbWVzXHJcbiAgICAgICAgICAgICAgaW50VHlwZU9wdGlvbnMgPSBleHRUeXBlT3B0aW9uc1tpbnRUeXBlTmFtZV0gPyB7fVxyXG5cclxuICAgICAgICAgICAgICBpZiBpbnRUeXBlT3B0aW9ucy5jaGVjaz8gYW5kIG5vdCBpbnRUeXBlT3B0aW9ucy5jaGVjayhleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgICAgICAgICAgIyB0cnkgc3BlY2lmaWMgY29udmVyc2lvbnNcclxuICAgICAgICAgICAgICBpZiB0cnlXcml0ZShpbnRUeXBlT3B0aW9ucy53cml0ZSwgaW50VHlwZU9wdGlvbnMud3JpdGVPcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgICAgICAgICMgdHJ5IG5vIGNvbnZlcnNpb25cclxuICAgICAgICAgICAgICBpZiBleHRUeXBlTmFtZSA9PSBpbnRUeXBlTmFtZVxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0KGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgICAgICAgICAgIyB0cnkgZGVmYXVsdCBjb252ZXJzaW9uXHJcbiAgICAgICAgICAgICAgaWYgbm90IG9wdGlvbnMuaWdub3JlRGVmYXVsdENvbnZlcnRlcnNcclxuICAgICAgICAgICAgICAgIGlmIHRyeVdyaXRlKGtvLnR5cGVkLmdldENvbnZlcnRlcihleHRUeXBlTmFtZSwgaW50VHlwZU5hbWUpLCBpbnRUeXBlT3B0aW9ucy53cml0ZU9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAgIHJldHVyblxyXG5cclxuICAgICAgICAgICMgTG9vayBmb3Igb25lLXNpZGVkIGNvbnZlcnNpb25cclxuICAgICAgICAgIGZvciBleHRUeXBlTmFtZSBpbiBvcHRpb25zLnR5cGVzXHJcbiAgICAgICAgICAgIGV4dFR5cGVPcHRpb25zID0gb3B0aW9uc1tleHRUeXBlTmFtZV1cclxuXHJcbiAgICAgICAgICAgIGlmIG5vdCBleHRUeXBlT3B0aW9ucy5jaGVjayhleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICAgICAgICBpZiB0cnlXcml0ZShleHRUeXBlT3B0aW9ucy53cml0ZSwgZXh0VHlwZU9wdGlvbnMud3JpdGVPcHRpb25zKVxyXG4gICAgICAgICAgICAgIHJldHVyblxyXG5cclxuICAgICAgICAgICMgTG9vayBmb3IgZ2VuZXJpYyBjb252ZXJzaW9uXHJcbiAgICAgICAgICBpZiBvcHRpb25zLmNoZWNrKGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgIGlmIHRyeVdyaXRlKG9wdGlvbnMud3JpdGUsIG9wdGlvbnMud3JpdGVPcHRpb25zKVxyXG4gICAgICAgICAgICAgIHJldHVyblxyXG5cclxuICAgICAgICAgICAgaWYgb3B0aW9ucy50eXBlcy5sZW5ndGggPT0gMFxyXG4gICAgICAgICAgICAgIHRhcmdldChleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgIHJldHVyblxyXG5cclxuICAgICAgICAgIGlmIG9wdGlvbnMuaXNUeXBlZFxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSBleHRlcm5hbCB0eXBlICN7aXNBbihleHRlcm5hbFZhbHVlKX0gdG8gaW50ZXJuYWwgdHlwZSAje3RhcmdldC50eXBlTmFtZX1cIilcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gZXh0ZXJuYWwgdHlwZSAje2lzQW4oZXh0ZXJuYWxWYWx1ZSl9XCIpXHJcbiAgICAgICAgY2F0Y2ggZXhcclxuICAgICAgICAgIGlmIGV4IGluc3RhbmNlb2YgVHlwZUVycm9yXHJcbiAgICAgICAgICAgIHJlc3VsdC50eXBlV3JpdGVFcnJvcihleClcclxuXHJcbiAgICAgICAgICAgIGlmIG9wdGlvbnMubm9UaHJvd1xyXG4gICAgICAgICAgICAgIHJldHVyblxyXG5cclxuICAgICAgICAgIHRocm93IGV4XHJcbiAgICAgICAgZmluYWxseVxyXG4gICAgICAgICAgaWYgbm90IGV4P1xyXG4gICAgICAgICAgICByZXN1bHQudHlwZVdyaXRlRXJyb3IodW5kZWZpbmVkKVxyXG4gICAgfSlcclxuXHJcbiAgICByZXN1bHQudHlwZU5hbWUgPSBvcHRpb25zLnR5cGVcclxuICAgIHJlc3VsdC50eXBlTmFtZXMgPSBvcHRpb25zLnR5cGVzXHJcbiAgICByZXN1bHQudHlwZUNoZWNrID0gb3B0aW9ucy5jaGVja1xyXG4gICAgcmVzdWx0LnR5cGVDaGVja3MgPSBvcHRpb25zLmNoZWNrc1xyXG5cclxuICAgIHJlc3VsdC50eXBlUmVhZEVycm9yID0ga28ub2JzZXJ2YWJsZSgpXHJcbiAgICByZXN1bHQudHlwZVdyaXRlRXJyb3IgPSBrby5vYnNlcnZhYmxlKClcclxuXHJcbiAgICB2YWxpZGF0ZShyZXN1bHQsIG9wdGlvbnMpXHJcblxyXG4gICAgaWYgb3B0aW9ucy5wdXJlIGFuZCBub3Qgb3B0aW9ucy5kZWZlckV2YWx1YXRpb25cclxuICAgICAgIyBmb3JjZSBpbW1lZGlhdGUgcmVhZFxyXG4gICAgICByZXN1bHQoKVxyXG5cclxuICAgIHJldHVybiByZXN1bHRcclxuXHJcbiAga28uZXh0ZW5kZXJzLmNvbnZlcnQub3B0aW9ucyA9IHtcclxuICAgIHZhbGlkYXRlOiB0cnVlXHJcbiAgICBtZXNzYWdlOiB1bmRlZmluZWRcclxuICAgIG5vVGhyb3c6IGZhbHNlXHJcbiAgICBwdXJlOiB0cnVlXHJcbiAgICBkZWZlckV2YWx1YXRpb246IHRydWVcclxuICB9XHJcblxyXG4gIGtvLnR5cGVkID0ge31cclxuXHJcbiAgZG8gLT5cclxuICAgIGtvLnR5cGVkLl9jb252ZXJ0ZXJzID0gY29udmVydGVycyA9IHt9XHJcblxyXG4gICAga28udHlwZWQuYWRkQ29udmVydGVyID0gKGZyb21UeXBlTmFtZSwgdG9UeXBlTmFtZSwgY29udmVydGVyLCBkZWZhdWx0T3B0aW9ucywgZGVmYXVsdE9wdGlvbikgLT5cclxuICAgICAgY29uc29sZT8uYXNzZXJ0Pyhpc1ZhbGlkVHlwZU5hbWUoZnJvbVR5cGVOYW1lKSwgXCJJbnZhbGlkIHR5cGVOYW1lICN7ZnJvbVR5cGVOYW1lfVwiKVxyXG4gICAgICBjb25zb2xlPy5hc3NlcnQ/KGlzVmFsaWRUeXBlTmFtZSh0b1R5cGVOYW1lKSwgXCJJbnZhbGlkIHR5cGVOYW1lICN7ZnJvbVR5cGVOYW1lfVwiKVxyXG5cclxuICAgICAgaWYgZGVmYXVsdE9wdGlvbnM/XHJcbiAgICAgICAgaWYgZGVmYXVsdE9wdGlvbj9cclxuICAgICAgICAgIHdyYXBwZXIgPSAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgICAgICAgIGlmIG9wdGlvbnM/IGFuZCBub3QgaXNBbi5PYmplY3Qob3B0aW9ucylcclxuICAgICAgICAgICAgICBvID0ge31cclxuICAgICAgICAgICAgICBvW2RlZmF1bHRPcHRpb25dID0gb3B0aW9uc1xyXG4gICAgICAgICAgICAgIG9wdGlvbnMgPSBvXHJcblxyXG4gICAgICAgICAgICByZXR1cm4gY29udmVydGVyKHZhbHVlLCBrby51dGlscy5leHRlbmQoa28udXRpbHMuZXh0ZW5kKHt9LCB3cmFwcGVyLm9wdGlvbnMpLCBvcHRpb25zKSlcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICB3cmFwcGVyID0gKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICAgICAgICByZXR1cm4gY29udmVydGVyKHZhbHVlLCBrby51dGlscy5leHRlbmQoa28udXRpbHMuZXh0ZW5kKHt9LCB3cmFwcGVyLm9wdGlvbnMpLCBvcHRpb25zKSlcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHdyYXBwZXIgPSAodmFsdWUpIC0+XHJcbiAgICAgICAgICByZXR1cm4gY29udmVydGVyKHZhbHVlKVxyXG5cclxuICAgICAgd3JhcHBlci5vcHRpb25zID0gZGVmYXVsdE9wdGlvbnNcclxuXHJcbiAgICAgIGNvbnZlcnRlcnNbZnJvbVR5cGVOYW1lXSA/PSB7fVxyXG4gICAgICBjb252ZXJ0ZXJzW2Zyb21UeXBlTmFtZV1bdG9UeXBlTmFtZV0gPSB3cmFwcGVyXHJcblxyXG4gICAgICByZXR1cm4ga28udHlwZWRcclxuXHJcbiAgICBrby50eXBlZC5nZXRDb252ZXJ0ZXIgPSAoZnJvbVR5cGVOYW1lLCB0b1R5cGVOYW1lKSAtPlxyXG4gICAgICBjb252ZXJ0ZXJzW2Zyb21UeXBlTmFtZV0/W3RvVHlwZU5hbWVdXHJcblxyXG4gICAga28udHlwZWQucmVtb3ZlQ29udmVydGVyID0gKGZyb21UeXBlTmFtZSwgdG9UeXBlTmFtZSkgLT5cclxuICAgICAgaWYgY29udmVydGVyc1tmcm9tVHlwZU5hbWVdP1t0b1R5cGVOYW1lXT9cclxuICAgICAgICBkZWxldGUgY29udmVydGVyc1tmcm9tVHlwZU5hbWVdP1t0b1R5cGVOYW1lXVxyXG5cclxuICAgICAgcmV0dXJuIGtvLnR5cGVkXHJcblxyXG4gICAgcmV0dXJuXHJcblxyXG5cclxuICBkbyAtPlxyXG4gICAgIyMgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvTWF0aC9yb3VuZFxyXG4gICAgZGVjaW1hbEFkanVzdCA9ICh0eXBlLCB2YWx1ZSwgZXhwKSAtPlxyXG4gICAgICAjIGlmIGV4cCBpcyB1bmRlZmluZWQgb3IgemVyb1xyXG4gICAgICBpZiBub3QgZXhwPyBvciArZXhwID09IDBcclxuICAgICAgICByZXR1cm4gdHlwZSh2YWx1ZSlcclxuXHJcbiAgICAgIHZhbHVlID0gK3ZhbHVlXHJcbiAgICAgIGV4cCA9ICtleHBcclxuXHJcbiAgICAgICMgSWYgdGhlIHZhbHVlIGl0IG5vdCBhIG51bWJlciBvZiB0aGUgZXhwIGlzIG5vdCBhbiBpbnRlZ2VyXHJcbiAgICAgIGlmIChpc05hTih2YWx1ZSkgb3Igbm90ICh0eXBlb2YgZXhwID09ICdudW1iZXInIGFuZCBleHAgJSAxID09IDApKVxyXG4gICAgICAgIHJldHVybiBOYU5cclxuXHJcbiAgICAgICMgU2hpZnRcclxuICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpLnNwbGl0KCdlJylcclxuICAgICAgdmFsdWUgPSB0eXBlKCsodmFsdWVbMF0gKyAnZScgKyAoaWYgdmFsdWVbMV0gdGhlbiAoK3ZhbHVlWzFdIC0gZXhwKSBlbHNlIC1leHApKSlcclxuXHJcbiAgICAgICMgU2hpZnQgYmFja1xyXG4gICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCkuc3BsaXQoJ2UnKVxyXG4gICAgICByZXR1cm4gKCsodmFsdWVbMF0gKyAnZScgKyAoaWYgdmFsdWVbMV0gdGhlbiAoK3ZhbHVlWzFdICsgZXhwKSBlbHNlIGV4cCkpKVxyXG5cclxuICAgIGlmIG5vdCBNYXRoLnJvdW5kMTA/XHJcbiAgICAgIE1hdGgucm91bmQxMCA9ICh2YWx1ZSwgZXhwKSAtPlxyXG4gICAgICAgIHJldHVybiBkZWNpbWFsQWRqdXN0KE1hdGgucm91bmQsIHZhbHVlLCBleHApXHJcblxyXG4gICAgaWYgbm90IE1hdGguZmxvb3IxMD9cclxuICAgICAgTWF0aC5mbG9vcjEwID0gKHZhbHVlLCBleHApIC0+XHJcbiAgICAgICAgcmV0dXJuIGRlY2ltYWxBZGp1c3QoTWF0aC5mbG9vciwgdmFsdWUsIGV4cClcclxuXHJcbiAgICBpZiBub3QgTWF0aC5jZWlsMTA/XHJcbiAgICAgIE1hdGguY2VpbDEwID0gKHZhbHVlLCBleHApIC0+XHJcbiAgICAgICAgcmV0dXJuIGRlY2ltYWxBZGp1c3QoTWF0aC5jZWlsLCB2YWx1ZSwgZXhwKVxyXG5cclxuICAgIHJldHVyblxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnQm9vbGVhbidcclxuICAgICdOdW1iZXIuSW50ZWdlcidcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgcmV0dXJuIGlmIHZhbHVlIHRoZW4gb3B0aW9ucy50cnV0aHkgZWxzZSBvcHRpb25zLmZhbHNleVxyXG4gICAge1xyXG4gICAgICB0cnV0aHk6IDFcclxuICAgICAgZmFsc2V5OiAwXHJcbiAgICB9XHJcbiAgICAndHJ1dGh5J1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ0Jvb2xlYW4nXHJcbiAgICAnTnVtYmVyJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICByZXR1cm4gaWYgdmFsdWUgdGhlbiBvcHRpb25zLnRydXRoeSBlbHNlIG9wdGlvbnMuZmFsc2V5XHJcbiAgICB7XHJcbiAgICAgIHRydXRoeTogMVxyXG4gICAgICBmYWxzZXk6IDBcclxuICAgIH1cclxuICAgICd0cnV0aHknXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnQm9vbGVhbidcclxuICAgICdTdHJpbmcnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIHZhbHVlID0gaWYgdmFsdWUgdGhlbiBvcHRpb25zLnRydXRoeSBlbHNlIG9wdGlvbnMuZmFsc2V5XHJcblxyXG4gICAgICBpZiBvcHRpb25zLnVwcGVyQ2FzZVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudG9VcHBlckNhc2UoKVxyXG5cclxuICAgICAgcmV0dXJuIHZhbHVlXHJcbiAgICB7XHJcbiAgICAgIHVwcGVyQ2FzZTogZmFsc2VcclxuICAgICAgdHJ1dGh5OiAndHJ1ZSdcclxuICAgICAgZmFsc2V5OiAnZmFsc2UnXHJcbiAgICB9XHJcbiAgICAndXBwZXJDYXNlJ1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ0RhdGUnXHJcbiAgICAnTW9tZW50J1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICAobW9tZW50ID8gcmVxdWlyZSgnbW9tZW50JykpKHZhbHVlKVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ0RhdGUnXHJcbiAgICAnU3RyaW5nJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBpc05hTih2YWx1ZS52YWx1ZU9mKCkpXHJcbiAgICAgICAgcmV0dXJuICcnXHJcblxyXG4gICAgICBtZXRob2QgPSBvcHRpb25zLmZvcm1hdHNbb3B0aW9ucy5mb3JtYXRdXHJcbiAgICAgIHJldHVybiB2YWx1ZVttZXRob2RdLmFwcGx5KHZhbHVlLCBvcHRpb25zLnBhcmFtcylcclxuXHJcbiAgICB7XHJcbiAgICAgIGZvcm1hdHM6IHtcclxuICAgICAgICBkYXRlOiAndG9EYXRlU3RyaW5nJ1xyXG4gICAgICAgIGlzbzogJ3RvSVNPU3RyaW5nJ1xyXG4gICAgICAgIGpzb246ICd0b0pTT04nXHJcbiAgICAgICAgbG9jYWxlRGF0ZTogJ3RvTG9jYWxlRGF0ZVN0cmluZydcclxuICAgICAgICBsb2NhbGVUaW1lOiAndG9Mb2NhbGVUaW1lU3RyaW5nJ1xyXG4gICAgICAgIGxvY2FsZTogJ3RvTG9jYWxlU3RyaW5nJ1xyXG4gICAgICAgIHRpbWU6ICd0b1RpbWVTdHJpbmcnXHJcbiAgICAgICAgdXRjOiAndG9VVENTdHJpbmcnXHJcbiAgICAgICAgZGVmYXVsdDogJ3RvU3RyaW5nJ1xyXG4gICAgICB9XHJcbiAgICAgIGZvcm1hdDogJ2RlZmF1bHQnXHJcbiAgICAgIHBhcmFtczogW11cclxuICAgIH1cclxuICAgICdmb3JtYXQnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnRGF0ZScsXHJcbiAgICAnVW5kZWZpbmVkJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgbm90IGlzTmFOKHZhbHVlLnZhbHVlT2YoKSlcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmFibGUgdG8gY29udmVydCBmcm9tIHZhbGlkIERhdGUgdG8gVW5kZWZpbmVkJylcclxuXHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdNb21lbnQnXHJcbiAgICAnRGF0ZSdcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgdmFsdWUudG9EYXRlKClcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdNb21lbnQnXHJcbiAgICAnU3RyaW5nJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBub3QgdmFsdWUuaXNWYWxpZCgpXHJcbiAgICAgICAgcmV0dXJuICcnXHJcblxyXG4gICAgICByZXR1cm4gdmFsdWUubG9jYWxlKG9wdGlvbnMubG9jYWxlKS5mb3JtYXQob3B0aW9ucy5mb3JtYXQpXHJcbiAgICB7XHJcbiAgICAgIHN0cmljdDogZmFsc2VcclxuICAgICAgbG9jYWxlOiAnZW4nXHJcbiAgICAgIGZvcm1hdDogJ0wnXHJcbiAgICB9XHJcbiAgICAnZm9ybWF0J1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ01vbWVudCcsXHJcbiAgICAnVW5kZWZpbmVkJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgdmFsdWUuaXNWYWxpZCgpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSB2YWxpZCBNb21lbnQgdG8gVW5kZWZpbmVkJylcclxuXHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdOdW1iZXInXHJcbiAgICAnQm9vbGVhbidcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy5mYWxzZXk/IGFuZCB2YWx1ZSA9PSBvcHRpb25zLmZhbHNleVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICBlbHNlIGlmIG9wdGlvbnMudHJ1dGh5PyBhbmQgdmFsdWUgPT0gb3B0aW9ucy50cnV0aHlcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICBlbHNlIGlmIG5vdCBvcHRpb25zLmZhbHNleT9cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgZWxzZSBpZiBub3Qgb3B0aW9ucy50cnV0aHk/XHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY29udmVydCBmcm9tICN7dmFsdWV9IHRvIEJvb2xlYW5cIilcclxuICAgIHtcclxuICAgICAgdHJ1dGh5OiB1bmRlZmluZWRcclxuICAgICAgZmFsc2V5OiAwXHJcbiAgICB9XHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTnVtYmVyJ1xyXG4gICAgJ051bWJlci5JbnRlZ2VyJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiB0eXBlb2Ygb3B0aW9ucy5tb2RlID09ICdzdHJpbmcnXHJcbiAgICAgICAgbW9kZSA9IE1hdGhbb3B0aW9ucy5tb2RlXVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgbW9kZSA9IG9wdGlvbnMubW9kZVxyXG5cclxuICAgICAgcmV0dXJuIG1vZGUodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgIG1vZGU6ICdyb3VuZCdcclxuICAgIH1cclxuICAgICdtb2RlJ1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ051bWJlcidcclxuICAgICdTdHJpbmcnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMuZGVjaW1hbHM/XHJcbiAgICAgICAgdmFsdWUgPSBNYXRoLnJvdW5kMTAodmFsdWUsIC1vcHRpb25zLmRlY2ltYWxzKVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudG9GaXhlZChvcHRpb25zLmRlY2ltYWxzKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpXHJcblxyXG4gICAgICByZXR1cm4gdmFsdWVcclxuICAgIHtcclxuICAgICAgZGVjaW1hbHM6IHVuZGVmaW5lZFxyXG4gICAgfVxyXG4gICAgJ2RlY2ltYWxzJ1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ051bWJlci5JbnRlZ2VyJ1xyXG4gICAgJ0Jvb2xlYW4nXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMuZmFsc2V5PyBhbmQgdmFsdWUgPT0gb3B0aW9ucy5mYWxzZXlcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgZWxzZSBpZiBvcHRpb25zLnRydXRoeT8gYW5kIHZhbHVlID09IG9wdGlvbnMudHJ1dGh5XHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgZWxzZSBpZiBub3Qgb3B0aW9ucy5mYWxzZXk/XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIGVsc2UgaWYgbm90IG9wdGlvbnMudHJ1dGh5P1xyXG4gICAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBCb29sZWFuXCIpXHJcbiAgICB7XHJcbiAgICAgIHRydXRoeTogdW5kZWZpbmVkXHJcbiAgICAgIGZhbHNleTogMFxyXG4gICAgfVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ051bWJlci5JbnRlZ2VyJ1xyXG4gICAgJ051bWJlcicsXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIHJldHVybiB2YWx1ZVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ051bWJlci5JbnRlZ2VyJ1xyXG4gICAgJ1N0cmluZycsXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcob3B0aW9ucy5iYXNlKVxyXG4gICAgICBpZiBvcHRpb25zLnVwcGVyQ2FzZVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudG9VcHBlckNhc2UoKVxyXG5cclxuICAgICAgcmV0dXJuIHZhbHVlXHJcbiAgICB7XHJcbiAgICAgIGJhc2U6IDEwXHJcbiAgICAgIHVwcGVyQ2FzZTogZmFsc2VcclxuICAgIH1cclxuICAgICdiYXNlJ1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1N0cmluZycsXHJcbiAgICAnQm9vbGVhbicsXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMudHJpbVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudHJpbSgpXHJcblxyXG4gICAgICBpZiBvcHRpb25zLmlnbm9yZUNhc2VcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvTG93ZXJDYXNlKClcclxuXHJcbiAgICAgIGlmIG9wdGlvbnMuc3RyaWN0XHJcbiAgICAgICAgaWYgdmFsdWUgPT0gb3B0aW9ucy50cnV0aHlbMF1cclxuICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgZWxzZSBpZiB2YWx1ZSA9PSBvcHRpb25zLmZhbHNleVswXVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBmb3IgdHJ1dGh5IGluIG9wdGlvbnMudHJ1dGh5XHJcbiAgICAgICAgICBpZiB2YWx1ZSA9PSB0cnV0aHlcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgICAgICAgZm9yIGZhbHNleSBpbiBvcHRpb25zLmZhbHNleVxyXG4gICAgICAgICAgaWYgdmFsdWUgPT0gZmFsc2V5XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjb252ZXJ0IGZyb20gI3t2YWx1ZX0gdG8gQm9vbGVhblwiKVxyXG4gICAge1xyXG4gICAgICBpZ25vcmVDYXNlOiB0cnVlXHJcbiAgICAgIHN0cmljdDogZmFsc2VcclxuICAgICAgdHJ1dGh5OiBbXHJcbiAgICAgICAgJ3RydWUnXHJcbiAgICAgICAgJ3QnXHJcbiAgICAgICAgJzEnXHJcbiAgICAgICAgJy0xJ1xyXG4gICAgICAgICd5ZXMnXHJcbiAgICAgICAgJ3knXHJcbiAgICAgIF1cclxuICAgICAgZmFsc2V5OiBbXHJcbiAgICAgICAgJ2ZhbHNlJ1xyXG4gICAgICAgICdmJ1xyXG4gICAgICAgICcwJ1xyXG4gICAgICAgICdubydcclxuICAgICAgICAnbidcclxuICAgICAgXVxyXG4gICAgICB0cmltOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgJ3N0cmljdCdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdTdHJpbmcnXHJcbiAgICAnRGF0ZSdcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy50cmltXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50cmltKClcclxuXHJcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSlcclxuICAgICAgaWYgaXNOYU4oZGF0ZS52YWx1ZU9mKCkpXHJcbiAgICAgICAgdGhyb3cgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBEYXRlXCIpXHJcblxyXG4gICAgICByZXR1cm4gZGF0ZVxyXG4gICAge1xyXG4gICAgICB0cmltOiBmYWxzZVxyXG4gICAgfVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1N0cmluZydcclxuICAgICdNb21lbnQnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMudHJpbVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudHJpbSgpXHJcblxyXG4gICAgICByZXN1bHQgPSAobW9tZW50ID8gcmVxdWlyZSgnbW9tZW50JykpKHZhbHVlLCBvcHRpb25zLmZvcm1hdCwgb3B0aW9ucy5sYW5ndWFnZSwgb3B0aW9ucy5zdHJpY3QpXHJcbiAgICAgIGlmIG5vdCByZXN1bHQuaXNWYWxpZCgpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gI3t2YWx1ZX0gdG8gTW9tZW50XCIpXHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICB7XHJcbiAgICAgIHN0cmljdDogZmFsc2VcclxuICAgICAgbGFuZ3VhZ2U6ICdlbidcclxuICAgICAgZm9ybWF0OiAnTCdcclxuICAgICAgdHJpbTogZmFsc2VcclxuICAgIH1cclxuICAgICdmb3JtYXQnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnU3RyaW5nJyxcclxuICAgICdOdW1iZXIuSW50ZWdlcicsXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMudHJpbVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudHJpbSgpXHJcblxyXG4gICAgICBpZiBvcHRpb25zLmJhc2UgPT0gMTAgYW5kIG5vdCBvcHRpb25zLnN0cmljdFxyXG4gICAgICAgIHRyeVxyXG4gICAgICAgICAgcmV0dXJuIGtvLnR5cGVkLmdldENvbnZlcnRlcignU3RyaW5nJywgJ051bWJlcicpKHZhbHVlLCAwKVxyXG4gICAgICAgIGNhdGNoIGV4XHJcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBOdW1iZXIuSW50ZWdlclwiKVxyXG5cclxuICAgICAgY2hhcnMgPSAnMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6J1xyXG4gICAgICBpZiBub3QgUmVnRXhwKFwiXihcXFxcLXxcXFxcKyk/WyN7Y2hhcnMuc2xpY2UoMCwgb3B0aW9ucy5iYXNlID8gMTApfV0rJFwiLCBpZiBub3Qgb3B0aW9ucy5zdHJpY3QgdGhlbiAnaScpLnRlc3QodmFsdWUpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gI3t2YWx1ZX0gdG8gTnVtYmVyLkludGVnZXJcIilcclxuXHJcbiAgICAgIHJldHVybiBwYXJzZUludCh2YWx1ZSwgb3B0aW9ucy5iYXNlKVxyXG4gICAge1xyXG4gICAgICBiYXNlOiAxMFxyXG4gICAgICBzdHJpY3Q6IGZhbHNlXHJcbiAgICAgIHRyaW06IGZhbHNlXHJcbiAgICB9XHJcbiAgICAnYmFzZSdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdTdHJpbmcnXHJcbiAgICAnTnVtYmVyJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLnRyaW1cclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRyaW0oKVxyXG5cclxuICAgICAgaWYgbm90IC9eKFxcK3xcXC0pP1swLTldKyhcXC4/KVswLTldKiQvLnRlc3QodmFsdWUpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gI3t2YWx1ZX0gdG8gTnVtYmVyXCIpXHJcblxyXG4gICAgICB2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUsIG9wdGlvbnMuYmFzZSlcclxuXHJcbiAgICAgIGlmIG9wdGlvbnMuZGVjaW1hbHM/XHJcbiAgICAgICAgdmFsdWUgPSBNYXRoLnJvdW5kMTAodmFsdWUsIC1vcHRpb25zLmRlY2ltYWxzKVxyXG5cclxuICAgICAgcmV0dXJuIHZhbHVlXHJcbiAgICB7XHJcbiAgICAgIGRlY2ltYWxzOiB1bmRlZmluZWRcclxuICAgICAgdHJpbTogZmFsc2VcclxuICAgIH1cclxuICAgICdkZWNpbWFscydcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdTdHJpbmcnLFxyXG4gICAgJ1VuZGVmaW5lZCcsXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMudHJpbVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudHJpbSgpXHJcblxyXG4gICAgICBpZiB2YWx1ZS5sZW5ndGggIT0gMFxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tICN7dmFsdWV9IHRvIFVuZGVmaW5lZFwiKVxyXG5cclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gICAge1xyXG4gICAgICB0cmltOiBmYWxzZVxyXG4gICAgfVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1VuZGVmaW5lZCcsXHJcbiAgICAnRGF0ZScsXHJcbiAgICAodmFsdWUpIC0+XHJcbiAgICAgIHJldHVybiBuZXcgRGF0ZSgnJylcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdVbmRlZmluZWQnLFxyXG4gICAgJ1N0cmluZycsXHJcbiAgICAodmFsdWUpIC0+XHJcbiAgICAgIHJldHVybiAnJ1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1VuZGVmaW5lZCcsXHJcbiAgICAnTW9tZW50JyxcclxuICAgICh2YWx1ZSkgLT5cclxuICAgICAgcmV0dXJuIHJlcXVpcmUoJ21vbWVudCcpKCcnKVxyXG4gIClcclxuXHJcbiAgcmV0dXJuIGtvXHJcblxyXG5hcHBseUtvdHIoa28pXHJcbiJdfQ==
