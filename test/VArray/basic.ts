import * as assert from "assert"
import { VObject, VACError, VArray, VEnum } from "easy-vac";
import { assertVACError } from "../test-utils";


// Define the array VType

const Hobbies = VArray({
  items: { type: "string", minLength: 1 },   // each item is a string, whose length >= 1
  minItems: 1,
  ambiguousSingle: true,
})



assert.deepEqual(
  Hobbies.vac(["sing", "dance", "RAP", "basketball"]),
  ["sing", "dance", "RAP", "basketball"]
)

assert.deepEqual(
  Hobbies.vac(["questioning", 42]),
  ["questioning", "42"]  // <- 42 is now string
)


// `ambiguousSingle` option:

assert.deepEqual(
  Hobbies.vac("sing"),   // input is a string, not an array.
  ["sing"]               // thanks to `ambiguousSingle`, we get an array at last
)

assertVACError(
  () => Hobbies.vac([]),
  ["root"] // : too few items
)

assertVACError(
  () => Hobbies.vac([""]),
  ["root[0]"] // : empty string, length == 0 < 1
)
