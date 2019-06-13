'use strict'

var require = {
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.17.0/min/vs",
    demo: "./dist"
  }
};

var loadText = (url) => fetch(url, { credentials: "omit" }).then(x => x.text());

function loadManualLang(code) {
  loadText(`manual/${code}.html`).then(x => {
    document.getElementById('manual').innerHTML = x
  }).catch(() => { alert('Failed to load manual!') })
  return false
}

!function () {
  var langs = {};
  [].map.call(document.querySelectorAll('.manual-lang'), x => { langs[x.getAttribute('data-code')] = 1 })
  navigator.languages.some(lang => {
    if (!langs[lang]) lang = /^\w+/.exec(lang)[0]
    if (lang in langs) { loadManualLang(lang); return true }
    return false
  })
}()
