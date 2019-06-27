//>>>--- data: Good(?) Input
export default {
  name: "John",
  gender: "mALE",   // <- ???
  period: "12",     // <- string, not a number ?
  language: "中文"
}

// ↑↑↑  Feel free to edit that


//>>>--- data: Bad `Period`
export default {
  name: "Mary",
  gender: "Female",
  period: 8,          // <- wrong value
  language: "English"
}


//>>>--- data: empty data
export default {
  // nothing
}

//>>>--- program
import { VObject, VArray, VEnum, VTuple, VACError } from "easy-vac"
import incoming from "incoming"

//===============================================
// [1] Define some Enum VTypes

// [1.1] VEnum value can be a number
const Period = VEnum([1, 2, 3, 6, 12, 24, 36])

// [1.2] or a string (and optionally, ignoreCase)
const Gender = VEnum(
    ["Male", "Female", "Other"],
    { ignoreCase: true }       // <- options may be omitted
)

// [1.3] as for strings, they may have aliases
const Language = VEnum({
    "en": "English",            // single alias
    "zh": ["Chinese", "中文"],  // multiple aliases
    "ja": ["Japanese", "日本語"],
})




//===============================================
// [2] Have fun with them

const MyForm = VObject.required({
    name: { type: "string" },
    gender: { type: Gender },
    period: { type: Period },
    language: { type: Language },
})

var data = MyForm.vac(incoming)
playground.log(data)
