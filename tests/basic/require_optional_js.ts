import "reflect-metadata"
import * as test from "tape"

import { VACData, Required, Optional } from "../../src";

class Form1 extends VACData {
  @Required(String) s1
  @Required(Boolean) b1
  @Required(Number) n1

  @Optional(String) s2
  @Optional(Boolean) b2
  @Optional(Number) n2

  @Optional(String) s3 = "Hello"
  @Optional(Boolean) b3 = true
  @Optional(Number) n3 = 123
}

test("Basic1(JS).1", t => {
  var data = new Form1().fillDataWith({
    s1: "World",
    b1: false,
    n1: 42
  })

  t.ok(data.hasErrors() == false)
  t.deepEqual(data.toJSON(), {
    s1: "World",
    b1: false,
    n1: 42,

    s3: "Hello",
    b3: true,
    n3: 123
  })

  t.end()
})

test("Basic1(JS).2", t => {
  var data = new Form1().fillDataWith({
    s2: "World",
    b2: false,
    n2: 42
  }, { silent: true }) // do not populate console

  t.ok(data.hasErrors())
  t.equal(data.getErrors().length, 3)

  t.end()
})

test("Basic1(JS).3", t => {
  var data = new Form1().fillDataWith({
    s1: "World",
    b1: false,
    n1: 42,

    s2: "Lorem",
    b2: true,
    n2: 56,

    s3: "Hey",
    b3: false,
    n3: 456,
  })

  t.ok(data.hasErrors() == false)
  t.deepEqual(data.toJSON(), {
    s1: "World",
    b1: false,
    n1: 42,

    s2: "Lorem",
    b2: true,
    n2: 56,

    s3: "Hey",
    b3: false,
    n3: 456,
  })

  t.end()
})
