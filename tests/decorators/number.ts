import * as test from "tape"

import { VACData, Required } from "../../src";
import { Max, Min, IsInt } from "../../src";
//       ▲ test these decorators

test("number decorators", ({ test, end }) => {

  test("Max", ({ test, end }) => {
    class Form1 extends VACData {
      @Max(10)
      @Required num: number
    }

    test("good", t => {
      const data = new Form1().fillDataWith({ num: 10 })
      t.notok(data.hasErrors())
      t.deepEqual(data.toJSON(), { num: 10 })
      t.end()
    })

    test("bad", t => {
      const data = new Form1().fillDataWith({ num: 20 }, { silent: true })
      t.ok(data.hasErrors())

      const errors = data.getErrors()
      t.equal(errors.length, 1)
      t.equal(errors[0].key, "num")
      t.end()
    })

    class Form2 extends VACData {
      @Max(10, "errmsg")
      @Required num: number
    }

    test("customErrorMessage", t => {
      const data = new Form2().fillDataWith({ num: 20 }, { silent: true })
      t.ok(data.hasErrors())

      const errors = data.getErrors()
      t.deepEqual(errors, [
        { key: "num", message: "errmsg" }
      ])
      t.end()
    })

    end()
  })

  test("Min", ({ test, end }) => {
    class Form1 extends VACData {
      @Min(10)
      @Required num: number
    }

    test("good", t => {
      const data = new Form1().fillDataWith({ num: 10 })
      t.notok(data.hasErrors())
      t.deepEqual(data.toJSON(), { num: 10 })
      t.end()
    })

    test("bad", t => {
      const data = new Form1().fillDataWith({ num: 5 }, { silent: true })
      t.ok(data.hasErrors())

      const errors = data.getErrors()
      t.equal(errors.length, 1)
      t.equal(errors[0].key, "num")
      t.end()
    })

    class Form2 extends VACData {
      @Min(10, "errmsg")
      @Required num: number
    }

    test("customErrorMessage", t => {
      const data = new Form2().fillDataWith({ num: 5 }, { silent: true })
      t.ok(data.hasErrors())

      const errors = data.getErrors()
      t.deepEqual(errors, [
        { key: "num", message: "errmsg" }
      ])
      t.end()
    })

    end()
  })

  test("IsInt", ({ test, end }) => {
    class Form1 extends VACData {
      @IsInt
      @Required num: number
    }

    test("good", t => {
      const data = new Form1().fillDataWith({ num: 10 })
      t.notok(data.hasErrors())
      t.deepEqual(data.toJSON(), { num: 10 })
      t.end()
    })

    test("bad", t => {
      const data = new Form1().fillDataWith({ num: 2.3 }, { silent: true })
      t.ok(data.hasErrors())

      const errors = data.getErrors()
      t.equal(errors.length, 1)
      t.equal(errors[0].key, "num")
      t.end()
    })

    class Form2 extends VACData {
      @IsInt("errmsg")
      @Required num: number
    }

    test("customErrorMessage", t => {
      const data = new Form2().fillDataWith({ num: 2.3 }, { silent: true })
      t.ok(data.hasErrors())

      const errors = data.getErrors()
      t.deepEqual(errors, [
        { key: "num", message: "errmsg" }
      ])
      t.end()
    })

    end()
  })

  end()
})
