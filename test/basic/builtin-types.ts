import * as assert from "assert"
import { VObject, VACError } from "easy-vac";
import { assertVACError } from "../test-utils";

////////////////////////////////////////////
// define a new VType and create sub-types from it

// Note: XType's fields are optional
const XType = VObject({
  str: { type: "string" },
  num: { type: "number" },
  bool: { type: "boolean" },
  email: { type: "email" },
  int1: { type: "int" },
  int2: { type: "integer" },
  date: { type: Date },
})

////////////////////////////////////////////
// validate and clean the data

const t1 = XType.vac({
  str: 1234,
  num: "3.14",
  bool: "false",      //  "false", "no" and "0" are treated as falsy
  email: "abc@example.com",
  int1: "4.6",        // parseInt is applied
  int2: "5555"
})

assert.deepEqual(t1, {
  str: "1234",
  num: 3.14,
  bool: false,
  email: "abc@example.com",
  int1: 4,
  int2: 5555
})

/////////////////////////////////////
// Date

const t2 = XType.vac({
  date: "2019-06-18T15:54:06.840Z"
})
assert(t2.date instanceof Date)
assert(+t2.date === 1560873246840)


const t3 = XType.vac({
  date: "1560873246840"   // Unix timestamp in string? Supported!
})
assert(t3.date instanceof Date)
assert(t3.date.toJSON() === "2019-06-18T15:54:06.840Z")


const t4 = XType.vac({
  date: 1560873246840
})
assert(t4.date instanceof Date)
assert(t4.date.toJSON() === "2019-06-18T15:54:06.840Z")




/////////////////////////////////////
// Bad Input Check

assertVACError(
  () => XType.vac({ email: "bad_email#github.com" }),
  ["root.email"]
)

assertVACError(
  () => XType.vac({ date: "2019-WHAT-HELL" }),
  ["root.date"]
)

assertVACError(
  () => XType.vac({ num: "Not-a-Number" }),
  ["root.num"]
)
