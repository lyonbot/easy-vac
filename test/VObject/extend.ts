import * as assert from "assert"
import { VObject } from "easy-vac";

////////////////////////////////////////////
// define a new VType and create sub-types from it

const PostcardBase = VObject.required({
  id: { type: Number },  // this will be overwritten by `WithId`
  from: { type: String },
  message: { type: String },
})

const WithResponse = VObject.required({
  responder: { type: String },
  response: { type: String },
})

const WithCreateTime = VObject.required({
  created_at: { type: Date },
})

const WithId = VObject.required({
  id: { type: String },
})

// get the mixed VObject type
const SuperPostcard = PostcardBase.extend(WithResponse, WithCreateTime, WithId)


////////////////////////////////////////////
// validate and clean the data

const t1 = SuperPostcard.vac({
  id: 3.14159,
  created_at: "2019-06-20",
  responder: 222,
  response: false,
  from: 111,
  message: "Knock, knock",
  what_the_hell: 123,
})

// == PostcardBase ==
// assert(typeof t1.id !== 'number')   // id's type is overwritten by `WithId`
assert(typeof t1.from === 'string')
assert(typeof t1.message === 'string')
// == WithResponse ==
assert(typeof t1.responder === 'string')
assert(typeof t1.response === 'string')
// == WithCreateTime ==
assert(t1.created_at instanceof Date)
// == WithId ==
assert(typeof t1.id === 'string')



assert(Object.keys(t1).length === 6, "no other fields")
