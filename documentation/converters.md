# [ko typed](../README.md)

[ko-typed](../README.md) provides observable extensions for restricting and converting observable values based on type.

[![Build Status](https://travis-ci.org/WHenderson/ko-typed.svg?branch=master)](https://travis-ci.org/WHenderson/ko-typed)
[![Coverage Status](https://coveralls.io/repos/WHenderson/ko-typed/badge.svg?branch=master&service=github)](https://coveralls.io/github/WHenderson/ko-typed?branch=master)

## Converters

| From Type        | From Value  | `Undefined` | `Null` | `Boolean`   | `Number.Integer` | `Number`    | `String`    | `Date`          | `Moment`           |
| ---------------- | ----------- | ----------- | ------ | ----------- | ---------------- | ----------- | ----------- | --------------- | ------------------ |
| `Undefined`      | `undefined` | N/A         | N/A    | N/A         | N/A              | N/A         | `''`        | `new Date(NaN)` | `moment.invalid()` |
| `Null`           | `null`      | N/A         | N/A    | N/A         | N/A              | N/A         | `''`        | `new Date(NaN)` | `moment.invalid()` |
| `Boolean`        | `true`      | N/A         | N/A    | N/A         | `1`\*            | `1`\*       | `'true'`\*  | N/A             | N/A                |
| `Boolean`        | `false`     | N/A         | N/A    | N/A         | `0`\*            | `0`\*       | `'false'`\* | N/A             | N/A                |
| `Number.Integer` | `0`         | N/A         | N/A    | `false`     | N/A              | `0`         | `0`         | N/A             | N/A                |
| `Number.Integer` | `1`         | N/A         | N/A    | `true`      | N/A              | `1`         | `1`         | N/A             | N/A                |
| `Number.Integer` | `2`         | N/A         | N/A    | `true`      | N/A              | `2`         | `2`         | N/A             | N/A                |
| `Number`         | `0`         | N/A         | N/A    | `false`     | `0`              | N/A         | `0`         | N/A             | N/A                |
| `Number`         | `0.5`       | N/A         | N/A    | `true`      | `TypeError`      | N/A         | `0.5`       | N/A             | N/A                |
| `String`         | `''`        | `undefined` | N/A    | `TypeError` | `TypeError`      | `TypeError` | N/A         | N/A             | N/A                |
| `String`         | `'true'`    | `TypeError` | N/A    | `true`      | `TypeError`      | `TypeError` | N/A         | N/A             | N/A                |
| `String`         | `'t'`       | `TypeError` | N/A    | `true`      | `TypeError`      | `TypeError` | N/A         | N/A             | N/A                |
| `String`         | `'1'`       | `TypeError` | N/A    | `true`      | `TypeError`      | `TypeError` | N/A         | N/A             | N/A                |
| `String`         | `'-1'`      | `TypeError` | N/A    | `true`      | `TypeError`      | `TypeError` | N/A         | N/A             | N/A                |
| `String`         | `'yes'`     | `TypeError` | N/A    | `true`      | `TypeError`      | `TypeError` | N/A         | N/A             | N/A                |
| `String`         | `'y'`       | `TypeError` | N/A    | `true`      | `TypeError`      | `TypeError` | N/A         | N/A             | N/A                |
| `String`         | `'false'`   | `TypeError` | N/A    | `false`     | `TypeError`      | `TypeError` | N/A         | N/A             | N/A                |
| `String`         | `'f'`       | `TypeError` | N/A    | `false`     | `TypeError`      | `TypeError` | N/A         | N/A             | N/A                |
| `String`         | `'0'`       | `TypeError` | N/A    | `false`     | `TypeError`      | `TypeError` | N/A         | N/A             | N/A                |
| `String`         | `'no'`      | `TypeError` | N/A    | `false`     | `TypeError`      | `TypeError` | N/A         | N/A             | N/A                |
| `String`         | `'n'`       | `TypeError` | N/A    | `false`     | `TypeError`      | `TypeError` | N/A         | N/A             | N/A                |
| `String`         | `'value'`   | `TypeError` | N/A    | `TypeError` | `TypeError`      | `TypeError` | N/A         | N/A             | N/A                |

| Key | Meaning |
| --- | ------- |
| \*  | The conversion function accepts conversion options |
| N/A | No such conversion exists |
| `TypeError` | The specified input value would result in a TypeError exception |


### `Undefined`

#### Default conversions
|            | `String` | `Date`          | `Moment`           |
| ---------- | -------- | --------------- | ------------------ |
| `undefined`| `''`     | `new Date(NaN)` | `moment.invalid()` |

### `Boolean`

#### Default Conversions
|        | `Number.Integer` | `Number`  | `String` |
| ------ | ---------------- | --------- | ---------|
| `true` | `1`              | `1`       | `true`   |

#### Options

* `Boolean` to `Number.Integer`
* `Boolean` to `Number`
*
