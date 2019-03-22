import "reflect-metadata"
import * as test from "tape"

import { VACData, Required, IsArrayOf, IsOneOf } from "../../src";

test("Loose_Conversion.PrimitiveField", function (t) {
  class MyForm extends VACData {
    @Required s: string
    @Required n: number
    @Required b: boolean
  }

  t.test("good data1", function (t) {
    var data = new MyForm().fillDataWith({ s: 123, n: "456", b: 1 })

    t.notOk(data.hasErrors())
    t.deepEqual(data.toJSON(), { s: "123", n: 456, b: true })

    t.end()
  })

  t.test("good data2", function (t) {
    var data = new MyForm().fillDataWith({ s: 123, n: "3.1", b: "" })

    t.notOk(data.hasErrors())
    t.deepEqual(data.toJSON(), { s: "123", n: 3.1, b: false })

    t.end()
  })

  t.test("bad data", function (t) {
    var data = new MyForm().fillDataWith({
      s: 123,
      n: "456",
      b: { foo: true } // incoming b is not a primitive
    }, { silent: true })

    t.ok(data.hasErrors())
    const errors = data.getErrors()
    t.equal(errors.length, 1)
    t.equal(errors[0].key, "b")

    t.end()
  })

  t.end()
})

test("Loose_Conversion.ArrayOfPrimitive", function (t) {
  class MyForm extends VACData {
    @IsArrayOf(String) @Required ss: string[]
    @IsArrayOf(Number) @Required ns: number[]
    @IsArrayOf(Boolean) @Required bs: boolean[]
  }

  t.test("good data", function (t) {
    var data = new MyForm().fillDataWith({
      ss: [123, false, "good"],
      ns: ["456", true, 3],
      bs: [1, "true", false]
    })

    t.notOk(data.hasErrors())
    t.deepEqual(data.toJSON(), {
      ss: ["123", "false", "good"],
      ns: [456, 1, 3],
      bs: [true, true, false]
    })

    t.end()
  })

  t.test("bad data", function (t) {
    var data = new MyForm().fillDataWith({
      ss: [123, false, { x: 1 }], // object is not primitive
      ns: [null, 3],  // note: null is also an object
      bs: []
    }, { silent: true })

    t.ok(data.hasErrors())
    const errors = data.getErrors()
    t.equal(errors.length, 4)
    t.equal(errors[0].key, "ss")
    t.equal(errors[1].key, "ss[2]")
    t.equal(errors[2].key, "ns")
    t.equal(errors[3].key, "ns[0]")

    t.end()
  })

  t.end()
})

test("Loose_Conversion.Enum", function (t) {
  class MyForm extends VACData {
    @IsOneOf(["x", 3, true])
    @Required x: any
  }

  t.test("good data", function (t) {
    var data = new MyForm().fillDataWith(
      { x: "3" },
      { loose: true }
    )

    t.notOk(data.hasErrors())
    t.deepEqual(data.toJSON(), { x: 3 })

    t.end()
  })

  t.test("good data 2", function (t) {
    var data = new MyForm().fillDataWith(
      { x: 1 },
      { loose: true }
    )

    t.notOk(data.hasErrors())
    t.deepEqual(data.toJSON(), { x: true })

    t.end()
  })

  t.test("bad data", function (t) {
    var data = new MyForm().fillDataWith(
      { x: false },
      { silent: true }
    )

    t.ok(data.hasErrors())

    t.end()
  })

  // "true" != true
  // https://stackoverflow.com/questions/11363659/why-does-true-true-show-false-in-javascript
  t.test("bad data2", function (t) {
    var data = new MyForm().fillDataWith(
      { x: "true" },
      { silent: true }
    )

    t.ok(data.hasErrors())

    t.end()
  })

  t.end()
})

test("Loose_Conversion.ArrayOfEnum", function (t) {
  class MyForm extends VACData {
    @IsArrayOf([1, 2, 3, 4])
    @Required ns: number[]
  }

  t.test("good data", function (t) {
    var data = new MyForm().fillDataWith(
      { ns: ["3", "4", true, 2] },
      { loose: true }
    )

    t.notOk(data.hasErrors())
    t.deepEqual(data.toJSON(), {
      ns: [3, 4, 1, 2]
    })

    t.end()
  })

  t.test("bad data", function (t) {
    var data = new MyForm().fillDataWith(
      { ns: ["3", "5", false, 2] },
      { silent: true }
    )

    t.ok(data.hasErrors())

    t.end()
  })

  t.end()
})