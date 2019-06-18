import * as assert from "assert"
import { VObject, VACError, VArray } from "easy-vac";
import { assertVACError } from "../test-utils";

////////////////////////////////////////////
// define a new VType and create sub-types from it

// Note: XType's fields are required
const XType = VObject.required({
  id: { type: "int" },
  name: { type: "string" },
  pass: { type: "string" },
})

const AllOptional = XType.partial()
const IdStillRequired = XType.partial({ exclude: ['id'] })
const NameHasDefault = XType.partial({ exclude: ['id'], default: { name: "John" } })

////////////////////////////////////////////
// validate and clean the data

const t1 = AllOptional.vac({})
assert.deepEqual(t1, {})

const t2 = IdStillRequired.vac({ id: "123" })
assert.deepEqual(t2, { id: 123 })

assertVACError(
  () => IdStillRequired.vac({}),
  ['root.id']
)

const t4 = NameHasDefault.vac({ id: "123" })
assert.deepEqual(t4, { id: 123, name: 'John' })
