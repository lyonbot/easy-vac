//@ts-check

const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const readTextFile = filePath => promisify(fs.readFile)(filePath, "utf-8")
const writeTextFile = (filePath, content) => promisify(fs.writeFile)(filePath, content)

/**
 * @param {string} pkgName
 * @param {string} entryPath - MUST BE ABSOLUTE PATH
 */
async function bundleDts(pkgName, entryPath) {
  const baseDir = path.dirname(entryPath)
  const processedPaths = new Set()
  const parts = []

  /**
   * @param {string} filePath
   */
  function getNewModulePath(filePath) {
    filePath = filePath.replace(/\.d\.ts$/, '').replace(/[\\\/]index$/, '')
    let ans = path.relative(baseDir, filePath).replace(/\\/g, '/')
    if (ans) ans = pkgName + "/" + ans
    else ans = pkgName
    return ans
  }

  /**
   * @param {string} filePath
   */
  async function extractFrom(filePath) {
    const pendings = []

    if (processedPaths.has(filePath)) return
    processedPaths.add(filePath)

    let text = await readTextFile(filePath)

    text = text
      .replace(/^(\s*(export\s+)?)\bdeclare\b/mg, '$1') // remove "declare"
      .replace(/^(\s*(?:import|export)\s*(?:.+\sfrom\s)?|\s*module\s+)(['"])(\..*?)\2/mg, // convert relative module paths
        (_, leading, quote, oldRelPath) => {
          let realPath = path.resolve(path.dirname(filePath), oldRelPath)

          // check 1
          try {
            const s = fs.statSync(realPath)
            if (s.isDirectory()) realPath = path.resolve(realPath, "index")
          } catch { }

          // check 2
          realPath += ".d.ts"

          pendings.push(extractFrom(realPath))
          return `${leading}${quote}${getNewModulePath(realPath)}${quote}`
        })

    parts.push(`declare module "${getNewModulePath(filePath)}" {\n${text}\n}`)

    await Promise.all(pendings)
  }

  await extractFrom(entryPath)

  return parts.join("\n\n")
}

bundleDts("easy-vac", path.resolve(__dirname, "../tmp/lib/index.d.ts"))
  .then(result => {
    result += [
      "",
      '/** easy-vac in plain browser env */',
      'declare const EasyVAC: typeof import("easy-vac")',
      "",
    ].join("\n")
    writeTextFile(path.resolve(__dirname, "../dist/index.d.ts"), result)
  })