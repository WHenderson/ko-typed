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

return applyKotr;
}));

//# sourceMappingURL=data:application/json;base64,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LEVBQUw7RUFEYixDQUhGO0VBT0EsRUFBRSxDQUFDLEtBQUssQ0FBQyxZQUFULENBQ0UsV0FERixFQUVFLFFBRkYsRUFHRSxTQUFDLEtBQUQ7QUFDRSxXQUFPO0VBRFQsQ0FIRjtFQU9BLEVBQUUsQ0FBQyxLQUFLLENBQUMsWUFBVCxDQUNFLFdBREYsRUFFRSxRQUZGLEVBR0UsU0FBQyxLQUFEO0FBQ0UsV0FBTyxPQUFBLENBQVEsUUFBUixDQUFBLENBQWtCLEVBQWxCO0VBRFQsQ0FIRjtBQU9BLFNBQU87QUEvNkJHIiwiZmlsZSI6ImtvLXR5cGVkLmFwcGx5LnVtZC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImFwcGx5S290ciA9IChrbykgLT5cclxuXHJcblxyXG4gIHR5cGVOYW1lVG9TdHJpbmcgPSAodmFsdWUpIC0+XHJcbiAgICBpZiBub3QgdmFsdWU/IG9yIHZhbHVlLmxlbmd0aCA9PSAwXHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuICAgIGVsc2UgaWYgaXNBbi5TdHJpbmcuTGl0ZXJhbCh2YWx1ZSlcclxuICAgICAgcmV0dXJuIHZhbHVlXHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVybiB2YWx1ZS5qb2luKCd8JylcclxuXHJcbiAgdHlwZU5hbWVUb0FycmF5ID0gKHZhbHVlKSAtPlxyXG4gICAgdmFsdWUgPSB0eXBlTmFtZVRvU3RyaW5nKHZhbHVlKVxyXG4gICAgaWYgaXNBbi5TdHJpbmcuTGl0ZXJhbCh2YWx1ZSlcclxuICAgICAgcmV0dXJuIHZhbHVlLnNwbGl0KCd8JylcclxuICAgIGVsc2VcclxuICAgICAgcmV0dXJuIFtdXHJcblxyXG4gIGlzVmFsaWRUeXBlTmFtZSA9ICh2YWx1ZSkgLT5cclxuICAgIHJldHVybiAvXltBLVpdLy50ZXN0KHZhbHVlKVxyXG5cclxuICBpc1R5cGVkID0gKHZhbHVlKSAtPlxyXG4gICAgcmV0dXJuIGlzQW4uRnVuY3Rpb24odmFsdWUpIGFuZCB2YWx1ZS50eXBlTmFtZT8gYW5kIHZhbHVlLnR5cGVOYW1lcz8gYW5kIHZhbHVlLnR5cGVDaGVjaz8gYW5kIHZhbHVlLnR5cGVDaGVja3M/XHJcblxyXG4gIHZhbGlkYXRlID0gKHRhcmdldCwgb3B0aW9ucykgLT5cclxuICAgIGlmIG5vdCBvcHRpb25zLnZhbGlkYXRlXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIHJ1bGUgPSB1bmRlZmluZWRcclxuXHJcbiAgICBlcnJvckNoZWNrID0gKCkgLT5cclxuICAgICAgIyBUcnkgaHR0cHM6Ly9naXRodWIuY29tL0tub2Nrb3V0LUNvbnRyaWIvS25vY2tvdXQtVmFsaWRhdGlvblxyXG4gICAgICBpZiBrby52YWxpZGF0aW9uPyBhbmQga28udmFsaWRhdGlvbi51dGlscy5pc1ZhbGlkYXRhYmxlKHRhcmdldClcclxuICAgICAgICBtZXNzYWdlID0gb3B0aW9ucy5tZXNzYWdlID8gKHRhcmdldC50eXBlV3JpdGVFcnJvcigpID8gdGFyZ2V0LnR5cGVSZWFkRXJyb3IoKSk/Lm1lc3NhZ2VcclxuICAgICAgICBpZiBub3QgcnVsZT9cclxuICAgICAgICAgIHJ1bGUgPSB7XHJcbiAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcclxuICAgICAgICAgICAgdmFsaWRhdG9yOiAoKSAtPlxyXG4gICAgICAgICAgICAgIG5vdCB0YXJnZXQudHlwZVdyaXRlRXJyb3IoKT8gYW5kIG5vdCB0YXJnZXQudHlwZVJlYWRFcnJvcigpP1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAga28udmFsaWRhdGlvbi5hZGRBbm9ueW1vdXNSdWxlKHRhcmdldCwgcnVsZSlcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBydWxlLm1lc3NhZ2UgPSBtZXNzYWdlXHJcbiAgICAgICAgICB0YXJnZXQucnVsZXMudmFsdWVIYXNNdXRhdGVkKClcclxuXHJcbiAgICB0YXJnZXQudHlwZVdyaXRlRXJyb3Iuc3Vic2NyaWJlKGVycm9yQ2hlY2spXHJcbiAgICB0YXJnZXQudHlwZVJlYWRFcnJvci5zdWJzY3JpYmUoZXJyb3JDaGVjaylcclxuXHJcbiAgICBpZiBrby52YWxpZGF0aW9uP1xyXG4gICAgICB0YXJnZXQuZXh0ZW5kKHsgdmFsaWRhdGFibGU6IHRydWUgfSlcclxuXHJcbiAgICBpZiBub3Qgb3B0aW9ucy5kZWZlckV2YWx1YXRpb25cclxuICAgICAgZXJyb3JDaGVjaygpXHJcblxyXG4gIGtvLmV4dGVuZGVycy50eXBlID0gKHRhcmdldCwgb3B0aW9ucykgLT5cclxuICAgICMgUmVxdWlyZXNcclxuICAgICMgdHlwZU5hbWUgOiBTdHJpbmdcclxuICAgICMgdHlwZU5hbWVzIDogQXJyYXkgb2YgU3RyaW5nXHJcbiAgICAjIHR5cGVDaGVjayA6IGZ1bmN0aW9uICh2YWx1ZSkgeyAuLi4gfVxyXG4gICAgIyB0eXBlQ2hlY2tzIDogeyB0eXBlTmFtZTogZnVuY3Rpb24gaXNUeXBlKHZhbHVlKSB7IC4uLiB9LCAuLi4gfVxyXG5cclxuICAgIGlmIGlzQW4uU3RyaW5nLkxpdGVyYWwob3B0aW9ucykgb3IgaXNBbi5BcnJheShvcHRpb25zKVxyXG4gICAgICAjIC5leHRlbmQoeyB0eXBlOiAnVHlwZU5hbWV8VHlwZU5hbWV8VHlwZU5hbWUnIH0pXHJcbiAgICAgICMgLmV4dGVuZCh7IHR5cGU6IFsnVHlwZU5hbWUnLCdUeXBlTmFtZScsLi4uXSB9KVxyXG4gICAgICBvcHRpb25zID0geyB0eXBlOiBvcHRpb25zIH1cclxuICAgIGVsc2UgaWYgaXNBbi5GdW5jdGlvbihvcHRpb25zKVxyXG4gICAgICAjIC5leHRlbmQoeyB0eXBlOiBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIHRydWV8ZmFsc2U7IH0gfSlcclxuICAgICAgb3B0aW9ucyA9IHtcclxuICAgICAgICB0eXBlOiBvcHRpb25zLnR5cGVOYW1lXHJcbiAgICAgICAgY2hlY2s6IG9wdGlvbnNcclxuICAgICAgfVxyXG5cclxuICAgIG9wdGlvbnMgPSBrby51dGlscy5leHRlbmQoa28udXRpbHMuZXh0ZW5kKHt9LCBrby5leHRlbmRlcnMudHlwZS5vcHRpb25zKSwgb3B0aW9ucylcclxuXHJcbiAgICBpZiBvcHRpb25zLnVzZURlZmF1bHQgYW5kIG5vdCBvcHRpb25zLmRlZmF1bHRGdW5jP1xyXG4gICAgICBvcHRpb25zLmRlZmF1bHRGdW5jID0gKCkgLT4gb3B0aW9ucy5kZWZhdWx0XHJcblxyXG4gICAgIyBHYXRoZXIgdHlwZSBuYW1lc1xyXG4gICAgdHlwZU5hbWVzID0gdHlwZU5hbWVUb0FycmF5KG9wdGlvbnMudHlwZSlcclxuXHJcbiAgICBkbyAtPlxyXG4gICAgICBmb3Igb3duIG5hbWUsIGNoZWNrIG9mIG9wdGlvbnNcclxuICAgICAgICBpZiBub3QgaXNWYWxpZFR5cGVOYW1lKG5hbWUpXHJcbiAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgIGlmIHR5cGVOYW1lcy5pbmRleE9mKG5hbWUpID09IC0xXHJcbiAgICAgICAgICB0eXBlTmFtZXMucHVzaChuYW1lKVxyXG5cclxuICAgIHR5cGVOYW1lID0gdHlwZU5hbWVUb1N0cmluZyh0eXBlTmFtZXMpXHJcblxyXG4gICAgIyBjaGVja3NcclxuICAgIHR5cGVDaGVja3MgPSB7fVxyXG4gICAgZG8gLT5cclxuICAgICAgZm9yIG5hbWUgaW4gdHlwZU5hbWVzXHJcbiAgICAgICAgdHlwZUNoZWNrc1tuYW1lXSA9IG9wdGlvbnNbbmFtZV0gPyBpc0FuKG5hbWUsIHsgcmV0dXJuQ2hlY2tlcjogdHJ1ZSB9KVxyXG5cclxuICAgICMgY2hlY2tcclxuICAgIHR5cGVDaGVjayA9IGRvIC0+XHJcbiAgICAgIF9jaGVjayA9IG9wdGlvbnMuY2hlY2sgPyAoKCkgLT4gdHJ1ZSlcclxuICAgICAgcmV0dXJuICh2YWx1ZSkgLT5cclxuICAgICAgICBfY2hlY2sodmFsdWUpIGFuZCAoKHR5cGVOYW1lcy5sZW5ndGggPT0gMCkgb3IgKHR5cGVOYW1lcy5zb21lKChuYW1lKSAtPiB0eXBlQ2hlY2tzW25hbWVdKHZhbHVlKSkpKVxyXG5cclxuICAgIHJlc3VsdCA9IGtvLmNvbXB1dGVkKHtcclxuICAgICAgcHVyZTogb3B0aW9ucy5wdXJlXHJcbiAgICAgIGRlZmVyRXZhbHVhdGlvbjogb3B0aW9ucy5kZWZlckV2YWx1YXRpb25cclxuXHJcbiAgICAgIHJlYWQ6ICgpIC0+XHJcbiAgICAgICAgdHJ5XHJcbiAgICAgICAgICBpbnRlcm5hbFZhbHVlID0gdGFyZ2V0KClcclxuXHJcbiAgICAgICAgICBpZiBub3QgdHlwZUNoZWNrKGludGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmV4cGVjdGVkIGludGVybmFsIHR5cGUuIEV4cGVjdGVkICN7dHlwZU5hbWV9LCBnb3QgI3tpc0FuKGludGVybmFsVmFsdWUpfVwiKVxyXG5cclxuICAgICAgICBjYXRjaCBleFxyXG4gICAgICAgICAgaWYgZXggaW5zdGFuY2VvZiBUeXBlRXJyb3JcclxuICAgICAgICAgICAgcmVzdWx0LnR5cGVSZWFkRXJyb3IoZXgpXHJcblxyXG4gICAgICAgICAgICBpZiBvcHRpb25zLnVzZURlZmF1bHRcclxuICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5kZWZhdWx0RnVuYygpXHJcblxyXG4gICAgICAgICAgdGhyb3cgZXhcclxuXHJcbiAgICAgICAgcmVzdWx0LnR5cGVSZWFkRXJyb3IodW5kZWZpbmVkKVxyXG4gICAgICAgIHJldHVybiBpbnRlcm5hbFZhbHVlXHJcblxyXG4gICAgICB3cml0ZTogKGV4dGVybmFsVmFsdWUpIC0+XHJcbiAgICAgICAgdHJ5XHJcbiAgICAgICAgICBpZiB0eXBlQ2hlY2soZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgdGFyZ2V0KGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmV4cGVjdGVkIGV4dGVybmFsIHR5cGUuIEV4cGVjdGVkICN7dHlwZU5hbWV9LCByZWNlaXZlZCAje2lzQW4oZXh0ZXJuYWxWYWx1ZSl9XCIpXHJcbiAgICAgICAgY2F0Y2ggZXhcclxuICAgICAgICAgIGlmIGV4IGluc3RhbmNlb2YgVHlwZUVycm9yXHJcbiAgICAgICAgICAgIHJlc3VsdC50eXBlV3JpdGVFcnJvcihleClcclxuXHJcbiAgICAgICAgICAgIGlmIG9wdGlvbnMubm9UaHJvd1xyXG4gICAgICAgICAgICAgIHJldHVyblxyXG5cclxuICAgICAgICAgIHRocm93IGV4XHJcblxyXG4gICAgICAgIHJlc3VsdC50eXBlV3JpdGVFcnJvcih1bmRlZmluZWQpXHJcbiAgICB9KVxyXG5cclxuICAgIHJlc3VsdC50eXBlTmFtZSA9IHR5cGVOYW1lXHJcbiAgICByZXN1bHQudHlwZU5hbWVzID0gdHlwZU5hbWVzXHJcbiAgICByZXN1bHQudHlwZUNoZWNrID0gdHlwZUNoZWNrXHJcbiAgICByZXN1bHQudHlwZUNoZWNrcyA9IHR5cGVDaGVja3NcclxuXHJcbiAgICByZXN1bHQudHlwZVdyaXRlRXJyb3IgPSBrby5vYnNlcnZhYmxlKClcclxuICAgIHJlc3VsdC50eXBlUmVhZEVycm9yID0ga28ub2JzZXJ2YWJsZSgpXHJcblxyXG4gICAgdmFsaWRhdGUocmVzdWx0LCBvcHRpb25zKVxyXG5cclxuICAgIGlmIG9wdGlvbnMucHVyZSBhbmQgbm90IG9wdGlvbnMuZGVmZXJFdmFsdWF0aW9uXHJcbiAgICAgICMgZm9yY2UgaW1tZWRpYXRlIHJlYWRcclxuICAgICAgcmVzdWx0KClcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcblxyXG4gIGtvLmV4dGVuZGVycy50eXBlLm9wdGlvbnMgPSB7XHJcbiAgICB2YWxpZGF0ZTogdHJ1ZVxyXG4gICAgbWVzc2FnZTogdW5kZWZpbmVkXHJcbiAgICBub1Rocm93OiBmYWxzZVxyXG4gICAgdXNlRGVmYXVsdDogZmFsc2VcclxuICAgICMgZGVmYXVsdFxyXG4gICAgIyBkZWZhdWx0RnVuY1xyXG4gICAgcHVyZTogdHJ1ZVxyXG4gICAgZGVmZXJFdmFsdWF0aW9uOiB0cnVlXHJcbiAgfVxyXG5cclxuXHJcbiAga28uZXh0ZW5kZXJzLmNvbnZlcnQgPSAodGFyZ2V0LCBvcHRpb25zKSAtPlxyXG4gICAgIyBub3JtYWxpemUgb3B0aW9uc1xyXG4gICAgZG8gLT5cclxuICAgICAgaWYgaXNBbi5TdHJpbmcob3B0aW9ucykgb3IgaXNBbi5BcnJheShvcHRpb25zKVxyXG4gICAgICAgIG9wdGlvbnMgPSB7IHR5cGU6IG9wdGlvbnMgfVxyXG5cclxuICAgICAgIyBtZXJnZSBvcHRpb25zXHJcbiAgICAgIG9wdGlvbnMgPSBrby51dGlscy5leHRlbmQoa28udXRpbHMuZXh0ZW5kKHt9LCBrby5leHRlbmRlcnMuY29udmVydC5vcHRpb25zKSwgb3B0aW9ucylcclxuXHJcbiAgICAgIGZpbmFsT3B0aW9ucyA9IHtcclxuICAgICAgICBjaGVja1NlbGY6IG9wdGlvbnMuY2hlY2sgPyAoKSAtPiB0cnVlXHJcbiAgICAgICAgcmVhZDogb3B0aW9ucy5yZWFkXHJcbiAgICAgICAgd3JpdGU6IG9wdGlvbnMud3JpdGVcclxuICAgICAgICBjaGVja3M6IHt9XHJcbiAgICAgICAgY2hlY2tlcnM6IFtdXHJcbiAgICAgICAgaXNUeXBlZDogaXNUeXBlZCh0YXJnZXQpXHJcbiAgICAgICAgaWdub3JlRGVmYXVsdENvbnZlcnRlcnM6IG9wdGlvbnMuaWdub3JlRGVmYXVsdENvbnZlcnRlcnNcclxuICAgICAgICBwdXJlOiBvcHRpb25zLnB1cmVcclxuICAgICAgICBkZWZlckV2YWx1YXRpb246IG9wdGlvbnMuZGVmZXJFdmFsdWF0aW9uXHJcbiAgICAgICAgZGVmYXVsdEZ1bmM6IG9wdGlvbnMuZGVmYXVsdEZ1bmNcclxuICAgICAgICBub1Rocm93OiBvcHRpb25zLm5vVGhyb3dcclxuICAgICAgICBtZXNzYWdlOiBvcHRpb25zLm1lc3NhZ2VcclxuICAgICAgICB1c2VEZWZhdWx0OiBvcHRpb25zLnVzZURlZmF1bHRcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgZmluYWxPcHRpb25zLnVzZURlZmF1bHQgYW5kIG5vdCBvcHRpb25zLmRlZmF1bHRGdW5jP1xyXG4gICAgICAgIGZpbmFsT3B0aW9ucy5kZWZhdWx0ID0gb3B0aW9ucy5kZWZhdWx0XHJcbiAgICAgICAgZmluYWxPcHRpb25zLmRlZmF1bHRGdW5jID0gKCkgLT4gZmluYWxPcHRpb25zLmRlZmF1bHRcclxuXHJcbiAgICAgIGZpbmFsT3B0aW9ucy5jaGVja2Vycy5wdXNoKGZpbmFsT3B0aW9ucy5jaGVja1NlbGYpXHJcblxyXG4gICAgICAjIEdhdGhlciBhbGwgZXh0ZXJuYWwgdHlwZXNcclxuICAgICAgZmluYWxPcHRpb25zLnR5cGVzID0gdHlwZU5hbWVUb0FycmF5KG9wdGlvbnMudHlwZSlcclxuICAgICAgZm9yIG93biBleHRUeXBlTmFtZSBvZiBvcHRpb25zXHJcbiAgICAgICAgaWYgbm90IGlzVmFsaWRUeXBlTmFtZShleHRUeXBlTmFtZSlcclxuICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICAgICMgQWRkIGV4dGVybmFsIHR5cGVcclxuICAgICAgICBpZiBmaW5hbE9wdGlvbnMudHlwZXMuaW5kZXhPZihleHRUeXBlTmFtZSkgPT0gLTFcclxuICAgICAgICAgIGZpbmFsT3B0aW9ucy50eXBlcy5wdXNoKGV4dFR5cGVOYW1lKVxyXG5cclxuICAgICAgIyBFeHBhbmQgZWFjaCBFeHRlcm5hbCBUeXBlXHJcbiAgICAgIGZvciBleHRUeXBlTmFtZSBpbiBmaW5hbE9wdGlvbnMudHlwZXNcclxuICAgICAgICBleHRUeXBlT3B0aW9ucyA9IG9wdGlvbnNbZXh0VHlwZU5hbWVdID8ge31cclxuXHJcbiAgICAgICAgZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXSA9IHtcclxuICAgICAgICAgIGNoZWNrU2VsZjogZXh0VHlwZU9wdGlvbnMuY2hlY2sgPyBpc0FuKGV4dFR5cGVOYW1lLCB7IHJldHVybkNoZWNrZXI6IHRydWUgfSkgPyAoKSAtPiB0cnVlXHJcbiAgICAgICAgICByZWFkOiBleHRUeXBlT3B0aW9ucy5yZWFkXHJcbiAgICAgICAgICB3cml0ZTogZXh0VHlwZU9wdGlvbnMud3JpdGVcclxuICAgICAgICAgIHR5cGVzOiB0eXBlTmFtZVRvQXJyYXkoZXh0VHlwZU9wdGlvbnMudHlwZSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNoZWNrUGFyZW50ID0gZmluYWxPcHRpb25zLmNoZWNrU2VsZlxyXG4gICAgICAgIGZpbmFsT3B0aW9ucy5jaGVja2Vycy5wdXNoKGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV0uY2hlY2tTZWxmKVxyXG4gICAgICAgIGZpbmFsT3B0aW9ucy5jaGVja3NbZXh0VHlwZU5hbWVdID0gZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXS5jaGVjayA9IGRvIChleHRUeXBlTmFtZSkgLT5cclxuICAgICAgICAgICh2YWx1ZSkgLT4gZmluYWxPcHRpb25zLmNoZWNrU2VsZih2YWx1ZSkgYW5kIGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV0uY2hlY2tTZWxmKHZhbHVlKVxyXG5cclxuICAgICAgICAjIEdhdGhlciBhbGwgaW50ZXJuYWwgdHlwZXNcclxuICAgICAgICBmb3Igb3duIGludFR5cGVOYW1lIG9mIGV4dFR5cGVPcHRpb25zXHJcbiAgICAgICAgICBpZiBub3QgaXNWYWxpZFR5cGVOYW1lKGludFR5cGVOYW1lKVxyXG4gICAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAgICMgQWRkIGludGVybmFsIHR5cGVcclxuICAgICAgICAgIGlmIGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV0udHlwZXMuaW5kZXhPZihpbnRUeXBlTmFtZSkgPT0gLTFcclxuICAgICAgICAgICAgZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXS50eXBlcy5wdXNoKGludFR5cGVOYW1lKVxyXG5cclxuICAgICAgICAjIEV4cGFuZCBhbGwgaW50ZXJuYWwgdHlwZXNcclxuICAgICAgICBmb3IgaW50VHlwZU5hbWUgaW4gZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXS50eXBlc1xyXG4gICAgICAgICAgaW50VHlwZU9wdGlvbnMgPSBvcHRpb25zW2V4dFR5cGVOYW1lXT9baW50VHlwZU5hbWVdID8ge31cclxuXHJcbiAgICAgICAgICBmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdW2ludFR5cGVOYW1lXSA9IHtcclxuICAgICAgICAgICAgY2hlY2tTZWxmOiBpbnRUeXBlT3B0aW9ucy5jaGVja1xyXG4gICAgICAgICAgICByZWFkOiBpbnRUeXBlT3B0aW9ucy5yZWFkXHJcbiAgICAgICAgICAgIHdyaXRlOiBpbnRUeXBlT3B0aW9ucy53cml0ZVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIG5vdCBmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdW2ludFR5cGVOYW1lXS5jaGVja1NlbGY/XHJcbiAgICAgICAgICAgIGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV1baW50VHlwZU5hbWVdLmNoZWNrID0gZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXVtpbnRUeXBlTmFtZV0uY2hlY2tTZWxmID0gZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXS5jaGVja1NlbGZcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXVtpbnRUeXBlTmFtZV0uY2hlY2sgPSBkbyAoZXh0VHlwZU5hbWUsIGludFR5cGVOYW1lKSAtPlxyXG4gICAgICAgICAgICAgICh2YWx1ZSkgLT4gZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXS5jaGVjayh2YWx1ZSkgYW5kIGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV1baW50VHlwZU5hbWVdLmNoZWNrU2VsZih2YWx1ZSlcclxuXHJcbiAgICAgICAgZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXS50eXBlID0gdHlwZU5hbWVUb1N0cmluZyhmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdLnR5cGVzKVxyXG5cclxuICAgICAgZmluYWxPcHRpb25zLnR5cGUgPSB0eXBlTmFtZVRvU3RyaW5nKGZpbmFsT3B0aW9ucy50eXBlcylcclxuICAgICAgZmluYWxPcHRpb25zLmNoZWNrID0gKHZhbHVlKSAtPlxyXG4gICAgICAgIGZpbmFsT3B0aW9ucy5jaGVja1NlbGYodmFsdWUpIGFuZCAoKGZpbmFsT3B0aW9ucy5jaGVja2Vycy5sZW5ndGggPT0gMCkgb3IgZmluYWxPcHRpb25zLmNoZWNrZXJzLnNvbWUoKGNoZWNrZXIpIC0+IGNoZWNrZXIodmFsdWUpKSlcclxuXHJcbiAgICAgIG9wdGlvbnMgPSBmaW5hbE9wdGlvbnNcclxuXHJcbiAgICByZXN1bHQgPSBrby5jb21wdXRlZCh7XHJcbiAgICAgIHB1cmU6IG9wdGlvbnMucHVyZVxyXG4gICAgICBkZWZlckV2YWx1YXRpb246IG9wdGlvbnMuZGVmZXJFdmFsdWF0aW9uXHJcblxyXG4gICAgICByZWFkOiAoKSAtPlxyXG4gICAgICAgIHRyeVxyXG4gICAgICAgICAgaW50ZXJuYWxWYWx1ZSA9IHRhcmdldCgpXHJcbiAgICAgICAgICBleHRlcm5hbFZhbHVlID0gdW5kZWZpbmVkXHJcblxyXG4gICAgICAgICAgIyBUcnkgZXhhY3QgaW50ZXJuYWwgdHlwZSBtYXRjaFxyXG4gICAgICAgICAgdHJ5UmVhZCA9IChjb252ZXJ0LCBvcHRpb25zKSAtPlxyXG4gICAgICAgICAgICBpZiBjb252ZXJ0P1xyXG4gICAgICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICAgICAgZXh0ZXJuYWxWYWx1ZSA9IGNvbnZlcnQoaW50ZXJuYWxWYWx1ZSwgb3B0aW9ucylcclxuICAgICAgICAgICAgICBjYXRjaCBleFxyXG4gICAgICAgICAgICAgICAgaWYgZXggbm90IGluc3RhbmNlb2YgVHlwZUVycm9yXHJcbiAgICAgICAgICAgICAgICAgIHRocm93IGV4XHJcblxyXG4gICAgICAgICAgICAgIGlmIG5vdCBleD9cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICAgICAgICAjIExvb2sgZm9yIHNwZWNpZmljIGNvbnZlcnNpb25cclxuICAgICAgICAgIGZvciBleHRUeXBlTmFtZSBpbiBvcHRpb25zLnR5cGVzXHJcbiAgICAgICAgICAgIGV4dFR5cGVPcHRpb25zID0gb3B0aW9uc1tleHRUeXBlTmFtZV1cclxuXHJcbiAgICAgICAgICAgICMgZ28gYnkgb3VyIG9yZGVyXHJcbiAgICAgICAgICAgIGludFR5cGVOYW1lcyA9IGV4dFR5cGVPcHRpb25zLnR5cGVzXHJcblxyXG4gICAgICAgICAgICBpZiBpbnRUeXBlTmFtZXMubGVuZ3RoID09IDAgYW5kIG5vdCBleHRUeXBlT3B0aW9ucy5yZWFkP1xyXG4gICAgICAgICAgICAgIGlmIG9wdGlvbnMuaXNUeXBlZFxyXG4gICAgICAgICAgICAgICAgIyBnbyBieSB0YXJnZXQgb3JkZXJcclxuICAgICAgICAgICAgICAgIGludFR5cGVOYW1lcyA9IHRhcmdldC50eXBlTmFtZXNcclxuICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAjIGdvIGJ5IGluZmVycmVkIG9yZGVyXHJcbiAgICAgICAgICAgICAgICBpbnRUeXBlTmFtZXMgPSBbaXNBbihpbnRlcm5hbFZhbHVlKV1cclxuXHJcbiAgICAgICAgICAgIGZvciBpbnRUeXBlTmFtZSBpbiBpbnRUeXBlTmFtZXNcclxuICAgICAgICAgICAgICAjIGNoZWNrIGludGVybmFsIHR5cGVcclxuICAgICAgICAgICAgICBpZiBvcHRpb25zLmlzVHlwZWRcclxuICAgICAgICAgICAgICAgIGlmIG5vdCB0YXJnZXQudHlwZUNoZWNrc1tpbnRUeXBlTmFtZV0/KGludGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgaWYgbm90IGlzQW4oaW50ZXJuYWxWYWx1ZSwgaW50VHlwZU5hbWUpXHJcbiAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICAgICAgICAgICMgZ2V0IHRoZSBvcHRpb25zXHJcbiAgICAgICAgICAgICAgaW50VHlwZU9wdGlvbnMgPSBleHRUeXBlT3B0aW9uc1tpbnRUeXBlTmFtZV0gPyB7IGNoZWNrOiBleHRUeXBlT3B0aW9ucy5jaGVjayB9XHJcblxyXG4gICAgICAgICAgICAgICMgdHJ5IHNwZWNpZmljIGNvbnZlcnNpb25zXHJcbiAgICAgICAgICAgICAgaWYgdHJ5UmVhZChpbnRUeXBlT3B0aW9ucy5yZWFkLCBpbnRUeXBlT3B0aW9ucy5yZWFkT3B0aW9ucylcclxuICAgICAgICAgICAgICAgIGlmIGludFR5cGVPcHRpb25zLmNoZWNrKGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBleHRlcm5hbFZhbHVlXHJcblxyXG4gICAgICAgICAgICAgICMgdHJ5IG5vIGNvbnZlcnNpb25cclxuICAgICAgICAgICAgICBpZiBleHRUeXBlTmFtZSA9PSBpbnRUeXBlTmFtZVxyXG4gICAgICAgICAgICAgICAgaWYgaW50VHlwZU9wdGlvbnMuY2hlY2soaW50ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICAgICAgZXh0ZXJuYWxWYWx1ZSA9IGludGVybmFsVmFsdWVcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4dGVybmFsVmFsdWVcclxuXHJcbiAgICAgICAgICAgICAgIyB0cnkgZGVmYXVsdCBjb252ZXJzaW9uXHJcbiAgICAgICAgICAgICAgaWYgbm90IG9wdGlvbnMuaWdub3JlRGVmYXVsdENvbnZlcnRlcnNcclxuICAgICAgICAgICAgICAgIGlmIHRyeVJlYWQoa28udHlwZWQuZ2V0Q29udmVydGVyKGludFR5cGVOYW1lLCBleHRUeXBlTmFtZSksIGludFR5cGVPcHRpb25zLnJlYWRPcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgICBpZiBpbnRUeXBlT3B0aW9ucy5jaGVjayhleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBleHRlcm5hbFZhbHVlXHJcblxyXG4gICAgICAgICAgIyBMb29rIGZvciBvbmUtc2lkZWQgY29udmVyc2lvblxyXG4gICAgICAgICAgZm9yIGV4dFR5cGVOYW1lIGluIG9wdGlvbnMudHlwZXNcclxuICAgICAgICAgICAgZXh0VHlwZU9wdGlvbnMgPSBvcHRpb25zW2V4dFR5cGVOYW1lXVxyXG5cclxuICAgICAgICAgICAgaWYgdHJ5UmVhZChleHRUeXBlT3B0aW9ucy5yZWFkLCBleHRUeXBlT3B0aW9ucy5yZWFkT3B0aW9ucylcclxuICAgICAgICAgICAgICBpZiBleHRUeXBlT3B0aW9ucy5jaGVjayhleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4dGVybmFsVmFsdWVcclxuXHJcbiAgICAgICAgICAjIExvb2sgZm9yIGdlbmVyaWMgY29udmVyc2lvblxyXG4gICAgICAgICAgaWYgdHJ5UmVhZChvcHRpb25zLnJlYWQsIG9wdGlvbnMucmVhZE9wdGlvbnMpXHJcbiAgICAgICAgICAgIGlmIG9wdGlvbnMuY2hlY2soZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICByZXR1cm4gZXh0ZXJuYWxWYWx1ZVxyXG5cclxuICAgICAgICAgIGlmIG9wdGlvbnMudHlwZXMubGVuZ3RoID09IDBcclxuICAgICAgICAgICAgaWYgb3B0aW9ucy5jaGVjayhleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgIGV4dGVybmFsVmFsdWUgPSBpbnRlcm5hbFZhbHVlXHJcbiAgICAgICAgICAgICAgcmV0dXJuIGV4dGVybmFsVmFsdWVcclxuXHJcbiAgICAgICAgICBpZiBvcHRpb25zLnR5cGU/XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tIGludGVybmFsIHR5cGUgI3tpc0FuKGludGVybmFsVmFsdWUpfSB0byBleHRlcm5hbCB0eXBlICN7b3B0aW9ucy50eXBlfVwiKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSBpbnRlcm5hbCB0eXBlICN7aXNBbihpbnRlcm5hbFZhbHVlKX1cIilcclxuICAgICAgICBjYXRjaCBleFxyXG4gICAgICAgICAgaWYgZXggaW5zdGFuY2VvZiBUeXBlRXJyb3JcclxuICAgICAgICAgICAgcmVzdWx0LnR5cGVSZWFkRXJyb3IoZXgpXHJcblxyXG4gICAgICAgICAgICBpZiBvcHRpb25zLnVzZURlZmF1bHRcclxuICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5kZWZhdWx0RnVuYygpXHJcblxyXG4gICAgICAgICAgdGhyb3cgZXhcclxuICAgICAgICBmaW5hbGx5XHJcbiAgICAgICAgICBpZiBub3QgZXg/XHJcbiAgICAgICAgICAgIHJlc3VsdC50eXBlUmVhZEVycm9yKHVuZGVmaW5lZClcclxuXHJcbiAgICAgIHdyaXRlOiAoZXh0ZXJuYWxWYWx1ZSkgLT5cclxuICAgICAgICB0cnlcclxuICAgICAgICAgIHRyeVdyaXRlID0gKGNvbnZlcnQsIG9wdGlvbnMpIC0+XHJcbiAgICAgICAgICAgIGlmIGNvbnZlcnQ/XHJcbiAgICAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgICAgICBpbnRlcm5hbFZhbHVlID0gY29udmVydChleHRlcm5hbFZhbHVlLCBvcHRpb25zKVxyXG4gICAgICAgICAgICAgIGNhdGNoIGV4XHJcbiAgICAgICAgICAgICAgICBpZiBleCBub3QgaW5zdGFuY2VvZiBUeXBlRXJyb3JcclxuICAgICAgICAgICAgICAgICAgdGhyb3cgZXhcclxuXHJcbiAgICAgICAgICAgICAgaWYgbm90IGV4P1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0KGludGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgICAgICAgIyBMb29rIGZvciBzcGVjaWZpYyBjb252ZXJzaW9uXHJcbiAgICAgICAgICBmb3IgZXh0VHlwZU5hbWUgaW4gb3B0aW9ucy50eXBlc1xyXG4gICAgICAgICAgICBleHRUeXBlT3B0aW9ucyA9IG9wdGlvbnNbZXh0VHlwZU5hbWVdXHJcblxyXG4gICAgICAgICAgICBpZiBub3QgZXh0VHlwZU9wdGlvbnMuY2hlY2soZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAgICAgIyBnbyBieSBvdXIgb3JkZXJcclxuICAgICAgICAgICAgaW50VHlwZU5hbWVzID0gZXh0VHlwZU9wdGlvbnMudHlwZXNcclxuXHJcbiAgICAgICAgICAgIGlmIGludFR5cGVOYW1lcy5sZW5ndGggPT0gMCBhbmQgbm90IGV4dFR5cGVPcHRpb25zLndyaXRlP1xyXG4gICAgICAgICAgICAgIGlmIG9wdGlvbnMuaXNUeXBlZFxyXG4gICAgICAgICAgICAgICAgIyBnbyBieSB0YXJnZXQgb3JkZXJcclxuICAgICAgICAgICAgICAgIGludFR5cGVOYW1lcyA9IHRhcmdldC50eXBlTmFtZXNcclxuICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAjIGdvIGJ5IGluZmVycmVkIG9yZGVyXHJcbiAgICAgICAgICAgICAgICBpbnRUeXBlTmFtZXMgPSBbaXNBbihleHRlcm5hbFZhbHVlKV1cclxuXHJcbiAgICAgICAgICAgIGZvciBpbnRUeXBlTmFtZSBpbiBpbnRUeXBlTmFtZXNcclxuICAgICAgICAgICAgICBpbnRUeXBlT3B0aW9ucyA9IGV4dFR5cGVPcHRpb25zW2ludFR5cGVOYW1lXSA/IHt9XHJcblxyXG4gICAgICAgICAgICAgIGlmIGludFR5cGVPcHRpb25zLmNoZWNrPyBhbmQgbm90IGludFR5cGVPcHRpb25zLmNoZWNrKGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAgICAgICAjIHRyeSBzcGVjaWZpYyBjb252ZXJzaW9uc1xyXG4gICAgICAgICAgICAgIGlmIHRyeVdyaXRlKGludFR5cGVPcHRpb25zLndyaXRlLCBpbnRUeXBlT3B0aW9ucy53cml0ZU9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgICAgICAgICAgIyB0cnkgbm8gY29udmVyc2lvblxyXG4gICAgICAgICAgICAgIGlmIGV4dFR5cGVOYW1lID09IGludFR5cGVOYW1lXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQoZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICAgIHJldHVyblxyXG5cclxuICAgICAgICAgICAgICAjIHRyeSBkZWZhdWx0IGNvbnZlcnNpb25cclxuICAgICAgICAgICAgICBpZiBub3Qgb3B0aW9ucy5pZ25vcmVEZWZhdWx0Q29udmVydGVyc1xyXG4gICAgICAgICAgICAgICAgaWYgdHJ5V3JpdGUoa28udHlwZWQuZ2V0Q29udmVydGVyKGV4dFR5cGVOYW1lLCBpbnRUeXBlTmFtZSksIGludFR5cGVPcHRpb25zLndyaXRlT3B0aW9ucylcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgICAgIyBMb29rIGZvciBvbmUtc2lkZWQgY29udmVyc2lvblxyXG4gICAgICAgICAgZm9yIGV4dFR5cGVOYW1lIGluIG9wdGlvbnMudHlwZXNcclxuICAgICAgICAgICAgZXh0VHlwZU9wdGlvbnMgPSBvcHRpb25zW2V4dFR5cGVOYW1lXVxyXG5cclxuICAgICAgICAgICAgaWYgbm90IGV4dFR5cGVPcHRpb25zLmNoZWNrKGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgICAgICAgIGlmIHRyeVdyaXRlKGV4dFR5cGVPcHRpb25zLndyaXRlLCBleHRUeXBlT3B0aW9ucy53cml0ZU9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgICAgIyBMb29rIGZvciBnZW5lcmljIGNvbnZlcnNpb25cclxuICAgICAgICAgIGlmIG9wdGlvbnMuY2hlY2soZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgaWYgdHJ5V3JpdGUob3B0aW9ucy53cml0ZSwgb3B0aW9ucy53cml0ZU9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgICAgICBpZiBvcHRpb25zLnR5cGVzLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgICAgICAgdGFyZ2V0KGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgICAgaWYgb3B0aW9ucy5pc1R5cGVkXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tIGV4dGVybmFsIHR5cGUgI3tpc0FuKGV4dGVybmFsVmFsdWUpfSB0byBpbnRlcm5hbCB0eXBlICN7dGFyZ2V0LnR5cGVOYW1lfVwiKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSBleHRlcm5hbCB0eXBlICN7aXNBbihleHRlcm5hbFZhbHVlKX1cIilcclxuICAgICAgICBjYXRjaCBleFxyXG4gICAgICAgICAgaWYgZXggaW5zdGFuY2VvZiBUeXBlRXJyb3JcclxuICAgICAgICAgICAgcmVzdWx0LnR5cGVXcml0ZUVycm9yKGV4KVxyXG5cclxuICAgICAgICAgICAgaWYgb3B0aW9ucy5ub1Rocm93XHJcbiAgICAgICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgICAgdGhyb3cgZXhcclxuICAgICAgICBmaW5hbGx5XHJcbiAgICAgICAgICBpZiBub3QgZXg/XHJcbiAgICAgICAgICAgIHJlc3VsdC50eXBlV3JpdGVFcnJvcih1bmRlZmluZWQpXHJcbiAgICB9KVxyXG5cclxuICAgIHJlc3VsdC50eXBlTmFtZSA9IG9wdGlvbnMudHlwZVxyXG4gICAgcmVzdWx0LnR5cGVOYW1lcyA9IG9wdGlvbnMudHlwZXNcclxuICAgIHJlc3VsdC50eXBlQ2hlY2sgPSBvcHRpb25zLmNoZWNrXHJcbiAgICByZXN1bHQudHlwZUNoZWNrcyA9IG9wdGlvbnMuY2hlY2tzXHJcblxyXG4gICAgcmVzdWx0LnR5cGVSZWFkRXJyb3IgPSBrby5vYnNlcnZhYmxlKClcclxuICAgIHJlc3VsdC50eXBlV3JpdGVFcnJvciA9IGtvLm9ic2VydmFibGUoKVxyXG5cclxuICAgIHZhbGlkYXRlKHJlc3VsdCwgb3B0aW9ucylcclxuXHJcbiAgICBpZiBvcHRpb25zLnB1cmUgYW5kIG5vdCBvcHRpb25zLmRlZmVyRXZhbHVhdGlvblxyXG4gICAgICAjIGZvcmNlIGltbWVkaWF0ZSByZWFkXHJcbiAgICAgIHJlc3VsdCgpXHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG5cclxuICBrby5leHRlbmRlcnMuY29udmVydC5vcHRpb25zID0ge1xyXG4gICAgdmFsaWRhdGU6IHRydWVcclxuICAgIG1lc3NhZ2U6IHVuZGVmaW5lZFxyXG4gICAgbm9UaHJvdzogZmFsc2VcclxuICAgIHB1cmU6IHRydWVcclxuICAgIGRlZmVyRXZhbHVhdGlvbjogdHJ1ZVxyXG4gIH1cclxuXHJcbiAga28udHlwZWQgPSB7fVxyXG5cclxuICBkbyAtPlxyXG4gICAga28udHlwZWQuX2NvbnZlcnRlcnMgPSBjb252ZXJ0ZXJzID0ge31cclxuXHJcbiAgICBrby50eXBlZC5hZGRDb252ZXJ0ZXIgPSAoZnJvbVR5cGVOYW1lLCB0b1R5cGVOYW1lLCBjb252ZXJ0ZXIsIGRlZmF1bHRPcHRpb25zLCBkZWZhdWx0T3B0aW9uKSAtPlxyXG4gICAgICBjb25zb2xlPy5hc3NlcnQ/KGlzVmFsaWRUeXBlTmFtZShmcm9tVHlwZU5hbWUpLCBcIkludmFsaWQgdHlwZU5hbWUgI3tmcm9tVHlwZU5hbWV9XCIpXHJcbiAgICAgIGNvbnNvbGU/LmFzc2VydD8oaXNWYWxpZFR5cGVOYW1lKHRvVHlwZU5hbWUpLCBcIkludmFsaWQgdHlwZU5hbWUgI3tmcm9tVHlwZU5hbWV9XCIpXHJcblxyXG4gICAgICBpZiBkZWZhdWx0T3B0aW9ucz9cclxuICAgICAgICBpZiBkZWZhdWx0T3B0aW9uP1xyXG4gICAgICAgICAgd3JhcHBlciA9ICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgICAgICAgaWYgb3B0aW9ucz8gYW5kIG5vdCBpc0FuLk9iamVjdChvcHRpb25zKVxyXG4gICAgICAgICAgICAgIG8gPSB7fVxyXG4gICAgICAgICAgICAgIG9bZGVmYXVsdE9wdGlvbl0gPSBvcHRpb25zXHJcbiAgICAgICAgICAgICAgb3B0aW9ucyA9IG9cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBjb252ZXJ0ZXIodmFsdWUsIGtvLnV0aWxzLmV4dGVuZChrby51dGlscy5leHRlbmQoe30sIHdyYXBwZXIub3B0aW9ucyksIG9wdGlvbnMpKVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIHdyYXBwZXIgPSAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgICAgICAgIHJldHVybiBjb252ZXJ0ZXIodmFsdWUsIGtvLnV0aWxzLmV4dGVuZChrby51dGlscy5leHRlbmQoe30sIHdyYXBwZXIub3B0aW9ucyksIG9wdGlvbnMpKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgd3JhcHBlciA9ICh2YWx1ZSkgLT5cclxuICAgICAgICAgIHJldHVybiBjb252ZXJ0ZXIodmFsdWUpXHJcblxyXG4gICAgICB3cmFwcGVyLm9wdGlvbnMgPSBkZWZhdWx0T3B0aW9uc1xyXG5cclxuICAgICAgY29udmVydGVyc1tmcm9tVHlwZU5hbWVdID89IHt9XHJcbiAgICAgIGNvbnZlcnRlcnNbZnJvbVR5cGVOYW1lXVt0b1R5cGVOYW1lXSA9IHdyYXBwZXJcclxuXHJcbiAgICAgIHJldHVybiBrby50eXBlZFxyXG5cclxuICAgIGtvLnR5cGVkLmdldENvbnZlcnRlciA9IChmcm9tVHlwZU5hbWUsIHRvVHlwZU5hbWUpIC0+XHJcbiAgICAgIGNvbnZlcnRlcnNbZnJvbVR5cGVOYW1lXT9bdG9UeXBlTmFtZV1cclxuXHJcbiAgICBrby50eXBlZC5yZW1vdmVDb252ZXJ0ZXIgPSAoZnJvbVR5cGVOYW1lLCB0b1R5cGVOYW1lKSAtPlxyXG4gICAgICBpZiBjb252ZXJ0ZXJzW2Zyb21UeXBlTmFtZV0/W3RvVHlwZU5hbWVdP1xyXG4gICAgICAgIGRlbGV0ZSBjb252ZXJ0ZXJzW2Zyb21UeXBlTmFtZV0/W3RvVHlwZU5hbWVdXHJcblxyXG4gICAgICByZXR1cm4ga28udHlwZWRcclxuXHJcbiAgICByZXR1cm5cclxuXHJcblxyXG4gIGRvIC0+XHJcbiAgICAjIyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9NYXRoL3JvdW5kXHJcbiAgICBkZWNpbWFsQWRqdXN0ID0gKHR5cGUsIHZhbHVlLCBleHApIC0+XHJcbiAgICAgICMgaWYgZXhwIGlzIHVuZGVmaW5lZCBvciB6ZXJvXHJcbiAgICAgIGlmIG5vdCBleHA/IG9yICtleHAgPT0gMFxyXG4gICAgICAgIHJldHVybiB0eXBlKHZhbHVlKVxyXG5cclxuICAgICAgdmFsdWUgPSArdmFsdWVcclxuICAgICAgZXhwID0gK2V4cFxyXG5cclxuICAgICAgIyBJZiB0aGUgdmFsdWUgaXQgbm90IGEgbnVtYmVyIG9mIHRoZSBleHAgaXMgbm90IGFuIGludGVnZXJcclxuICAgICAgaWYgKGlzTmFOKHZhbHVlKSBvciBub3QgKHR5cGVvZiBleHAgPT0gJ251bWJlcicgYW5kIGV4cCAlIDEgPT0gMCkpXHJcbiAgICAgICAgcmV0dXJuIE5hTlxyXG5cclxuICAgICAgIyBTaGlmdFxyXG4gICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCkuc3BsaXQoJ2UnKVxyXG4gICAgICB2YWx1ZSA9IHR5cGUoKyh2YWx1ZVswXSArICdlJyArIChpZiB2YWx1ZVsxXSB0aGVuICgrdmFsdWVbMV0gLSBleHApIGVsc2UgLWV4cCkpKVxyXG5cclxuICAgICAgIyBTaGlmdCBiYWNrXHJcbiAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKS5zcGxpdCgnZScpXHJcbiAgICAgIHJldHVybiAoKyh2YWx1ZVswXSArICdlJyArIChpZiB2YWx1ZVsxXSB0aGVuICgrdmFsdWVbMV0gKyBleHApIGVsc2UgZXhwKSkpXHJcblxyXG4gICAgaWYgbm90IE1hdGgucm91bmQxMD9cclxuICAgICAgTWF0aC5yb3VuZDEwID0gKHZhbHVlLCBleHApIC0+XHJcbiAgICAgICAgcmV0dXJuIGRlY2ltYWxBZGp1c3QoTWF0aC5yb3VuZCwgdmFsdWUsIGV4cClcclxuXHJcbiAgICBpZiBub3QgTWF0aC5mbG9vcjEwP1xyXG4gICAgICBNYXRoLmZsb29yMTAgPSAodmFsdWUsIGV4cCkgLT5cclxuICAgICAgICByZXR1cm4gZGVjaW1hbEFkanVzdChNYXRoLmZsb29yLCB2YWx1ZSwgZXhwKVxyXG5cclxuICAgIGlmIG5vdCBNYXRoLmNlaWwxMD9cclxuICAgICAgTWF0aC5jZWlsMTAgPSAodmFsdWUsIGV4cCkgLT5cclxuICAgICAgICByZXR1cm4gZGVjaW1hbEFkanVzdChNYXRoLmNlaWwsIHZhbHVlLCBleHApXHJcblxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdCb29sZWFuJ1xyXG4gICAgJ051bWJlci5JbnRlZ2VyJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICByZXR1cm4gaWYgdmFsdWUgdGhlbiBvcHRpb25zLnRydXRoeSBlbHNlIG9wdGlvbnMuZmFsc2V5XHJcbiAgICB7XHJcbiAgICAgIHRydXRoeTogMVxyXG4gICAgICBmYWxzZXk6IDBcclxuICAgIH1cclxuICAgICd0cnV0aHknXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnQm9vbGVhbidcclxuICAgICdOdW1iZXInXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIHJldHVybiBpZiB2YWx1ZSB0aGVuIG9wdGlvbnMudHJ1dGh5IGVsc2Ugb3B0aW9ucy5mYWxzZXlcclxuICAgIHtcclxuICAgICAgdHJ1dGh5OiAxXHJcbiAgICAgIGZhbHNleTogMFxyXG4gICAgfVxyXG4gICAgJ3RydXRoeSdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdCb29sZWFuJ1xyXG4gICAgJ1N0cmluZydcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgdmFsdWUgPSBpZiB2YWx1ZSB0aGVuIG9wdGlvbnMudHJ1dGh5IGVsc2Ugb3B0aW9ucy5mYWxzZXlcclxuXHJcbiAgICAgIGlmIG9wdGlvbnMudXBwZXJDYXNlXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1VwcGVyQ2FzZSgpXHJcblxyXG4gICAgICByZXR1cm4gdmFsdWVcclxuICAgIHtcclxuICAgICAgdXBwZXJDYXNlOiBmYWxzZVxyXG4gICAgICB0cnV0aHk6ICd0cnVlJ1xyXG4gICAgICBmYWxzZXk6ICdmYWxzZSdcclxuICAgIH1cclxuICAgICd1cHBlckNhc2UnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnRGF0ZSdcclxuICAgICdNb21lbnQnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIChtb21lbnQgPyByZXF1aXJlKCdtb21lbnQnKSkodmFsdWUpXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnRGF0ZSdcclxuICAgICdTdHJpbmcnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIGlzTmFOKHZhbHVlLnZhbHVlT2YoKSlcclxuICAgICAgICByZXR1cm4gJydcclxuXHJcbiAgICAgIG1ldGhvZCA9IG9wdGlvbnMuZm9ybWF0c1tvcHRpb25zLmZvcm1hdF1cclxuICAgICAgcmV0dXJuIHZhbHVlW21ldGhvZF0uYXBwbHkodmFsdWUsIG9wdGlvbnMucGFyYW1zKVxyXG5cclxuICAgIHtcclxuICAgICAgZm9ybWF0czoge1xyXG4gICAgICAgIGRhdGU6ICd0b0RhdGVTdHJpbmcnXHJcbiAgICAgICAgaXNvOiAndG9JU09TdHJpbmcnXHJcbiAgICAgICAganNvbjogJ3RvSlNPTidcclxuICAgICAgICBsb2NhbGVEYXRlOiAndG9Mb2NhbGVEYXRlU3RyaW5nJ1xyXG4gICAgICAgIGxvY2FsZVRpbWU6ICd0b0xvY2FsZVRpbWVTdHJpbmcnXHJcbiAgICAgICAgbG9jYWxlOiAndG9Mb2NhbGVTdHJpbmcnXHJcbiAgICAgICAgdGltZTogJ3RvVGltZVN0cmluZydcclxuICAgICAgICB1dGM6ICd0b1VUQ1N0cmluZydcclxuICAgICAgICBkZWZhdWx0OiAndG9TdHJpbmcnXHJcbiAgICAgIH1cclxuICAgICAgZm9ybWF0OiAnZGVmYXVsdCdcclxuICAgICAgcGFyYW1zOiBbXVxyXG4gICAgfVxyXG4gICAgJ2Zvcm1hdCdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdEYXRlJyxcclxuICAgICdVbmRlZmluZWQnLFxyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBub3QgaXNOYU4odmFsdWUudmFsdWVPZigpKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VuYWJsZSB0byBjb252ZXJ0IGZyb20gdmFsaWQgRGF0ZSB0byBVbmRlZmluZWQnKVxyXG5cclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ01vbWVudCdcclxuICAgICdEYXRlJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICB2YWx1ZS50b0RhdGUoKVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ01vbWVudCdcclxuICAgICdTdHJpbmcnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG5vdCB2YWx1ZS5pc1ZhbGlkKClcclxuICAgICAgICByZXR1cm4gJydcclxuXHJcbiAgICAgIHJldHVybiB2YWx1ZS5sb2NhbGUob3B0aW9ucy5sb2NhbGUpLmZvcm1hdChvcHRpb25zLmZvcm1hdClcclxuICAgIHtcclxuICAgICAgc3RyaWN0OiBmYWxzZVxyXG4gICAgICBsb2NhbGU6ICdlbidcclxuICAgICAgZm9ybWF0OiAnTCdcclxuICAgIH1cclxuICAgICdmb3JtYXQnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTW9tZW50JyxcclxuICAgICdVbmRlZmluZWQnLFxyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiB2YWx1ZS5pc1ZhbGlkKClcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmFibGUgdG8gY29udmVydCBmcm9tIHZhbGlkIE1vbWVudCB0byBVbmRlZmluZWQnKVxyXG5cclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ051bWJlcidcclxuICAgICdCb29sZWFuJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLmZhbHNleT8gYW5kIHZhbHVlID09IG9wdGlvbnMuZmFsc2V5XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIGVsc2UgaWYgb3B0aW9ucy50cnV0aHk/IGFuZCB2YWx1ZSA9PSBvcHRpb25zLnRydXRoeVxyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgIGVsc2UgaWYgbm90IG9wdGlvbnMuZmFsc2V5P1xyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICBlbHNlIGlmIG5vdCBvcHRpb25zLnRydXRoeT9cclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjb252ZXJ0IGZyb20gI3t2YWx1ZX0gdG8gQm9vbGVhblwiKVxyXG4gICAge1xyXG4gICAgICB0cnV0aHk6IHVuZGVmaW5lZFxyXG4gICAgICBmYWxzZXk6IDBcclxuICAgIH1cclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdOdW1iZXInXHJcbiAgICAnTnVtYmVyLkludGVnZXInXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIHR5cGVvZiBvcHRpb25zLm1vZGUgPT0gJ3N0cmluZydcclxuICAgICAgICBtb2RlID0gTWF0aFtvcHRpb25zLm1vZGVdXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBtb2RlID0gb3B0aW9ucy5tb2RlXHJcblxyXG4gICAgICByZXR1cm4gbW9kZSh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgbW9kZTogJ3JvdW5kJ1xyXG4gICAgfVxyXG4gICAgJ21vZGUnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTnVtYmVyJ1xyXG4gICAgJ1N0cmluZydcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy5kZWNpbWFscz9cclxuICAgICAgICB2YWx1ZSA9IE1hdGgucm91bmQxMCh2YWx1ZSwgLW9wdGlvbnMuZGVjaW1hbHMpXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50b0ZpeGVkKG9wdGlvbnMuZGVjaW1hbHMpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKClcclxuXHJcbiAgICAgIHJldHVybiB2YWx1ZVxyXG4gICAge1xyXG4gICAgICBkZWNpbWFsczogdW5kZWZpbmVkXHJcbiAgICB9XHJcbiAgICAnZGVjaW1hbHMnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTnVtYmVyLkludGVnZXInXHJcbiAgICAnQm9vbGVhbidcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy5mYWxzZXk/IGFuZCB2YWx1ZSA9PSBvcHRpb25zLmZhbHNleVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICBlbHNlIGlmIG9wdGlvbnMudHJ1dGh5PyBhbmQgdmFsdWUgPT0gb3B0aW9ucy50cnV0aHlcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICBlbHNlIGlmIG5vdCBvcHRpb25zLmZhbHNleT9cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgZWxzZSBpZiBub3Qgb3B0aW9ucy50cnV0aHk/XHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY29udmVydCBmcm9tICN7dmFsdWV9IHRvIEJvb2xlYW5cIilcclxuICAgIHtcclxuICAgICAgdHJ1dGh5OiB1bmRlZmluZWRcclxuICAgICAgZmFsc2V5OiAwXHJcbiAgICB9XHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTnVtYmVyLkludGVnZXInXHJcbiAgICAnTnVtYmVyJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgcmV0dXJuIHZhbHVlXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTnVtYmVyLkludGVnZXInXHJcbiAgICAnU3RyaW5nJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZyhvcHRpb25zLmJhc2UpXHJcbiAgICAgIGlmIG9wdGlvbnMudXBwZXJDYXNlXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1VwcGVyQ2FzZSgpXHJcblxyXG4gICAgICByZXR1cm4gdmFsdWVcclxuICAgIHtcclxuICAgICAgYmFzZTogMTBcclxuICAgICAgdXBwZXJDYXNlOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgJ2Jhc2UnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnU3RyaW5nJyxcclxuICAgICdCb29sZWFuJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy50cmltXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50cmltKClcclxuXHJcbiAgICAgIGlmIG9wdGlvbnMuaWdub3JlQ2FzZVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudG9Mb3dlckNhc2UoKVxyXG5cclxuICAgICAgaWYgb3B0aW9ucy5zdHJpY3RcclxuICAgICAgICBpZiB2YWx1ZSA9PSBvcHRpb25zLnRydXRoeVswXVxyXG4gICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICBlbHNlIGlmIHZhbHVlID09IG9wdGlvbnMuZmFsc2V5WzBdXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGZvciB0cnV0aHkgaW4gb3B0aW9ucy50cnV0aHlcclxuICAgICAgICAgIGlmIHZhbHVlID09IHRydXRoeVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgICAgICBmb3IgZmFsc2V5IGluIG9wdGlvbnMuZmFsc2V5XHJcbiAgICAgICAgICBpZiB2YWx1ZSA9PSBmYWxzZXlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBCb29sZWFuXCIpXHJcbiAgICB7XHJcbiAgICAgIGlnbm9yZUNhc2U6IHRydWVcclxuICAgICAgc3RyaWN0OiBmYWxzZVxyXG4gICAgICB0cnV0aHk6IFtcclxuICAgICAgICAndHJ1ZSdcclxuICAgICAgICAndCdcclxuICAgICAgICAnMSdcclxuICAgICAgICAnLTEnXHJcbiAgICAgICAgJ3llcydcclxuICAgICAgICAneSdcclxuICAgICAgXVxyXG4gICAgICBmYWxzZXk6IFtcclxuICAgICAgICAnZmFsc2UnXHJcbiAgICAgICAgJ2YnXHJcbiAgICAgICAgJzAnXHJcbiAgICAgICAgJ25vJ1xyXG4gICAgICAgICduJ1xyXG4gICAgICBdXHJcbiAgICAgIHRyaW06IGZhbHNlXHJcbiAgICB9XHJcbiAgICAnc3RyaWN0J1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1N0cmluZydcclxuICAgICdEYXRlJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLnRyaW1cclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRyaW0oKVxyXG5cclxuICAgICAgZGF0ZSA9IG5ldyBEYXRlKHZhbHVlKVxyXG4gICAgICBpZiBpc05hTihkYXRlLnZhbHVlT2YoKSlcclxuICAgICAgICB0aHJvdyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tICN7dmFsdWV9IHRvIERhdGVcIilcclxuXHJcbiAgICAgIHJldHVybiBkYXRlXHJcbiAgICB7XHJcbiAgICAgIHRyaW06IGZhbHNlXHJcbiAgICB9XHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnU3RyaW5nJ1xyXG4gICAgJ01vbWVudCdcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy50cmltXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50cmltKClcclxuXHJcbiAgICAgIHJlc3VsdCA9IChtb21lbnQgPyByZXF1aXJlKCdtb21lbnQnKSkodmFsdWUsIG9wdGlvbnMuZm9ybWF0LCBvcHRpb25zLmxhbmd1YWdlLCBvcHRpb25zLnN0cmljdClcclxuICAgICAgaWYgbm90IHJlc3VsdC5pc1ZhbGlkKClcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBNb21lbnRcIilcclxuXHJcbiAgICAgIHJldHVybiByZXN1bHRcclxuICAgIHtcclxuICAgICAgc3RyaWN0OiBmYWxzZVxyXG4gICAgICBsYW5ndWFnZTogJ2VuJ1xyXG4gICAgICBmb3JtYXQ6ICdMJ1xyXG4gICAgICB0cmltOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgJ2Zvcm1hdCdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdTdHJpbmcnLFxyXG4gICAgJ051bWJlci5JbnRlZ2VyJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy50cmltXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50cmltKClcclxuXHJcbiAgICAgIGlmIG9wdGlvbnMuYmFzZSA9PSAxMCBhbmQgbm90IG9wdGlvbnMuc3RyaWN0XHJcbiAgICAgICAgdHJ5XHJcbiAgICAgICAgICByZXR1cm4ga28udHlwZWQuZ2V0Q29udmVydGVyKCdTdHJpbmcnLCAnTnVtYmVyJykodmFsdWUsIDApXHJcbiAgICAgICAgY2F0Y2ggZXhcclxuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tICN7dmFsdWV9IHRvIE51bWJlci5JbnRlZ2VyXCIpXHJcblxyXG4gICAgICBjaGFycyA9ICcwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXonXHJcbiAgICAgIGlmIG5vdCBSZWdFeHAoXCJeKFxcXFwtfFxcXFwrKT9bI3tjaGFycy5zbGljZSgwLCBvcHRpb25zLmJhc2UgPyAxMCl9XSskXCIsIGlmIG5vdCBvcHRpb25zLnN0cmljdCB0aGVuICdpJykudGVzdCh2YWx1ZSlcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBOdW1iZXIuSW50ZWdlclwiKVxyXG5cclxuICAgICAgcmV0dXJuIHBhcnNlSW50KHZhbHVlLCBvcHRpb25zLmJhc2UpXHJcbiAgICB7XHJcbiAgICAgIGJhc2U6IDEwXHJcbiAgICAgIHN0cmljdDogZmFsc2VcclxuICAgICAgdHJpbTogZmFsc2VcclxuICAgIH1cclxuICAgICdiYXNlJ1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1N0cmluZydcclxuICAgICdOdW1iZXInXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMudHJpbVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudHJpbSgpXHJcblxyXG4gICAgICBpZiBub3QgL14oXFwrfFxcLSk/WzAtOV0rKFxcLj8pWzAtOV0qJC8udGVzdCh2YWx1ZSlcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBOdW1iZXJcIilcclxuXHJcbiAgICAgIHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSwgb3B0aW9ucy5iYXNlKVxyXG5cclxuICAgICAgaWYgb3B0aW9ucy5kZWNpbWFscz9cclxuICAgICAgICB2YWx1ZSA9IE1hdGgucm91bmQxMCh2YWx1ZSwgLW9wdGlvbnMuZGVjaW1hbHMpXHJcblxyXG4gICAgICByZXR1cm4gdmFsdWVcclxuICAgIHtcclxuICAgICAgZGVjaW1hbHM6IHVuZGVmaW5lZFxyXG4gICAgICB0cmltOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgJ2RlY2ltYWxzJ1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1N0cmluZycsXHJcbiAgICAnVW5kZWZpbmVkJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy50cmltXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50cmltKClcclxuXHJcbiAgICAgIGlmIHZhbHVlLmxlbmd0aCAhPSAwXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gI3t2YWx1ZX0gdG8gVW5kZWZpbmVkXCIpXHJcblxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXHJcbiAgICB7XHJcbiAgICAgIHRyaW06IGZhbHNlXHJcbiAgICB9XHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnVW5kZWZpbmVkJyxcclxuICAgICdEYXRlJyxcclxuICAgICh2YWx1ZSkgLT5cclxuICAgICAgcmV0dXJuIG5ldyBEYXRlKCcnKVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1VuZGVmaW5lZCcsXHJcbiAgICAnU3RyaW5nJyxcclxuICAgICh2YWx1ZSkgLT5cclxuICAgICAgcmV0dXJuICcnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnVW5kZWZpbmVkJyxcclxuICAgICdNb21lbnQnLFxyXG4gICAgKHZhbHVlKSAtPlxyXG4gICAgICByZXR1cm4gcmVxdWlyZSgnbW9tZW50JykoJycpXHJcbiAgKVxyXG5cclxuICByZXR1cm4ga29cclxuIl19
