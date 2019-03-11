import * as test from "tape"

import { VACData, Required, IsOneOf, getVACInfoOf } from "../../src";

test("Basic_Enum.basic", function (t) {
  class MyForm extends VACData {
    @IsOneOf(["a", "b", "c"])
    @Required() opt: string
  }

  t.test("good data", function (t) {
    var data = new MyForm().fillDataWith({ opt: "a" })

    t.notOk(data.hasErrors())
    t.deepEqual(data.toJSON(), { opt: "a" })

    t.end()
  })

  t.test("bad data", function (t) {
    var data = new MyForm().fillDataWith({ opt: "X" }, { silent: true })

    t.ok(data.hasErrors())

    const errors = data.getErrors()
    t.equal(errors.length, 1)
    t.equal(errors[0].key, "opt")

    t.end()
  })

  t.end()
})

test("Basic_Enum.different enum syntax", function (t) {
  class MyForm extends VACData {
    @IsOneOf([
      "a",
      { value: "b" },
      { value: "c", label: "Third" }
    ])
    @Required opt: string
  }

  t.test("option meta infos", function (t) {
    const finfo = getVACInfoOf(MyForm.prototype).getFieldInfo("opt")

    t.equal(finfo.type, "enum")
    t.equal(finfo.enum.length, 3)
    t.deepEqual(finfo.enum[0], { value: "a", label: "a" })
    t.deepEqual(finfo.enum[1], { value: "b", label: "b" })
    t.deepEqual(finfo.enum[2], { value: "c", label: "Third" })

    t.end()
  })

  t.test("good data", function (t) {
    var data = new MyForm().fillDataWith({ opt: "a" })

    t.notOk(data.hasErrors())
    t.deepEqual(data.toJSON(), { opt: "a" })

    t.end()
  })

  t.test("bad data", function (t) {
    var data = new MyForm().fillDataWith({ opt: "X" }, { silent: true })

    t.ok(data.hasErrors())

    const errors = data.getErrors()
    t.equal(errors.length, 1)
    t.equal(errors[0].key, "opt")

    t.end()
  })

  t.end()
})
