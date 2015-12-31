# [ko typed](../README.md)

[ko-typed](../README.md) provides observable extensions for restricting and converting observable values based on type.

[![Build Status](https://travis-ci.org/WHenderson/ko-typed.svg?branch=master)](https://travis-ci.org/WHenderson/ko-typed)
[![Coverage Status](https://coveralls.io/repos/WHenderson/ko-typed/badge.svg?branch=master&service=github)](https://coveralls.io/github/WHenderson/ko-typed?branch=master)

## Converters

### API

The converters API can be accessed from `ko.typed`

#### Converter function signature

##### Syntax

```js
var converted = converter(value[, options]);
```

##### Parameters

* `value`
  The input value to be converted

* `options` (optional)
  Options used to control the conversion.
  May be a value specifying the default configurable option, or an object literal.
  Values override the default options.

##### Properties

* `options`
  The default options used when calling the function. May be overridden / replaced.

#### `.addConverter`

The `.addConverter` method adds a converter to the internal list of standard converters.
This method is chainable.

##### Syntax

```js
ko.typed.addConverter(fromTypeName, toTypeName, converter[, defaultOptions[, defaultOption]]);
```
##### Parameters

* `fromTypeName`
  TypeName of the source `value`. Standard TypeName's are provided by the [is-an](https://github.com/WHenderson/is-an) library.

* `toTypeName`
  TypeName of the result.

* `converter`
  A function with the signature `converter(value[, options])`.
  Throws `TypeError` if the conversion cannot be performed with the given value/options.
  This function is not expected to validate the type of incoming arguments.
  The resulting type is expected to be of `toTypeName`.
  When called, `options` will be an object literal containing the default options and overridden options.

* `defaultOptions` (optional)
  An object literal containing the default options which will be provided to `converter`.

* `defaultOption` (optional)
  The name of a key within `defaultOptions`.
  When `converter` is called with an options argument which is not an `Object`, the specified option will be overridden.

##### Example

```js
function Converter(value, options) {
  // See https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
  return JSON.parse(value, options.reviver);
}

ko.typed.addConverter('String', 'Object.Literal', Converter, { reviver: undefined }, 'reviver');

var converter = ko.typed.getConverter('String', 'Object.Literal');

var converted = converter('{ "a": 1 }');
```

#### `.getConverter`

The `.getConverter` method returns a specific converter, or `undefined` if none is found.
Note that the returned converter is actually a wrapper around the original converter provided to `.addConverter`.

##### Syntax

```js
ko.typed.getConverter(fromTypeName, toTypeName);
```

##### Parameters

* `fromTypeName`
  TypeName of the source `value`. Standard TypeName's are provided by the [is-an](https://github.com/WHenderson/is-an) library.

* `toTypeName`
  TypeName of the result.

##### Example

```js
var converter = ko.typed.getConverter('Undefined', 'String');
```

#### `.removeConverter`

The `.removeConverter` method removes the specific converter.
No error is raised if the converter does not exist.
This method is chainable.

##### Syntax

```js
ko.typed.removeConverter(fromTypeName, toTypeName);
```

##### Parameters

* `fromTypeName`
  TypeName of the source `value`. Standard TypeName's are provided by the [is-an](https://github.com/WHenderson/is-an) library.

* `toTypeName`
  TypeName of the result.

##### Example

```js
ko.typed.removeConverter('Undefined', 'String');
```


### Provided Converters

| From             | To                                                              |
| ---------------- | --------------------------------------------------------------- |
| `Undefined`      | `String`,`Data`,`Moment`                                        |
| `Boolean`        | `Number.Integer`,`Number`,`String`                              |
| `Number.Integer` | `Boolean`,`Number`,`String`                                     |
| `Number`         | `Boolean`,`Number.Integer`,`String`                             |
| `String`         | `Undefined`,`Boolean`,`Number.Integer`,`Number`,`Date`,`Moment` |

### `Undefined` to `String`

Results in the empty string `''`.

#### Examples

| Input       | Output |
| ----------- | ------ |
| `undefined` | `''`   |

### `Undefined` to `Date`

Results in the invalid date `new Date(NaN)`.

#### Examples

| Input       | Output            |
| ----------- | ----------------- |
| `undefined` | `new Date(NaN)`   |

### `Undefined` to `Moment`

Results in the invalid moment `moment.invalid()`.

#### Examples

| Input       | Output               |
| ----------- | -------------------- |
| `undefined` | `moment.invalid()`   |

### `Boolean` to `Number.Integer`

* `options: value` -> `options.truthy: value`
* `options.truthy: value`
  Default `1`.
  The value to return when the input value is truthy.
* `options.falsey: value`
  Default `0`.
  The value to return when the input value is falsey.

#### Examples

| Input       | Output |
| ----------- | ------ |
| `false`     | `0`   |
| `true`      | `1`   |

### `Boolean` to `Number`

* `options: value` -> `options.truthy: value`
* `options.truthy: value`
  Default `1`.
  The value to return when the input value is truthy.
* `options.falsey: value`
  Default `0`.
  The value to return when the input value is falsey.

#### Examples

| Input       | Output |
| ----------- | ------ |
| `false`     | `0`   |
| `true`      | `1`   |

### `Boolean` to `String`

* `options: value` -> `options.upperCase: value`
* `options.truthy: value`
  Default `true`.
  The value to return when the input value is truthy.
* `options.falsey: value`
  Default `false`.
  The value to return when the input value is falsey.
* `options.upperCase: Boolean`
  Default `false`.
  If true, the resulting value will be converted to uppercase.

#### Examples

| Input       | Output    |
| ----------- | --------- |
| `false`     | `'false'` |
| `true`      | `'true'`  |

### `Number.Integer` to `Boolean`

* `options.truthy: value`
  Default `undefined`.
  If `value` is null or undefined and the input value does not match `options.falsey`, then the result is `true`.
  If `value` matches input value, then the result is `true`.
* `options.falsey: value`
  Default `undefined`.
  If `value` is null or undefined and the input value does not match `options.falsey`, then the result is `true`.
  If `value` matches input value, then the result is `true`.

Throws TypeError if not match is found.

#### Examples

| Input       | Output  |
| ----------- | ------- |
| `0`         | `false` |
| `123`       | `true`  |

### `Number.Integer` to `Number`

Results in the input value.

#### Examples

| Input | Output |
| ----- | ------ |
| `42`  | `42`   |

### `Number.Integer` to `String`

* `options: value` -> `options.base: value`
* `options.base: Integer`
  Default `10`.
  Convert the input value to a string with the specified base.
* `options.upperCase: Boolean`
  Default `false`.
  If true, the result will be converted to upper case.

#### Examples

| Input | Output |
| ----- | ------ |
| `42`  | `'42'` |

### `Number` to `Boolean`

* `options.truthy: value`
  Default `undefined`.
  If `value` is null or undefined and the input value does not match `options.falsey`, then the result is `true`.
  If `value` matches input value, then the result is `true`.
* `options.falsey: value`
  Default `undefined`.
  If `value` is null or undefined and the input value does not match `options.falsey`, then the result is `true`.
  If `value` matches input value, then the result is `true`.

Throws TypeError if not match is found.

#### Examples

| Input       | Output  |
| ----------- | ------- |
| `0`         | `false` |
| `0.5`       | `true`  |

### `Number` to `Number.Integer`

* `options: value` -> `options.mode: value`
* `options.mode: Undefined|String|Function`
  Default `undefined`.
  * `Undefined`
    Input value must be an exact integer or the conversion will throw a TypeError.
  * `String`
    The name of a function from the Math standard unit.
    Normally this would be one of round/floor/ceil/round10/floor10/ceil10.
  * `Function`
    A function which takes a number and returns an integer.
    Should throw TypeError if the conversion cannot be performed due to the input value.

Throws TypeError if the conversion cannot be performed.

#### Examples

| Input | Output      |
| ----- | ----------- |
| `0.5` | `TypeError` |
| `0`   | `0`         |
| `42`  | `42`        |

### `Number` to `String`

* `options: value` -> `options.decimals: value`
* `options.decimals: Undefined|Integer`
  Default `undefined`.
  * `Undefined`
    Use the default system conversion
  * `Integer`
    Ensure there is a fixed number of decimal places in the resulting string

#### Examples

| Input | Output   |
| ----- | -------- |
| `0.5` | `'0.5'`  |
| `0`   | `'0'`    |
| `42`  | `'42'`   |

### `String` to `Undefined`

If string is empty returns undefined, otherwise throws TypeError.

* `options.trim: Boolean`
  Default `false`.
  If true, trims leading and trailing whitespace from the input value before attempting conversion.

#### Examples

| Input     | Output      |
| --------- | ----------- |
| `'value'` | `TypeError` |
| `''`      | `undefined` |

### `String` to `Boolean`

* `options: value` -> `options.strict: value`
* `options.strict: Boolean`
  If true, only the first option is considered from each of the truthy/falsey lists
* `options.trim`
  Default `false`.
  If true, trims leading and trailing whitespace from the input value before attempting conversion.
* `options.ignoreCase`
  Default `true`
  If true, the input value is converted to lower case before conversion.
* `options.truthy: Array`
  Default `['true', 't', '1', '-1', 'yes', 'y']`.
  If the input value matches one of these, the result is `true`.
* `options.falsey: Array`
  Default `['false', 'f', '0', 'no', 'n']`.
  If the input value matches one of these, the result is `false`.

Throws TypeError if no match is found.

#### Examples

| Input     | Output      |
| --------- | ----------- |
| `'true'`  | `true`      |
| `'t'`     | `true`      |
| `'1'`     | `true`      |
| `'-1'`    | `true`      |
| `'yes'`   | `true`      |
| `'y'`     | `true`      |
| `'false'` | `false`     |
| `'f'`     | `false`     |
| `'0'`     | `false`     |
| `'no'`    | `false`     |
| `'n'`     | `false`     |
| `'value'` | `TypeError` |

### `String` to `Number.Integer`

* `options: value` -> `options.base: value`
* `options.base: Integer`
  Default `10`.
  The number base to use during conversion.
* `options.strict: Boolean`
  Default `false`.
  If false and `base` is `10`, numbers with decimals are rounded up to the nearest integer.
* `options.trim: Boolean`
  Default `false`
  If true, trims leading and trailing whitespace from the input value before attempting conversion.

Throws TypeError if the conversion fails.

| Input     | Output      |
| --------- | ----------- |
| `'0'`     | `0`         |
| `'0.5'`   | `1`         |
| `'42'`    | `42`        |
| `'value'` | `TypeError` |

### `String` to `Number`

* `options: value` -> `options.decimals`
* `options.decimals: Undefined|Integer`
  Default `undefined`
  * `Integer`
    Resulting value is rounded to the specified number of decimal places.
* `options.trim: Boolean`
  Default `false`
  If true, trims leading and trailing whitespace from the input value before attempting conversion.

Throws TypeError if the conversion fails.

| Input     | Output      |
| --------- | ----------- |
| `'0'`     | `0`         |
| `'0.5'`   | `0.5`       |
| `'42'`    | `42`        |
| `'value'` | `TypeError` |

### `String` to `Date`

* `options.trim: Boolean`
  Default `false`
  If true, trims leading and trailing whitespace from the input value before attempting conversion.
* `options.strict: Boolean`
  Default `true`
  If true, input value must match the regular expression provided by `options.format`
* `options.format: RegExp`
  Default [ISO](https://www.debuggex.com/r/FnDf90hqnGul1ZYu/0).
  Provides a regexp for parsing a `String` into date/time/timezone components
* `options.formatDict: Object`
  Provides a name mapping for capture groups within `options.format`
* `options.utc: Boolean`
  Default `false`.
  If true, dates will be parsed as UTC time

Throws TypeError if the resulting `Date` is invalid.

### `String` to `Moment`

* `options: value` -> `options.format: value`
* `options.format: String`
  Default `'L'`.
  Used by the `moment` constructor
* `options.language: String`
  Default `'en'`.
  Used by the `moment` constructor
* `options.strict: Boolean`
  Default `false`.
  Used by the `moment` constructor
* `options.trim: Boolean`
  Default `false`
  If true, trims leading and trailing whitespace from the input value before attempting conversion.

Throws TypeError if the resulting `Moment` is invalid.

### `Date` to `Undefined`

Returns `undefined` if the input value is an invalid Date, otherwise throws TypeError.

### `Date` to `String`

If the input value is an invalid date, returns an empty string.

* `options: value` -> `options.format: value`
* `options.format: String`
  Default `default`.
  Format method used to convert date to a string.
* `options.formats: Object`
  Mapping of supported formats and their respective method names.
  Default supported formats are: default, date, iso, json, localeDate, localeTime, locale, time, utc.
* `options.params: Array`
  Default `[]`.
  Array of arguments to pass to the selected formatting method.

### `Date` to `Moment`

Returns an equivalent moment.

### `Moment` to `Undefined`

Returns `undefined` if the input value is an invalid Moment, otherwise throws TypeError.

### `Moment` to `String`

If the input value is an invalid moment, returns an empty string.

* `options: value` -> `options.format: value`
* `options.format: String`
  Default `'L'`.
  Used by `moment.format`.
* `options.locale: String`
  Default `'en'`.
  Used by `moment.locale`
