import * as test from "tape"

import { VACData, Required } from "../../src";
import { IsEmail, MatchRegExp, MaxLength, MinLength } from "../../src";
//       ▲ test these decorators

test("string decorators", ({ test, end }) => {

  test("IsEmail", ({ test, end }) => {
    class Form1 extends VACData {
      @IsEmail
      @Required email: string
    }

    test("good email", t => {
      const data = new Form1().fillDataWith({ email: "lyonbot@gmail.com" })
      t.notok(data.hasErrors())
      t.deepEqual(data.toJSON(), { email: "lyonbot@gmail.com" })
      t.end()
    })

    test("bad email", t => {
      const data = new Form1().fillDataWith({ email: "lyonbot-gmail.com" }, { silent: true })
      t.ok(data.hasErrors())

      const errors = data.getErrors()
      t.equal(errors.length, 1)
      t.equal(errors[0].key, "email")
      t.end()
    })

    class Form2 extends VACData {
      @IsEmail("errmsg")
      @Required email: string
    }

    test("customErrorMessage", t => {
      const data = new Form2().fillDataWith({ email: "not_a_email" }, { silent: true })
      t.ok(data.hasErrors())

      const errors = data.getErrors()
      t.deepEqual(errors, [
        { key: "email", message: "errmsg" }
      ])
      t.end()
    })

    end()
  })

  test("MatchRegExp", ({ test, end }) => {
    class Form1 extends VACData {
      @MatchRegExp(/^q+\d$/i)
      @Required text: string
    }

    test("good data", t => {
      const data = new Form1().fillDataWith({ text: "qQqqq4" })
      t.notok(data.hasErrors())
      t.deepEqual(data.toJSON(), { text: "qQqqq4" })
      t.end()
    })

    test("bad data", t => {
      const data = new Form1().fillDataWith({ text: "badString" }, { silent: true })
      t.ok(data.hasErrors())

      const errors = data.getErrors()
      t.equal(errors.length, 1)
      t.equal(errors[0].key, "text")
      t.end()
    })

    class Form2 extends VACData {
      @MatchRegExp(/^q+\d$/i, "errmsg")
      @Required text: string
    }

    test("customErrorMessage", t => {
      const data = new Form2().fillDataWith({ text: "badString" }, { silent: true })
      t.ok(data.hasErrors())

      const errors = data.getErrors()
      t.deepEqual(errors, [
        { key: "text", message: "errmsg" }
      ])
      t.end()
    })

    end()
  })

  test("MaxLength", ({ test, end }) => {
    class Form1 extends VACData {
      @MaxLength(5)
      @Required text: string
    }

    test("good data", t => {
      const data = new Form1().fillDataWith({ text: "abc" })
      t.notok(data.hasErrors())
      t.deepEqual(data.toJSON(), { text: "abc" })
      t.end()
    })

    test("bad data", t => {
      const data = new Form1().fillDataWith({ text: "badString" }, { silent: true })
      t.ok(data.hasErrors())

      const errors = data.getErrors()
      t.equal(errors.length, 1)
      t.equal(errors[0].key, "text")
      t.end()
    })

    class Form2 extends VACData {
      @MaxLength(5, "errmsg")
      @Required text: string
    }

    test("customErrorMessage", t => {
      const data = new Form2().fillDataWith({ text: "badString" }, { silent: true })
      t.ok(data.hasErrors())

      const errors = data.getErrors()
      t.deepEqual(errors, [
        { key: "text", message: "errmsg" }
      ])
      t.end()
    })

    end()
  })

  test("MinLength", ({ test, end }) => {
    class Form1 extends VACData {
      @MinLength(15)
      @Required text: string
    }

    test("good data", t => {
      const data = new Form1().fillDataWith({ text: "loooooooong string" })
      t.notok(data.hasErrors())
      t.deepEqual(data.toJSON(), { text: "loooooooong string" })
      t.end()
    })

    test("bad data", t => {
      const data = new Form1().fillDataWith({ text: "badString" }, { silent: true })
      t.ok(data.hasErrors())

      const errors = data.getErrors()
      t.equal(errors.length, 1)
      t.equal(errors[0].key, "text")
      t.end()
    })

    class Form2 extends VACData {
      @MaxLength(5, "errmsg")
      @Required text: string
    }

    test("customErrorMessage", t => {
      const data = new Form2().fillDataWith({ text: "badString" }, { silent: true })
      t.ok(data.hasErrors())

      const errors = data.getErrors()
      t.deepEqual(errors, [
        { key: "text", message: "errmsg" }
      ])
      t.end()
    })

    end()
  })

  end()
})
