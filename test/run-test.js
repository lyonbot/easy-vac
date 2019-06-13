const Module = require("module")
const path = require("path")
const fs = require("fs")
const ts = require("typescript")
const old_resolveFilename = Module._resolveFilename

Module._resolveFilename = function (request, _parent) {
  if (request === "easy-vac") {
    return path.resolve(__dirname, "../dist/index.js")
  }
  return old_resolveFilename.apply(this, arguments)
}

let filenames = process.argv.slice(2)

if (filenames.length == 1 && filenames[0] === '--all') {
  filenames.splice(0)
  fs.readdirSync(__dirname).forEach(dir => {
    try {
      fs.readdirSync(path.join(__dirname, dir)).forEach(file => {
        if (/\.ts$/.test(file)) filenames.push(`${dir}/${file}`)
      })
    } catch (e) { }
  })
}

if (filenames.length == 0) {
  console.error([
    "Quickly transiple TypeScript test-cases and run them.",
    "Note: to debug, use ts-node or tsc",
    "",
    "Usage: npm run test filename1 [filename2] [filename3] ...",
    "",
    " - filename is relative path to " + __dirname
  ].join("\n"))
  process.exit(1)
}

for (let filename of filenames) {
  if (!/\.[tj]s$/i.test(filename)) filename += ".ts"
  let filepath = path.resolve(__dirname, filename)

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
