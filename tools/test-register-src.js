const Module = require("module")
const path = require("path")
const old_resolveFilename = Module._resolveFilename

Module._resolveFilename = function (request, _parent) {
  if (request === "easy-vac") {
    return path.resolve(__dirname, "../src/index.ts")
  }
  return old_resolveFilename.apply(this, arguments)
}
