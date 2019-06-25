import * as assert from "assert"
import { VObject, VACError, VArray, VEnum } from "easy-vac";
import { assertVACError } from "../test-utils";

// then define an array of ints

const IntList = VArray({
  items: { type: "int", minimum: 0, maximum: 10 },
  minItems: 1,
  maxItems: 3,
  ambiguousSingle: true,      // input `X` is not array? turn it into `[X]`
  uniqueItems: "validate",    // "validate" == report error on duplicated items.   also see ./enum_and_options.ts
})



// good / fair input

assert.deepEqual(
  IntList.vac([1, "2", 3.14]), // "int" VType may convert things to int
  [1, 2, 3]
)

assert.deepEqual(
  IntList.vac("4"), // input is a string, not an array
  [4]               // thanks to `ambiguousSingle` and "int" VType, we get this!
)


// bad input

assertVACError(
  () => IntList.vac([1, 1.0]),  // has duplicated items
  ["root"]
)

assertVACError(
  () => IntList.vac([1, NaN, -5, 1000]),  // some invalid values for IntList
  ["root[1]", "root[2]", "root[3]"]
)

assertVACError(
  () => IntList.vac([]), // too few items
  ["root"]
)

assertVACError(
  () => IntList.vac([5, 4, 3, 1, 2]), // too many items
  ["root"]
)
