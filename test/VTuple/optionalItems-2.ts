import * as assert from "assert"
import { VObject, VACError, VArray, VEnum, VTuple } from "easy-vac";
import { assertVACError } from "../test-utils";


// Define the VType

const PointEx = VTuple(
  [
    { type: "number" },
    { type: "number" },
    { type: "number", minimum: 0, maximum: 1, default: 0.5 },
    { type: "string", optional: true }
  ]
)


assert.deepEqual(
  PointEx.vac([123, 456]),
  [123, 456, 0.5]
)

assert.deepEqual(
  PointEx.vac([123, 456, 1]),
  [123, 456, 1]
)

assert.deepEqual(
  PointEx.vac([123, 456, 1, "building-3"]),
  [123, 456, 1, "building-3"]
)

assert.deepEqual(
  PointEx.vac([123, 456, 1, "building-3", "Waddles"]),
  [123, 456, 1, "building-3"]   // additional items are removed by default
)

assertVACError(
  () => PointEx.vac([9]),
  ["root"] // : length == 1 < 2
)

