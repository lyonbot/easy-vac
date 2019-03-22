import "reflect-metadata"
import * as test from "tape"

import { VACData, Required, Optional } from "../../src";

class Form1 extends VACData {
  @Required s1: string
  @Required b1: boolean
  @Required n1: number

  @Optional s2: string
  @Optional b2: boolean
  @Optional n2: number

  @Optional s3: string = "Hello"
  @Optional b3: boolean = true
  @Optional n3: number = 123
}

test("Basic1.1", t => {
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

test("Basic1.2", t => {
  var data = new Form1().fillDataWith({
    s2: "World",
    b2: false,
    n2: 42
  }, { silent: true }) // do not populate console

  t.ok(data.hasErrors())
  t.equal(data.getErrors().length, 3)

  t.end()
})

test("Basic1.3", t => {
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
