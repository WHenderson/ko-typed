# ko-type-restricted

ko-type-restricted provides observable extensions for restricting and converting observable values based on type.

[![Build Status](https://travis-ci.org/WHenderson/ko-type-restricted.svg?branch=master)](https://travis-ci.org/WHenderson/ko-type-restricted)
[![Coverage Status](https://coveralls.io/repos/WHenderson/ko-type-restricted/badge.svg?branch=master&service=github)](https://coveralls.io/github/WHenderson/ko-type-restricted?branch=master)

## Installation

### Node
    npm install ko-type-restricted

### Web
    bower install ko-type-restricted

## Usage

### node
```js
var ko = require('ko-type-restricted')(require('knockout'));

var typed = ko.observable().extend({ type: 'Undefined|Number' })
var convert = typed.extend({ convert: 'String' })
```

### web (global)
```html
<html>
    <head>
        <script type="text/javascript" src="ko-type-restricted.web.min.js"></script>
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
        "ko-type-restricted": "ko-type-restricted.web.min.js"
    }
});
require(['ko-type-restricted'], function (ko) {
    var typed = ko.observable().extend({ type: 'Undefined|Number' })
    var convert = typed.extend({ convert: 'String' })
});
```

## API

### Type restriction

Extend an observable to only allow a list of specified types during assignment.
Does not perform conversions.
Used the [is-an](https://github.com/WHenderson/is-an) library for generic type matching.

#### Extending an observable

`myObservable.extend({ type: options })`

#### options

##### options = String Literal
`myObservable.extend({ type: 'TypeName' })`
`myObservable.extend({ type: 'TypeName|AnotherTypeName' })`
`myObservable.extend({ type: ['TypeName'] })`
`myObservable.extend({ type: ['TypeName', 'AnotherTypeName'] })`

Equivalent to

`myObservable.extend({ type: { type: ... } })`

Specified types must be exposed from the [is-an](https://github.com/WHenderson/is-an) library.

Example

```js
var typed = ko.observable().extend({ type: 'Number' });

typed(10); // no error
typed('10'); // TypeError
```

##### options = Function

`myObservable.extend({ type: function (value) { return true|false; })`

Equivalent to

`myObservable.extend({ type: { check: function (value) { return true|false; } })`

Example

```js
var typed = ko.observable().extend({ type: function (value) { return (typeof value == 'string') && (value == value.toUpperCase()); } });

typed('ALL CAPS'); // no error
typed('Some Caps'); // TypeError
```

##### Options = Object Literal

###### `.type` : String or Array of Strings
`{ type: 'TypeName' }`
`{ type: 'TypeName|AnotherTypeName' }`
`{ type: ['TypeName'] }`
`{ type: ['TypeName', 'AnotherTypeName'] }`

A string or array of type(s) which the observable value should be restricted to.

###### `.check` : Function
`{ check: function (value) { return true|false; } }`

A function which returns true if the provided value is of the expected type.

###### `.CustomTypeName` : Function
`{ CustomTypeName: function (value) { return true|false; } }`

A function which returns true if the provided value is of the expected type for `"CustomTypeName"`
`CustomTypeName` Must start with an uppercase letter and be a valid identifier name.

### Type conversion

Extend an observable to convert to/from the underlying observable.
Conversion observables will restrict their input/output values according to the provided options.

Checks and conversions are performed in-order from most specific to least specific.

If the underlying observable is type restricted, the underlying types will be inferred where necessary.

TypeError is thrown for failed conversions.
May throw during read operations if the underlying observable does not match the specified external type list.

#### Extending an observable

`myObservable.extend({ type: options })`

Example

```js

var base = ko.observable();
var typed = base.extend({ type: 'Undefined|Number' })
var convert = base.extend({ convert: {
  read: function (value) { return value + 1000; }
  write: function (value) { return value - 1000; }
}});
var typedConvert = typed.extend({ convert: 'String' });

base(1);
console.log(convert());
// 1001

convert(1002);
console.log(base());
// 2

base(undefined)
console.log(convert())
//

convert('123')
console.log(base())
// 123
```

#### options

##### options = String Literal
Equivalent to setting `options.type`

##### options = Object Literal

###### `.type` : String or Array of String
String or Array of type(s) specifying valid external types

###### `.read` : Function
Convert provided value (internal value) into an external value

###### `.write`: Function
Convert provided value (external value) into an internal value

###### `.check`: Function
Return true if the provided (external value) is of a valid type

###### `.ignoreDefaultConverters` : Boolean
If set to true, default conversions will not be applied

###### `.ExternalTypeName` : Object Literal
Specify an external type and options relating to it.
`ExternalTypeName` must start with an upper case character and be a valid identifier.

###### `.ExternalTypeName.type` : String or Array of String
String or Array of type(s) specifying valid internal types when converting to `ExternalTypeName`

###### `.ExternalTypeName.read` : Function
Convert provided value (internal value) into an `ExternalTypeName`

###### `.ExternalTypeName.write` : Function
Convert provided value (`ExternalTypeName`) into an internal value

###### `.ExternalTypeName.check` : Function
Return true if the provided (external value) is an `ExternalTypeName`

###### `.ExternalTypeName.InternalTypeName` : Object Literal
Specify an internal type and options relating to it.
`InternalTypeName` must start with an upper case character and be a valid identifier.

###### `.ExternalTypeName.InternalTypeName.read` : Function
Convert provided value (`InternalTypeName`) into an `ExternalTypeName`

###### `.ExternalTypeName.InternalTypeName.write` : Function
Convert provided value (`ExternalTypeName`) into an `InternalTypeName`

###### `.ExternalTypeName.InternalTypeName.check` : Function
Return true if the provided (external value) can be converted to `InternalTypeName`
