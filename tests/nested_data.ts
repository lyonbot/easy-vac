import * as test from "tape"

import { VACData, Required, Optional, IsArrayOf } from "../src";

class NestedForm extends VACData {
  @Optional num: number = 1234
  @Required boo: boolean
}

class MyForm extends VACData {
  @Required name: string
  @Required nested: NestedForm

  @IsArrayOf(NestedForm)
  @Optional arr: NestedForm[]
}

test("Bad Data Test", t => {
  var data = new MyForm().fillDataWith({
    name: "John",
    nested: {
      num: false,
      boo: 5678
    }
  }, { silent: true })

  t.ok(data.hasErrors())

  var errors = data.getErrors()
  t.equal(errors.length, 2)
  t.deepEqual(errors.map(x => x.key).sort(), ["nested.boo", "nested.num"])

  t.end()
})

test("Good Data Test", t => {
  var data2 = new MyForm().fillDataWith({
    name: "John",
    nested: {
      num: 5678,
      boo: true
    },
    arr: [
      { boo: true },
      { num: 24, boo: false }
    ]
  })

  t.ok(data2.hasErrors() === false)
  t.deepEqual(data2.toJSON(), {
    name: "John",
    nested: {
      num: 5678,
      boo: true
    },
    arr: [
      { num: 1234, boo: true }, // the default value of "num" is used
      { num: 24, boo: false }
    ]
  })

  t.end()
})