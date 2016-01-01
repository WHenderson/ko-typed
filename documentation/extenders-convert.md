# [ko typed](../README.md)

[ko-typed](../README.md) provides observable extensions for restricting and converting observable values based on type. Supports validation.

[![Build Status](https://travis-ci.org/WHenderson/ko-typed.svg?branch=master)](https://travis-ci.org/WHenderson/ko-typed)
[![Coverage Status](https://coveralls.io/repos/WHenderson/ko-typed/badge.svg?branch=master&service=github)](https://coveralls.io/github/WHenderson/ko-typed?branch=master)


## `convert`

Create a computed observable which converts to and from internal and external types.

Supports:
* Type restriction
* Custom conversions
* Default conversions
* Overrides

Uses the [is-an](https://github.com/WHenderson/is-an) library for generic type matching.
See [Extenders](./extenders.md) for generic information around ko-typed extenders.

### Syntax

* `options: String|Array` -> `options.type: String|Array`
* `options: true` -> `options: {}`
* `options: false` -> `noop`
* `options.type: Undefined|String|Array`
  * `Undefined`
    Convert to/from any external type.
  * `String`
    `|` separated string of TypeName's.
    External values must match one of the provided types.
    e.g. `'Undefined|Number|String'`
  * `Array`
    Array of TypeName's.
    External values must match one of the provided types.
* `options.check`
  Syntax `check(externalValue) : Boolean`.
  If this function returns false, then the given external value is not supported.
* `options.read`
  Syntax `read(internalValue) : externalValue`.
  Converts the given internalValue to an externalValue, or throws TypeError if the conversion is not supported.
* `options.write`
  Syntax `write(externalValue) : internalValue`.
  Converts the given externalValue to an internalValue, or throws TypeError if the conversion is not supported.
* `options.ExternalTypeName`
  Provides overrides for conversions involving the given external type.
* `options.ExternalTypeName.type: Undefined|String|Array`
  * `Undefined`
    Convert to/from any internal type. (Overridden by target.typeNames if available).
  * `String`
    `|` separated string of TypeName's.
    Internal values must match one of the provided types.
    e.g. `'Undefined|Number|String'`
  * `Array`
    Array of TypeName's.
    Internal values must match one of the provided types.
* `options.ExternalTypeName.check: Function`
  Syntax `check(externalValue) : Boolean`.
  Used to validate that `externalValue` is an `ExternalTypeName`.
  If none is provided, the is-an library will be used for type checking.
* `options.ExternalTypeName.read`
  Syntax `read(internalValue) : ExternalTypeName`.
  Converts the given internalValue to an externalValue, or throws TypeError if the conversion is not supported.
  Overrides `options.read` for the given `ExternalTypeName`.
* `options.ExternalTypeName.write`
  Syntax `write(externalValue : ExternalTypeName) : internalValue`.
  Converts the given externalValue to an internalValue, or throws TypeError if the conversion is not supported.
  Overrides `options.write` for the given `ExternalTypeName`.
* `options.ExternalTypeName.InternalTypeName`
  Provides overrides for conversion between the given internal and external types.
* `options.ExternalTypeName.InternalTypeName.read`
  Syntax `read(internalValue: InternalTypeName) : ExternalTypeName`.
  Converts the given internalValue to an externalValue, or throws TypeError if the conversion is not supported.
  Overrides `options.read` and `options.ExternalTypeName.read` for the given `ExternalTypeName` and `InternalTypeName` combination.
* `options.ExternalTypeName.InternalTypeName.write`
  Syntax `write(externalValue : ExternalTypeName) : InternalTypeName`.
  Converts the given externalValue to an internalValue, or throws TypeError if the conversion is not supported.
  Overrides `options.write` and `options.ExternalTypeName` for the given `ExternalTypeName` and `InternalTypeName` combination.
* `options.ignoreDefaultConverters`
  Do not use default converters provided by `ko.typed.getConverter`.
* [common options](./extenders.md)

### Conversion types order

Conversions types are attempted in-order.

For instance, if the external type list is `'Number|String'` and the internal type list `Undefined|Number.Integer|String', then conversions will be attempted in the following order:

* `'Number'` -> `'Undefined'`
* `'Number'` -> `'Number.Integer'`
* `'Number'` -> `'String'`
* `'String'` -> `'Undefined'`
* `'String'` -> `'Number.Integer'`
* `'String'` -> `'String'`

As soon as a successful conversion is found, the function returns.
If no conversion is found, a TypeError exception is raised.

The exception may be caught and a default value may also be used depending on the [options given by `options.exRead` / `options.exWrite`](./extenders.md)

### Conversion overrides order

Conversion overrides are attempted in most specific to least specific order.

e.g.

* `options.ExternalTypeName.InternalTypeName.read/write`
* `options.ExternalTypeName.read/write`
* `options.read/write`
* no conversion necessary (`ExternalTypeName == InternalTypeName`)
* `ko.typed.getConverter(ExternalTypeName, InternalTypeName)`
