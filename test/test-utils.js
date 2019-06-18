const assert = require('assert')
const { VACError } = require("easy-vac")

/**
 *
 * @param {() => void} fn
 * @param {string[]} bad_labels
 */
exports.assertVACError = function assertVACError(fn, bad_labels) {
  try {
    fn()
    assert(false, "shall throw a VACError")
  } catch (e) {
    assert(e instanceof VACError, "shall throw a VACError")
    assert.deepEqual(
      e.errors.map(x => x.label).sort(),
      bad_labels.slice().sort(),
      "only some fields report errors"
    )
  }
}
