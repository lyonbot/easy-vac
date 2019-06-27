import * as assert from "assert"
import { VObject, VACError, VArray, VEnum, VTuple } from "easy-vac";
import { assertVACError } from "../test-utils";


// Define the VType

const Point = VTuple(
  [
    { type: "number" },
    { type: "number", minimum: 0 }
  ]
)


assert.deepEqual(
  Point.vac([123, 456]),
  [123, 456]
)

assert.deepEqual(
  Point.vac([123, "2.4"]),
  [123, 2.4]
)

assert.deepEqual(
  Point.vac([123, 456, 789]),
  [123, 456]  // additionalItems are removed by default
)

assert.deepEqual(
  Point.withOptions({ additionalItems: "keep" }).vac([123, 456, 789]),
  [123, 456, 789]
)

assertVACError(
  () => Point.vac([9]),
  ["root"] // : length == 1 < 2
)

assertVACError(
  () => Point.vac([9, -5]),
  ["root[1]"] // : -5 < 0
)

assertVACError(
  () => Point.vac(["NotNumber", 22]),
  ["root[0]"] // : NaN
)
