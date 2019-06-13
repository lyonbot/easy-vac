import * as assert from "assert"
import { VObject, makeVType, define } from "easy-vac";

////////////////////////////////////////////
// 1. Make a new type "DazeWord"

const DazeString = makeVType(
  (x) => {
    var ans = String(x)
    if (!/daze.?/i.test(x)) ans += " daze~"
    return ans
  },
  { result: String }
)

////////////////////////////////////////////
// 2. define this type in easy-vac (not necessary but worthy to try)

define("daze", DazeString)

// Help TypeScript do Type Inference. remove this if you are not using TypeScript
//  ↓

declare module "easy-vac" {
  interface VTypeDict { "daze": string }
}

////////////////////////////////////////////
// 3. Time to play

// define a new VType

const Postcard = VObject({
  from: { type: String, required: true },
  message: { type: DazeString, required: true },  // Directly use the VType
  postscript: { type: "daze", required: true },   // or use typename that defined for easy-vac
})

// validate and clean the data

const card1 = Postcard.vac({
  from: 2233,
  message: "Happy Birthday!",
  postscript: "Hope you like this daze",
  foo: true,
})

// card1 is the validate-and-cleaned result

assert.deepEqual(card1, {
  from: "2233",                            // 'from' is string
  message: "Happy Birthday! daze~",        // DazeString added " daze~"
  postscript: "Hope you like this daze",   // original string already ends with "daze"
  // ... unexpected properties are removed
})
