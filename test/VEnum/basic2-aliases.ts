import * as assert from "assert"
import { VObject, VACError, VArray, VEnum } from "easy-vac";
import { assertVACError } from "../test-utils";



const Language = VEnum({
  "en": "English",            // single alias
  "zh": ["Chinese", "中文"],  // multiple aliases
  "ja": ["Japanese", "日本語"],
})


assert(Language.vac("English") === "en")
assert(Language.vac("en") === "en")
assert(Language.vac("中文") === "zh")
assert(Language.vac("Chinese") === "zh")
assert(Language.vac("Japanese") === "ja")


// Have fun with aliases

assert(Language.aliases.length === 5)


// in a `Map`, the LAST alias name is preserved
const dict = new Map(Language.aliases)

assert.equal(dict.size, 3)
assert.equal(dict.get('en'), 'English')
assert.equal(dict.get('zh'), '中文')
assert.equal(dict.get('ja'), '日本語')


// see ./options1.ts

assertVACError( // `ignoreCase` is not set by default
  () => Language.vac("JAPANESE"),
  ["root"]
)

assertVACError( // `trim` is not set by default
  () => Language.vac("  ja"),
  ["root"]
)
