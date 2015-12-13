# ko-typed

ko-typed provides observable extensions for restricting and converting observable values based on type.

[![Build Status](https://travis-ci.org/WHenderson/ko-typed.svg?branch=master)](https://travis-ci.org/WHenderson/ko-typed)
[![Coverage Status](https://coveralls.io/repos/WHenderson/ko-typed/badge.svg?branch=master&service=github)](https://coveralls.io/github/WHenderson/ko-typed?branch=master)

## Installation

### Node
    npm install ko-typed

### Web
    bower install ko-typed

## Usage

`ko-typed` comes in two flavours - `.apply` and `.applied`.

### `.apply`
`ko-typed.apply` provides a method which will extend the provided knockout instance with the `ko-typed` api.
This is the default for nodejs.

### `.applied`
`ko-typed.applied` attempts to resolve the default knockout instance and extend it directly with the `ko-typed` api.
This is the preferred version to used for AMD.

### node
```js
var ko = require('ko-typed')(require('knockout'));

var typed = ko.observable().extend({ type: 'Undefined|Number' })
var convert = typed.extend({ convert: 'String' })
```

### web (global)
```html
<html>
    <head>
        <script type="text/javascript" src="knockout.js"></script>
        <script type="text/javascript" src="ko-typed.applied.web.min.js"></script>
    </head>
    <body>
        <script>
            var typed = ko.observable().extend({ type: 'Undefined|Number' })
            var convert = typed.extend({ convert: 'String' })
        </script>
    </body>
</html>
```

### web (amd)
```js
require.config({
    paths: {
        "knockout": ...,
        "ko-typed": "ko-typed.applied.web.min.js"
    }
});
require(['ko-typed'], function (ko) {
    var typed = ko.observable().extend({ type: 'Undefined|Number' })
    var convert = typed.extend({ convert: 'String' })
});
```

## API

### [ko extenders](http://knockoutjs.com/documentation/extenders.html)

#### `type`

Extend an observable to only allow a list of specified types during assignment.
Does not perform conversions.
Uses the [is-an](https://github.com/WHenderson/is-an) library for generic type matching.

#### `.extend({ type: string })
Returns an observable which only reads/writes the specified types.

`.extend({ type: 'TypeName' })`
`.extend({ type: 'TypeName|AnotherTypeName' })`
`.extend({ type: ['TypeName'] })`
`.extend({ type: ['TypeName', 'AnotherTypeName'] })`

Equivalent to

`.extend({ type: { type: ... } })`

Specified types must be exposed from the [is-an](https://github.com/WHenderson/is-an) library.
Extend the isAn library instance to add further types.

Example:
```js
var typed = ko.observable().extend({ type: 'Undefined|String' });

typed('String Value'); // good
typed(undefined); // good
typed(10); // TypeError
```

#### `.extend({ type: function })
Returns an observable which only reads/writes values that match the provided validation function.

`.extend({ type: function (value) { return true|false; })`

Equivalent to

`.extend({ type: { check: ... })`

Example

```js
var typed = ko.observable().extend({ type: function (value) { return (typeof value == 'string') && (value == value.toUpperCase()); } });

typed('ALL CAPS'); // no error
typed('Some Caps'); // TypeError
```

#### `.extend({ type: { ... } })`

##### `.extend({ type: { type: ... } })`
`.extend({ type: 'TypeName' })`
`.extend({ type: 'TypeName|AnotherTypeName' })`
`.extend({ type: ['TypeName'] })`
`.extend({ type: ['TypeName', 'AnotherTypeName'] })`

A string or array of type(s) which the observable value should be restricted to.

##### `.extend({ type: { check: function } })`
`.extend({ check: function (value) { return true|false; } })`

A function which returns true if the provided value is of the expected type.

##### `.extend({ type: { CustomTypeName: function } })`
`.extend({ type: { CustomTypeName: function (value) { return true|false; } } })`

A function which returns true if the provided value is of the expected type for `CustomTypeName`
`CustomTypeName` must be a valid identifier as defined by the is-an library.

##### `.extend({ type: { noThrow: boolean } })`
`.extend({ type: { noThrow: true } })`

When set to true, the write method will not raise TypeError exceptions for invalid types.
Use `.typeWriteError()` to determine if errors have been thrown.

##### `.extend({ type: { useDefault: boolean } })`
##### `.extend({ type: { default: any } })`
##### `.extend({ type: { defaultFunc: function } })`
`.extend({ type: { useDefault: true, default: 10 } })`
`.extend({ type: { useDefault: true, defaultFunc: function () { return 10; } } })`

When `useDefault` is set to true, the read method will not raise TypeError exceptions for invalid types.
Instead, the `default` value or result of `defaultFunc()` will be used.
Use `.typeReadError()` to determine if errors have been thrown.

##### `.extend({ type: { pure: boolean } })`
.extend({ type: { pure: true } })

Determine if a computed or pureComputed observable is used for wrapping.

##### `.extend({ type: { deferEvaluation: boolean } })`
.extend({ type: { deferEvaluation: true } })

Determine if the read function is executed immediately.
Note that this also applies to pure computeds so that errors can be determined immediately.

##### `.extend({ type: { validate: boolean } })`
`.extend({ type: { validate: true } })`

If true, the observable will be made validatable using the knockout-validation engine. https://github.com/Knockout-Contrib/Knockout-Validation

##### `.extend({ type: { message: string } })`
`.extend({ type: { message: 'invalid value' } })`

Used in conjunction with `validate`.
If set, this message will override the message given to the validation engine.

##### defaults

`ko.extenders.type.options` contains the default options used for the `type` extender.
Modifying this value will effect all subsequent `type` extensions.

#### `convert`

Extend an observable to convert to/from the underlying observable.
Conversion observables will restrict their input/output values according to the provided options.

Checks and conversions are performed in-order from most specific to least specific.

If the underlying observable is type restricted, the underlying types will be inferred where necessary.

TypeError is thrown for failed conversions.

##### `.extend({ convert: { ... })`

`.extend({ convert: { ... })`

Example

```js
// Example custom conversion

var base = ko.observable();
var typed = base.extend({ type: 'Undefined|Number' })
var convert = base.extend({ convert: {
  read: function (value) { return value + 1000; }
  write: function (value) { return value - 1000; }
}});
var typedConvert = typed.extend({ convert: 'String' });

base(1);
console.log(convert());
// output: 1001

convert(1002);
console.log(base());
// output: 2

base(undefined)
console.log(convert())
// output: <empty>

convert('123')
console.log(base())
// output: 123
```


##### `.extend({ convert: string })`
Equivalent to `.extend({ convert: { type: ... } })`

##### `.extend({ convert: { type: ... } })`
Provide either a String or Array of Strings specifying valid external types by name.

##### `.extend({ convert: { read: function } })`
Used to convert from the underlying value when reading the extended observable.

##### `.extend({ convert: { write: function } })`
Used to convert to the underlying value when writing the extended observable.

##### `.extend({ convert: { check: function } })`
Used to check the external value of the extended observable.

##### `.ignoreDefaultConverters`
If set to true, default conversions will not be applied.
Defaults to false.

##### `.extend({ convert: { ExternalTypeName: { ... } } })`
Specify an external type and options relating to it.

##### `.extend({ convert: { ExternalTypeName: { type: ... } } })`
String or Array of type(s) specifying valid internal types when converting to `ExternalTypeName`

##### `.extend({ convert: { ExternalTypeName: { read: function } } })`
Convert provided value (internal value) into an `ExternalTypeName`

##### `.extend({ convert: { ExternalTypeName: { write: function } } })`
Convert provided value (`ExternalTypeName`) into an internal value

##### `.extend({ convert: { ExternalTypeName: { check: function } } })`
Return true if the provided (external value) is an `ExternalTypeName`

##### `.extend({ convert: { ExternalTypeName: { InternalTypeName: { ... } } } })`
Specify an internal type and options relating to it.

##### `.extend({ convert: { ExternalTypeName: { InternalTypeName: { read: function } } } })`
Convert provided value (`InternalTypeName`) into an `ExternalTypeName`

##### `.extend({ convert: { ExternalTypeName: { InternalTypeName: { write: function } } } })`
Convert provided value (`ExternalTypeName`) into an `InternalTypeName`

##### `.extend({ convert: { ExternalTypeName: { InternalTypeName: { check: function } } } })`
Return true if the provided (external value) can be converted to `InternalTypeName`

#### Extended observables

Once an observable has been extended via `.extend({ type: ... })` or `.extend({ convert: ... })` it will contain the following api

##### `.typeName` : string
String representing the type/types which this observable supports.
Undefined if the observable does not support any named types.

##### `.typeNames` : array
Array containing each typename supported by this observable.

##### `.typeCheck` : function
Simple function for validating if the given value is supported by this observable.
Note that this only performs type checks, it does not attempt any conversions.

##### `.typeChecks` : object
object literal. keys are type names, values are type checks.

##### `.extend({ type: { noThrow: boolean } })`
`.extend({ type: { noThrow: true } })`

When set to true, the write method will not raise TypeError exceptions for invalid types.
Use `.typeWriteError()` to determine if errors have been thrown.

##### `.extend({ type: { useDefault: boolean } })`
##### `.extend({ type: { default: any } })`
##### `.extend({ type: { defaultFunc: function } })`
`.extend({ type: { useDefault: true, default: 10 } })`
`.extend({ type: { useDefault: true, defaultFunc: function () { return 10; } } })`

When `useDefault` is set to true, the read method will not raise TypeError exceptions for invalid types.
Instead, the `default` value or result of `defaultFunc()` will be used.
Use `.typeReadError()` to determine if errors have been thrown.

##### `.extend({ type: { pure: boolean } })`
.extend({ type: { pure: true } })

Determine if a computed or pureComputed observable is used for wrapping.

##### `.extend({ type: { deferEvaluation: boolean } })`
.extend({ type: { deferEvaluation: true } })

Determine if the read function is executed immediately.
Note that this also applies to pure computeds so that errors can be determined immediately.

##### `.extend({ type: { validate: boolean } })`
`.extend({ type: { validate: true } })`

If true, the observable will be made validatable using the knockout-validation engine. https://github.com/Knockout-Contrib/Knockout-Validation

##### `.extend({ type: { message: string } })`
`.extend({ type: { message: 'invalid value' } })`

Used in conjunction with `validate`.
If set, this message will override the message given to the validation engine.

##### defaults

`ko.extenders.convert.options` contains the default options used for the `convert` extender.
Modifying this value will effect all subsequent `convert` extensions.
