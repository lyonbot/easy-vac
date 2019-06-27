//@ts-check

const fs = require("fs");
const sass = require("sass");
const child_process = require("child_process");
const hljs = require("highlight.js");
const md = require("markdown-it")({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' + hljs.highlight(lang, str, true).value + "</code></pre>";
      } catch (_) { }
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>";
  }
});

const watch_mode = process.argv.includes("--watch");

function debounced(fn) {
  var debounceTimer = null;
  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fn();
      debounceTimer = null;
    }, 50);
  };
}

const generate_html = debounced(function () {
  var html = fs.readFileSync("src/index.html", "utf-8");

  var examples = fs
    .readdirSync("examples")
    .sort()
    .map(x => [x, x.replace(/^\d+\s*|\.\w+$/g, '')])
  html = html.replace(
    "[[EXAMPLES]]",
    examples.map(([path, name]) => `<option value="${path}">${name}</option>`).join("\n")
  );

  var manualLangs = fs
    .readdirSync("src/manual")
    .map(x => {
      var parts = x.slice(0, -3).split("-", 2)
      var mainContent = md.render(fs.readFileSync("src/manual/" + x, "utf-8"));
      fs.writeFileSync(`manual/${parts[0]}.html`, mainContent)
      return parts
    })


  var mainContent = md.render(fs.readFileSync("src/manual/en-English.md", "utf-8"));
  html = html
    .replace("{{MANUAL_LANGS}}", manualLangs.map(([code, name]) => `<a class="manual-lang" onclick="loadManualLang('${code}')" data-code="${code}">${name}</a>`).join(''))
    .replace("[[MAIN-CONTENT]]", mainContent)
    .replace("{{EXAMPLE_COUNT}}", String(examples.length))
    .replace("{{EXAMPLE_LIST}}", examples.map(([path, name]) => `<a class="example-item" onclick="loadExample('${path}')">${name}</a>`).join(" "));

  // var sampleCode = fs.readFileSync("examples/00 Hello-World.txt", "utf-8");
  // html = html.replace("[[SAMPLE-CODE]]", sampleCode);

  fs.writeFileSync("index.html", html);

  console.log("index.html is generated.");
});

generate_html();
if (watch_mode) {
  fs.readdirSync("src")
    .filter(x => /\.(html|md)$/.test(x))
    .forEach(it => void fs.watchFile("src/" + it, generate_html));
  fs.watch("examples", generate_html);
  fs.watch("src/manual", generate_html);
}

const platform_suffix = (process.platform == "win32" ? ".cmd" : "");
const rollup_process = child_process.spawn("npx" + platform_suffix, ["rollup", "-c", ...(watch_mode ? ["-w"] : [])], { stdio: "inherit" });
process.addListener("beforeExit", () => typeof rollup_process["kill"] === "function" && rollup_process.kill());

const generate_css = debounced(function () {
  try {
    var result = sass.renderSync({ file: "src/main.scss", outFile: "main.css" });
    fs.writeFileSync("main.css", result.css);
    console.log("main.css is generated.");
  } catch (err) {
    console.error("failed to compile main.css");
    console.error(err);

    if (!watch_mode) process.exit(1);
  }
});

generate_css();
if (watch_mode) {
  fs.watch("src/scss", generate_css);
  fs.watch("src/main.scss", generate_css);
}