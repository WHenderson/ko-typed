# [ko typed](../README.md)

[ko-typed](../README.md) provides observable extensions for restricting and converting observable values based on type. Supports validation.

[![Build Status](https://travis-ci.org/WHenderson/ko-typed.svg?branch=master)](https://travis-ci.org/WHenderson/ko-typed)
[![Coverage Status](https://coveralls.io/repos/WHenderson/ko-typed/badge.svg?branch=master&service=github)](https://coveralls.io/github/WHenderson/ko-typed?branch=master)

## Extenders

[ko extenders](http://knockoutjs.com/documentation/extenders.html) are used to wrap a given observable and provide a typed interface.

### Common API

* `ko.typed.options`
   Default options used for each extender.

### Common options

The following options can be applied at any level. Global default (`ko.typed.options`), extender default (`ko.extenders.<EXTENDER>.options`),
and individual extensions (`ko.observable().extend({ <EXTENDER>: options })`).

* `options.validation`
  Object literal containing default validation options.

  * `options.validation.enable: Boolean`
    Default `false`.
    If true, extensions enable and contain validation using the included validation library.
    `ko.validation` must be defined at the time of extension.

  * `options.validation.read: Boolean`
    Default `true`.
    If true, validation is performed when reading the resulting observable.

  * `options.validation.write: Boolean`
    Default `true`.
    If true, validation is performed when writing the resulting observable.

  * `options.validation.target: Boolean`
    Default `false`.
    If true, validation is attached to the underlying observable.

  * `options.validation.result: Boolean
    Default `true`.
    If true, validation is attached to the resulting observable.

  * `options.validation.message: Undefined|String`
    Default `undefined`.
    * `Undefined`
      Validation error message is the message from the exception that caused validation to fail.
    * `String`
      This message is used for validation errors.

* `options.exRead`
  Object literal containing options for handling exceptions thrown when reading the resulting observable.

  * `options.exRead.catch: Boolean|Function`
    Default `true`.
    * `true`
      Catch all `TypeError` exceptions
    * `false`
      Catch no exceptions
    * `Function`
      Syntax `catch(error) : Boolean`
      `Function` is called with the thrown exception. Return `true` to catch the exception.

  * `options.exRead.useDefault : Boolean`
    Default `false`.
    If `true`, caught exceptions will result in the default value as defined by `options.exRead.defaultValue` or `options.exRead.defaultFunc`.

  * `options.exRead.defaultValue: value`
    Default `undefined`.
    The value to return when an exception is caught. This value is overridden by `options.exRead.defaultFunc`.

  * `options.exRead.defaultFunc: Undefined|Function`
    Default `undefined`.
    * `Undefined`
      Not used.
    * `Function`
      Syntax `defaultFunc() : value`.
      The result of this function is used as the return value when an exception is caught. This value overrides `options.exRead.defaultValue`.

* `options.exWrite`
  Object literal containing options for handling exceptions thrown when writing to the resulting observable.

  * `options.exWrite.catch: Boolean|Function`
    Default `true`.
    * `true`
      Catch all `TypeError` exceptions
    * `false`
      Catch no exceptions
    * `Function`
      Syntax `catch(error) : Boolean`
      `Function` is called with the thrown exception. Return `true` to catch the exception.

  * `options.exWrite.useDefault : Boolean`
    Default `false`.
    If `true`, caught exceptions will write the provided default value to the underlying observables.

  * `options.exWrite.defaultValue: value`
    Default `undefined`.
    The default value to use when an exception is caught. This value is overridden by `options.exWrite.defaultFunc`.

  * `options.exWrite.defaultFunc: Undefined|Function`
    Default `undefined`.
    * `Undefined`
      Not used.
    * `Function`
      Syntax `defaultFunc() : value`.
      The result of this function is used as the default value when an exception is caught. This value overrides `options.exWrite.defaultValue`.

