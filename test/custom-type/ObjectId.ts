import * as assert from "assert"
import { VObject, makeVType, define, VArray } from "easy-vac";

/////////////////////////////////////////////////////
// Assuming we have an ObjectId class

class ObjectId {
  id: string

  constructor(expr_str?: string) {
    if (arguments.length == 0) {
      this.id = Date.now().toString(16).slice(0, 10) + "00000000000000"
    } else {
      if (typeof expr_str !== 'string') throw new Error("ObjectId expression must be string")
      if (!/^[a-f\d]{24}$/i.test(expr_str)) throw new Error("Invalid ObjectId expression")
      else this.id = expr_str.toLowerCase()
    }
  }
}

/////////////////////////////////////////////////////
// register the type in easy-vac

define(ObjectId, makeVType(x => new ObjectId(x), { result: ObjectId }))

/////////////////////////////////////////////////////
// define your type structure

const ModifyRequest = VObject({
  docId: { type: ObjectId, required: true },
  changes: {
    required: true,
    type: VObject({
      // in VObject, properties are optional by default
      name: { type: String, maxLength: 140 },
      content: { type: String, minLength: 10 },
      author: { type: String },
    })
  }
})


/////////////////////////////////////////////////////
// let easy-vac do cleaning

const data1 = ModifyRequest.vac({
  docId: "507c7f79bcf86cd7994f6c0e",
  changes: {
    _id: "000094f6c0e507c7f79bcf86",  // <- unwanted property
    name: 12345,
    content: "Lorem Ipsum"
  }
})

assert("_id" in data1.changes === false, "unwanted properties are removed")
assert(data1.docId instanceof ObjectId, "docId is an ObjectId instance")

assert.deepEqual(data1.changes, {
  name: "12345",
  content: "Lorem Ipsum"
})
