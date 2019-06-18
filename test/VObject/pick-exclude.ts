import * as assert from "assert"
import { VObject, VACError, VArray } from "easy-vac";

////////////////////////////////////////////
// define a new VType and create sub-types from it

const QA = VObject.required({
  id: { type: "int" },
  tags: { type: VArray({ items: { type: String } }) },
  question: { type: String },
  created_at: { type: Date },
  answer: { type: String },
  answerd_at: { type: Date },
})

const Q1 = QA.pick("id", "tags", "question", "created_at")
const Q2 = QA.exclude("answer", "answerd_at")

////////////////////////////////////////////
// validate and clean the data

const raw = {
  id: "312321",
  tags: ["lorem", "ipsum"],
  question: "What's the meaning of life",
  created_at: "2012-12-31",
  answer: 42,
  answerd_at: "2012-12-31"
}

const out1 = Q1.vac(raw)
const out2 = Q2.vac(raw)

assert.deepEqual(Object.keys(out1).sort(), Object.keys(out2).sort(), "identical keys")

assert.ok("id" in out1)
assert.ok("tags" in out1)
assert.ok("question" in out1)
assert.ok("created_at" in out1)
assert.ok("answer" in out1 === false)
assert.ok("answered_at" in out1 === false)
