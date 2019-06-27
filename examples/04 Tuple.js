//>>>--- data: Good Input
//                       ↑↑↑
// Choose an example data
// ... or just edit:

export default [3.14, -12.56]


//>>>--- data: additionalItems

//

export default [1, 2, 3]

//>>>--- data: Items are VAC-ed

//

export default ["5.2", "0x1e3"]


//>>>--- data: Bad Input (too few items)
//

export default [6]

//>>>--- program
import { VObject, VArray, VEnum, VTuple, VACError } from "easy-vac"
import incoming from "incoming"

// Define some tuple types

const Point2d = VTuple(
  { type: "number" },
  { type: "number" }
)

const Point2i = VTuple(
  { type: "int" },
  { type: "int" }
)

// Now let's have fun!

var pt1 = Point2d.vac(incoming)
var pt2 = Point2i.vac(incoming)
playground.log("Point2d:", pt1)
playground.log("Point2i:", pt2)
