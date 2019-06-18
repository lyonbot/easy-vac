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

require('./test-register')
const Module = require("module")
const vm = require("vm")
const path = require("path")
const fs = require("fs")
const ts = require("typescript")

const testDir = path.resolve(__dirname, "..", "test")

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
    var tsOutput = ts.transpileModule(content, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2016,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
      },
    })
    content = tsOutput.outputText
  }

  console.log(`==== [${filename}] ====`)
  const compiled = vm.runInThisContext(Module.wrap(content), {
    filename: filepath,
    lineOffset: 0,
    displayErrors: true
  })

  const _module = { exports: {} }, _exports = _module.exports
  const _require = Module.createRequireFromPath(filepath)
  compiled.call(_exports, _exports, _require, _module, filepath, path.dirname(filepath))
  console.log(`==== Finished ====`)
}
