(function (isAn){
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

module.exports = applyKotr;
})(require('is-an'));

//# sourceMappingURL=data:application/json;base64,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RGIsQ0FIRjtFQU9BLEVBQUUsQ0FBQyxLQUFLLENBQUMsWUFBVCxDQUNFLFdBREYsRUFFRSxRQUZGLEVBR0UsU0FBQyxLQUFEO0FBQ0UsV0FBTztFQURULENBSEY7RUFPQSxFQUFFLENBQUMsS0FBSyxDQUFDLFlBQVQsQ0FDRSxXQURGLEVBRUUsUUFGRixFQUdFLFNBQUMsS0FBRDtBQUNFLFdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FBQSxDQUFrQixFQUFsQjtFQURULENBSEY7QUFPQSxTQUFPO0FBLzZCRyIsImZpbGUiOiJrby10eXBlZC5hcHBseS5ub2RlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiYXBwbHlLb3RyID0gKGtvKSAtPlxyXG5cclxuXHJcbiAgdHlwZU5hbWVUb1N0cmluZyA9ICh2YWx1ZSkgLT5cclxuICAgIGlmIG5vdCB2YWx1ZT8gb3IgdmFsdWUubGVuZ3RoID09IDBcclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gICAgZWxzZSBpZiBpc0FuLlN0cmluZy5MaXRlcmFsKHZhbHVlKVxyXG4gICAgICByZXR1cm4gdmFsdWVcclxuICAgIGVsc2VcclxuICAgICAgcmV0dXJuIHZhbHVlLmpvaW4oJ3wnKVxyXG5cclxuICB0eXBlTmFtZVRvQXJyYXkgPSAodmFsdWUpIC0+XHJcbiAgICB2YWx1ZSA9IHR5cGVOYW1lVG9TdHJpbmcodmFsdWUpXHJcbiAgICBpZiBpc0FuLlN0cmluZy5MaXRlcmFsKHZhbHVlKVxyXG4gICAgICByZXR1cm4gdmFsdWUuc3BsaXQoJ3wnKVxyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm4gW11cclxuXHJcbiAgaXNWYWxpZFR5cGVOYW1lID0gKHZhbHVlKSAtPlxyXG4gICAgcmV0dXJuIC9eW0EtWl0vLnRlc3QodmFsdWUpXHJcblxyXG4gIGlzVHlwZWQgPSAodmFsdWUpIC0+XHJcbiAgICByZXR1cm4gaXNBbi5GdW5jdGlvbih2YWx1ZSkgYW5kIHZhbHVlLnR5cGVOYW1lPyBhbmQgdmFsdWUudHlwZU5hbWVzPyBhbmQgdmFsdWUudHlwZUNoZWNrPyBhbmQgdmFsdWUudHlwZUNoZWNrcz9cclxuXHJcbiAgdmFsaWRhdGUgPSAodGFyZ2V0LCBvcHRpb25zKSAtPlxyXG4gICAgaWYgbm90IG9wdGlvbnMudmFsaWRhdGVcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgcnVsZSA9IHVuZGVmaW5lZFxyXG5cclxuICAgIGVycm9yQ2hlY2sgPSAoKSAtPlxyXG4gICAgICAjIFRyeSBodHRwczovL2dpdGh1Yi5jb20vS25vY2tvdXQtQ29udHJpYi9Lbm9ja291dC1WYWxpZGF0aW9uXHJcbiAgICAgIGlmIGtvLnZhbGlkYXRpb24/IGFuZCBrby52YWxpZGF0aW9uLnV0aWxzLmlzVmFsaWRhdGFibGUodGFyZ2V0KVxyXG4gICAgICAgIG1lc3NhZ2UgPSBvcHRpb25zLm1lc3NhZ2UgPyAodGFyZ2V0LnR5cGVXcml0ZUVycm9yKCkgPyB0YXJnZXQudHlwZVJlYWRFcnJvcigpKT8ubWVzc2FnZVxyXG4gICAgICAgIGlmIG5vdCBydWxlP1xyXG4gICAgICAgICAgcnVsZSA9IHtcclxuICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZVxyXG4gICAgICAgICAgICB2YWxpZGF0b3I6ICgpIC0+XHJcbiAgICAgICAgICAgICAgbm90IHRhcmdldC50eXBlV3JpdGVFcnJvcigpPyBhbmQgbm90IHRhcmdldC50eXBlUmVhZEVycm9yKCk/XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBrby52YWxpZGF0aW9uLmFkZEFub255bW91c1J1bGUodGFyZ2V0LCBydWxlKVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIHJ1bGUubWVzc2FnZSA9IG1lc3NhZ2VcclxuICAgICAgICAgIHRhcmdldC5ydWxlcy52YWx1ZUhhc011dGF0ZWQoKVxyXG5cclxuICAgIHRhcmdldC50eXBlV3JpdGVFcnJvci5zdWJzY3JpYmUoZXJyb3JDaGVjaylcclxuICAgIHRhcmdldC50eXBlUmVhZEVycm9yLnN1YnNjcmliZShlcnJvckNoZWNrKVxyXG5cclxuICAgIGlmIGtvLnZhbGlkYXRpb24/XHJcbiAgICAgIHRhcmdldC5leHRlbmQoeyB2YWxpZGF0YWJsZTogdHJ1ZSB9KVxyXG5cclxuICAgIGlmIG5vdCBvcHRpb25zLmRlZmVyRXZhbHVhdGlvblxyXG4gICAgICBlcnJvckNoZWNrKClcclxuXHJcbiAga28uZXh0ZW5kZXJzLnR5cGUgPSAodGFyZ2V0LCBvcHRpb25zKSAtPlxyXG4gICAgIyBSZXF1aXJlc1xyXG4gICAgIyB0eXBlTmFtZSA6IFN0cmluZ1xyXG4gICAgIyB0eXBlTmFtZXMgOiBBcnJheSBvZiBTdHJpbmdcclxuICAgICMgdHlwZUNoZWNrIDogZnVuY3Rpb24gKHZhbHVlKSB7IC4uLiB9XHJcbiAgICAjIHR5cGVDaGVja3MgOiB7IHR5cGVOYW1lOiBmdW5jdGlvbiBpc1R5cGUodmFsdWUpIHsgLi4uIH0sIC4uLiB9XHJcblxyXG4gICAgaWYgaXNBbi5TdHJpbmcuTGl0ZXJhbChvcHRpb25zKSBvciBpc0FuLkFycmF5KG9wdGlvbnMpXHJcbiAgICAgICMgLmV4dGVuZCh7IHR5cGU6ICdUeXBlTmFtZXxUeXBlTmFtZXxUeXBlTmFtZScgfSlcclxuICAgICAgIyAuZXh0ZW5kKHsgdHlwZTogWydUeXBlTmFtZScsJ1R5cGVOYW1lJywuLi5dIH0pXHJcbiAgICAgIG9wdGlvbnMgPSB7IHR5cGU6IG9wdGlvbnMgfVxyXG4gICAgZWxzZSBpZiBpc0FuLkZ1bmN0aW9uKG9wdGlvbnMpXHJcbiAgICAgICMgLmV4dGVuZCh7IHR5cGU6IGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdHJ1ZXxmYWxzZTsgfSB9KVxyXG4gICAgICBvcHRpb25zID0ge1xyXG4gICAgICAgIHR5cGU6IG9wdGlvbnMudHlwZU5hbWVcclxuICAgICAgICBjaGVjazogb3B0aW9uc1xyXG4gICAgICB9XHJcblxyXG4gICAgb3B0aW9ucyA9IGtvLnV0aWxzLmV4dGVuZChrby51dGlscy5leHRlbmQoe30sIGtvLmV4dGVuZGVycy50eXBlLm9wdGlvbnMpLCBvcHRpb25zKVxyXG5cclxuICAgIGlmIG9wdGlvbnMudXNlRGVmYXVsdCBhbmQgbm90IG9wdGlvbnMuZGVmYXVsdEZ1bmM/XHJcbiAgICAgIG9wdGlvbnMuZGVmYXVsdEZ1bmMgPSAoKSAtPiBvcHRpb25zLmRlZmF1bHRcclxuXHJcbiAgICAjIEdhdGhlciB0eXBlIG5hbWVzXHJcbiAgICB0eXBlTmFtZXMgPSB0eXBlTmFtZVRvQXJyYXkob3B0aW9ucy50eXBlKVxyXG5cclxuICAgIGRvIC0+XHJcbiAgICAgIGZvciBvd24gbmFtZSwgY2hlY2sgb2Ygb3B0aW9uc1xyXG4gICAgICAgIGlmIG5vdCBpc1ZhbGlkVHlwZU5hbWUobmFtZSlcclxuICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgaWYgdHlwZU5hbWVzLmluZGV4T2YobmFtZSkgPT0gLTFcclxuICAgICAgICAgIHR5cGVOYW1lcy5wdXNoKG5hbWUpXHJcblxyXG4gICAgdHlwZU5hbWUgPSB0eXBlTmFtZVRvU3RyaW5nKHR5cGVOYW1lcylcclxuXHJcbiAgICAjIGNoZWNrc1xyXG4gICAgdHlwZUNoZWNrcyA9IHt9XHJcbiAgICBkbyAtPlxyXG4gICAgICBmb3IgbmFtZSBpbiB0eXBlTmFtZXNcclxuICAgICAgICB0eXBlQ2hlY2tzW25hbWVdID0gb3B0aW9uc1tuYW1lXSA/IGlzQW4obmFtZSwgeyByZXR1cm5DaGVja2VyOiB0cnVlIH0pXHJcblxyXG4gICAgIyBjaGVja1xyXG4gICAgdHlwZUNoZWNrID0gZG8gLT5cclxuICAgICAgX2NoZWNrID0gb3B0aW9ucy5jaGVjayA/ICgoKSAtPiB0cnVlKVxyXG4gICAgICByZXR1cm4gKHZhbHVlKSAtPlxyXG4gICAgICAgIF9jaGVjayh2YWx1ZSkgYW5kICgodHlwZU5hbWVzLmxlbmd0aCA9PSAwKSBvciAodHlwZU5hbWVzLnNvbWUoKG5hbWUpIC0+IHR5cGVDaGVja3NbbmFtZV0odmFsdWUpKSkpXHJcblxyXG4gICAgcmVzdWx0ID0ga28uY29tcHV0ZWQoe1xyXG4gICAgICBwdXJlOiBvcHRpb25zLnB1cmVcclxuICAgICAgZGVmZXJFdmFsdWF0aW9uOiBvcHRpb25zLmRlZmVyRXZhbHVhdGlvblxyXG5cclxuICAgICAgcmVhZDogKCkgLT5cclxuICAgICAgICB0cnlcclxuICAgICAgICAgIGludGVybmFsVmFsdWUgPSB0YXJnZXQoKVxyXG5cclxuICAgICAgICAgIGlmIG5vdCB0eXBlQ2hlY2soaW50ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuZXhwZWN0ZWQgaW50ZXJuYWwgdHlwZS4gRXhwZWN0ZWQgI3t0eXBlTmFtZX0sIGdvdCAje2lzQW4oaW50ZXJuYWxWYWx1ZSl9XCIpXHJcblxyXG4gICAgICAgIGNhdGNoIGV4XHJcbiAgICAgICAgICBpZiBleCBpbnN0YW5jZW9mIFR5cGVFcnJvclxyXG4gICAgICAgICAgICByZXN1bHQudHlwZVJlYWRFcnJvcihleClcclxuXHJcbiAgICAgICAgICAgIGlmIG9wdGlvbnMudXNlRGVmYXVsdFxyXG4gICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmRlZmF1bHRGdW5jKClcclxuXHJcbiAgICAgICAgICB0aHJvdyBleFxyXG5cclxuICAgICAgICByZXN1bHQudHlwZVJlYWRFcnJvcih1bmRlZmluZWQpXHJcbiAgICAgICAgcmV0dXJuIGludGVybmFsVmFsdWVcclxuXHJcbiAgICAgIHdyaXRlOiAoZXh0ZXJuYWxWYWx1ZSkgLT5cclxuICAgICAgICB0cnlcclxuICAgICAgICAgIGlmIHR5cGVDaGVjayhleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICB0YXJnZXQoZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuZXhwZWN0ZWQgZXh0ZXJuYWwgdHlwZS4gRXhwZWN0ZWQgI3t0eXBlTmFtZX0sIHJlY2VpdmVkICN7aXNBbihleHRlcm5hbFZhbHVlKX1cIilcclxuICAgICAgICBjYXRjaCBleFxyXG4gICAgICAgICAgaWYgZXggaW5zdGFuY2VvZiBUeXBlRXJyb3JcclxuICAgICAgICAgICAgcmVzdWx0LnR5cGVXcml0ZUVycm9yKGV4KVxyXG5cclxuICAgICAgICAgICAgaWYgb3B0aW9ucy5ub1Rocm93XHJcbiAgICAgICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgICAgdGhyb3cgZXhcclxuXHJcbiAgICAgICAgcmVzdWx0LnR5cGVXcml0ZUVycm9yKHVuZGVmaW5lZClcclxuICAgIH0pXHJcblxyXG4gICAgcmVzdWx0LnR5cGVOYW1lID0gdHlwZU5hbWVcclxuICAgIHJlc3VsdC50eXBlTmFtZXMgPSB0eXBlTmFtZXNcclxuICAgIHJlc3VsdC50eXBlQ2hlY2sgPSB0eXBlQ2hlY2tcclxuICAgIHJlc3VsdC50eXBlQ2hlY2tzID0gdHlwZUNoZWNrc1xyXG5cclxuICAgIHJlc3VsdC50eXBlV3JpdGVFcnJvciA9IGtvLm9ic2VydmFibGUoKVxyXG4gICAgcmVzdWx0LnR5cGVSZWFkRXJyb3IgPSBrby5vYnNlcnZhYmxlKClcclxuXHJcbiAgICB2YWxpZGF0ZShyZXN1bHQsIG9wdGlvbnMpXHJcblxyXG4gICAgaWYgb3B0aW9ucy5wdXJlIGFuZCBub3Qgb3B0aW9ucy5kZWZlckV2YWx1YXRpb25cclxuICAgICAgIyBmb3JjZSBpbW1lZGlhdGUgcmVhZFxyXG4gICAgICByZXN1bHQoKVxyXG5cclxuICAgIHJldHVybiByZXN1bHRcclxuXHJcbiAga28uZXh0ZW5kZXJzLnR5cGUub3B0aW9ucyA9IHtcclxuICAgIHZhbGlkYXRlOiB0cnVlXHJcbiAgICBtZXNzYWdlOiB1bmRlZmluZWRcclxuICAgIG5vVGhyb3c6IGZhbHNlXHJcbiAgICB1c2VEZWZhdWx0OiBmYWxzZVxyXG4gICAgIyBkZWZhdWx0XHJcbiAgICAjIGRlZmF1bHRGdW5jXHJcbiAgICBwdXJlOiB0cnVlXHJcbiAgICBkZWZlckV2YWx1YXRpb246IHRydWVcclxuICB9XHJcblxyXG5cclxuICBrby5leHRlbmRlcnMuY29udmVydCA9ICh0YXJnZXQsIG9wdGlvbnMpIC0+XHJcbiAgICAjIG5vcm1hbGl6ZSBvcHRpb25zXHJcbiAgICBkbyAtPlxyXG4gICAgICBpZiBpc0FuLlN0cmluZyhvcHRpb25zKSBvciBpc0FuLkFycmF5KG9wdGlvbnMpXHJcbiAgICAgICAgb3B0aW9ucyA9IHsgdHlwZTogb3B0aW9ucyB9XHJcblxyXG4gICAgICAjIG1lcmdlIG9wdGlvbnNcclxuICAgICAgb3B0aW9ucyA9IGtvLnV0aWxzLmV4dGVuZChrby51dGlscy5leHRlbmQoe30sIGtvLmV4dGVuZGVycy5jb252ZXJ0Lm9wdGlvbnMpLCBvcHRpb25zKVxyXG5cclxuICAgICAgZmluYWxPcHRpb25zID0ge1xyXG4gICAgICAgIGNoZWNrU2VsZjogb3B0aW9ucy5jaGVjayA/ICgpIC0+IHRydWVcclxuICAgICAgICByZWFkOiBvcHRpb25zLnJlYWRcclxuICAgICAgICB3cml0ZTogb3B0aW9ucy53cml0ZVxyXG4gICAgICAgIGNoZWNrczoge31cclxuICAgICAgICBjaGVja2VyczogW11cclxuICAgICAgICBpc1R5cGVkOiBpc1R5cGVkKHRhcmdldClcclxuICAgICAgICBpZ25vcmVEZWZhdWx0Q29udmVydGVyczogb3B0aW9ucy5pZ25vcmVEZWZhdWx0Q29udmVydGVyc1xyXG4gICAgICAgIHB1cmU6IG9wdGlvbnMucHVyZVxyXG4gICAgICAgIGRlZmVyRXZhbHVhdGlvbjogb3B0aW9ucy5kZWZlckV2YWx1YXRpb25cclxuICAgICAgICBkZWZhdWx0RnVuYzogb3B0aW9ucy5kZWZhdWx0RnVuY1xyXG4gICAgICAgIG5vVGhyb3c6IG9wdGlvbnMubm9UaHJvd1xyXG4gICAgICAgIG1lc3NhZ2U6IG9wdGlvbnMubWVzc2FnZVxyXG4gICAgICAgIHVzZURlZmF1bHQ6IG9wdGlvbnMudXNlRGVmYXVsdFxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiBmaW5hbE9wdGlvbnMudXNlRGVmYXVsdCBhbmQgbm90IG9wdGlvbnMuZGVmYXVsdEZ1bmM/XHJcbiAgICAgICAgZmluYWxPcHRpb25zLmRlZmF1bHQgPSBvcHRpb25zLmRlZmF1bHRcclxuICAgICAgICBmaW5hbE9wdGlvbnMuZGVmYXVsdEZ1bmMgPSAoKSAtPiBmaW5hbE9wdGlvbnMuZGVmYXVsdFxyXG5cclxuICAgICAgZmluYWxPcHRpb25zLmNoZWNrZXJzLnB1c2goZmluYWxPcHRpb25zLmNoZWNrU2VsZilcclxuXHJcbiAgICAgICMgR2F0aGVyIGFsbCBleHRlcm5hbCB0eXBlc1xyXG4gICAgICBmaW5hbE9wdGlvbnMudHlwZXMgPSB0eXBlTmFtZVRvQXJyYXkob3B0aW9ucy50eXBlKVxyXG4gICAgICBmb3Igb3duIGV4dFR5cGVOYW1lIG9mIG9wdGlvbnNcclxuICAgICAgICBpZiBub3QgaXNWYWxpZFR5cGVOYW1lKGV4dFR5cGVOYW1lKVxyXG4gICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgICAgIyBBZGQgZXh0ZXJuYWwgdHlwZVxyXG4gICAgICAgIGlmIGZpbmFsT3B0aW9ucy50eXBlcy5pbmRleE9mKGV4dFR5cGVOYW1lKSA9PSAtMVxyXG4gICAgICAgICAgZmluYWxPcHRpb25zLnR5cGVzLnB1c2goZXh0VHlwZU5hbWUpXHJcblxyXG4gICAgICAjIEV4cGFuZCBlYWNoIEV4dGVybmFsIFR5cGVcclxuICAgICAgZm9yIGV4dFR5cGVOYW1lIGluIGZpbmFsT3B0aW9ucy50eXBlc1xyXG4gICAgICAgIGV4dFR5cGVPcHRpb25zID0gb3B0aW9uc1tleHRUeXBlTmFtZV0gPyB7fVxyXG5cclxuICAgICAgICBmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdID0ge1xyXG4gICAgICAgICAgY2hlY2tTZWxmOiBleHRUeXBlT3B0aW9ucy5jaGVjayA/IGlzQW4oZXh0VHlwZU5hbWUsIHsgcmV0dXJuQ2hlY2tlcjogdHJ1ZSB9KSA/ICgpIC0+IHRydWVcclxuICAgICAgICAgIHJlYWQ6IGV4dFR5cGVPcHRpb25zLnJlYWRcclxuICAgICAgICAgIHdyaXRlOiBleHRUeXBlT3B0aW9ucy53cml0ZVxyXG4gICAgICAgICAgdHlwZXM6IHR5cGVOYW1lVG9BcnJheShleHRUeXBlT3B0aW9ucy50eXBlKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2hlY2tQYXJlbnQgPSBmaW5hbE9wdGlvbnMuY2hlY2tTZWxmXHJcbiAgICAgICAgZmluYWxPcHRpb25zLmNoZWNrZXJzLnB1c2goZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXS5jaGVja1NlbGYpXHJcbiAgICAgICAgZmluYWxPcHRpb25zLmNoZWNrc1tleHRUeXBlTmFtZV0gPSBmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdLmNoZWNrID0gZG8gKGV4dFR5cGVOYW1lKSAtPlxyXG4gICAgICAgICAgKHZhbHVlKSAtPiBmaW5hbE9wdGlvbnMuY2hlY2tTZWxmKHZhbHVlKSBhbmQgZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXS5jaGVja1NlbGYodmFsdWUpXHJcblxyXG4gICAgICAgICMgR2F0aGVyIGFsbCBpbnRlcm5hbCB0eXBlc1xyXG4gICAgICAgIGZvciBvd24gaW50VHlwZU5hbWUgb2YgZXh0VHlwZU9wdGlvbnNcclxuICAgICAgICAgIGlmIG5vdCBpc1ZhbGlkVHlwZU5hbWUoaW50VHlwZU5hbWUpXHJcbiAgICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICAgICAgIyBBZGQgaW50ZXJuYWwgdHlwZVxyXG4gICAgICAgICAgaWYgZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXS50eXBlcy5pbmRleE9mKGludFR5cGVOYW1lKSA9PSAtMVxyXG4gICAgICAgICAgICBmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdLnR5cGVzLnB1c2goaW50VHlwZU5hbWUpXHJcblxyXG4gICAgICAgICMgRXhwYW5kIGFsbCBpbnRlcm5hbCB0eXBlc1xyXG4gICAgICAgIGZvciBpbnRUeXBlTmFtZSBpbiBmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdLnR5cGVzXHJcbiAgICAgICAgICBpbnRUeXBlT3B0aW9ucyA9IG9wdGlvbnNbZXh0VHlwZU5hbWVdP1tpbnRUeXBlTmFtZV0gPyB7fVxyXG5cclxuICAgICAgICAgIGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV1baW50VHlwZU5hbWVdID0ge1xyXG4gICAgICAgICAgICBjaGVja1NlbGY6IGludFR5cGVPcHRpb25zLmNoZWNrXHJcbiAgICAgICAgICAgIHJlYWQ6IGludFR5cGVPcHRpb25zLnJlYWRcclxuICAgICAgICAgICAgd3JpdGU6IGludFR5cGVPcHRpb25zLndyaXRlXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgbm90IGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV1baW50VHlwZU5hbWVdLmNoZWNrU2VsZj9cclxuICAgICAgICAgICAgZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXVtpbnRUeXBlTmFtZV0uY2hlY2sgPSBmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdW2ludFR5cGVOYW1lXS5jaGVja1NlbGYgPSBmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdLmNoZWNrU2VsZlxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdW2ludFR5cGVOYW1lXS5jaGVjayA9IGRvIChleHRUeXBlTmFtZSwgaW50VHlwZU5hbWUpIC0+XHJcbiAgICAgICAgICAgICAgKHZhbHVlKSAtPiBmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdLmNoZWNrKHZhbHVlKSBhbmQgZmluYWxPcHRpb25zW2V4dFR5cGVOYW1lXVtpbnRUeXBlTmFtZV0uY2hlY2tTZWxmKHZhbHVlKVxyXG5cclxuICAgICAgICBmaW5hbE9wdGlvbnNbZXh0VHlwZU5hbWVdLnR5cGUgPSB0eXBlTmFtZVRvU3RyaW5nKGZpbmFsT3B0aW9uc1tleHRUeXBlTmFtZV0udHlwZXMpXHJcblxyXG4gICAgICBmaW5hbE9wdGlvbnMudHlwZSA9IHR5cGVOYW1lVG9TdHJpbmcoZmluYWxPcHRpb25zLnR5cGVzKVxyXG4gICAgICBmaW5hbE9wdGlvbnMuY2hlY2sgPSAodmFsdWUpIC0+XHJcbiAgICAgICAgZmluYWxPcHRpb25zLmNoZWNrU2VsZih2YWx1ZSkgYW5kICgoZmluYWxPcHRpb25zLmNoZWNrZXJzLmxlbmd0aCA9PSAwKSBvciBmaW5hbE9wdGlvbnMuY2hlY2tlcnMuc29tZSgoY2hlY2tlcikgLT4gY2hlY2tlcih2YWx1ZSkpKVxyXG5cclxuICAgICAgb3B0aW9ucyA9IGZpbmFsT3B0aW9uc1xyXG5cclxuICAgIHJlc3VsdCA9IGtvLmNvbXB1dGVkKHtcclxuICAgICAgcHVyZTogb3B0aW9ucy5wdXJlXHJcbiAgICAgIGRlZmVyRXZhbHVhdGlvbjogb3B0aW9ucy5kZWZlckV2YWx1YXRpb25cclxuXHJcbiAgICAgIHJlYWQ6ICgpIC0+XHJcbiAgICAgICAgdHJ5XHJcbiAgICAgICAgICBpbnRlcm5hbFZhbHVlID0gdGFyZ2V0KClcclxuICAgICAgICAgIGV4dGVybmFsVmFsdWUgPSB1bmRlZmluZWRcclxuXHJcbiAgICAgICAgICAjIFRyeSBleGFjdCBpbnRlcm5hbCB0eXBlIG1hdGNoXHJcbiAgICAgICAgICB0cnlSZWFkID0gKGNvbnZlcnQsIG9wdGlvbnMpIC0+XHJcbiAgICAgICAgICAgIGlmIGNvbnZlcnQ/XHJcbiAgICAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgICAgICBleHRlcm5hbFZhbHVlID0gY29udmVydChpbnRlcm5hbFZhbHVlLCBvcHRpb25zKVxyXG4gICAgICAgICAgICAgIGNhdGNoIGV4XHJcbiAgICAgICAgICAgICAgICBpZiBleCBub3QgaW5zdGFuY2VvZiBUeXBlRXJyb3JcclxuICAgICAgICAgICAgICAgICAgdGhyb3cgZXhcclxuXHJcbiAgICAgICAgICAgICAgaWYgbm90IGV4P1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgICAgICMgTG9vayBmb3Igc3BlY2lmaWMgY29udmVyc2lvblxyXG4gICAgICAgICAgZm9yIGV4dFR5cGVOYW1lIGluIG9wdGlvbnMudHlwZXNcclxuICAgICAgICAgICAgZXh0VHlwZU9wdGlvbnMgPSBvcHRpb25zW2V4dFR5cGVOYW1lXVxyXG5cclxuICAgICAgICAgICAgIyBnbyBieSBvdXIgb3JkZXJcclxuICAgICAgICAgICAgaW50VHlwZU5hbWVzID0gZXh0VHlwZU9wdGlvbnMudHlwZXNcclxuXHJcbiAgICAgICAgICAgIGlmIGludFR5cGVOYW1lcy5sZW5ndGggPT0gMCBhbmQgbm90IGV4dFR5cGVPcHRpb25zLnJlYWQ/XHJcbiAgICAgICAgICAgICAgaWYgb3B0aW9ucy5pc1R5cGVkXHJcbiAgICAgICAgICAgICAgICAjIGdvIGJ5IHRhcmdldCBvcmRlclxyXG4gICAgICAgICAgICAgICAgaW50VHlwZU5hbWVzID0gdGFyZ2V0LnR5cGVOYW1lc1xyXG4gICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICMgZ28gYnkgaW5mZXJyZWQgb3JkZXJcclxuICAgICAgICAgICAgICAgIGludFR5cGVOYW1lcyA9IFtpc0FuKGludGVybmFsVmFsdWUpXVxyXG5cclxuICAgICAgICAgICAgZm9yIGludFR5cGVOYW1lIGluIGludFR5cGVOYW1lc1xyXG4gICAgICAgICAgICAgICMgY2hlY2sgaW50ZXJuYWwgdHlwZVxyXG4gICAgICAgICAgICAgIGlmIG9wdGlvbnMuaXNUeXBlZFxyXG4gICAgICAgICAgICAgICAgaWYgbm90IHRhcmdldC50eXBlQ2hlY2tzW2ludFR5cGVOYW1lXT8oaW50ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICAgICAgY29udGludWVcclxuICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBpZiBub3QgaXNBbihpbnRlcm5hbFZhbHVlLCBpbnRUeXBlTmFtZSlcclxuICAgICAgICAgICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgICAgICAgICAgIyBnZXQgdGhlIG9wdGlvbnNcclxuICAgICAgICAgICAgICBpbnRUeXBlT3B0aW9ucyA9IGV4dFR5cGVPcHRpb25zW2ludFR5cGVOYW1lXSA/IHsgY2hlY2s6IGV4dFR5cGVPcHRpb25zLmNoZWNrIH1cclxuXHJcbiAgICAgICAgICAgICAgIyB0cnkgc3BlY2lmaWMgY29udmVyc2lvbnNcclxuICAgICAgICAgICAgICBpZiB0cnlSZWFkKGludFR5cGVPcHRpb25zLnJlYWQsIGludFR5cGVPcHRpb25zLnJlYWRPcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgaWYgaW50VHlwZU9wdGlvbnMuY2hlY2soZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4dGVybmFsVmFsdWVcclxuXHJcbiAgICAgICAgICAgICAgIyB0cnkgbm8gY29udmVyc2lvblxyXG4gICAgICAgICAgICAgIGlmIGV4dFR5cGVOYW1lID09IGludFR5cGVOYW1lXHJcbiAgICAgICAgICAgICAgICBpZiBpbnRUeXBlT3B0aW9ucy5jaGVjayhpbnRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgICAgICBleHRlcm5hbFZhbHVlID0gaW50ZXJuYWxWYWx1ZVxyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gZXh0ZXJuYWxWYWx1ZVxyXG5cclxuICAgICAgICAgICAgICAjIHRyeSBkZWZhdWx0IGNvbnZlcnNpb25cclxuICAgICAgICAgICAgICBpZiBub3Qgb3B0aW9ucy5pZ25vcmVEZWZhdWx0Q29udmVydGVyc1xyXG4gICAgICAgICAgICAgICAgaWYgdHJ5UmVhZChrby50eXBlZC5nZXRDb252ZXJ0ZXIoaW50VHlwZU5hbWUsIGV4dFR5cGVOYW1lKSwgaW50VHlwZU9wdGlvbnMucmVhZE9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAgIGlmIGludFR5cGVPcHRpb25zLmNoZWNrKGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4dGVybmFsVmFsdWVcclxuXHJcbiAgICAgICAgICAjIExvb2sgZm9yIG9uZS1zaWRlZCBjb252ZXJzaW9uXHJcbiAgICAgICAgICBmb3IgZXh0VHlwZU5hbWUgaW4gb3B0aW9ucy50eXBlc1xyXG4gICAgICAgICAgICBleHRUeXBlT3B0aW9ucyA9IG9wdGlvbnNbZXh0VHlwZU5hbWVdXHJcblxyXG4gICAgICAgICAgICBpZiB0cnlSZWFkKGV4dFR5cGVPcHRpb25zLnJlYWQsIGV4dFR5cGVPcHRpb25zLnJlYWRPcHRpb25zKVxyXG4gICAgICAgICAgICAgIGlmIGV4dFR5cGVPcHRpb25zLmNoZWNrKGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZXh0ZXJuYWxWYWx1ZVxyXG5cclxuICAgICAgICAgICMgTG9vayBmb3IgZ2VuZXJpYyBjb252ZXJzaW9uXHJcbiAgICAgICAgICBpZiB0cnlSZWFkKG9wdGlvbnMucmVhZCwgb3B0aW9ucy5yZWFkT3B0aW9ucylcclxuICAgICAgICAgICAgaWYgb3B0aW9ucy5jaGVjayhleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgIHJldHVybiBleHRlcm5hbFZhbHVlXHJcblxyXG4gICAgICAgICAgaWYgb3B0aW9ucy50eXBlcy5sZW5ndGggPT0gMFxyXG4gICAgICAgICAgICBpZiBvcHRpb25zLmNoZWNrKGV4dGVybmFsVmFsdWUpXHJcbiAgICAgICAgICAgICAgZXh0ZXJuYWxWYWx1ZSA9IGludGVybmFsVmFsdWVcclxuICAgICAgICAgICAgICByZXR1cm4gZXh0ZXJuYWxWYWx1ZVxyXG5cclxuICAgICAgICAgIGlmIG9wdGlvbnMudHlwZT9cclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gaW50ZXJuYWwgdHlwZSAje2lzQW4oaW50ZXJuYWxWYWx1ZSl9IHRvIGV4dGVybmFsIHR5cGUgI3tvcHRpb25zLnR5cGV9XCIpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tIGludGVybmFsIHR5cGUgI3tpc0FuKGludGVybmFsVmFsdWUpfVwiKVxyXG4gICAgICAgIGNhdGNoIGV4XHJcbiAgICAgICAgICBpZiBleCBpbnN0YW5jZW9mIFR5cGVFcnJvclxyXG4gICAgICAgICAgICByZXN1bHQudHlwZVJlYWRFcnJvcihleClcclxuXHJcbiAgICAgICAgICAgIGlmIG9wdGlvbnMudXNlRGVmYXVsdFxyXG4gICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmRlZmF1bHRGdW5jKClcclxuXHJcbiAgICAgICAgICB0aHJvdyBleFxyXG4gICAgICAgIGZpbmFsbHlcclxuICAgICAgICAgIGlmIG5vdCBleD9cclxuICAgICAgICAgICAgcmVzdWx0LnR5cGVSZWFkRXJyb3IodW5kZWZpbmVkKVxyXG5cclxuICAgICAgd3JpdGU6IChleHRlcm5hbFZhbHVlKSAtPlxyXG4gICAgICAgIHRyeVxyXG4gICAgICAgICAgdHJ5V3JpdGUgPSAoY29udmVydCwgb3B0aW9ucykgLT5cclxuICAgICAgICAgICAgaWYgY29udmVydD9cclxuICAgICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgICAgIGludGVybmFsVmFsdWUgPSBjb252ZXJ0KGV4dGVybmFsVmFsdWUsIG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgY2F0Y2ggZXhcclxuICAgICAgICAgICAgICAgIGlmIGV4IG5vdCBpbnN0YW5jZW9mIFR5cGVFcnJvclxyXG4gICAgICAgICAgICAgICAgICB0aHJvdyBleFxyXG5cclxuICAgICAgICAgICAgICBpZiBub3QgZXg/XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQoaW50ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICAgICAgICAjIExvb2sgZm9yIHNwZWNpZmljIGNvbnZlcnNpb25cclxuICAgICAgICAgIGZvciBleHRUeXBlTmFtZSBpbiBvcHRpb25zLnR5cGVzXHJcbiAgICAgICAgICAgIGV4dFR5cGVPcHRpb25zID0gb3B0aW9uc1tleHRUeXBlTmFtZV1cclxuXHJcbiAgICAgICAgICAgIGlmIG5vdCBleHRUeXBlT3B0aW9ucy5jaGVjayhleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICAgICAgICAjIGdvIGJ5IG91ciBvcmRlclxyXG4gICAgICAgICAgICBpbnRUeXBlTmFtZXMgPSBleHRUeXBlT3B0aW9ucy50eXBlc1xyXG5cclxuICAgICAgICAgICAgaWYgaW50VHlwZU5hbWVzLmxlbmd0aCA9PSAwIGFuZCBub3QgZXh0VHlwZU9wdGlvbnMud3JpdGU/XHJcbiAgICAgICAgICAgICAgaWYgb3B0aW9ucy5pc1R5cGVkXHJcbiAgICAgICAgICAgICAgICAjIGdvIGJ5IHRhcmdldCBvcmRlclxyXG4gICAgICAgICAgICAgICAgaW50VHlwZU5hbWVzID0gdGFyZ2V0LnR5cGVOYW1lc1xyXG4gICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICMgZ28gYnkgaW5mZXJyZWQgb3JkZXJcclxuICAgICAgICAgICAgICAgIGludFR5cGVOYW1lcyA9IFtpc0FuKGV4dGVybmFsVmFsdWUpXVxyXG5cclxuICAgICAgICAgICAgZm9yIGludFR5cGVOYW1lIGluIGludFR5cGVOYW1lc1xyXG4gICAgICAgICAgICAgIGludFR5cGVPcHRpb25zID0gZXh0VHlwZU9wdGlvbnNbaW50VHlwZU5hbWVdID8ge31cclxuXHJcbiAgICAgICAgICAgICAgaWYgaW50VHlwZU9wdGlvbnMuY2hlY2s/IGFuZCBub3QgaW50VHlwZU9wdGlvbnMuY2hlY2soZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICAgICAgICAgICMgdHJ5IHNwZWNpZmljIGNvbnZlcnNpb25zXHJcbiAgICAgICAgICAgICAgaWYgdHJ5V3JpdGUoaW50VHlwZU9wdGlvbnMud3JpdGUsIGludFR5cGVPcHRpb25zLndyaXRlT3B0aW9ucylcclxuICAgICAgICAgICAgICAgIHJldHVyblxyXG5cclxuICAgICAgICAgICAgICAjIHRyeSBubyBjb252ZXJzaW9uXHJcbiAgICAgICAgICAgICAgaWYgZXh0VHlwZU5hbWUgPT0gaW50VHlwZU5hbWVcclxuICAgICAgICAgICAgICAgIHRhcmdldChleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgICAgICAgICMgdHJ5IGRlZmF1bHQgY29udmVyc2lvblxyXG4gICAgICAgICAgICAgIGlmIG5vdCBvcHRpb25zLmlnbm9yZURlZmF1bHRDb252ZXJ0ZXJzXHJcbiAgICAgICAgICAgICAgICBpZiB0cnlXcml0ZShrby50eXBlZC5nZXRDb252ZXJ0ZXIoZXh0VHlwZU5hbWUsIGludFR5cGVOYW1lKSwgaW50VHlwZU9wdGlvbnMud3JpdGVPcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgICAgICAjIExvb2sgZm9yIG9uZS1zaWRlZCBjb252ZXJzaW9uXHJcbiAgICAgICAgICBmb3IgZXh0VHlwZU5hbWUgaW4gb3B0aW9ucy50eXBlc1xyXG4gICAgICAgICAgICBleHRUeXBlT3B0aW9ucyA9IG9wdGlvbnNbZXh0VHlwZU5hbWVdXHJcblxyXG4gICAgICAgICAgICBpZiBub3QgZXh0VHlwZU9wdGlvbnMuY2hlY2soZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAgICAgaWYgdHJ5V3JpdGUoZXh0VHlwZU9wdGlvbnMud3JpdGUsIGV4dFR5cGVPcHRpb25zLndyaXRlT3B0aW9ucylcclxuICAgICAgICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgICAgICAjIExvb2sgZm9yIGdlbmVyaWMgY29udmVyc2lvblxyXG4gICAgICAgICAgaWYgb3B0aW9ucy5jaGVjayhleHRlcm5hbFZhbHVlKVxyXG4gICAgICAgICAgICBpZiB0cnlXcml0ZShvcHRpb25zLndyaXRlLCBvcHRpb25zLndyaXRlT3B0aW9ucylcclxuICAgICAgICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgICAgICAgIGlmIG9wdGlvbnMudHlwZXMubGVuZ3RoID09IDBcclxuICAgICAgICAgICAgICB0YXJnZXQoZXh0ZXJuYWxWYWx1ZSlcclxuICAgICAgICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgICAgICBpZiBvcHRpb25zLmlzVHlwZWRcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gZXh0ZXJuYWwgdHlwZSAje2lzQW4oZXh0ZXJuYWxWYWx1ZSl9IHRvIGludGVybmFsIHR5cGUgI3t0YXJnZXQudHlwZU5hbWV9XCIpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tIGV4dGVybmFsIHR5cGUgI3tpc0FuKGV4dGVybmFsVmFsdWUpfVwiKVxyXG4gICAgICAgIGNhdGNoIGV4XHJcbiAgICAgICAgICBpZiBleCBpbnN0YW5jZW9mIFR5cGVFcnJvclxyXG4gICAgICAgICAgICByZXN1bHQudHlwZVdyaXRlRXJyb3IoZXgpXHJcblxyXG4gICAgICAgICAgICBpZiBvcHRpb25zLm5vVGhyb3dcclxuICAgICAgICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgICAgICB0aHJvdyBleFxyXG4gICAgICAgIGZpbmFsbHlcclxuICAgICAgICAgIGlmIG5vdCBleD9cclxuICAgICAgICAgICAgcmVzdWx0LnR5cGVXcml0ZUVycm9yKHVuZGVmaW5lZClcclxuICAgIH0pXHJcblxyXG4gICAgcmVzdWx0LnR5cGVOYW1lID0gb3B0aW9ucy50eXBlXHJcbiAgICByZXN1bHQudHlwZU5hbWVzID0gb3B0aW9ucy50eXBlc1xyXG4gICAgcmVzdWx0LnR5cGVDaGVjayA9IG9wdGlvbnMuY2hlY2tcclxuICAgIHJlc3VsdC50eXBlQ2hlY2tzID0gb3B0aW9ucy5jaGVja3NcclxuXHJcbiAgICByZXN1bHQudHlwZVJlYWRFcnJvciA9IGtvLm9ic2VydmFibGUoKVxyXG4gICAgcmVzdWx0LnR5cGVXcml0ZUVycm9yID0ga28ub2JzZXJ2YWJsZSgpXHJcblxyXG4gICAgdmFsaWRhdGUocmVzdWx0LCBvcHRpb25zKVxyXG5cclxuICAgIGlmIG9wdGlvbnMucHVyZSBhbmQgbm90IG9wdGlvbnMuZGVmZXJFdmFsdWF0aW9uXHJcbiAgICAgICMgZm9yY2UgaW1tZWRpYXRlIHJlYWRcclxuICAgICAgcmVzdWx0KClcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcblxyXG4gIGtvLmV4dGVuZGVycy5jb252ZXJ0Lm9wdGlvbnMgPSB7XHJcbiAgICB2YWxpZGF0ZTogdHJ1ZVxyXG4gICAgbWVzc2FnZTogdW5kZWZpbmVkXHJcbiAgICBub1Rocm93OiBmYWxzZVxyXG4gICAgcHVyZTogdHJ1ZVxyXG4gICAgZGVmZXJFdmFsdWF0aW9uOiB0cnVlXHJcbiAgfVxyXG5cclxuICBrby50eXBlZCA9IHt9XHJcblxyXG4gIGRvIC0+XHJcbiAgICBrby50eXBlZC5fY29udmVydGVycyA9IGNvbnZlcnRlcnMgPSB7fVxyXG5cclxuICAgIGtvLnR5cGVkLmFkZENvbnZlcnRlciA9IChmcm9tVHlwZU5hbWUsIHRvVHlwZU5hbWUsIGNvbnZlcnRlciwgZGVmYXVsdE9wdGlvbnMsIGRlZmF1bHRPcHRpb24pIC0+XHJcbiAgICAgIGNvbnNvbGU/LmFzc2VydD8oaXNWYWxpZFR5cGVOYW1lKGZyb21UeXBlTmFtZSksIFwiSW52YWxpZCB0eXBlTmFtZSAje2Zyb21UeXBlTmFtZX1cIilcclxuICAgICAgY29uc29sZT8uYXNzZXJ0Pyhpc1ZhbGlkVHlwZU5hbWUodG9UeXBlTmFtZSksIFwiSW52YWxpZCB0eXBlTmFtZSAje2Zyb21UeXBlTmFtZX1cIilcclxuXHJcbiAgICAgIGlmIGRlZmF1bHRPcHRpb25zP1xyXG4gICAgICAgIGlmIGRlZmF1bHRPcHRpb24/XHJcbiAgICAgICAgICB3cmFwcGVyID0gKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICAgICAgICBpZiBvcHRpb25zPyBhbmQgbm90IGlzQW4uT2JqZWN0KG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgbyA9IHt9XHJcbiAgICAgICAgICAgICAgb1tkZWZhdWx0T3B0aW9uXSA9IG9wdGlvbnNcclxuICAgICAgICAgICAgICBvcHRpb25zID0gb1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGNvbnZlcnRlcih2YWx1ZSwga28udXRpbHMuZXh0ZW5kKGtvLnV0aWxzLmV4dGVuZCh7fSwgd3JhcHBlci5vcHRpb25zKSwgb3B0aW9ucykpXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgd3JhcHBlciA9ICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgICAgICAgcmV0dXJuIGNvbnZlcnRlcih2YWx1ZSwga28udXRpbHMuZXh0ZW5kKGtvLnV0aWxzLmV4dGVuZCh7fSwgd3JhcHBlci5vcHRpb25zKSwgb3B0aW9ucykpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICB3cmFwcGVyID0gKHZhbHVlKSAtPlxyXG4gICAgICAgICAgcmV0dXJuIGNvbnZlcnRlcih2YWx1ZSlcclxuXHJcbiAgICAgIHdyYXBwZXIub3B0aW9ucyA9IGRlZmF1bHRPcHRpb25zXHJcblxyXG4gICAgICBjb252ZXJ0ZXJzW2Zyb21UeXBlTmFtZV0gPz0ge31cclxuICAgICAgY29udmVydGVyc1tmcm9tVHlwZU5hbWVdW3RvVHlwZU5hbWVdID0gd3JhcHBlclxyXG5cclxuICAgICAgcmV0dXJuIGtvLnR5cGVkXHJcblxyXG4gICAga28udHlwZWQuZ2V0Q29udmVydGVyID0gKGZyb21UeXBlTmFtZSwgdG9UeXBlTmFtZSkgLT5cclxuICAgICAgY29udmVydGVyc1tmcm9tVHlwZU5hbWVdP1t0b1R5cGVOYW1lXVxyXG5cclxuICAgIGtvLnR5cGVkLnJlbW92ZUNvbnZlcnRlciA9IChmcm9tVHlwZU5hbWUsIHRvVHlwZU5hbWUpIC0+XHJcbiAgICAgIGlmIGNvbnZlcnRlcnNbZnJvbVR5cGVOYW1lXT9bdG9UeXBlTmFtZV0/XHJcbiAgICAgICAgZGVsZXRlIGNvbnZlcnRlcnNbZnJvbVR5cGVOYW1lXT9bdG9UeXBlTmFtZV1cclxuXHJcbiAgICAgIHJldHVybiBrby50eXBlZFxyXG5cclxuICAgIHJldHVyblxyXG5cclxuXHJcbiAgZG8gLT5cclxuICAgICMjIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL01hdGgvcm91bmRcclxuICAgIGRlY2ltYWxBZGp1c3QgPSAodHlwZSwgdmFsdWUsIGV4cCkgLT5cclxuICAgICAgIyBpZiBleHAgaXMgdW5kZWZpbmVkIG9yIHplcm9cclxuICAgICAgaWYgbm90IGV4cD8gb3IgK2V4cCA9PSAwXHJcbiAgICAgICAgcmV0dXJuIHR5cGUodmFsdWUpXHJcblxyXG4gICAgICB2YWx1ZSA9ICt2YWx1ZVxyXG4gICAgICBleHAgPSArZXhwXHJcblxyXG4gICAgICAjIElmIHRoZSB2YWx1ZSBpdCBub3QgYSBudW1iZXIgb2YgdGhlIGV4cCBpcyBub3QgYW4gaW50ZWdlclxyXG4gICAgICBpZiAoaXNOYU4odmFsdWUpIG9yIG5vdCAodHlwZW9mIGV4cCA9PSAnbnVtYmVyJyBhbmQgZXhwICUgMSA9PSAwKSlcclxuICAgICAgICByZXR1cm4gTmFOXHJcblxyXG4gICAgICAjIFNoaWZ0XHJcbiAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKS5zcGxpdCgnZScpXHJcbiAgICAgIHZhbHVlID0gdHlwZSgrKHZhbHVlWzBdICsgJ2UnICsgKGlmIHZhbHVlWzFdIHRoZW4gKCt2YWx1ZVsxXSAtIGV4cCkgZWxzZSAtZXhwKSkpXHJcblxyXG4gICAgICAjIFNoaWZ0IGJhY2tcclxuICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpLnNwbGl0KCdlJylcclxuICAgICAgcmV0dXJuICgrKHZhbHVlWzBdICsgJ2UnICsgKGlmIHZhbHVlWzFdIHRoZW4gKCt2YWx1ZVsxXSArIGV4cCkgZWxzZSBleHApKSlcclxuXHJcbiAgICBpZiBub3QgTWF0aC5yb3VuZDEwP1xyXG4gICAgICBNYXRoLnJvdW5kMTAgPSAodmFsdWUsIGV4cCkgLT5cclxuICAgICAgICByZXR1cm4gZGVjaW1hbEFkanVzdChNYXRoLnJvdW5kLCB2YWx1ZSwgZXhwKVxyXG5cclxuICAgIGlmIG5vdCBNYXRoLmZsb29yMTA/XHJcbiAgICAgIE1hdGguZmxvb3IxMCA9ICh2YWx1ZSwgZXhwKSAtPlxyXG4gICAgICAgIHJldHVybiBkZWNpbWFsQWRqdXN0KE1hdGguZmxvb3IsIHZhbHVlLCBleHApXHJcblxyXG4gICAgaWYgbm90IE1hdGguY2VpbDEwP1xyXG4gICAgICBNYXRoLmNlaWwxMCA9ICh2YWx1ZSwgZXhwKSAtPlxyXG4gICAgICAgIHJldHVybiBkZWNpbWFsQWRqdXN0KE1hdGguY2VpbCwgdmFsdWUsIGV4cClcclxuXHJcbiAgICByZXR1cm5cclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ0Jvb2xlYW4nXHJcbiAgICAnTnVtYmVyLkludGVnZXInXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIHJldHVybiBpZiB2YWx1ZSB0aGVuIG9wdGlvbnMudHJ1dGh5IGVsc2Ugb3B0aW9ucy5mYWxzZXlcclxuICAgIHtcclxuICAgICAgdHJ1dGh5OiAxXHJcbiAgICAgIGZhbHNleTogMFxyXG4gICAgfVxyXG4gICAgJ3RydXRoeSdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdCb29sZWFuJ1xyXG4gICAgJ051bWJlcidcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgcmV0dXJuIGlmIHZhbHVlIHRoZW4gb3B0aW9ucy50cnV0aHkgZWxzZSBvcHRpb25zLmZhbHNleVxyXG4gICAge1xyXG4gICAgICB0cnV0aHk6IDFcclxuICAgICAgZmFsc2V5OiAwXHJcbiAgICB9XHJcbiAgICAndHJ1dGh5J1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ0Jvb2xlYW4nXHJcbiAgICAnU3RyaW5nJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICB2YWx1ZSA9IGlmIHZhbHVlIHRoZW4gb3B0aW9ucy50cnV0aHkgZWxzZSBvcHRpb25zLmZhbHNleVxyXG5cclxuICAgICAgaWYgb3B0aW9ucy51cHBlckNhc2VcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvVXBwZXJDYXNlKClcclxuXHJcbiAgICAgIHJldHVybiB2YWx1ZVxyXG4gICAge1xyXG4gICAgICB1cHBlckNhc2U6IGZhbHNlXHJcbiAgICAgIHRydXRoeTogJ3RydWUnXHJcbiAgICAgIGZhbHNleTogJ2ZhbHNlJ1xyXG4gICAgfVxyXG4gICAgJ3VwcGVyQ2FzZSdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdEYXRlJ1xyXG4gICAgJ01vbWVudCdcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgKG1vbWVudCA/IHJlcXVpcmUoJ21vbWVudCcpKSh2YWx1ZSlcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdEYXRlJ1xyXG4gICAgJ1N0cmluZydcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgaXNOYU4odmFsdWUudmFsdWVPZigpKVxyXG4gICAgICAgIHJldHVybiAnJ1xyXG5cclxuICAgICAgbWV0aG9kID0gb3B0aW9ucy5mb3JtYXRzW29wdGlvbnMuZm9ybWF0XVxyXG4gICAgICByZXR1cm4gdmFsdWVbbWV0aG9kXS5hcHBseSh2YWx1ZSwgb3B0aW9ucy5wYXJhbXMpXHJcblxyXG4gICAge1xyXG4gICAgICBmb3JtYXRzOiB7XHJcbiAgICAgICAgZGF0ZTogJ3RvRGF0ZVN0cmluZydcclxuICAgICAgICBpc286ICd0b0lTT1N0cmluZydcclxuICAgICAgICBqc29uOiAndG9KU09OJ1xyXG4gICAgICAgIGxvY2FsZURhdGU6ICd0b0xvY2FsZURhdGVTdHJpbmcnXHJcbiAgICAgICAgbG9jYWxlVGltZTogJ3RvTG9jYWxlVGltZVN0cmluZydcclxuICAgICAgICBsb2NhbGU6ICd0b0xvY2FsZVN0cmluZydcclxuICAgICAgICB0aW1lOiAndG9UaW1lU3RyaW5nJ1xyXG4gICAgICAgIHV0YzogJ3RvVVRDU3RyaW5nJ1xyXG4gICAgICAgIGRlZmF1bHQ6ICd0b1N0cmluZydcclxuICAgICAgfVxyXG4gICAgICBmb3JtYXQ6ICdkZWZhdWx0J1xyXG4gICAgICBwYXJhbXM6IFtdXHJcbiAgICB9XHJcbiAgICAnZm9ybWF0J1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ0RhdGUnLFxyXG4gICAgJ1VuZGVmaW5lZCcsXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG5vdCBpc05hTih2YWx1ZS52YWx1ZU9mKCkpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSB2YWxpZCBEYXRlIHRvIFVuZGVmaW5lZCcpXHJcblxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTW9tZW50J1xyXG4gICAgJ0RhdGUnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIHZhbHVlLnRvRGF0ZSgpXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTW9tZW50J1xyXG4gICAgJ1N0cmluZydcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgbm90IHZhbHVlLmlzVmFsaWQoKVxyXG4gICAgICAgIHJldHVybiAnJ1xyXG5cclxuICAgICAgcmV0dXJuIHZhbHVlLmxvY2FsZShvcHRpb25zLmxvY2FsZSkuZm9ybWF0KG9wdGlvbnMuZm9ybWF0KVxyXG4gICAge1xyXG4gICAgICBzdHJpY3Q6IGZhbHNlXHJcbiAgICAgIGxvY2FsZTogJ2VuJ1xyXG4gICAgICBmb3JtYXQ6ICdMJ1xyXG4gICAgfVxyXG4gICAgJ2Zvcm1hdCdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdNb21lbnQnLFxyXG4gICAgJ1VuZGVmaW5lZCcsXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIHZhbHVlLmlzVmFsaWQoKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VuYWJsZSB0byBjb252ZXJ0IGZyb20gdmFsaWQgTW9tZW50IHRvIFVuZGVmaW5lZCcpXHJcblxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnTnVtYmVyJ1xyXG4gICAgJ0Jvb2xlYW4nXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMuZmFsc2V5PyBhbmQgdmFsdWUgPT0gb3B0aW9ucy5mYWxzZXlcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgZWxzZSBpZiBvcHRpb25zLnRydXRoeT8gYW5kIHZhbHVlID09IG9wdGlvbnMudHJ1dGh5XHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgZWxzZSBpZiBub3Qgb3B0aW9ucy5mYWxzZXk/XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIGVsc2UgaWYgbm90IG9wdGlvbnMudHJ1dGh5P1xyXG4gICAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBCb29sZWFuXCIpXHJcbiAgICB7XHJcbiAgICAgIHRydXRoeTogdW5kZWZpbmVkXHJcbiAgICAgIGZhbHNleTogMFxyXG4gICAgfVxyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ051bWJlcidcclxuICAgICdOdW1iZXIuSW50ZWdlcidcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgdHlwZW9mIG9wdGlvbnMubW9kZSA9PSAnc3RyaW5nJ1xyXG4gICAgICAgIG1vZGUgPSBNYXRoW29wdGlvbnMubW9kZV1cclxuICAgICAgZWxzZVxyXG4gICAgICAgIG1vZGUgPSBvcHRpb25zLm1vZGVcclxuXHJcbiAgICAgIHJldHVybiBtb2RlKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICBtb2RlOiAncm91bmQnXHJcbiAgICB9XHJcbiAgICAnbW9kZSdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdOdW1iZXInXHJcbiAgICAnU3RyaW5nJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLmRlY2ltYWxzP1xyXG4gICAgICAgIHZhbHVlID0gTWF0aC5yb3VuZDEwKHZhbHVlLCAtb3B0aW9ucy5kZWNpbWFscylcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvRml4ZWQob3B0aW9ucy5kZWNpbWFscylcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKVxyXG5cclxuICAgICAgcmV0dXJuIHZhbHVlXHJcbiAgICB7XHJcbiAgICAgIGRlY2ltYWxzOiB1bmRlZmluZWRcclxuICAgIH1cclxuICAgICdkZWNpbWFscydcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdOdW1iZXIuSW50ZWdlcidcclxuICAgICdCb29sZWFuJ1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLmZhbHNleT8gYW5kIHZhbHVlID09IG9wdGlvbnMuZmFsc2V5XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIGVsc2UgaWYgb3B0aW9ucy50cnV0aHk/IGFuZCB2YWx1ZSA9PSBvcHRpb25zLnRydXRoeVxyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgIGVsc2UgaWYgbm90IG9wdGlvbnMuZmFsc2V5P1xyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICBlbHNlIGlmIG5vdCBvcHRpb25zLnRydXRoeT9cclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjb252ZXJ0IGZyb20gI3t2YWx1ZX0gdG8gQm9vbGVhblwiKVxyXG4gICAge1xyXG4gICAgICB0cnV0aHk6IHVuZGVmaW5lZFxyXG4gICAgICBmYWxzZXk6IDBcclxuICAgIH1cclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdOdW1iZXIuSW50ZWdlcidcclxuICAgICdOdW1iZXInLFxyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICByZXR1cm4gdmFsdWVcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdOdW1iZXIuSW50ZWdlcidcclxuICAgICdTdHJpbmcnLFxyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKG9wdGlvbnMuYmFzZSlcclxuICAgICAgaWYgb3B0aW9ucy51cHBlckNhc2VcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvVXBwZXJDYXNlKClcclxuXHJcbiAgICAgIHJldHVybiB2YWx1ZVxyXG4gICAge1xyXG4gICAgICBiYXNlOiAxMFxyXG4gICAgICB1cHBlckNhc2U6IGZhbHNlXHJcbiAgICB9XHJcbiAgICAnYmFzZSdcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdTdHJpbmcnLFxyXG4gICAgJ0Jvb2xlYW4nLFxyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLnRyaW1cclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRyaW0oKVxyXG5cclxuICAgICAgaWYgb3B0aW9ucy5pZ25vcmVDYXNlXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50b0xvd2VyQ2FzZSgpXHJcblxyXG4gICAgICBpZiBvcHRpb25zLnN0cmljdFxyXG4gICAgICAgIGlmIHZhbHVlID09IG9wdGlvbnMudHJ1dGh5WzBdXHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIGVsc2UgaWYgdmFsdWUgPT0gb3B0aW9ucy5mYWxzZXlbMF1cclxuICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgZm9yIHRydXRoeSBpbiBvcHRpb25zLnRydXRoeVxyXG4gICAgICAgICAgaWYgdmFsdWUgPT0gdHJ1dGh5XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICAgICAgIGZvciBmYWxzZXkgaW4gb3B0aW9ucy5mYWxzZXlcclxuICAgICAgICAgIGlmIHZhbHVlID09IGZhbHNleVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY29udmVydCBmcm9tICN7dmFsdWV9IHRvIEJvb2xlYW5cIilcclxuICAgIHtcclxuICAgICAgaWdub3JlQ2FzZTogdHJ1ZVxyXG4gICAgICBzdHJpY3Q6IGZhbHNlXHJcbiAgICAgIHRydXRoeTogW1xyXG4gICAgICAgICd0cnVlJ1xyXG4gICAgICAgICd0J1xyXG4gICAgICAgICcxJ1xyXG4gICAgICAgICctMSdcclxuICAgICAgICAneWVzJ1xyXG4gICAgICAgICd5J1xyXG4gICAgICBdXHJcbiAgICAgIGZhbHNleTogW1xyXG4gICAgICAgICdmYWxzZSdcclxuICAgICAgICAnZidcclxuICAgICAgICAnMCdcclxuICAgICAgICAnbm8nXHJcbiAgICAgICAgJ24nXHJcbiAgICAgIF1cclxuICAgICAgdHJpbTogZmFsc2VcclxuICAgIH1cclxuICAgICdzdHJpY3QnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnU3RyaW5nJ1xyXG4gICAgJ0RhdGUnXHJcbiAgICAodmFsdWUsIG9wdGlvbnMpIC0+XHJcbiAgICAgIGlmIG9wdGlvbnMudHJpbVxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUudHJpbSgpXHJcblxyXG4gICAgICBkYXRlID0gbmV3IERhdGUodmFsdWUpXHJcbiAgICAgIGlmIGlzTmFOKGRhdGUudmFsdWVPZigpKVxyXG4gICAgICAgIHRocm93IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gI3t2YWx1ZX0gdG8gRGF0ZVwiKVxyXG5cclxuICAgICAgcmV0dXJuIGRhdGVcclxuICAgIHtcclxuICAgICAgdHJpbTogZmFsc2VcclxuICAgIH1cclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdTdHJpbmcnXHJcbiAgICAnTW9tZW50J1xyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLnRyaW1cclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRyaW0oKVxyXG5cclxuICAgICAgcmVzdWx0ID0gKG1vbWVudCA/IHJlcXVpcmUoJ21vbWVudCcpKSh2YWx1ZSwgb3B0aW9ucy5mb3JtYXQsIG9wdGlvbnMubGFuZ3VhZ2UsIG9wdGlvbnMuc3RyaWN0KVxyXG4gICAgICBpZiBub3QgcmVzdWx0LmlzVmFsaWQoKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tICN7dmFsdWV9IHRvIE1vbWVudFwiKVxyXG5cclxuICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAge1xyXG4gICAgICBzdHJpY3Q6IGZhbHNlXHJcbiAgICAgIGxhbmd1YWdlOiAnZW4nXHJcbiAgICAgIGZvcm1hdDogJ0wnXHJcbiAgICAgIHRyaW06IGZhbHNlXHJcbiAgICB9XHJcbiAgICAnZm9ybWF0J1xyXG4gIClcclxuXHJcbiAga28udHlwZWQuYWRkQ29udmVydGVyKFxyXG4gICAgJ1N0cmluZycsXHJcbiAgICAnTnVtYmVyLkludGVnZXInLFxyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLnRyaW1cclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRyaW0oKVxyXG5cclxuICAgICAgaWYgb3B0aW9ucy5iYXNlID09IDEwIGFuZCBub3Qgb3B0aW9ucy5zdHJpY3RcclxuICAgICAgICB0cnlcclxuICAgICAgICAgIHJldHVybiBrby50eXBlZC5nZXRDb252ZXJ0ZXIoJ1N0cmluZycsICdOdW1iZXInKSh2YWx1ZSwgMClcclxuICAgICAgICBjYXRjaCBleFxyXG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBjb252ZXJ0IGZyb20gI3t2YWx1ZX0gdG8gTnVtYmVyLkludGVnZXJcIilcclxuXHJcbiAgICAgIGNoYXJzID0gJzAxMjM0NTY3ODlhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eidcclxuICAgICAgaWYgbm90IFJlZ0V4cChcIl4oXFxcXC18XFxcXCspP1sje2NoYXJzLnNsaWNlKDAsIG9wdGlvbnMuYmFzZSA/IDEwKX1dKyRcIiwgaWYgbm90IG9wdGlvbnMuc3RyaWN0IHRoZW4gJ2knKS50ZXN0KHZhbHVlKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tICN7dmFsdWV9IHRvIE51bWJlci5JbnRlZ2VyXCIpXHJcblxyXG4gICAgICByZXR1cm4gcGFyc2VJbnQodmFsdWUsIG9wdGlvbnMuYmFzZSlcclxuICAgIHtcclxuICAgICAgYmFzZTogMTBcclxuICAgICAgc3RyaWN0OiBmYWxzZVxyXG4gICAgICB0cmltOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgJ2Jhc2UnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnU3RyaW5nJ1xyXG4gICAgJ051bWJlcidcclxuICAgICh2YWx1ZSwgb3B0aW9ucykgLT5cclxuICAgICAgaWYgb3B0aW9ucy50cmltXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50cmltKClcclxuXHJcbiAgICAgIGlmIG5vdCAvXihcXCt8XFwtKT9bMC05XSsoXFwuPylbMC05XSokLy50ZXN0KHZhbHVlKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmFibGUgdG8gY29udmVydCBmcm9tICN7dmFsdWV9IHRvIE51bWJlclwiKVxyXG5cclxuICAgICAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlLCBvcHRpb25zLmJhc2UpXHJcblxyXG4gICAgICBpZiBvcHRpb25zLmRlY2ltYWxzP1xyXG4gICAgICAgIHZhbHVlID0gTWF0aC5yb3VuZDEwKHZhbHVlLCAtb3B0aW9ucy5kZWNpbWFscylcclxuXHJcbiAgICAgIHJldHVybiB2YWx1ZVxyXG4gICAge1xyXG4gICAgICBkZWNpbWFsczogdW5kZWZpbmVkXHJcbiAgICAgIHRyaW06IGZhbHNlXHJcbiAgICB9XHJcbiAgICAnZGVjaW1hbHMnXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnU3RyaW5nJyxcclxuICAgICdVbmRlZmluZWQnLFxyXG4gICAgKHZhbHVlLCBvcHRpb25zKSAtPlxyXG4gICAgICBpZiBvcHRpb25zLnRyaW1cclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRyaW0oKVxyXG5cclxuICAgICAgaWYgdmFsdWUubGVuZ3RoICE9IDBcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIGNvbnZlcnQgZnJvbSAje3ZhbHVlfSB0byBVbmRlZmluZWRcIilcclxuXHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuICAgIHtcclxuICAgICAgdHJpbTogZmFsc2VcclxuICAgIH1cclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdVbmRlZmluZWQnLFxyXG4gICAgJ0RhdGUnLFxyXG4gICAgKHZhbHVlKSAtPlxyXG4gICAgICByZXR1cm4gbmV3IERhdGUoJycpXHJcbiAgKVxyXG5cclxuICBrby50eXBlZC5hZGRDb252ZXJ0ZXIoXHJcbiAgICAnVW5kZWZpbmVkJyxcclxuICAgICdTdHJpbmcnLFxyXG4gICAgKHZhbHVlKSAtPlxyXG4gICAgICByZXR1cm4gJydcclxuICApXHJcblxyXG4gIGtvLnR5cGVkLmFkZENvbnZlcnRlcihcclxuICAgICdVbmRlZmluZWQnLFxyXG4gICAgJ01vbWVudCcsXHJcbiAgICAodmFsdWUpIC0+XHJcbiAgICAgIHJldHVybiByZXF1aXJlKCdtb21lbnQnKSgnJylcclxuICApXHJcblxyXG4gIHJldHVybiBrb1xyXG4iXX0=
