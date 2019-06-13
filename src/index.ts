/// <reference path="./globals.d.ts" />

import * as example from "./example";
import { VConsole, VConsoleDts } from "./vconsole";
import { debounce, removeLeadingJSComments, loadText } from "./helpers";
import { TranspileOptions } from "typescript";
import { renderVACError } from "./render-vacerror";

define("playground", () => VConsole)
window['playground'] = VConsole

const programModel = monaco.editor.createModel("", "typescript", monaco.Uri.parse("file:///program.ts"));
const incomingModel = monaco.editor.createModel("export default {\n}", "typescript", monaco.Uri.parse("file:///incoming.ts"));

const transpileOptions: TranspileOptions = {
  compilerOptions: {
    module: ts.ModuleKind.AMD,
    target: ts.ScriptTarget.ES2016,
  }
}

define('test-data', () => ({ "default": {} }))

let lastProgramSource: string, lastIncomingSource: string

const recompile = debounce(function () {
  const jsToRun = [] as string[]

  const incomingScript = incomingModel.getValue()
  if (incomingScript !== lastIncomingSource) {
    lastIncomingSource = incomingScript
    let js =
      removeLeadingJSComments(ts.transpileModule(incomingScript, transpileOptions).outputText)
        .replace('define(', 'require(')
        .replace('"exports"', '"test-data"')

    jsToRun.push(js)
  }

  const programScript = programModel.getValue()
  if (jsToRun.length || programScript !== lastProgramSource) {
    lastProgramSource = programScript
    let js =
      removeLeadingJSComments(ts.transpileModule(programScript, transpileOptions).outputText)
        .replace('define(', 'require(')

    jsToRun.push(js)
  }

  if (jsToRun.length) {
    VConsole.clear()
    try {
      jsToRun.forEach(js => { eval(js) })
      VConsole.info("Test program successfully executed.")
    } catch (err) {
      if (err instanceof EasyVAC.VACError) {
        VConsole.appendChild(renderVACError(err))
      }
      VConsole.error(err)
    }
  }
}, 300)

!async function () {
  const typescriptDefaults = monaco.languages.typescript.typescriptDefaults

  typescriptDefaults.addExtraLib(await loadText('https://unpkg.com/easy-vac/dist/index.d.ts'), "file:///easy-vac/index.d.ts")
  typescriptDefaults.addExtraLib(VConsoleDts, "file:///playground.d.ts")
  typescriptDefaults.addExtraLib(`declare module "test-data" { const d: any; export default d; }`, "file:///test-data.d.ts")

  example.init(programModel, incomingModel)
  example.useExample(await loadText("examples/00 Hello World.txt"))

  const editorOptions = { minimap: { enabled: false }, automaticLayout: true }

  monaco.editor.create(document.getElementById("editor1"), { model: programModel, ...editorOptions });
  monaco.editor.create(document.getElementById("editor2"), { model: incomingModel, ...editorOptions });

  programModel.onDidChangeContent(recompile)
  incomingModel.onDidChangeContent(recompile)
  recompile()
  setTimeout(() => { VConsole.autoScroll = true }, 1000)
}()

window['loadExample'] = function (name) {
  loadText(`examples/${name}.txt`).then(example.useExample).catch(() => { alert('Failed to load example!') })
  return false
}

window['loadManualLang'] = loadManualLang

function loadManualLang(code: string) {
  loadText(`manual/${code}.html`).then(x => {
    document.getElementById('manual').innerHTML = x
  }).catch(() => { alert('Failed to load manual!') })
  return false
}

window['resetProgram'] = function () {
  programModel.setValue(`import { VObject, VArray, VEnum, VTuple, VACError } from "easy-vac"
import incoming from "test-data"

const XXX = VObject({
  // ...
})

var data = XXX.vac(incoming)
playground.log(data)
`)
  return false
}