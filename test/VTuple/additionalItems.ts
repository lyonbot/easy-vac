import * as assert from "assert"
import { VObject, VACError, VArray, VEnum, VTuple } from "easy-vac";
import { assertVACError } from "../test-utils";


// Define the VType

const Point = VTuple(
  [
    { type: "number" },
    { type: "number", minimum: 0 }
  ],
  {
    additionalItems: "error"
  }
)

const PointWithComment = Point.withOptions({ additionalItems: { type: "string" } })

const PointWithAnyAdditionalItems = Point.withOptions({ additionalItems: "keep" })

assert.deepEqual(
  Point.vac([123, 456]),
  [123, 456]
)

assertVACError(
  () => Point.vac([123, 456, 789]),
  ["root"] // threw an VACError due to additionalItems: "error"
)

assert.deepEqual(
  PointWithComment.vac([123, 456]),
  [123, 456]
)

assert.deepEqual(
  PointWithComment.vac([123, 456, 789]),
  [123, 456, "789"]
)

assert.deepEqual(
  PointWithComment.vac([123, 456, 789, "Hello"]),
  [123, 456, "789", "Hello"]
)

assert.deepEqual(
  PointWithAnyAdditionalItems.vac([123, 456, 789, "Hello"]),
  [123, 456, 789, "Hello"]
)
