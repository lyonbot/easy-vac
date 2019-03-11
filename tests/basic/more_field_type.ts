// https://github.com/lyonbot/easy-vac/wiki/Field-Types

import * as test from "tape"

import { VACData, Required, Optional, IsArrayOf, registerFieldType } from "../../src";

class MyObjectId {
  public key: string
  public length: number

  constructor(key: string) {
    if (!/^key-\w+$/.test(key)) throw new Error("Invalid key format for MyObjectId: " + key)
    this.key = key
    this.length = key.length - 4
  }
}

registerFieldType(MyObjectId, val => new MyObjectId(val))

class MyForm extends VACData {
  @Required id: MyObjectId

  @IsArrayOf(MyObjectId)
  @Optional ids: MyObjectId[]
}


test(function (t) {
  var data1 = new MyForm().fillDataWith({ id: "invalid-key" }, { silent: true })
  t.ok(data1.hasErrors())
  t.equal(data1.getErrors().length, 1)

  t.end()
})


test(function (t) {
  var data2 = new MyForm().fillDataWith({
    id: "key-john",
    ids: ["key-smith", "key-tony", "key-whatever"]
  })

  t.notOk(data2.hasErrors())
  t.ok(data2.id instanceof MyObjectId)
  t.equal(data2.ids.length, 3)
  t.ok(data2.ids.every(item => item instanceof MyObjectId))

  t.end()
})


test(function (t) {
  var data2 = new MyForm().fillDataWith({
    id: "key-john",
    ids: ["key-smith", "key-tony", "key-whatever"]
  })

  t.notOk(data2.hasErrors())
  t.ok(data2.id instanceof MyObjectId)
  t.equal(data2.ids.length, 3)
  t.ok(data2.ids.every(item => item instanceof MyObjectId))

  t.end()
})

