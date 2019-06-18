/**
 * Transpile ts files and run tests. Faster than ts-node.
 *
 * Note: to debug, use ts-node or tsc
 *
 * Usage: npm run test [xxxxx] [xxxxx] ...
 *
 * xxxxx are filename is relative path to `test` directory.
 * If no file specified, all tests will be ran.
 */

const Module = require("module")
const path = require("path")
const fs = require("fs")
const ts = require("typescript")
const old_resolveFilename = Module._resolveFilename

const testDir = path.resolve(__dirname, "..", "test")

Module._resolveFilename = function (request, _parent) {
  if (request === "easy-vac") {
    return path.resolve(__dirname, "../dist/index.js")
  }
  return old_resolveFilename.apply(this, arguments)
}

let filenames = process.argv.slice(2)

if (filenames.length == 0) {
  console.warn("No specified test files. Running all tests.")
  fs.readdirSync(testDir).forEach(dir => {
    try {
      fs.readdirSync(path.join(testDir, dir)).forEach(file => {
        if (/\.ts$/.test(file)) filenames.push(`${dir}/${file}`)
      })
    } catch (e) { }
  })
}

if (filenames.length == 0) {
  console.error("No test to run")
  process.exit(1)
}

for (let filename of filenames) {
  if (!/\.[tj]s$/i.test(filename)) filename += ".ts"
  let filepath = path.resolve(testDir, filename)

  let content = fs.readFileSync(filepath, "utf-8")

  if (/\.ts$/.test(filepath)) {
    // transpile .ts file
    content = ts.transpile(content, {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2016
    })
  }

  console.log(`==== [${filename}] ====`)
  eval(content)
  console.log(`==== Finished ====`)
}
