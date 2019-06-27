import * as assert from "assert"
import { VObject, VACError, VArray, VEnum, VTuple } from "easy-vac";
import { assertVACError } from "../test-utils";


// Define the VType

const Point3D = VTuple(
  [
    { type: "number" },
    { type: "number" },
    { type: "number", minimum: 0, maximum: 1, default: 0.5 },
  ]
)


assert.deepEqual(
  Point3D.vac([123, 456]),
  [123, 456, 0.5]
)

assert.deepEqual(
  Point3D.vac([123, 456, 1]),
  [123, 456, 1]
)

assertVACError(
  () => Point3D.vac([9]),
  ["root"] // : length == 1 < 2
)

assertVACError(
  () => Point3D.vac([12, 34, 56]),
  ["root[2]"] // : 56 > 1
)
