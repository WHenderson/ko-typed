# [ko typed](../README.md)

[ko-typed](../README.md) provides observable extensions for restricting and converting observable values based on type. Supports validation.

[![Build Status](https://travis-ci.org/WHenderson/ko-typed.svg?branch=master)](https://travis-ci.org/WHenderson/ko-typed)
[![Coverage Status](https://coveralls.io/repos/WHenderson/ko-typed/badge.svg?branch=master&service=github)](https://coveralls.io/github/WHenderson/ko-typed?branch=master)


## `type`

Create a computed observable which only accepts a specified list of types.
Does not perform conversions.

Supports:
* Generic types
* Custom types
* Overrides

Uses the [is-an](https://github.com/WHenderson/is-an) library for generic type matching.
See [Extenders](./extenders.md) for generic information around ko-typed extenders.

### Syntax

```js
ko.observable().extend({ type: options })
```

* `options: String` -> `options.type: String`
* `options: Array` -> `options.type: Array`
* `options: Function` -> `options.check: Function` and `options.type: Function.typeName`
* `options.type: String|Array`
  * `String`
    Provide a `|` separated list of TypeNames.
    eg: `'Undefined|String'`
  * `Array`
    Provide an array of TypeNames.
    eg: `['Undefined', 'String']`
* `options.check: Function`
  Returns false to refuse assignment of the provided value.
  Signature: `check(value) : Boolean`
* [common options](./extenders.md)
* `options.TypeName : Function`
  Provides a custom type check for `TypeName`.
  This type check will override any checks provided by the is-an library for `TypeName`.
  Multiple `TypeName : Function`'s can be provided in this way.
  Each `TypeName` provided this way is added to `options.type`.




