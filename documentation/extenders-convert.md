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


### Conversion order

Conversions are attempted in-order.

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


