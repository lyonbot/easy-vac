//>>>--- data: Good Input
//                       ↑↑↑
// Choose an example data
// ... or just edit:

// 0, 1, 2, 3, 4         ↓ edit me
export const testIndex = 0

export default {
  id: 3,
  name: "John",
  password: "123456",
  email: "xxx@yyy.com",
  age: 24,
  location: "Gravity Spring",
  motto: "User can't have a motto!"
}

//>>>--- data: UserInfoModify
//
export const testIndex = 3

// in UserInfoModify, every field is optional

export default {
  // name: "John",
  // email: "xxx@yyy.com",
  age: 24,
  // location: "Gravity Spring",
}

//>>>--- data: empty data

// 0, 1, 2, 3, 4         ↓ edit me
export const testIndex = 0

export default {
  // nothing
}

//>>>--- program
import { VObject, VArray, VEnum, VTuple, VACError } from "easy-vac"
import incoming, { testIndex } from "incoming"

// Do object arith magic with:
//
// - VObject#pick(...)
// - VObject#exclude(...)
// - VObject#extend(...)
// - VObject#partial(...)

const User = VObject.required({
  id: { type: "int" },
  name: { type: "string" },
  password: { type: "string" },
  email: { type: "email" },
  age: { type: "int" },
  verified: { type: "boolean", default: false },
  location: { type: "string" }
})

// pick some fields
const NameCard = User.pick("id", "name")

// omit some fields
const PublicUserInfo = User.exclude("password", "location")

// pick some field, then make these fields optional
const UserInfoModify = User.pick("name", "age", "location", "email").partial()

// combine two VObject
const NameCardWithMotto = NameCard.extend(VObject.required({
  motto: { type: "string" }
}))


//
// TEST CODE

playground.info("testIndex = " + testIndex)
if (testIndex == 0) playground.log("User", User.vac(incoming))
if (testIndex == 1) playground.log("NameCard", NameCard.vac(incoming))
if (testIndex == 2) playground.log("PublicUserInfo", PublicUserInfo.vac(incoming))
if (testIndex == 3) playground.log("UserInfoModify", UserInfoModify.vac(incoming))
if (testIndex == 4) playground.log("NameCardWithMotto", NameCardWithMotto.vac(incoming))
