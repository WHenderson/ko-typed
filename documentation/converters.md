# [ko typed](../README.md)

[ko-typed](../README.md) provides observable extensions for restricting and converting observable values based on type.

[![Build Status](https://travis-ci.org/WHenderson/ko-typed.svg?branch=master)](https://travis-ci.org/WHenderson/ko-typed)
[![Coverage Status](https://coveralls.io/repos/WHenderson/ko-typed/badge.svg?branch=master&service=github)](https://coveralls.io/github/WHenderson/ko-typed?branch=master)

## Converters

### `Undefined`

|            | `String` | `Date`          | `Moment`           |
| ---------- | -------- | --------------- | ------------------ |
| `undefined`| `''`     | `new Date(NaN)` | `moment.invalid()` |
