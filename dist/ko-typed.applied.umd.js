;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['knockout', 'is-an'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('knockout'), require('is-an'));
  } else {
    root.ko = factory(root.ko, root.isAn);
  }
}(this, function(ko, isAn) {
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

//# sourceMappingURL=data:application/json;base64,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QUssRUFBTDtFQURiLENBSEY7RUFPQSxFQUFFLENBQUMsS0FBSyxDQUFDLFlBQVQsQ0FDRSxXQURGLEVBRUUsUUFGRixFQUdFLFNBQUMsS0FBRDtBQUNFLFdBQU87RUFEVCxDQUhGO0VBT0EsRUFBRSxDQUFDLEtBQUssQ0FBQyxZQUFULENBQ0UsV0FERixFQUVFLFFBRkYsRUFHRSxTQUFDLEtBQUQ7QUFDRSxXQUFPLE9BQUEsQ0FBUSxRQUFSLENBQUEsQ0FBa0IsRUFBbEI7RUFEVCxDQUhGO0FBT0EsU0FBTztBQS82Qkc7O0FBaTdCWixTQUFBLENBQVUsRUFBViIsImZpbGUiOiJrby10eXBlZC5hcHBsaWVkLnVtZC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImFwcGx5S290ciA9IChrbykgLT5cclxuXHJcblxyXG4gIHR5cGVOYW1lVG9TdHJpbmcgPSAodmFsdWUpIC0+XHJcbiAgICBpZiBub3QgdmFsdWU/IG9yIHZhbHVlLmxlbmd0aCA9PSAwXHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuICAgIGVsc2UgaWYgaXNBbi5TdHJpbmcuTGl0ZXJhbCh2YWx1ZSlcclxuICAgICAgcmV0dXJuIHZhbHVlXHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVybiB2YWx1ZS5qb2luKCd8JylcclxuXHJcbiAgdHlwZU5hbWVUb0FycmF5ID0gKHZhbHVlKSAtPlxyXG4gICAgdmFsdWUgPSB0eXBlTmFtZVRvU3RyaW5nKHZhbHVlKVxyXG4gICAgaWYgaXNBbi5TdHJpbmcuTGl0ZXJhbCh2YWx1ZSlcclxuICAgICAgcmV0dXJuIHZhbHVlLnNwbGl0KCd8JylcclxuICAgIGVsc2VcclxuICAgICAgcmV0dXJuIFtdXHJcblxyXG4gIGlzVmFsaWRUeXBlTmFtZSA9ICh2YWx1ZSkgLT5cclxuICAgIHJldHVybiAvXltBLVpdLy50ZXN0KHZhbHVlKVxyXG5cclxuICBpc1R5cGVkID0gKHZhbHVlKSAtPlxyXG4gICAgcmV0dXJuIGlzQW4uRnVuY3Rpb24odmFsdWUpIGFuZCB2YWx1ZS50eXBlTmFtZT8gYW5kIHZhbHVlLnR5cGVOYW1lcz8gYW5kIHZhbHVlLnR5cGVDaGVjaz8gYW5kIHZhbHVlLnR5cGVDaGVja3M/XHJcblxyXG4gIHZhbGlkYXRlID0gKHRhcmdldCwgb3B0aW9ucykgLT5cclxuICAgIGlmIG5vdCBvcHRpb25zLnZhbGlkYXRlXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIHJ1bGUgPSB1bmRlZmluZWRcclxuXHJcbiAgICBlcnJvckNoZWNrID0gKCkgLT5cclxuICAgICAgIyBUcnkgaHR0cHM6Ly9naXRodWIuY29tL0tub2Nrb3V0LUNvbnRyaWIvS25vY2tvdXQtVmFsaWRhdGlvblxyXG4gICAgICBpZiBrby52YWxpZGF0aW9uPyBhbmQga28udmFsaWRhdGlvbi51dGlscy5pc1ZhbGlkYXRhYmxlKHRhcmdldClcclxuICAgICAgICBtZXNzYWdlID0gb3B0aW9ucy5tZXNzYWdlID8gKHRhcmdldC50eXBlV3JpdGVFcnJvcigpID8gdGFyZ2V0LnR5cGVSZWFkRXJyb3IoKSk/Lm1lc3NhZ2VcclxuICAgICAgICBpZiBub3QgcnVsZT9cclxuICAgICAgICAgIHJ1bGUgPSB7XHJcbiAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcclxuICAgICAgICAgICAgdmFsaWRhdG9yOiAoKSAtPlxyXG4gICAgICAgICAgICAgIG5vdCB0YXJnZXQudHlwZVdyaXRlRXJyb3IoKT8gYW5kIG5vdCB0YXJnZXQudHlwZVJlYWRFcnJvcigpP1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAga28udmFsaWRhdGlvbi5hZGRBbm9ueW1vdXNSdWxlKHRhcmdldCwgcnVsZSlcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBydWxlLm1lc3NhZ2UgPSBtZXNzYWdlXHJcbiAgICAgICAgICB0YXJnZXQucnVsZXMudmFsdWVIYXNNdXRhdGVkKClcclxuXHJcbiAgICB0YXJnZXQudHlwZVdyaXRlRXJyb3Iuc3Vic2NyaWJlKGVycm9yQ2hlY2spXHJcbiAgICB0YXJnZXQudHlwZVJlYWRFcnJvci5zdWJzY3JpYmUoZXJyb3JDaGVjaylcclxuXHJcbiAgICBpZiBrby52YWxpZGF0aW9uP1xyXG4gICAgICB0YXJnZXQuZXh0ZW5kKHsgdmFsaWRhdGFibGU6IHRydWUgfSlcclxuXHJcbiAgICBpZiBub3Qgb3B0aW9ucy5kZWZlckV2YWx1YXRpb25cclxuICAgICAgZXJyb3JDaGVjaygpXHJcblxyXG4gIGtvLmV4dGVuZGVycy50eXBlID0gKHRhcmdldCwgb3B0aW9ucykgLT5cclxuICAgICMgUmVxdWlyZXNcclxuICAgICMgdHlwZU5hbWUgOiBTdHJpbmdcclxuICAgICMgdHlwZU5hbWVzIDogQXJyYXkgb2YgU3RyaW5nXHJcbiAgICAjIHR5cGVDaGVjayA6IGZ1bmN0aW9uICh2YWx1ZSkgeyAuLi4gfVxyXG4gICAgIyB0eXBlQ2hlY2tzIDogeyB0eXBlTmFtZTogZnVuY3Rpb24gaXNUeXBlKHZhbHVlKSB7IC4uLiB9LCAuLi4gfVxyXG5cclxuICAgIGlmIGlzQW4uU3RyaW5nLkxpdGVyYWwob3B0aW9ucykgb3IgaXNBbi5BcnJheShvcHRpb25zKVxyXG4gICAgICAjIC5leHRlbmQoeyB0eXBlOiAnVHlwZU5hbWV8VHlwZU5hbWV8VHlwZU5hbWUnIH0pXHJcbiAgICAgICMgLmV4dGVuZCh7IHR5cGU6IFsnVHlwZU5hbWUnLCdUeXBlTmFtZScsLi4uXSB9KVxyXG4gICAgICBvcHRpb25zID0geyB0eXBlOiBvcHRpb25zIH1cclxuICAgIGVsc2UgaWYgaXNBbi5GdW5jdGlvbihvcHRpb25zKVxyXG4gICAgICAjIC5leHRlbmQoeyB0eXBlOiBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIHRydWV8ZmFsc2U7IH0gfSlcclxuICAgICAgb3B0aW9ucyA9IHtcclxuICAgICAgICB0eXBlOiBvcHRpb25zLnR5cGVOYW1lXHJcbiAgICAgICAgY2hlY2s6IG9wdGlvbnNcclxuICAgICAgfVxyXG5cclxuICAgIG9wdGlvbnMgPSBrby51dGlscy5leHRlbmQoa28udXRpbHMuZXh0ZW5kKHt9LCBrby5leHRlbmRlcnMudHlwZS5vcHRpb25zKSwgb3B0aW9ucylcclxuXHJcbiAgICBpZiBvcHRpb25zLnVzZURlZmF1bHQgYW5kIG5vdCBvcHRpb25zLmRlZmF1bHRGdW5jP1xyXG4gICAgICBvcHRpb25zLmRlZmF1bHRGdW5jID0gKCkgLT4gb3B0aW9ucy5kZWZhdWx0XHJcblxyXG4gICAgIyBHYXRoZXIgdHlwZSBuYW1lc1xyXG4gICAgdHlwZU5hbWVzID0gdHlwZU5hbWVUb0FycmF5KG9wdGlvbnMudHlwZSlcclxuXHJcbiAgICBkbyAtPlxyXG4gICAgICBmb3Igb3duIG5hbWUsIGNoZWNrIG9mIG9wdGlvbnNcclxuICAgICAgICBpZiBub3QgaXNWYWxpZFR5cGVOYW1lKG5hbWUpXHJcbiAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgIGlmIHR5cGVOYW1lcy5pbmRleE9mKG5hbWUpID09IC0xXHJcbiAgICAgICAgICB0eXBlTmFtZXMucHVzaChuYW1lKVxyXG5cclxuICAgIHR5cGVOYW1lID0gdHlwZU5hbWVUb1N0cmluZyh0eXBlTmFtZXMpXHJcblxyXG4gICAgIyBjaGVja3NcclxuICAgIHR5cGVDaGVja3MgPSB7fVxyXG4gICAgZG8gLT5cclxuICAgICAgZm9yIG5hbWUgaW4gdHlwZU5hbWVzXHJcbiAgICAgICAgdHlwZUNoZWNrc1tuYW1lXSA9IG9wdGlvbnNbbmFtZV0gPyBpc0FuKG5hbWUsIHsgcmV0dXJuQ2hlY2tlcjogdHJ1ZSB9KVxyXG5cclxuICAgICMgY2hlY2tcclxuICAgIHR5cGVDaGVjayA9IGRvIC0+XHJcbiAgICAgIF9jaGVjayA9IG9wdGlvbnMuY2hlY2sgPyAoKCkgLT4gdHJ1ZSlcclxuICAgICAgcmV0dXJuICh2YWx1ZSkgLT5cclxuICAgICAgICBfY2hlY2sodmFsdWUpIGFuZCAoKHR5cGVOYW1lcy5sZW5ndGggPT0gMCkgb3IgKHR5cGVOYW1lcy5zb21lKChuYW1lKSAtPiB0eXBlQ2hlY2tzW25hbWVdKHZhbHVlKSkpKVxyXG5cclxuICAgIHJlc3VsdCA9IGtvLmNvbXB1dGVkKHtcclxuICAgICAgcHVyZTogb3B0aW9ucy5wdXJlXHJcbiAgICAgIGRlZmVyRXZhbHVhdGlvbjogb3B0aW9ucy5kZWZlckV2YWx1YXRpb25cclxuXHJcbiAgICAgIHJlYWQ6ICgpIC0+XHJcbiAgICAgICAgdHJ5XHJcbiAgICAgICAgICBpbnRlcm5hbFZhbHVlID0gdGFyZ2V0KClcclxuXHJcbiAgICAgICAgICBpZiBub3QgdHlwZUNoZWNrKGludGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmV4cGVjdGVkIGludGVybmFsIHR5cGUuIEV4cGVjdGVkICN7dHlwZU5hbWV9LCBnb3QgI3tpc0FuKGludGVybmFsVmFsdWUpfVwiKVxyXG5cclxuICAgICAgICBjYXRjaCBleFxyXG4gICAgICAgICAgaWYgZXggaW5zdGFuY2VvZiBUeXBlRXJyb3JcclxuICAgICAgICAgICAgcmVzdWx0LnR5cGVSZWFkRXJyb3IoZXgpXHJcblxyXG4gICAgICAgICAgICBpZiBvcHRpb25zLnVzZURlZmF1bHRcclxuICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5kZWZhdWx0RnVuYygpXHJcblxyXG4gICAgICAgICAgdGhyb3cgZXhcclxuXHJcbiAgICAgICAgcmVzdWx0LnR5cGVSZWFkRXJyb3IodW5kZWZpbmVkKVxyXG4gICAgICAgIHJldHVybiBpbnRlcm5hbFZhbHVlXHJcblxyXG4gICAgICB3cml0ZTogKGV4dGVybmFsVmFsdWUpIC0+XHJcbiAgICAgICAgdHJ5XHJcbiAgICAgICAgICBpZiB0eXBlQ2hlY2soZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgdGFyZ2V0KGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmV4cGVjdGVkIGV4dGVybmFsIHR5cGUuIEV4cGVjdGVkICN7dHlwZU5hbWV9LCByZWNlaXZlZCAje2lzQW4oZXh0ZXJuYWxWYWx1ZSl9XCIpXHJcbiAgICAgICAgY2F0Y2ggZXhcclxuICAgICAgICAgIGlmIGV4IGluc3RhbmNlb2YgVHlwZUVycm9yXHJcbiAgICAgICAgICAgIHJlc3VsdC50eXBlV3JpdGVFcnJvcihleClcclxuXHJcbiAgICAgICAgICAgIGlmIG9wdGlvbnMubm9UaHJvd1xyXG4gICAgICAgICAgICAgIHJldHVyblxyXG5cclxuICAgICAgICAgIHRocm93IGV4XHJcblxyXG4gICAgICAgIHJlc3VsdC50eXBlV3JpdGVFcnJvcih1bmRlZmluZWQpXHJcbiAgICB9KVxyXG5cclxuICAgIHJlc3VsdC50eXBlTmFtZSA9IHR5cGVOYW1lXHJcbiAgICByZXN1bHQudHlwZU5hbWVzID0gdHlwZU5hbWVzXHJcbiAgICByZXN1bHQudHlwZUNoZWNrID0gdHlwZUNoZWNrXHJcbiAgICByZXN1bHQudHlwZUNoZWNrcyA9IHR5cGVDaGVja3NcclxuXHJcbiAgICByZXN1bHQudHlwZVdyaXRlRXJyb3IgPSBrby5vYnNlcnZhYmxlKClcclxuICAgIHJlc3VsdC50eXBlUmVhZEVycm9yID0ga28ub2JzZXJ2YWJsZSgpXHJcblxyXG4gICAgdmFsaWRhdGUocmVzdWx0LCBvcHRpb25zKVxyXG5cclxuICAgIGlmIG9wdGlvbnMucHVyZSBhbmQgbm90IG9wdGlvbnMuZGVmZXJFdmFsdWF0aW9uXHJcbiAgICAgICMgZm9yY2UgaW1tZWRpYXRlIHJlYWRcclxuICAgICAgcmVzdWx0KClcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcblxyXG4gIGtvLmV4dGVuZGVycy50eXBlLm9wdGlvbnMgPSB7XHJcbiAgICB2YWxpZGF0ZTogdHJ1ZVxyXG4gICAgbWVzc2FnZTogdW5kZWZpbmVkXHJcbiAgICBub1Rocm93OiBmYWxzZVxyXG4gICAgdXNlRGVmYXVsdDogZmFsc2VcclxuICAgICMgZGVmYXVsdFxyXG4gICAgIyBkZWZhdWx0RnVuY1xyXG4gICAgcHVyZTogdHJ1ZVxyXG4gICAgZGVmZXJFdmFsdWF0aW9uOiB0cnVlXHJcbiAgfVxyXG5cclxuXHJcbiAga28uZXh0ZW5kZXJzLmNvbnZlcnQgPSAodGFyZ2V0LCBvcHRpb25zKSAtPlxyXG4gICAgIyBub3JtYWxpemUgb3B0aW9uc1xyXG4gICAgZG8gLT5cclxuICAgICAgaWYgaXNBbi5TdHJpbmcob3B0aW9ucykgb3IgaXNBbi5BcnJheShvcHRpb25zKVxyXG4gICAgICAgIG9wdGlvbnMgPSB7IHR5cGU6IG9wdGlvbnMgfVxyXG5cclxuICAgICAgIyBtZXJnZSBvcHRpb25zXHJcbiAgICAgIG9wdGlvbnMgPSBrby51dGlscy5leHRlbmQoa28udXRpbHMuZXh0ZW5kKHt9LCBrby5leHRlbmRlcnMuY29udmVydC5vcHRpb25zKSwgb3B0aW9ucylcclxuXHJcbiAgICAgIGZpbmFsT3B0aW9ucyA9IHtcclxuICAgICAgICBjaGVja1NlbGY6IG9wdGlvbnMuY2hlY2sgPyAoKSAtPiB0cnVlXHJcbiAgICAgICAgcmVhZDogb3B0aW9ucy5yZWFkXHJcbiAgICAgICAgd3JpdGU6IG9wdGlvbnMud3JpdGVcclxuICAgICAgICBjaGVja3M6IHt9XHJcbiAgICAgICAgY2hlY2tlcnM6IFtdXHJcbiAgICAgICAgaXNUeXBlZDogaXNUeXBlZCh0YXJnZXQpXHJcbiAgICAgICAgaWdub3JlRGVmYXVsdENvbnZlcnRlcnM6IG9wdGlvbnMuaWdub3JlRGVmYXVsdENvbnZlcnRlcnNcclxuICAgICAgICBwdXJlOiBvcHRpb25zLnB1cmVcclxuICAgICAgICBkZWZlckV2YWx1YXRpb246IG9wdGlvbnMuZGVmZXJFdmFsdWF0aW9uXHJcbiAgICAgICAgZGVmYXVsdEZ1bmM6IG9wdGlvbnMuZGVmYXVsdEZ1bmNcclxuICAgICAgICBub1Rocm93OiBvcHRpb25zLm5vVGhyb3dcclxuICAgICAgICBtZXNzYWdlOiBvcHRpb25zLm1lc3NhZ2VcclxuICAgICAgICB1c2VEZWZhdWx0OiBvcHRpb25zLnVzZURlZmF1bHRcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgZmluYWxPcHRpb25zLnVzZURlZmF1bHQgYW5kIG5vdCBvcHRpb25zLmRlZmF1bHRGdW5jP1xyXG4gICAgICAgIGZpbmFsT3B0aW9ucy5kZWZhdWx0ID0gb3B0aW9ucy5kZWZhdWx0XHJcbiAgICAgICAgZmluYWxPcHRpb25zLmRlZmF1bHRGdW5jID0gKCkgLT4gZmluYWxPcHRpb25zLmRlZmF1bHRcclxuXHJcbiAgICAgIGZpbmFsT3B0aW9ucy5jaGVja2Vycy5wdXNoKGZpbmFsT3B0aW9ucy5jaGVja1NlbGYpXHJcblxyXG4gICAgICAjIEdhdGhlciBhbGwgZXh0ZXJuYWwgdHlwZXNcclxuICAgICAgZmluYWxPcHRpb25zLnR5cGVzID0gdHlwZU5hbWVUb0FycmF5KG9wdGlvbnMudHlwZSlcclxuICAgICAgZm9yIG93biBleHRUeXBlTmFtZSBvZiBvcHRpb25zXHJcbiAgICAgICAgaWYgbm90IGlzVmFsaWRUeXBlTmFtZShleHRUeXBlTmFtZSlcclxuICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICAgICMgQWRkIGV4dGVybmFsIHR5cGVcclxuICAgICAgICBpZiBmaW5hbE9wdGlvbnMudHlwZXMuaW5kZXhPZihleHRUeXBlTmFtZSkgPT0gLTFcclxuICAgICAgICAgIGZpbmFsT3B0aW9ucy50eXBlcy5wdXNoKGV4dFR5cGVOYW1lKVxyXG5cclxuICAgICAgIyBFeHBhbmQgZWFjaCBFeHRlcm5hbCBUeXBlXHJcbiAgICAgIGZvciBleHRUeXBlTmFtZSBpbiBmaW5hbE9wdGlvbnMudHlwZXNcclxuICAgICAgICBleHRUeXBlT3B0aW9ucyA9IG9wdGlvbnNbZXh0VHlwZU5hbWVdID8ge31cclxuXHJcbiAgICAgICAgZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXSA9IHtcclxuICAgICAgICAgIGNoZWNrU2VsZjogZXh0VHlwZU9wdGlvbnMuY2hlY2sgPyBpc0FuKGV4dFR5cGVOYW1lLCB7IHJldHVybkNoZWNrZXI6IHRydWUgfSkgPyAoKSAtPiB0cnVlXHJcbiAgICAgICAgICByZWFkOiBleHRUeXBlT3B0aW9ucy5yZWFkXHJcbiAgICAgICAgICB3cml0ZTogZXh0VHlwZU9wdGlvbnMud3JpdGVcclxuICAgICAgICAgIHR5cGVzOiB0eXBlTmFtZVRvQXJyYXkoZXh0VHlwZU9wdGlvbnMudHlwZSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNoZWNrUGFyZW50ID0gZmluYWxPcHRpb25zLmNoZWNrU2VsZlxyXG4gICAgICAgIGZpbmFsT3B0aW9ucy5jaGVja2Vycy5wdXNoKGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV0uY2hlY2tTZWxmKVxyXG4gICAgICAgIGZpbmFsT3B0aW9ucy5jaGVja3NbZXh0VHlwZU5hbWVdID0gZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXS5jaGVjayA9IGRvIChleHRUeXBlTmFtZSkgLT5cclxuICAgICAgICAgICh2YWx1ZSkgLT4gZmluYWxPcHRpb25zLmNoZWNrU2VsZih2YWx1ZSkgYW5kIGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV0uY2hlY2tTZWxmKHZhbHVlKVxyXG5cclxuICAgICAgICAjIEdhdGhlciBhbGwgaW50ZXJuYWwgdHlwZXNcclxuICAgICAgICBmb3Igb3duIGludFR5cGVOYW1lIG9mIGV4dFR5cGVPcHRpb25zXHJcbiAgICAgICAgICBpZiBub3QgaXNWYWxpZFR5cGVOYW1lKGludFR5cGVOYW1lKVxyXG4gICAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAgICMgQWRkIGludGVybmFsIHR5cGVcclxuICAgICAgICAgIGlmIGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV0udHlwZXMuaW5kZXhPZihpbnRUeXBlTmFtZSkgPT0gLTFcclxuICAgICAgICAgICAgZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXS50eXBlcy5wdXNoKGludFR5cGVOYW1lKVxyXG5cclxuICAgICAgICAjIEV4cGFuZCBhbGwgaW50ZXJuYWwgdHlwZXNcclxuICAgICAgICBmb3IgaW50VHlwZU5hbWUgaW4gZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXS50eXBlc1xyXG4gICAgICAgICAgaW50VHlwZU9wdGlvbnMgPSBvcHRpb25zW2V4dFR5cGVOYW1lXT9baW50VHlwZU5hbWVdID8ge31cclxuXHJcbiAgICAgICAgICBmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdW2ludFR5cGVOYW1lXSA9IHtcclxuICAgICAgICAgICAgY2hlY2tTZWxmOiBpbnRUeXBlT3B0aW9ucy5jaGVja1xyXG4gICAgICAgICAgICByZWFkOiBpbnRUeXBlT3B0aW9ucy5yZWFkXHJcbiAgICAgICAgICAgIHdyaXRlOiBpbnRUeXBlT3B0aW9ucy53cml0ZVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIG5vdCBmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdW2ludFR5cGVOYW1lXS5jaGVja1NlbGY/XHJcbiAgICAgICAgICAgIGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV1baW50VHlwZU5hbWVdLmNoZWNrID0gZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXVtpbnRUeXBlTmFtZV0uY2hlY2tTZWxmID0gZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXS5jaGVja1NlbGZcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXVtpbnRUeXBlTmFtZV0uY2hlY2sgPSBkbyAoZXh0VHlwZU5hbWUsIGludFR5cGVOYW1lKSAtPlxyXG4gICAgICAgICAgICAgICh2YWx1ZSkgLT4gZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXS5jaGVjayh2YWx1ZSkgYW5kIGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV1baW50VHlwZU5hbWVdLmNoZWNrU2VsZih2YWx1ZSlcclxuXHJcbiAgICAgICAgZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXS50eXBlID0gdHlwZU5hbWVUb1N0cmluZyhmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdLnR5cGVzKVxyXG5cclxuICAgICAgZmluYWxPcHRpb25zLnR5cGUgPSB0eXBlTmFtZVRvU3RyaW5nKGZpbmFsT3B0aW9ucy50eXBlcylcclxuICAgICAgZmluYWxPcHRpb25zLmNoZWNrID0gKHZhbHVlKSAtPlxyXG4gICAgICAgIGZpbmFsT3B0aW9ucy5jaGVja1NlbGYodmFsdWUpIGFuZCAoKGZpbmFsT3B0aW9ucy5jaGVja2Vycy5sZW5ndGggPT0gMCkgb3IgZmluYWxPcHRpb25zLmNoZWNrZXJzLnNvbWUoKGNoZWNrZXIpIC0+IGNoZWNrZXIodmFsdWUpKSlcclxuXHJcbiAgICAgIG9wdGlvbnMgPSBmaW5hbE9wdGlvbnNcclxuXHJcbiAgICByZXN1bHQgPSBrby5jb21wdXRlZCh7XHJcbiAgICAgIHB1cmU6IG9wdGlvbnMucHVyZVxyXG4gICAgICBkZWZlckV2YWx1YXRpb246IG9wdGlvbnMuZGVmZXJFdmFsdWF0aW9uXHJcblxyXG4gICAgICByZWFkOiAoKSAtPlxyXG4gICAgICAgIHRyeVxyXG4gICAgICAgICAgaW50ZXJuYWxWYWx1ZSA9IHRhcmdldCgpXHJcbiAgICAgICAgICBleHRlcm5hbFZhbHVlID0gdW5kZWZpbmVkXHJcblxyXG4gICAgICAgICAgIyBUcnkgZXhhY3QgaW50ZXJuYWwgdHlwZSBtYXRjaFxyXG4gICAgICAgICAgdHJ5UmVhZCA9IChjb252ZXJ0LCBvcHRpb25zKSAtPlxyXG4gICAgICAgICAgICBpZiBjb252ZXJ0P1xyXG4gICAgICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICAgICAgZXh0ZXJuYWxWYWx1ZSA9IGNvbnZlcnQoaW50ZXJuYWxWYWx1ZSwgb3B0aW9ucylcclxuICAgICAgICAgICAgICBjYXRjaCBleFxyXG4gICAgICAgICAgICAgICAgaWYgZXggbm90IGluc3RhbmNlb2YgVHlwZUVycm9yXHJcbiAgICAgICAgICAgICAgICAgIHRocm93IGV4XHJcblxyXG4gICAgICAgICAgICAgIGlmIG5vdCBleD9cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICAgICAgICAjIExvb2sgZm9yIHNwZWNpZmljIGNvbnZlcnNpb25cclxuICAgICAgICAgIGZvciBleHRUeXBlTmFtZSBpbiBvcHRpb25zLnR5cGVzXHJcbiAgICAgICAgICAgIGV4dFR5cGVPcHRpb25zID0gb3B0aW9uc1tleHRUeXBlTmFtZV1cclxuXHJcbiAgICAgICAgICAgICMgZ28gYnkgb3VyIG9yZGVyXHJcbiAgICAgICAgICAgIGludFR5cGVOYW1lcyA9IGV4dFR5cGVPcHRpb25zLnR5cGVzXHJcblxyXG4gICAgICAgICAgICBpZiBpbnRUeXBlTmFtZXMubGVuZ3RoID09IDAgYW5kIG5vdCBleHRUeXBlT3B0aW9ucy5yZWFkP1xyXG4gICAgICAgICAgICAgIGlmIG9wdGlvbnMuaXNUeXBlZFxyXG4gICAgICAgICAgICAgICAgIyBnbyBieSB0YXJnZXQgb3JkZXJcclxuICAgICAgICAgICAgICAgIGludFR5cGVOYW1lcyA9IHRhcmdldC50eXBlTmFtZXNcclxuICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAjIGdvIGJ5IGluZmVycmVkIG9yZGVyXHJcbiAgICAgICAgICAgICAgICBpbnRUeXBlTmFtZXMgPSBbaXNBbihpbnRlcm5hbFZhbHVlKV1cclxuXHJcbiAgICAgICAgICAgIGZvciBpbnRUeXBlTmFtZSBpbiBpbnRUeXBlTmFtZXNcclxuICAgICAgICAgICAgICAjIGNoZWNrIGludGVybmFsIHR5cGVcclxuICAgICAgICAgICAgICBpZiBvcHRpb25zLmlzVHlwZWRcclxuICAgICAgICAgICAgICAgIGlmIG5vdCB0YXJnZXQudHlwZUNoZWNrc1tpbnRUeXBlTmFtZV0/KGludGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgaWYgbm90IGlzQW4oaW50ZXJuYWxWYWx1ZSwgaW50VHlwZU5hbWUpXHJcbiAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICAgICAgICAgICMgZ2V0IHRoZSBvcHRpb25zXHJcbiAgICAgICAgICAgICAgaW50VHlwZU9wdGlvbnMgPSBleHRUeXBlT3B0aW9uc1tpbnRUeXBlTmFtZV0gPyB7IGNoZWNrOiBleHRUeXBlT3B0aW9ucy5jaGVjayB9XHJcblxyXG4gICAgICAgICAgICAgICMgdHJ5IHNwZWNpZmljIGNvbnZlcnNpb25zXHJcbiAgICAgICAgICAgICAgaWYgdHJ5UmVhZChpbnRUeXBlT3B0aW9ucy5yZWFkLCBpbnRUeXBlT3B0aW9ucy5yZWFkT3B0aW9ucylcclxuICAgICAgICAgICAgICAgIGlmIGludFR5cGVPcHRpb25zLmNoZWNrKGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBleHRlcm5hbFZhbHVlXHJcblxyXG4gICAgICAgICAgICAgICMgdHJ5IG5vIGNvbnZlcnNpb25cclxuICAgICAgICAgICAgICBpZiBleHRUeXBlTmFtZSA9PSBpbnRUeXBlTmFtZVxyXG4gICAgICAgICAgICAgICAgaWYgaW50VHlwZU9wdGlvbnMuY2hlY2soaW50ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICAgICAgZXh0ZXJuYWxWYWx1ZSA9IGludGVybmFsVmFsdWVcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4dGVybmFsVmFsdWVcclxuXHJcbiAgICAgICAgICAgICAgIyB0cnkgZGVmYXVsdCBjb252ZXJzaW9uXHJcbiAgICAgICAgICAgICAgaWYgbm90IG9wdGlvbnMuaWdub3JlRGVmYXVsdENvbnZlcnRlcnNcclxuICAgICAgICAgICAgICAgIGlmIHRyeVJlYWQoa28udHlwZWQuZ2V0Q29udmVydGVyKGludFR5cGVOYW1lLCBleHRUeXBlTmFtZSksIGludFR5cGVPcHRpb25zLnJlYWRPcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgICBpZiBpbnRUeXBlT3B0aW9ucy5jaGVjayhleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBleHRlcm5hbFZhbHVlXHJcblxyXG4gICAgICAgICAgIyBMb29rIGZvciBvbmUtc2lkZWQgY29udmVyc2lvblxyXG4gICAgICAgICAgZm9yIGV4dFR5cGVOYW1lIGluIG9wdGlvbnMudHlwZXNcclxuICAgICAgICAgICAgZXh0VHlwZU9wdGlvbnMgPSBvcHRpb25zW2V4dFR5cGVOYW1lXVxyXG5cclxuICAgICAgICAgICAgaWYgdHJ5UmVhZChleHRUeXBlT3B0aW9ucy5yZWFkLCBleHRUeXBlT3B0aW9ucy5yZWFkT3B0aW9ucylcclxuICAgICAgICAgICAgICBpZiBleHRUeXBlT3B0aW9ucy5jaGVjayhleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4dGVybmFsVmFsdWVcclxuXHJcbiAgICAgICAgICAjIExvb2sgZm9yIGdlbmVyaWMgY29udmVyc2lvblxyXG4gICAgICAgICAgaWYgdHJ5UmVhZChvcHRpb25zLnJlYWQsIG9wdGlvbnMucmVhZE9wdGlvbnMpXHJcbiAgICAgICAgICAgIGlmIG9wdGlvbnMuY2hlY2soZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICByZXR1cm4gZXh0ZXJuYWxWYWx1ZVxyXG5cclxuICAgICAgICAgIGlmIG9wdGlvbnMudHlwZXMubGVuZ3RoID09IDBcclxuICAgICAgICAgICAgaWYgb3B0aW9ucy5jaGVjayhleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgIGV4dGVybmFsVmFsdWUgPSBpbnRlcm5hbFZhbHVlXHJcbiAgICAgICAgICAgICAgcmV0dXJuIGV4dGVybmFsVmFsdWVcclxuXHJcbiAgICAgICAgICBpZiBvcHRpb25zLnR5cGU/XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tIGludGVybmFsIHR5cGUgI3tpc0FuKGludGVybmFsVmFsdWUpfSB0byBleHRlcm5hbCB0eXBlICN7b3B0aW9ucy50eXBlfVwiKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSBpbnRlcm5hbCB0eXBlICN7aXNBbihpbnRlcm5hbFZhbHVlKX1cIilcclxuICAgICAgICBjYXRjaCBleFxyXG4gICAgICAgICAgaWYgZXggaW5zdGFuY2VvZiBUeXBlRXJyb3JcclxuICAgICAgICAgICAgcmVzdWx0LnR5cGVSZWFkRXJyb3IoZXgpXHJcblxyXG4gICAgICAgICAgICBpZiBvcHRpb25zLnVzZURlZmF1bHRcclxuICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5kZWZhdWx0RnVuYygpXHJcblxyXG4gICAgICAgICAgdGhyb3cgZXhcclxuICAgICAgICBmaW5hbGx5XHJcbiAgICAgICAgICBpZiBub3QgZXg/XHJcbiAgICAgICAgICAgIHJlc3VsdC50eXBlUmVhZEVycm9yKHVuZGVmaW5lZClcclxuXHJcbiAgICAgIHdyaXRlOiAoZXh0ZXJuYWxWYWx1ZSkgLT5cclxuICAgICAgICB0cnlcclxuICAgICAgICAgIHRyeVdyaXRlID0gKGNvbnZlcnQsIG9wdGlvbnMpIC0+XHJcbiAgICAgICAgICAgIGlmIGNvbnZlcnQ/XHJcbiAgICAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgICAgICBpbnRlcm5hbFZhbHVlID0gY29udmVydChleHRlcm5hbFZhbHVlLCBvcHRpb25zKVxyXG4gICAgICAgICAgICAgIGNhdGNoIGV4XHJcbiAgICAgICAgICAgICAgICBpZiBleCBub3QgaW5zdGFuY2VvZiBUeXBlRXJyb3JcclxuICAgICAgICAgICAgICAgICAgdGhyb3cgZXhcclxuXHJcbiAgICAgICAgICAgICAgaWYgbm90IGV4P1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0KGludGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgICAgICAgIyBMb29rIGZvciBzcGVjaWZpYyBjb252ZXJzaW9uXHJcbiAgICAgICAgICBmb3IgZXh0VHlwZU5hbWUgaW4gb3B0aW9ucy50eXBlc1xyXG4gICAgICAgICAgICBleHRUeXBlT3B0aW9ucyA9IG9wdGlvbnNbZXh0VHlwZU5hbWVdXHJcblxyXG4gICAgICAgICAgICBpZiBub3QgZXh0VHlwZU9wdGlvbnMuY2hlY2soZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAgICAgIyBnbyBieSBvdXIgb3JkZXJcclxuICAgICAgICAgICAgaW50VHlwZU5hbWVzID0gZXh0VHlwZU9wdGlvbnMudHlwZXNcclxuXHJcbiAgICAgICAgICAgIGlmIGludFR5cGVOYW1lcy5sZW5ndGggPT0gMCBhbmQgbm90IGV4dFR5cGVPcHRpb25zLndyaXRlP1xyXG4gICAgICAgICAgICAgIGlmIG9wdGlvbnMuaXNUeXBlZFxyXG4gICAgICAgICAgICAgICAgIyBnbyBieSB0YXJnZXQgb3JkZXJcclxuICAgICAgICAgICAgICAgIGludFR5cGVOYW1lcyA9IHRhcmdldC50eXBlTmFtZXNcclxuICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAjIGdvIGJ5IGluZmVycmVkIG9yZGVyXHJcbiAgICAgICAgICAgICAgICBpbnRUeXBlTmFtZXMgPSBbaXNBbihleHRlcm5hbFZhbHVlKV1cclxuXHJcbiAgICAgICAgICAgIGZvciBpbnRUeXBlTmFtZSBpbiBpbnRUeXBlTmFtZXNcclxuICAgICAgICAgICAgICBpbnRUeXBlT3B0aW9ucyA9IGV4dFR5cGVPcHRpb25zW2ludFR5cGVOYW1lXSA/IHt9XHJcblxyXG4gICAgICAgICAgICAgIGlmIGludFR5cGVPcHRpb25zLmNoZWNrPyBhbmQgbm90IGludFR5cGVPcHRpb25zLmNoZWNrKGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAgICAgICAjIHRyeSBzcGVjaWZpYyBjb252ZXJzaW9uc1xyXG4gICAgICAgICAgICAgIGlmIHRyeVdyaXRlKGludFR5cGVPcHRpb25zLndyaXRlLCBpbnRUeXBlT3B0aW9ucy53cml0ZU9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgICAgICAgICAgIyB0cnkgbm8gY29udmVyc2lvblxyXG4gICAgICAgICAgICAgIGlmIGV4dFR5cGVOYW1lID09IGludFR5cGVOYW1lXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQoZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICAgIHJldHVyblxyXG5cclxuICAgICAgICAgICAgICAjIHRyeSBkZWZhdWx0IGNvbnZlcnNpb25cclxuICAgICAgICAgICAgICBpZiBub3Qgb3B0aW9ucy5pZ25vcmVEZWZhdWx0Q29udmVydGVyc1xyXG4gICAgICAgICAgICAgICAgaWYgdHJ5V3JpdGUoa28udHlwZWQuZ2V0Q29udmVydGVyKGV4dFR5cGVOYW1lLCBpbnRUeXBlTmFtZSksIGludFR5cGVPcHRpb25zLndyaXRlT3B0aW9ucylcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgICAgIyBMb29rIGZvciBvbmUtc2lkZWQgY29udmVyc2lvblxyXG4gICAgICAgICAgZm9yIGV4dFR5cGVOYW1lIGluIG9wdGlvbnMudHlwZXNcclxuICAgICAgICAgICAgZXh0VHlwZU9wdGlvbnMgPSBvcHRpb25zW2V4dFR5cGVOYW1lXVxyXG5cclxuICAgICAgICAgICAgaWYgbm90IGV4dFR5cGVPcHRpb25zLmNoZWNrKGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgICAgICAgIGlmIHRyeVdyaXRlKGV4dFR5cGVPcHRpb25zLndyaXRlLCBleHRUeXBlT3B0aW9ucy53cml0ZU9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgICAgIyBMb29rIGZvciBnZW5lcmljIGNvbnZlcnNpb25cclxuICAgICAgICAgIGlmIG9wdGlvbnMuY2hlY2soZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgaWYgdHJ5V3JpdGUob3B0aW9ucy53cml0ZSwgb3B0aW9ucy53cml0ZU9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgICAgICBpZiBvcHRpb25zLnR5cGVzLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgICAgICAgdGFyZ2V0KGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgICAgaWYgb3B0aW9ucy5pc1R5cGVkXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tIGV4dGVybmFsIHR5cGUgI3tpc0FuKGV4dGVybmFsVmFsdWUpfSB0byBpbnRlcm5hbCB0eXBlICN7dGFyZ2V0LnR5cGVOYW1lfVwiKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSBleHRlcm5hbCB0eXBlICN7aXNBbihleHRlcm5hbFZhbHVlKX1cIilcclxuICAgICAgICBjYXRjaCBleFxyXG4gICAgICAgICAgaWYgZXggaW5zdGFuY2VvZiBUeXBlRXJyb3JcclxuICAgICAgICAgICAgcmVzdWx0LnR5cGVXcml0ZUVycm9yKGV4KVxyXG5cclxuICAgICAgICAgICAgaWYgb3B0aW9ucy5ub1Rocm93XHJcbiAgICAgICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgICAgdGhyb3cgZXhcclxuICAgICAgICBmaW5hbGx5XHJcbiAgICAgICAgICBpZiBub3QgZXg/XHJcbiAgICAgICAgICAgIHJlc3VsdC50eXBlV3JpdGVFcnJvcih1bmRlZmluZWQpXHJcbiAgICB9KVxyXG5cclxuICAgIHJlc3VsdC50eXBlTmFtZSA9IG9wdGlvbnMudHlwZVxyXG4gICAgcmVzdWx0LnR5cGVOYW1lcyA9IG9wdGlvbnMudHlwZXNcclxuICAgIHJlc3VsdC50eXBlQ2hlY2sgPSBvcHRpb25zLmNoZWNrXHJcbiAgICByZXN1bHQudHlwZUNoZWNrcyA9IG9wdGlvbnMuY2hlY2tzXHJcblxyXG4gICAgcmVzdWx0LnR5cGVSZWFkRXJyb3IgPSBrby5vYnNlcnZhYmxlKClcclxuICAgIHJlc3VsdC50eXBlV3JpdGVFcnJvciA9IGtvLm9ic2VydmFibGUoKVxyXG5cclxuICAgIHZhbGlkYXRlKHJlc3VsdCwgb3B0aW9ucylcclxuXHJcbiAgICBpZiBvcHRpb25zLnB1cmUgYW5kIG5vdCBvcHRpb25zLmRlZmVyRXZhbHVhdGlvblxyXG4gICAgICAjIGZvcmNlIGltbWVkaWF0ZSByZWFkXHJcbiAgICAgIHJlc3VsdCgpXHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG5cclxuICBrby5leHRlbmRlcnMuY29udmVydC5vcHRpb25zID0ge1xyXG4gICAgdmFsaWRhdGU6IHRydWVcclxuICAgIG1lc3NhZ2U6IHVuZGVmaW5lZFxyXG4gICAgbm9UaHJvdzogZmFsc2VcclxuICAgIHB1cmU6IHRydWVcclxuICAgIGRlZmVyRXZhbHVhdGlvbjogdHJ1ZVxyXG4gIH1cclxuXHJcbiAga28udHlwZWQgPSB7fVxyXG5cclxuICBkbyAtPlxyXG4gICAga28udHlwZWQuX2NvbnZlcnRlcnMgPSBjb252ZXJ0ZXJzID0ge31cclxuXHJcbiAgICBrby50eXBlZC5hZGRDb252ZXJ0ZXIgPSAoZnJvbVR5cGVOYW1lLCB0b1R5cGVOYW1lLCBjb252ZXJ0ZXIsIGRlZmF1bHRPcHRpb25zLCBkZWZhdWx0T3B0aW9uKSAtPlxyXG4gICAgICBjb25zb2xlPy5hc3NlcnQ/KGlzVmFsaWRUeXBlTmFtZShmcm9tVHlwZU5hbWUpLCBcIkludmFsaWQgdHlwZU5hbWUgI3tmcm9tVHlwZU5hbWV9XCIpXHJcbiAgICAgIGNvbnNvbGU/LmFzc2VydD8oaXNWYWxpZFR5cGVOYW1lKHRvVHlwZU5hbWUpLCBcIkludmFsaWQgdHlwZU5hbWUgI3tmcm9tVHlwZU5hbWV9XCIpXHJcblxyXG4gICAgICBpZiBkZWZhdWx0T3B0aW9ucz9cclxuICAgICAgICBpZiBkZWZhdWx0T3B0aW9uP1xyXG4gICAgICAgICAgd3JhcHBlciA9ICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgICAgICAgaWYgb3B0aW9ucz8gYW5kIG5vdCBpc0FuLk9iamVjdChvcHRpb25zKVxyXG4gICAgICAgICAgICAgIG8gPSB7fVxyXG4gICAgICAgICAgICAgIG9bZGVmYXVsdE9wdGlvbl0gPSBvcHRpb25zXHJcbiAgICAgICAgICAgICAgb3B0aW9ucyA9IG9cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBjb252ZXJ0ZXIodmFsdWUsIGtvLnV0aWxzLmV4dGVuZChrby51dGlscy5leHRlbmQoe30sIHdyYXBwZXIub3B0aW9ucyksIG9wdGlvbnMpKVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIHdyYXBwZXIgPSAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgICAgICAgIHJldHVybiBjb252ZXJ0ZXIodmFsdWUsIGtvLnV0aWxzLmV4dGVuZChrby51dGlscy5leHRlbmQoe30sIHdyYXBwZXIub3B0aW9ucyksIG9wdGlvbnMpKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgd3JhcHBlciA9ICh2YWx1ZSkgLT5cclxuICAgICAgICAgIHJldHVybiBjb252ZXJ0ZXIodmFsdWUpXHJcblxyXG4gICAgICB3cmFwcGVyLm9wdGlvbnMgPSBkZWZhdWx0T3B0aW9uc1xyXG5cclxuICAgICAgY29udmVydGVyc1tmcm9tVHlwZU5hbWVdID89IHt9XHJcbiAgICAgIGNvbnZlcnRlcnNbZnJvbVR5cGVOYW1lXVt0b1R5cGVOYW1lXSA9IHdyYXBwZXJcclxuXHJcbiAgICAgIHJldHVybiBrby50eXBlZFxyXG5cclxuICAgIGtvLnR5cGVkLmdldENvbnZlcnRlciA9IChmcm9tVHlwZU5hbWUsIHRvVHlwZU5hbWUpIC0+XHJcbiAgICAgIGNvbnZlcnRlcnNbZnJvbVR5cGVOYW1lXT9bdG9UeXBlTmFtZV1cclxuXHJcbiAgICBrby50eXBlZC5yZW1vdmVDb252ZXJ0ZXIgPSAoZnJvbVR5cGVOYW1lLCB0b1R5cGVOYW1lKSAtPlxyXG4gICAgICBpZiBjb252ZXJ0ZXJzW2Zyb21UeXBlTmFtZV0/W3RvVHlwZU5hbWVdP1xyXG4gICAgICAgIGRlbGV0ZSBjb252ZXJ0ZXJzW2Zyb21UeXBlTmFtZV0/W3RvVHlwZU5hbWVdXHJcblxyXG4gICAgICByZXR1cm4ga28udHlwZWRcclxuXHJcbiAgICByZXR1cm5cclxuXHJcblxyXG4gIGRvIC0+XHJcbiAgICAjIyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9NYXRoL3JvdW5kXHJcbiAgICBkZWNpbWFsQWRqdXN0ID0gKHR5cGUsIHZhbHVlLCBleHApIC0+XHJcbiAgICAgICMgaWYgZXhwIGlzIHVuZGVmaW5lZCBvciB6ZXJvXHJcbiAgICAgIGlmIG5vdCBleHA/IG9yICtleHAgPT0gMFxyXG4gICAgICAgIHJldHVybiB0eXBlKHZhbHVlKVxyXG5cclxuICAgICAgdmFsdWUgPSArdmFsdWVcclxuICAgICAgZXhwID0gK2V4cFxyXG5cclxuICAgICAgIyBJZiB0aGUgdmFsdWUgaXQgbm90IGEgbnVtYmVyIG9mIHRoZSBleHAgaXMgbm90IGFuIGludGVnZXJcclxuICAgICAgaWYgKGlzTmFOKHZhbHVlKSBvciBub3QgKHR5cGVvZiBleHAgPT0gJ251bWJlcicgYW5kIGV4cCAlIDEgPT0gMCkpXHJcbiAgICAgICAgcmV0dXJuIE5hTlxyXG5cclxuICAgICAgIyBTaGlmdFxyXG4gICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCkuc3BsaXQoJ2UnKVxyXG4gICAgICB2YWx1ZSA9IHR5cGUoKyh2YWx1ZVswXSArICdlJyArIChpZiB2YWx1ZVsxXSB0aGVuICgrdmFsdWVbMV0gLSBleHApIGVsc2UgLWV4cCkpKVxyXG5cclxuICAgICAgIyBTaGlmdCBiYWNrXHJcbiAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKS5zcGxpdCgnZScpXHJcbiAgICAgIHJldHVybiAoKyh2YWx1ZVswXSArICdlJyArIChpZiB2YWx1ZVsxXSB0aGVuICgrdmFsdWVbMV0gKyBleHApIGVsc2UgZXhwKSkpXHJcblxyXG4gICAgaWYgbm90IE1hdGgucm91bmQxMD9cclxuICAgICAgTWF0aC5yb3VuZDEwID0gKHZhbHVlLCBleHApIC0+XHJcbiAgICAgICAgcmV0dXJuIGRlY2ltYWxBZGp1c3QoTWF0aC5yb3VuZCwgdmFsdWUsIGV4cClcclxuXHJcbiAgICBpZiBub3QgTWF0aC5mbG9vcjEwP1xyXG4gICAgICBNYXRoLmZsb29yMTAgPSAodmFsdWUsIGV4cCkgLT5cclxuICAgICAgICByZXR1cm4gZGVjaW1hbEFkanVzdChNYXRoLmZsb29yLCB2YWx1ZSwgZXhwKVxyXG5cclxuICAgIGlmIG5vdCBNYXRoLmNlaWwxMD9cclxuICAgICAgTWF0aC5jZWlsMTAgPSAodmFsdWUsIGV4cCkgLT5cclxuICAgICAgICByZXR1cm4gZGVjaW1hbEFkanVzdChNYXRoLmNlaWwsIHZhbHVlLCBleHApXHJcblxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdCb29sZWFuJ1xyXG4gICAgJ051bWJlci5JbnRlZ2VyJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICByZXR1cm4gaWYgdmFsdWUgdGhlbiBvcHRpb25zLnRydXRoeSBlbHNlIG9wdGlvbnMuZmFsc2V5XHJcbiAgICB7XHJcbiAgICAgIHRydXRoeTogMVxyXG4gICAgICBmYWxzZXk6IDBcclxuICAgIH1cclxuICAgICd0cnV0aHknXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnQm9vbGVhbidcclxuICAgICdOdW1iZXInXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIHJldHVybiBpZiB2YWx1ZSB0aGVuIG9wdGlvbnMudHJ1dGh5IGVsc2Ugb3B0aW9ucy5mYWxzZXlcclxuICAgIHtcclxuICAgICAgdHJ1dGh5OiAxXHJcbiAgICAgIGZhbHNleTogMFxyXG4gICAgfVxyXG4gICAgJ3RydXRoeSdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdCb29sZWFuJ1xyXG4gICAgJ1N0cmluZydcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgdmFsdWUgPSBpZiB2YWx1ZSB0aGVuIG9wdGlvbnMudHJ1dGh5IGVsc2Ugb3B0aW9ucy5mYWxzZXlcclxuXHJcbiAgICAgIGlmIG9wdGlvbnMudXBwZXJDYXNlXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1VwcGVyQ2FzZSgpXHJcblxyXG4gICAgICByZXR1cm4gdmFsdWVcclxuICAgIHtcclxuICAgICAgdXBwZXJDYXNlOiBmYWxzZVxyXG4gICAgICB0cnV0aHk6ICd0cnVlJ1xyXG4gICAgICBmYWxzZXk6ICdmYWxzZSdcclxuICAgIH1cclxuICAgICd1cHBlckNhc2UnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnRGF0ZSdcclxuICAgICdNb21lbnQnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIChtb21lbnQgPyByZXF1aXJlKCdtb21lbnQnKSkodmFsdWUpXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnRGF0ZSdcclxuICAgICdTdHJpbmcnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIGlzTmFOKHZhbHVlLnZhbHVlT2YoKSlcclxuICAgICAgICByZXR1cm4gJydcclxuXHJcbiAgICAgIG1ldGhvZCA9IG9wdGlvbnMuZm9ybWF0c1tvcHRpb25zLmZvcm1hdF1cclxuICAgICAgcmV0dXJuIHZhbHVlW21ldGhvZF0uYXBwbHkodmFsdWUsIG9wdGlvbnMucGFyYW1zKVxyXG5cclxuICAgIHtcclxuICAgICAgZm9ybWF0czoge1xyXG4gICAgICAgIGRhdGU6ICd0b0RhdGVTdHJpbmcnXHJcbiAgICAgICAgaXNvOiAndG9JU09TdHJpbmcnXHJcbiAgICAgICAganNvbjogJ3RvSlNPTidcclxuICAgICAgICBsb2NhbGVEYXRlOiAndG9Mb2NhbGVEYXRlU3RyaW5nJ1xyXG4gICAgICAgIGxvY2FsZVRpbWU6ICd0b0xvY2FsZVRpbWVTdHJpbmcnXHJcbiAgICAgICAgbG9jYWxlOiAndG9Mb2NhbGVTdHJpbmcnXHJcbiAgICAgICAgdGltZTogJ3RvVGltZVN0cmluZydcclxuICAgICAgICB1dGM6ICd0b1VUQ1N0cmluZydcclxuICAgICAgICBkZWZhdWx0OiAndG9TdHJpbmcnXHJcbiAgICAgIH1cclxuICAgICAgZm9ybWF0OiAnZGVmYXVsdCdcclxuICAgICAgcGFyYW1zOiBbXVxyXG4gICAgfVxyXG4gICAgJ2Zvcm1hdCdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdEYXRlJyxcclxuICAgICdVbmRlZmluZWQnLFxyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBub3QgaXNOYU4odmFsdWUudmFsdWVPZigpKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VuYWJsZSB0byBjb252ZXJ0IGZyb20gdmFsaWQgRGF0ZSB0byBVbmRlZmluZWQnKVxyXG5cclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ01vbWVudCdcclxuICAgICdEYXRlJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICB2YWx1ZS50b0RhdGUoKVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ01vbWVudCdcclxuICAgICdTdHJpbmcnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG5vdCB2YWx1ZS5pc1ZhbGlkKClcclxuICAgICAgICByZXR1cm4gJydcclxuXHJcbiAgICAgIHJldHVybiB2YWx1ZS5sb2NhbGUob3B0aW9ucy5sb2NhbGUpLmZvcm1hdChvcHRpb25zLmZvcm1hdClcclxuICAgIHtcclxuICAgICAgc3RyaWN0OiBmYWxzZVxyXG4gICAgICBsb2NhbGU6ICdlbidcclxuICAgICAgZm9ybWF0OiAnTCdcclxuICAgIH1cclxuICAgICdmb3JtYXQnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTW9tZW50JyxcclxuICAgICdVbmRlZmluZWQnLFxyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiB2YWx1ZS5pc1ZhbGlkKClcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmFibGUgdG8gY29udmVydCBmcm9tIHZhbGlkIE1vbWVudCB0byBVbmRlZmluZWQnKVxyXG5cclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ051bWJlcidcclxuICAgICdCb29sZWFuJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLmZhbHNleT8gYW5kIHZhbHVlID09IG9wdGlvbnMuZmFsc2V5XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIGVsc2UgaWYgb3B0aW9ucy50cnV0aHk/IGFuZCB2YWx1ZSA9PSBvcHRpb25zLnRydXRoeVxyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgIGVsc2UgaWYgbm90IG9wdGlvbnMuZmFsc2V5P1xyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICBlbHNlIGlmIG5vdCBvcHRpb25zLnRydXRoeT9cclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjb252ZXJ0IGZyb20gI3t2YWx1ZX0gdG8gQm9vbGVhblwiKVxyXG4gICAge1xyXG4gICAgICB0cnV0aHk6IHVuZGVmaW5lZFxyXG4gICAgICBmYWxzZXk6IDBcclxuICAgIH1cclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdOdW1iZXInXHJcbiAgICAnTnVtYmVyLkludGVnZXInXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIHR5cGVvZiBvcHRpb25zLm1vZGUgPT0gJ3N0cmluZydcclxuICAgICAgICBtb2RlID0gTWF0aFtvcHRpb25zLm1vZGVdXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBtb2RlID0gb3B0aW9ucy5tb2RlXHJcblxyXG4gICAgICByZXR1cm4gbW9kZSh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgbW9kZTogJ3JvdW5kJ1xyXG4gICAgfVxyXG4gICAgJ21vZGUnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTnVtYmVyJ1xyXG4gICAgJ1N0cmluZydcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy5kZWNpbWFscz9cclxuICAgICAgICB2YWx1ZSA9IE1hdGgucm91bmQxMCh2YWx1ZSwgLW9wdGlvbnMuZGVjaW1hbHMpXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50b0ZpeGVkKG9wdGlvbnMuZGVjaW1hbHMpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKClcclxuXHJcbiAgICAgIHJldHVybiB2YWx1ZVxyXG4gICAge1xyXG4gICAgICBkZWNpbWFsczogdW5kZWZpbmVkXHJcbiAgICB9XHJcbiAgICAnZGVjaW1hbHMnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTnVtYmVyLkludGVnZXInXHJcbiAgICAnQm9vbGVhbidcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy5mYWxzZXk/IGFuZCB2YWx1ZSA9PSBvcHRpb25zLmZhbHNleVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICBlbHNlIGlmIG9wdGlvbnMudHJ1dGh5PyBhbmQgdmFsdWUgPT0gb3B0aW9ucy50cnV0aHlcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICBlbHNlIGlmIG5vdCBvcHRpb25zLmZhbHNleT9cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgZWxzZSBpZiBub3Qgb3B0aW9ucy50cnV0aHk/XHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY29udmVydCBmcm9tICN7dmFsdWV9IHRvIEJvb2xlYW5cIilcclxuICAgIHtcclxuICAgICAgdHJ1dGh5OiB1bmRlZmluZWRcclxuICAgICAgZmFsc2V5OiAwXHJcbiAgICB9XHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTnVtYmVyLkludGVnZXInXHJcbiAgICAnTnVtYmVyJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgcmV0dXJuIHZhbHVlXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTnVtYmVyLkludGVnZXInXHJcbiAgICAnU3RyaW5nJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZyhvcHRpb25zLmJhc2UpXHJcbiAgICAgIGlmIG9wdGlvbnMudXBwZXJDYXNlXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1VwcGVyQ2FzZSgpXHJcblxyXG4gICAgICByZXR1cm4gdmFsdWVcclxuICAgIHtcclxuICAgICAgYmFzZTogMTBcclxuICAgICAgdXBwZXJDYXNlOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgJ2Jhc2UnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnU3RyaW5nJyxcclxuICAgICdCb29sZWFuJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy50cmltXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50cmltKClcclxuXHJcbiAgICAgIGlmIG9wdGlvbnMuaWdub3JlQ2FzZVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudG9Mb3dlckNhc2UoKVxyXG5cclxuICAgICAgaWYgb3B0aW9ucy5zdHJpY3RcclxuICAgICAgICBpZiB2YWx1ZSA9PSBvcHRpb25zLnRydXRoeVswXVxyXG4gICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICBlbHNlIGlmIHZhbHVlID09IG9wdGlvbnMuZmFsc2V5WzBdXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGZvciB0cnV0aHkgaW4gb3B0aW9ucy50cnV0aHlcclxuICAgICAgICAgIGlmIHZhbHVlID09IHRydXRoeVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgICAgICBmb3IgZmFsc2V5IGluIG9wdGlvbnMuZmFsc2V5XHJcbiAgICAgICAgICBpZiB2YWx1ZSA9PSBmYWxzZXlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBCb29sZWFuXCIpXHJcbiAgICB7XHJcbiAgICAgIGlnbm9yZUNhc2U6IHRydWVcclxuICAgICAgc3RyaWN0OiBmYWxzZVxyXG4gICAgICB0cnV0aHk6IFtcclxuICAgICAgICAndHJ1ZSdcclxuICAgICAgICAndCdcclxuICAgICAgICAnMSdcclxuICAgICAgICAnLTEnXHJcbiAgICAgICAgJ3llcydcclxuICAgICAgICAneSdcclxuICAgICAgXVxyXG4gICAgICBmYWxzZXk6IFtcclxuICAgICAgICAnZmFsc2UnXHJcbiAgICAgICAgJ2YnXHJcbiAgICAgICAgJzAnXHJcbiAgICAgICAgJ25vJ1xyXG4gICAgICAgICduJ1xyXG4gICAgICBdXHJcbiAgICAgIHRyaW06IGZhbHNlXHJcbiAgICB9XHJcbiAgICAnc3RyaWN0J1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1N0cmluZydcclxuICAgICdEYXRlJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLnRyaW1cclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRyaW0oKVxyXG5cclxuICAgICAgZGF0ZSA9IG5ldyBEYXRlKHZhbHVlKVxyXG4gICAgICBpZiBpc05hTihkYXRlLnZhbHVlT2YoKSlcclxuICAgICAgICB0aHJvdyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tICN7dmFsdWV9IHRvIERhdGVcIilcclxuXHJcbiAgICAgIHJldHVybiBkYXRlXHJcbiAgICB7XHJcbiAgICAgIHRyaW06IGZhbHNlXHJcbiAgICB9XHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnU3RyaW5nJ1xyXG4gICAgJ01vbWVudCdcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy50cmltXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50cmltKClcclxuXHJcbiAgICAgIHJlc3VsdCA9IChtb21lbnQgPyByZXF1aXJlKCdtb21lbnQnKSkodmFsdWUsIG9wdGlvbnMuZm9ybWF0LCBvcHRpb25zLmxhbmd1YWdlLCBvcHRpb25zLnN0cmljdClcclxuICAgICAgaWYgbm90IHJlc3VsdC5pc1ZhbGlkKClcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBNb21lbnRcIilcclxuXHJcbiAgICAgIHJldHVybiByZXN1bHRcclxuICAgIHtcclxuICAgICAgc3RyaWN0OiBmYWxzZVxyXG4gICAgICBsYW5ndWFnZTogJ2VuJ1xyXG4gICAgICBmb3JtYXQ6ICdMJ1xyXG4gICAgICB0cmltOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgJ2Zvcm1hdCdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdTdHJpbmcnLFxyXG4gICAgJ051bWJlci5JbnRlZ2VyJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy50cmltXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50cmltKClcclxuXHJcbiAgICAgIGlmIG9wdGlvbnMuYmFzZSA9PSAxMCBhbmQgbm90IG9wdGlvbnMuc3RyaWN0XHJcbiAgICAgICAgdHJ5XHJcbiAgICAgICAgICByZXR1cm4ga28udHlwZWQuZ2V0Q29udmVydGVyKCdTdHJpbmcnLCAnTnVtYmVyJykodmFsdWUsIDApXHJcbiAgICAgICAgY2F0Y2ggZXhcclxuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tICN7dmFsdWV9IHRvIE51bWJlci5JbnRlZ2VyXCIpXHJcblxyXG4gICAgICBjaGFycyA9ICcwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXonXHJcbiAgICAgIGlmIG5vdCBSZWdFeHAoXCJeKFxcXFwtfFxcXFwrKT9bI3tjaGFycy5zbGljZSgwLCBvcHRpb25zLmJhc2UgPyAxMCl9XSskXCIsIGlmIG5vdCBvcHRpb25zLnN0cmljdCB0aGVuICdpJykudGVzdCh2YWx1ZSlcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBOdW1iZXIuSW50ZWdlclwiKVxyXG5cclxuICAgICAgcmV0dXJuIHBhcnNlSW50KHZhbHVlLCBvcHRpb25zLmJhc2UpXHJcbiAgICB7XHJcbiAgICAgIGJhc2U6IDEwXHJcbiAgICAgIHN0cmljdDogZmFsc2VcclxuICAgICAgdHJpbTogZmFsc2VcclxuICAgIH1cclxuICAgICdiYXNlJ1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1N0cmluZydcclxuICAgICdOdW1iZXInXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMudHJpbVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudHJpbSgpXHJcblxyXG4gICAgICBpZiBub3QgL14oXFwrfFxcLSk/WzAtOV0rKFxcLj8pWzAtOV0qJC8udGVzdCh2YWx1ZSlcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBOdW1iZXJcIilcclxuXHJcbiAgICAgIHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSwgb3B0aW9ucy5iYXNlKVxyXG5cclxuICAgICAgaWYgb3B0aW9ucy5kZWNpbWFscz9cclxuICAgICAgICB2YWx1ZSA9IE1hdGgucm91bmQxMCh2YWx1ZSwgLW9wdGlvbnMuZGVjaW1hbHMpXHJcblxyXG4gICAgICByZXR1cm4gdmFsdWVcclxuICAgIHtcclxuICAgICAgZGVjaW1hbHM6IHVuZGVmaW5lZFxyXG4gICAgICB0cmltOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgJ2RlY2ltYWxzJ1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1N0cmluZycsXHJcbiAgICAnVW5kZWZpbmVkJyxcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy50cmltXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50cmltKClcclxuXHJcbiAgICAgIGlmIHZhbHVlLmxlbmd0aCAhPSAwXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gI3t2YWx1ZX0gdG8gVW5kZWZpbmVkXCIpXHJcblxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXHJcbiAgICB7XHJcbiAgICAgIHRyaW06IGZhbHNlXHJcbiAgICB9XHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnVW5kZWZpbmVkJyxcclxuICAgICdEYXRlJyxcclxuICAgICh2YWx1ZSkgLT5cclxuICAgICAgcmV0dXJuIG5ldyBEYXRlKCcnKVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1VuZGVmaW5lZCcsXHJcbiAgICAnU3RyaW5nJyxcclxuICAgICh2YWx1ZSkgLT5cclxuICAgICAgcmV0dXJuICcnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnVW5kZWZpbmVkJyxcclxuICAgICdNb21lbnQnLFxyXG4gICAgKHZhbHVlKSAtPlxyXG4gICAgICByZXR1cm4gcmVxdWlyZSgnbW9tZW50JykoJycpXHJcbiAgKVxyXG5cclxuICByZXR1cm4ga29cclxuXHJcbmFwcGx5S290cihrbylcclxuIl19
