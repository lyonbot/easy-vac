import * as test from "tape"

import { VACData, Required, Optional, IsArrayOf, getVACInfoOf, registerFieldType } from "../../src";

test("Basic_Array.StringArray", function (t) {
  class MyForm extends VACData {
    @IsArrayOf(String)
    @Required arr1: string[]
  }

  t.test("good data", function (t) {
    var data = new MyForm().fillDataWith({ arr1: ["a", "b", "c"] })

    t.notOk(data.hasErrors())
    t.deepEqual(data.toJSON(), { arr1: ["a", "b", "c"] })

    t.end()
  })

  t.test("bad data", function (t) {
    var data = new MyForm().fillDataWith({ arr1: ["a", "b", 3] }, { silent: true })

    t.ok(data.hasErrors())

    const errors = data.getErrors()
    t.equal(errors.length, 2)
    t.equal(errors[0].key, "arr1")
    t.equal(errors[1].key, "arr1[2]")

    t.end()
  })

  t.end()
})

test("Basic_Array.EnumArray", function (t) {
  class MyForm extends VACData {
    @IsArrayOf(["a", "b", "c", { value: "d", label: "Fourth" }])
    @Required arr1: ("a" | "b" | "c" | "d")[]
  }

  t.test("option meta infos", function (t) {
    const finfo = getVACInfoOf(MyForm.prototype).getFieldInfo("arr1")

    t.equal(finfo.type, Array)
    t.equal(finfo.isArrayOf, "enum")
    t.equal(finfo.enum.length, 4)
    t.deepEqual(finfo.enum[0], { value: "a", label: "a" })
    t.deepEqual(finfo.enum[1], { value: "b", label: "b" })
    t.deepEqual(finfo.enum[2], { value: "c", label: "c" })
    t.deepEqual(finfo.enum[3], { value: "d", label: "Fourth" })

    t.end()
  })

  t.test("good data", function (t) {
    var data = new MyForm().fillDataWith({ arr1: ["a", "b", "c"] })

    t.notOk(data.hasErrors())
    t.deepEqual(data.toJSON(), { arr1: ["a", "b", "c"] })

    t.end()
  })

  t.test("bad data", function (t) {
    var data = new MyForm().fillDataWith({ arr1: ["a", "b", "X"] }, { silent: true })

    t.ok(data.hasErrors())

    const errors = data.getErrors()
    t.equal(errors.length, 2)
    t.equal(errors[0].key, "arr1")
    t.equal(errors[1].key, "arr1[2]")

    t.end()
  })

  t.end()
})

test("Basic_Array.Array of Another VACData", function (t) {
  class NestedForm extends VACData {
    @Required num: number
  }

  class MyForm extends VACData {
    @IsArrayOf(NestedForm)
    @Required arr1: NestedForm[]
  }

  t.test("good data", function (t) {
    var data = new MyForm().fillDataWith({ arr1: [{ num: 1 }, { num: 2 }] })

    t.notOk(data.hasErrors())
    t.deepEqual(data.toJSON(), { arr1: [{ num: 1 }, { num: 2 }] })

    t.end()
  })

  t.test("bad data", function (t) {
    var data = new MyForm().fillDataWith({ arr1: [{ num: 1 }, { foo: 2 }] }, { silent: true })

    t.ok(data.hasErrors())

    const errors = data.getErrors()
    t.equal(errors.length, 2)
    t.equal(errors[0].key, "arr1")
    t.equal(errors[1].key, "arr1[1].num")

    t.end()
  })

  t.end()
})

test("Basic_Array.Array of Self", function (t) {
  class MyForm extends VACData {
    @Required m: string

    @IsArrayOf(MyForm)
    @Optional arr1: MyForm[]
  }

  t.test("good data", function (t) {
    var data = new MyForm().fillDataWith({
      m: "1",
      arr1: [
        {
          m: "1.1",
          arr1: [{ m: "1.1.1" }, { m: "1.1.2" }]
        },
        {
          m: "1.2",
          arr1: [{ m: "1.2.1" }, { m: "1.2.2" }, { m: "1.2.3" }]
        }
      ]
    })

    t.notOk(data.hasErrors())
    t.deepEqual(data.toJSON(), {
      m: "1",
      arr1: [
        {
          m: "1.1",
          arr1: [{ m: "1.1.1" }, { m: "1.1.2" }]
        },
        {
          m: "1.2",
          arr1: [{ m: "1.2.1" }, { m: "1.2.2" }, { m: "1.2.3" }]
        }
      ]
    })

    t.end()
  })

  t.test("bad data", function (t) {
    var data = new MyForm().fillDataWith({
      m: "1",
      arr1: [
        {
          m: "1.1",
          arr1: [{ m: "1.1.1" }, { n: "1.1.2" }]
        },
        // the following one shall be short-circuited and skipped
        {
          m: "1.2",
          arr1: [false]
        }
      ]
    }, { silent: true })

    t.ok(data.hasErrors())

    const errors = data.getErrors()
    t.equal(errors.length, 3)
    t.equal(errors[0].key, "arr1")
    t.equal(errors[1].key, "arr1[0].arr1")
    t.equal(errors[2].key, "arr1[0].arr1[1].m")

    t.end()
  })

  t.end()
})

test("Basic_Array.Array of Registered FieldType", function (t) {
  class MyObjectId {
    public key: string
    public length: number

    constructor(key: string) {
      if (!/^key-\w+$/.test(key)) throw new Error("Invalid key format for MyObjectId: " + key)
      this.key = key.slice(4)
      this.length = key.length - 4
    }
  }

  registerFieldType(MyObjectId, val => new MyObjectId(val))

  class MyForm extends VACData {
    @IsArrayOf(MyObjectId)
    @Optional arr1: MyObjectId[]
  }

  t.test("good data", function (t) {
    var data = new MyForm().fillDataWith({ arr1: ["key-lorem", "key-ipsum"] })

    t.notOk(data.hasErrors())
    t.equal(data.arr1.length, 2)
    t.ok(data.arr1.every(item => item instanceof MyObjectId))
    t.equal(data.arr1[0].key, "lorem")
    t.equal(data.arr1[1].key, "ipsum")

    t.end()
  })

  t.test("bad data", function (t) {
    var data = new MyForm().fillDataWith(
      { arr1: ["key-lorem", "key-ipsum", "bad-key"] },
      { silent: true }
    )

    t.ok(data.hasErrors())

    const errors = data.getErrors()
    t.equal(errors.length, 2)
    t.equal(errors[0].key, "arr1")
    t.equal(errors[1].key, "arr1[2]")

    t.end()
  })

  t.end()
})