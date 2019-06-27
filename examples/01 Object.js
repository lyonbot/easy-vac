//>>>--- data: Minimal Good Input
//                       ↑↑↑
// Choose an example data
// ... or just edit:

export default {
  name: "John",
  email: "xxx@yyy.com",
}

//>>>--- data: Full Good Input
//

export default {
  name: "Maddles",
  age: 14,
  email: "maddles@example.com",
  motto: "oink oink",
  location: "Gravity Spring"
}

//>>>--- data: Bad Input
//

export default {
  name: "Clark",
  age: 3,
  email: "not#email.com",
  location: "X"
}


//>>>--- data: empty data
export default {
  // nothing
}

//>>>--- program
import { VObject, VArray, VEnum, VTuple, VACError } from "easy-vac"
import incoming from "incoming"

// Basically, all you need is:
//
// [1] VObject(...)
// [2] VObject.required(...)


//
// [1] VObject(...)
//
const SmallForm = VObject({
    name: { type: "string" },
    age: { type: "int" }
})

//
// [2] VObject.require(...)
//
// fields are required  ↓↓↓↓↓
const BigForm = VObject.required({
    name: { type: "string" },
    email: { type: "email" },

    motto: { type: "string", default: "No Motto!" },
    // unless it has `default` ↑↑↑↑
    // or `required` is defined ↓↓↓↓
    location: { type: "string", required: false, minLength: 2 }
})

//
// [3] Test
//

var data1 = SmallForm.vac(incoming)
playground.log("SmallForm:", data1)

var data2 = BigForm.vac(incoming)
playground.log("BigForm:", data2)
