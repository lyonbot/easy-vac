import * as assert from "assert"
import { VObject, VACError, VArray, VEnum } from "easy-vac";
import { assertVACError } from "../test-utils";

const Language = VEnum(["en", "zh", "ja"])

assert(Language.vac("en") === "en")
assert(Language.vac("zh") === "zh")
assert(Language.vac("ja") === "ja")

// "in" is not defined

assertVACError(
  () => Language.vac("in"),
  ["root"]
)

// see ./options1.ts

assertVACError( // `ignoreCase` is not set by default
  () => Language.vac("EN"),
  ["root"]
)

assertVACError( // `trim` is not set by default
  () => Language.vac("  ja"),
  ["root"]
)
