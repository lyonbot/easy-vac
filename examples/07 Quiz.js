//>>>--- data: Basic Arithmetic Problem
export default {
  title: "Basic Arithmetic Problem",
  author: "Elliot", // not defined in Quiz
  due: "2017-12-31 08:30",
  num1: "3.14",
  num2: 20.5,       // note: shall be an integer
  // op: "minus",   // uncomment me
}

//>>>--- data: empty data
export default {
  // nothing
}

//>>>--- program
import { VObject, VArray, VEnum, VTuple } from "easy-vac"
import incoming from "incoming"

/**
 * ArithOp is a enum type,
 * which could be one of "+" | "-" | "*" | "/"
 */
const ArithOp = VEnum({
  "+": ["plus", "add"],
  "-": ["minus", "subtract"],
  "*": "multiply",
  "/": "divide"
})


// Quiz is a VType describing a object which follows a schema.
// Try: hover your cursor on "Quiz" and see the type info.
//    ↓↓↓↓
const Quiz = VObject({
  title: { type: "string" },    // "string" can also be String
  due: { type: Date },
  num1: { type: Number, required: true },
  num2: { type: "int", required: true },  // integer number
  op: { type: ArithOp, default: "+" },
})


var result = Quiz.vac(incoming)
playground.log(result)