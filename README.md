# ko-typed

ko-typed provides observable extensions for restricting and converting observable values based on type. Supports validation.

[![Build Status](https://travis-ci.org/WHenderson/ko-typed.svg?branch=master)](https://travis-ci.org/WHenderson/ko-typed)
[![Coverage Status](https://coveralls.io/repos/WHenderson/ko-typed/badge.svg?branch=master&service=github)](https://coveralls.io/github/WHenderson/ko-typed?branch=master)

## Installation

### Node
    npm install ko-typed

### Web
    bower install ko-typed

## Usage

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
require(['knockout', 'ko-typed'], function (ko) {
    var typed = ko.observable().extend({ type: 'Undefined|Number' })
    var convert = typed.extend({ convert: 'String' })
});
```

## API

### [extenders](./documentation/extenders.md)

[ko extenders](http://knockoutjs.com/documentation/extenders.html) are used to wrap a given observable and provide a typed interface.

#### [extenders-type](./documentation/extenders-type.md)
Create a computed observable which only accepts a specified list of types.
Does not perform conversions.

Supports:
* Generic types
* Custom types
* Overrides

##### Example

```js
var base = ko.observable();
var typed = base.extend({ type: 'Undefined|String' });

typed(); // good. undefined is of a supported type.
typed(undefined); // good. undefined is of a supported type.
typed('string'); // good. 'string' is of a supported type.

base(10); typed(); // bad. 10 is not of a supported type.
typed(10); // bad. 10 is not of a supported type.
```

See [examples/type](./examples/type) for more examples.
See [test/coverage/type](./test/coverage/type) for detailed tests.

#### [extenders-convert](./documentation/extenders-type.md)
Create a computed observable which converts to and from internal and external types.

Supports:
* Type restriction
* Custom conversions
* Default conversions
* Overrides

##### Example
```js
var base = ko.observable();
var typed = base.extend({ type: 'Undefined|String' });
var converted = typed.extend({ convert: true });

converted('');
assert.strictEqual(base(), undefined);
converted(10);
assert.strictEqual(base(), '10');
converted('string');
assert.strictEqual(base(), 'string');

base(undefined);
assert.strictEqual(converted(), undefined);
base('10');
assert.strictEqual(converted(), '10');
base('string');
assert.strictEqual(converted(), 'string');
```

See [examples/convert](./examples/convert) for more examples.
See [test/coverage/convert](./test/coverage/convert) for detailed tests.

### [converters](./documentation/converters.md)
Converters between all common types are provided where conversion is common and unambiguous.

