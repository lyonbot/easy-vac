///<reference path="./main.d.ts" />

"use strict";

const loadText = url => fetch(url, {credentials: "omit"}).then(x => x.text());

require(["vs/editor/editor.main"], async function() {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
    emitDecoratorMetadata: true,
    experimentalDecorators: true
  });

  await Promise.all([
    ...["core.d.ts", "decorators.d.ts", "i18n.d.ts", "index.d.ts"].map(s =>
      loadText("../types/" + s).then(dts => monaco.languages.typescript.typescriptDefaults.addExtraLib(dts, "inmemory://model/" + s))
    ),
    loadText("https://cdn.jsdelivr.net/npm/reflect-metadata/index.d.ts").then(dts =>
      monaco.languages.typescript.typescriptDefaults.addExtraLib(dts, "inmemory://model/reflect-metadata.d.ts")
    )
  ]);

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    `import * as ModuleObject from "./index"\ndeclare module "easy-vac" { export = ModuleObject; }`,
    "inmemory://model/easy-vac.d.ts"
  );

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    `declare module "assert" {
      function assert(v: any, msg?: string): void;
      namespace assert {
        function ok(v: any, msg?: string): void;
        function deepStrictEqual(actual: any, expected: any, msg?: string): void;
        function strictEqual(actual: any, expected: any, msg?: string): void;
      };
      export = assert;
    }`,
    "inmemory://model/assert.d.ts"
  );

  var editorDiv = document.querySelector("#editor1");

  var data = await loadText("./sample.ts");
  var model = monaco.editor.createModel(data, "typescript", monaco.Uri.parse("inmemory://model/1.ts"));
  var editor = monaco.editor.create(editorDiv, {model, scrollbar: {handleMouseWheel: true}});

  window.model = model;
  window.editor = editor;
  window.addEventListener("resize", () => editor.layout(), false);

  document.getElementById("execute").onclick = function() {
    var script = model.getValue();
    var out = ts.transpile(script, {
      ...ts.getDefaultCompilerOptions,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2016,
      emitDecoratorMetadata: true,
      experimentalDecorators: true
    });

    var fn = new Function("require", "exports", out);
    try {
      fn(my_require, {});
    } catch (error) {
      console.error(error)
    }
  };
});

var my_require = function(mod) {
  if (mod === "reflect-metadata") return null;
  if (mod === "easy-vac") return EasyVAC;
  if (mod === "assert") return SimpleAssert;
  console.warn(mod + " is required but not defined");
};
