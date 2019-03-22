import "reflect-metadata"
import * as test from "tape"

import { VACData, Required } from "../../src";
import { ProcessWith } from "../../src";
//       ▲ test this

test("ProcessWith decorator", ({ test, end }) => {
  class Form1 extends VACData {
    @ProcessWith(x => x | 0)  // a quick-and-dirty `Math.floor(x)` (within 32bit)
    @Required num: number
  }

  test("good1", t => {
    const data = new Form1().fillDataWith({ num: 10.5 })
    t.notok(data.hasErrors())
    t.deepEqual(data.toJSON(), { num: 10 })
    t.end()
  })

  test("good2", t => {
    const data = new Form1().fillDataWith({ num: "3.6" })
    t.notok(data.hasErrors())
    t.deepEqual(data.toJSON(), { num: 3 })
    t.end()
  })

  class Form2 extends VACData {
    @ProcessWith(x => { throw "errmsg" })  // a quick-and-dirty `Math.floor(x)` (within 32bit)
    @Required num: number
  }

  test("throw error string", t => {
    const data = new Form2().fillDataWith({ num: 123 }, { silent: true })
    t.ok(data.hasErrors())
    t.deepEqual(data.getErrors(), [{ key: "num", message: "errmsg" }])
    t.end()
  })

  class Form3 extends VACData {
    @ProcessWith(x => { throw new Error("msg2") })  // a quick-and-dirty `Math.floor(x)` (within 32bit)
    @Required num: number
  }

  test("throw regular error", t => {
    const data = new Form3().fillDataWith({ num: 123 }, { silent: true })
    t.ok(data.hasErrors())
    const errors = data.getErrors()
    t.equal(errors.length, 1)
    t.equal(errors[0].key, "num")
    t.end()
  })

  end()
})
