//>>>--- data: Good Input
//                       ↑↑↑
// Choose an example data
// ... or just edit:

export default
  ["唱", "跳", "RAP", "篮球"]


//>>>--- data: ambiguousSingle

// Hint: edit the test program,
//       altering `ambiguousSingle` to `false`

export default
  "Dance"

//>>>--- data: Duplicated Items

// Hint: edit the test program,
//       altering `uniqueItems` to `false` or "validate"

export default ["A", "B", "A", "C"]


//>>>--- data: Bad Input (too many items)
//

export default ["A", "B", "C", "D", "E"]


//>>>--- data: Bad Input (too few items)
//

export default []

//>>>--- program
import { VObject, VArray, VEnum, VTuple, VACError } from "easy-vac"
import incoming from "incoming"

// `Hobbies` is a VType for array,
// each item is a string, whose length >= 1

const Hobbies = VArray({
  items: { type: "string", minLength: 1 },
  minItems: 1,
  maxItems: 4,
  ambiguousSingle: true,    // default is false
  uniqueItems: true,        // true, false(default), "validate"
})


// data will be an array!

var data = Hobbies.vac(incoming)
playground.log("Your array is:", data)
