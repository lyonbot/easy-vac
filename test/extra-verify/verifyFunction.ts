import * as assert from "assert"
import { VObject, VACError } from "easy-vac";

////////////////////////////////////////////
// define a new VType

const Student = VObject.required({
  name: {
    type: String,
  },
  id: {
    type: String,
    verify(id: string) {
      // assuming student id (string) follows these rules:

      if (/^S\d{6}$/.test(id) === false) throw new Error("wrong format")

      const fiveDigits = parseInt(id.substr(1, 5))
      const checkCode = parseInt(id.charAt(6))

      if (fiveDigits % 7 !== checkCode) throw new Error("wrong check code")

      // then this id is good
    }
  }
})

////////////////////////////////////////////
// validate and clean the data

// good student info: no error reports

Student.vac({
  name: "Bob",
  id: "S001035"
})

// bad student info: throw an VACError

try {
  Student.vac({
    name: "Bob",
    id: "S002035" // bad student id.  203 % 7 == 0, not 5
  })
  assert.ok(false, "Program shall not reach here")
}
catch (err) {
  assert.ok(err instanceof VACError) // we shall get a VACError (from `Student.vac`)
  assert.equal(err.errors.length, 1) // which reports one bad field
  assert.equal(err.errors[0].label, "root.id")  // the field is "root.id"
  assert.equal(err.errors[0].error.message, "wrong check code") // with this error message
}
