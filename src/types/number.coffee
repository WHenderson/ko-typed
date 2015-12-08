  do ->
    ## https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Math/round
    decimalAdjust = (type, value, exp) ->
      # if exp is undefined or zero
      if not exp? or +exp == 0
        return type(value)

      value = +value
      exp = +exp

      # If the value it not a number of the exp is not an integer
      if (isNaN(value) or not (typeof exp == 'number' and exp % 1 == 0))
        return NaN

      # Shift
      value = value.toString().split('e')
      value = type(+(value[0] + 'e' + (if value[1] then (+value[1] - exp) else -exp)))

      # Shift back
      value = value.toString().split('e')
      return (+(value[0] + 'e' + (if value[1] then (+value[1] + exp) else exp)))

    if not Math.round10?
      Math.round10 = (value, exp) ->
        return decimalAdjust(Math.round, value, exp)

    if not Math.floor10?
      Math.floor10 = (value, exp) ->
        return decimalAdjust(Math.floor, value, exp)

    if not Math.ceil10?
      Math.ceil10 = (value, exp) ->
        return decimalAdjust(Math.ceil, value, exp)

    return
