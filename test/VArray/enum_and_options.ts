import * as assert from "assert"
import { VObject, VACError, VArray, VEnum } from "easy-vac";
import { assertVACError } from "../test-utils";

// first of all, define Language type, whose ignoreCase is set
const Language = VEnum(["en", "zh", "ja", "ko", "ru"], { ignoreCase: true })

// then define an array of Language
const LanguageList = VArray({
  items: { type: Language },
  minItems: 1,
  maxItems: 3,
  uniqueItems: true,    // true == remove duplicated items.  also see ./options.ts
})



assert.deepEqual(
  LanguageList.vac(["zh", "EN"]), // Language ignoreCase is set
  ["zh", "en"]
)

assert.deepEqual(
  LanguageList.vac(["zh", "en", "EN", "ja", "eN"]), // Language ignoreCase is set
  ["zh", "en", "ja"]
)

assertVACError(
  () => LanguageList.vac(["zh", "in"]),  // array[1] is not a valid Language value
  ["root[1]"]
)

assertVACError(
  () => LanguageList.vac([]), // too few items
  ["root"]
)

assertVACError(
  () => LanguageList.vac(["en", "zh", "ja", "ko"]), // too many items
  ["root"]
)
