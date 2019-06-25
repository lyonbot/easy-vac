import { define } from "./index";
import { makeVType } from "./makeVType";

declare module "../core" {
  interface VTypeDict {
    "string": string
    "number": number
    "boolean": boolean

    "int": number
    "integer": number
    "email": string
  }
}

const reEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

const EmailVType = makeVType(
  x => {
    let y = String(x)
    if (!reEmail.test(y)) throw new Error("Not an email address")
    return y
  },
  { result: String }
)

const IntegerVType = makeVType(
  x => {
    let y = parseInt(x)
    if (isNaN(y)) throw new Error("got a NaN")
    return y
  },
  { result: Number }
)

const NumberVType = makeVType(
  x => {
    let y = Number(x);
    if (isNaN(y)) throw new Error("got a NaN")
    return y
  },
  { result: Number }
)

const BooleanVType = makeVType(
  x => {
    if (typeof x === 'string') {
      if (!x || /^(?:false|no?|0)$/i.test(x)) return false
      return true
    }
    return !!x
  },
  { result: Boolean }
)

define("string", makeVType(x => String(x), { result: String }))
define("boolean", BooleanVType)
define("number", NumberVType)
define("int", IntegerVType)
define("integer", IntegerVType)
define("email", EmailVType)

// extra VTypes for widely used JS built-in objects

define(Date, makeVType(
  function makeDate(x) {
    if (x instanceof Date) return x
    if (typeof x === 'boolean') throw new Error("date required, boolean got")
    if (typeof x === 'string' && /^\d+$/.test(x)) x = parseInt(x) // unix timestamp

    var date = new Date(x)
    if (isNaN(date.getDay())) throw new Error("invalid date")
    return date
  },
  { result: Date }
))

define(RegExp, makeVType(
  function makeRegExp(x) {
    if (x instanceof RegExp) return x
    if (typeof x !== 'string') throw new Error("RegExp shall be a string")

    if (x[0] !== '/') throw new Error("RegExp is invalid. missing leading slash")

    const flagParts = /\/([a-z]*)$/i.exec(x)
    if (!flagParts) throw new Error("RegExp is invalid. are you missing tailing slash and/or flags?")

    return new RegExp(x.slice(1, flagParts.index), flagParts[1])
  },
  { result: RegExp }
))

// NodeJS

if (typeof Buffer !== 'undefined') {
  define(Buffer, makeVType(
    (x) => Buffer.from(x),
    { result: Buffer }
  ))
}
