import * as assert from "assert"
import { VObject, VACError, VArray, VEnum } from "easy-vac";
import { assertVACError } from "../test-utils";



const Language = VEnum({
  "en": "English",    // not an array? it's okay
  "zh": ["中文", "Chinese"],
  "ja": ["日本語", "Japanese"],
}, { ignoreCase: true })

const LanguageIgnoreSpace = Language.withOptions({ trim: true })



assert(Language !== LanguageIgnoreSpace)

assert(Language.vac("enGLiSH") === "en")
assert(Language.vac("eN") === "en")
assert(Language.vac("ChinESE") === "zh")
assert(Language.vac("jaPaNese") === "ja")

// `trim` is not set in `Language`

assertVACError(
  () => Language.vac("  jA"),
  ["root"]
)

// but it is set in `LanguageIgnoreSpace`

assert(LanguageIgnoreSpace.vac("  jA") === "ja")
assert(LanguageIgnoreSpace.vac("  jApANeSE  ") === "ja")
