import * as test from "tape"

import { VACData, Required, Optional, AssertWith } from "../../src";

class Form1 extends VACData {
  @AssertWith((s: string) => s.length % 2 == 0, "errmsg1")
  @AssertWith((s: string) => s.length >= 4, "errmsg2")
  @Required s1: string

  @AssertWith((n: number) => { if (n > 10) throw new Error("errmsg3"); else return true })
  @AssertWith((n: number) => { if (n < 2) throw "errmsg4"; else return true })
  @Required n1: number

  @AssertWith((s: string) => s.length < 4, "errmsg5")
  @Optional s2: string
}

test("AssertWith decorator", t => {
  t.test("asserting-1: predefined err msg str", t => {
    var data = new Form1().fillDataWith({ s1: "World", n1: 5 }, { silent: true })

    t.ok(data.hasErrors())

    const errors = data.getErrors()
    t.deepEqual(errors, [
      { key: "s1", message: "errmsg1" }
    ])

    t.end()
  })

  t.test("asserting-2: throw string", t => {
    var data = new Form1().fillDataWith({ s1: "Ho", n1: 0 }, { silent: true })

    t.ok(data.hasErrors())

    const errors = data.getErrors()
    t.deepEqual(errors, [
      { key: "s1", message: "errmsg2" },
      { key: "n1", message: "errmsg4" },
    ])

    t.end()
  })

  t.test("asserting-3: throw Error object", t => {
    var data = new Form1().fillDataWith({ s1: "Nihao!", n1: 15, s2: "longword" }, { silent: true })

    t.ok(data.hasErrors())

    const errors = data.getErrors()
    t.deepEqual(errors, [
      { key: "n1", message: "Error: errmsg3" },   // new Error("xxx").toString() == "Error: xxx"
      { key: "s2", message: "errmsg5" }
    ])

    t.end()
  })

  t.test("asserting - good data with loose mode", t => {
    var data = new Form1().fillDataWith({ s1: "Nihao!", n1: "8", s2: "ok" }, { loose: true })

    t.notOk(data.hasErrors())
    t.deepEqual(data.toJSON(), { s1: "Nihao!", n1: 8, s2: "ok" })

    t.end()
  })

  t.end()
})
