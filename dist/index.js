define(['preact'], function (preact) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    var programModel, incomingModel;
    const incomingSelect = document.getElementById('incomingSelect');
    function init(_programModel, _incomingModel) {
        programModel = _programModel;
        incomingModel = _incomingModel;
        incomingSelect.onchange = function () {
            incomingModel.setValue(incomings[incomingSelect.value]);
        };
    }
    var incomings = [];
    function useExample(content) {
        var parts = content.split('//>>>---').slice(1);
        var firstIncoming = true;
        incomings.splice(0);
        incomingSelect.innerHTML = '';
        parts.forEach(text => {
            const header = /^\s*(program|data)(?:\:\s*(.+))?[\r\n]+/.exec(text);
            const remains = text.slice(header[0].length);
            if (header[1] === 'program') {
                programModel.setValue(remains);
            }
            if (header[1] === 'data') {
                const opt = document.createElement('option');
                opt.value = String(incomings.length);
                opt.textContent = header[2];
                opt.selected = incomings.length == 0;
                incomingSelect.appendChild(opt);
                incomings.push(remains);
                if (firstIncoming) {
                    incomingModel.setValue(remains);
                    firstIncoming = false;
                }
            }
        });
    }

    var Styled;
    (function (Styled) {
        // Dark theme
        // export const Keyword: FunctionalComponent = ({ children: x }) => <span style="color: #569cd6">{x}</span>
        // export const Symbol: FunctionalComponent = ({ children: x }) => <span style="color: #9cdcfe">{x}</span>
        // export const MethodSymbol: FunctionalComponent = ({ children: x }) => <span style="color: #dcdcaa">{x}</span>
        // export const TypeSymbol: FunctionalComponent = ({ children: x }) => <span style="color: #4ec9b0">{x}</span>
        // export const Number: FunctionalComponent = ({ children: x }) => <span style="color: #b5cea8">{x}</span>
        // export const String: FunctionalComponent = ({ children: x }) => <span style="color: #ce9178">{x}</span>
        // Bright theme
        Styled.Keyword = ({ children: x }) => preact.h("span", { style: "color: #aa0d91" }, x);
        Styled.Symbol = ({ children: x }) => preact.h("span", { style: "color: #008eda" }, x);
        Styled.MethodSymbol = ({ children: x }) => preact.h("span", { style: "color: #000000" }, x);
        Styled.TypeSymbol = ({ children: x }) => preact.h("span", { style: "color: #008080" }, x);
        Styled.Number = ({ children: x }) => preact.h("span", { style: "color: #09885a" }, x);
        Styled.String = ({ children: x }) => preact.h("span", { style: "white-space: pre-wrap; color: #c41a16" },
            "\"",
            x,
            "\"");
        Styled.Symbol_ = ({ x }) => preact.h("span", null,
            preact.h(Styled.Keyword, null, "Symbol"),
            x.toString().slice(6));
        Styled.Function_ = ({ x }) => preact.h("span", null,
            preact.h(Styled.Keyword, null, "fn "),
            preact.h(Styled.MethodSymbol, null, x.name),
            `() { ... }`);
        Styled.Object_ = ({ x }) => {
            const prototype = Object.getPrototypeOf(x);
            const canExpandKey = !prototype || prototype.constructor === Object;
            return preact.h("span", null,
                preact.h(Styled.TypeSymbol, null, prototype ? prototype.constructor.name : "object"),
                (canExpandKey && ` { ${Object.keys(x).length} keys }`) ||
                    (('length' in x) && ` [ ${x['length']} items ]`) ||
                    (typeof x['toString'] === 'function' && ` : ${x.toString()}`) ||
                    "");
        };
        Styled.Bullet = ({ state, onClick }) => preact.h("span", { style: "position:absolute;left:0;cursor:pointer;width:1em;text-align:center", onClick: onClick }, state === "open" ? "-" : state === "closed" ? "+" : "");
    })(Styled || (Styled = {}));
    class JsNode extends preact.Component {
        constructor(props) {
            super(...arguments);
            this.toggleExpansion = () => this.setState((s) => ({ expanded: !s.expanded }));
            this.state = {
                expanded: (props.expandLevels > 0 && typeof props.obj === 'object' && props.obj !== null && Object.keys(props.obj).length < 20),
            };
        }
        shouldComponentUpdate(nextProp, nextState) {
            return nextProp.obj !== this.props.obj || nextProp.propLabel !== this.props.propLabel || nextState.expanded !== this.state.expanded;
        }
        render(props, state) {
            let { propLabel } = props;
            try {
                return this._render(props, state);
            }
            catch (err) {
                let propLabelEl = propLabel ? preact.h(Styled.Symbol, null, propLabel + ": ") : null;
                return preact.h("div", { style: "padding-left: 1em; position: relative", class: "json-viewer-failed" },
                    propLabelEl,
                    preact.h("i", null, "Can't present data"));
            }
        }
        _render({ obj, propLabel, expandLevels = 0 }, state) {
            let propLabelEl = propLabel ? preact.h(Styled.Symbol, null, propLabel + ": ") : null;
            let nodeText = "unknown";
            let expandable = false;
            if (typeof obj === "undefined")
                nodeText = preact.h(Styled.Keyword, null, "undefined");
            else if (typeof obj === "string")
                nodeText = preact.h(Styled.String, null, obj);
            else if (typeof obj === "number")
                nodeText = preact.h(Styled.Number, null, obj);
            else if (typeof obj === "symbol")
                nodeText = preact.h(Styled.Symbol_, { x: obj });
            else if (typeof obj === "boolean")
                nodeText = preact.h(Styled.Keyword, null, obj ? "true" : "false");
            else if (typeof obj === "function")
                nodeText = preact.h(Styled.Function_, { x: obj });
            else if (obj === null)
                nodeText = preact.h(Styled.Keyword, null, "null");
            else if (typeof obj === 'object') {
                expandable = true;
                nodeText = preact.h(Styled.Object_, { x: obj });
            }
            else {
                nodeText = preact.h("span", null, obj + '');
            }
            let expandedInfo = null;
            if (expandable && state.expanded) {
                expandedInfo = [];
                for (const k in obj) {
                    expandedInfo.push(preact.h(JsNode, { expandLevels: expandLevels - 1, propLabel: k, obj: obj[k], key: k }));
                }
            }
            return preact.h("div", { style: "padding-left: 1em; position: relative", class: "json-viewer-node" },
                preact.h(Styled.Bullet, { onClick: this.toggleExpansion, state: !expandable ? "none" : state.expanded ? "open" : "closed" }),
                preact.h("div", { style: expandable && "cursor:pointer", onClick: this.toggleExpansion, key: "nodeText" },
                    propLabelEl,
                    nodeText),
                expandedInfo);
        }
    }
    function renderObjectTo(container, obj) {
        return preact.render(preact.h(JsNode, { obj: obj, expandLevels: 2 }), container);
    }

    function debounce(func, wait) {
        var timeout = null;
        function timeoutFn() { timeout = null; func(); }
        return function () {
            if (timeout)
                clearTimeout(timeout);
            timeout = setTimeout(timeoutFn, wait || 100);
        };
    }
    const leadingComment = /^\s*(?:\/\/.+\s*|\/\*[\d\D]+?\*\/\s*)+/;
    function removeLeadingJSComments(s) {
        return s.replace(leadingComment, "");
    }

    const VConsoleEl = document.getElementById('vconsole');
    const VConsoleDts = `
declare module "playground" {
  /** clear the virtual console */
  export function clear(): void
  export function appendChild(...items: Node[]): void
  export function log(...items: any[]): void
  export function error(...items: any[]): void
  export function warn(...items: any[]): void
  export function info(...items: any[]): void
  export function assert(value: any, message?: string): void
}

/** This is the virtual console. have fun :) */
declare const playground: typeof import("playground")
`;
    const VConsole = {
        autoScroll: false,
        clear() { VConsoleEl.innerHTML = ''; },
        appendChild(...items) {
            var line = document.createElement('div');
            line.className = "console-line";
            items.forEach(el => {
                line.appendChild(el);
            });
            VConsoleEl.appendChild(line);
            VConsole.scrollToBottom();
            return line;
        },
        _log(extraClassName, ...items) {
            var line = document.createElement('div');
            line.className = "console-line " + extraClassName;
            items.forEach(val => {
                if (typeof val === "string") {
                    const frag = document.createElement('span');
                    frag.style.whiteSpace = 'pre-wrap';
                    frag.textContent = val;
                    line.appendChild(frag);
                }
                else
                    renderObjectTo(line, val);
            });
            VConsoleEl.appendChild(line);
            VConsole.scrollToBottom();
        },
        scrollToBottom: debounce(() => {
            if (!VConsole.autoScroll)
                return;
            const lastEl = VConsoleEl.lastElementChild;
            if (lastEl)
                lastEl.scrollIntoView();
        }),
        log(...items) { VConsole._log("", ...items); },
        error(...items) { VConsole._log("error", ...items); },
        warn(...items) { VConsole._log("warn", ...items); },
        info(...items) { VConsole._log("info", ...items); },
        assert(value, message) { if (!value)
            VConsole.error("Assertion Failed: " + (message || '')); },
    };

    const VACErrorDisplay = ({ err }) => preact.h("div", { class: "vacerror" },
        preact.h("div", null,
            preact.h("b", null, "[playground]"),
            " your program threw a VACError"),
        preact.h("ul", null, err.errors.map(e => preact.h("li", null,
            preact.h("span", { class: "label" }, e.label),
            " ",
            String(e.error)))));
    function renderVACError(err) {
        const frag = document.createDocumentFragment();
        preact.render(preact.h(VACErrorDisplay, { err: err }), frag);
        return frag;
    }

    /// <reference path="./globals.d.ts" />
    define("playground", () => VConsole);
    window['playground'] = VConsole;
    const hijackedConsole = (function () {
        if (typeof Proxy === 'undefined')
            return console;
        const hijackFunctions = {};
        for (const k in VConsole) {
            const fn = VConsole[k];
            if (typeof fn === 'function') {
                hijackFunctions[k] = function () {
                    console[k].apply(k, arguments);
                    fn.apply(VConsole, arguments);
                };
            }
        }
        return new Proxy(console, {
            get(target, key) { return hijackFunctions[key] || target[key]; }
        });
    })();
    window['hijackedConsole'] = hijackedConsole;
    const programModel$1 = monaco.editor.createModel("", "typescript", monaco.Uri.parse("file:///program.ts"));
    const incomingModel$1 = monaco.editor.createModel("export default {\n}", "typescript", monaco.Uri.parse("file:///incoming.ts"));
    const transpileOptions = {
        compilerOptions: {
            module: ts.ModuleKind.AMD,
            target: ts.ScriptTarget.ES2016,
            esModuleInterop: true,
        }
    };
    const emulatedIncomingModule = { "default": {} };
    define('incoming', () => emulatedIncomingModule);
    Object.defineProperty(window, "incoming", { get() { return emulatedIncomingModule.default; }, configurable: false });
    let lastProgramSource, lastIncomingSource;
    const recompile = debounce(function () {
        const jsToRun = [];
        const prePatch = "const console = hijackedConsole;\n";
        const incomingScript = incomingModel$1.getValue();
        if (incomingScript !== lastIncomingSource) {
            lastIncomingSource = incomingScript;
            let js = removeLeadingJSComments(ts.transpileModule(prePatch + incomingScript, transpileOptions).outputText)
                .replace('define(', 'require(')
                .replace('"exports"', '"incoming"');
            jsToRun.push(js);
        }
        const programScript = programModel$1.getValue();
        if (jsToRun.length || programScript !== lastProgramSource) {
            lastProgramSource = programScript;
            let js = removeLeadingJSComments(ts.transpileModule(prePatch + programScript, transpileOptions).outputText)
                .replace('define(', 'require(');
            jsToRun.push(js);
        }
        if (jsToRun.length) {
            VConsole.clear();
            try {
                jsToRun.forEach(js => { eval(js); });
                VConsole.info("Test program successfully executed.");
            }
            catch (err) {
                if (err instanceof EasyVAC.VACError) {
                    VConsole.appendChild(renderVACError(err));
                }
                VConsole.error(err);
            }
        }
    }, 300);
    !function () {
        return __awaiter(this, void 0, void 0, function* () {
            const typescriptDefaults = monaco.languages.typescript.typescriptDefaults;
            typescriptDefaults.setCompilerOptions({ esModuleInterop: true });
            typescriptDefaults.addExtraLib(yield loadText('https://unpkg.com/easy-vac/dist/index.d.ts'), "file:///easy-vac/index.d.ts");
            typescriptDefaults.addExtraLib(VConsoleDts, "file:///playground.d.ts");
            typescriptDefaults.addExtraLib(`declare module "incoming" { const d: Record<string, any>; export = d; }`, "file:///incoming.d.ts");
            init(programModel$1, incomingModel$1);
            useExample(yield loadText("examples/00 Hello World.txt"));
            const editorOptions = { minimap: { enabled: false }, automaticLayout: true };
            monaco.editor.create(document.getElementById("editor1"), Object.assign({ model: programModel$1 }, editorOptions));
            monaco.editor.create(document.getElementById("editor2"), Object.assign({ model: incomingModel$1 }, editorOptions));
            programModel$1.onDidChangeContent(recompile);
            incomingModel$1.onDidChangeContent(recompile);
            recompile();
            const loadingMask = document.querySelector('#playground .loading-cloak');
            loadingMask.parentElement.removeChild(loadingMask);
            setTimeout(() => { VConsole.autoScroll = true; }, 1000);
        });
    }();
    window['loadExample'] = function (path) {
        loadText(`examples/${path}`).then(useExample).catch(() => { alert('Failed to load example!'); });
        return false;
    };
    window['resetProgram'] = function () {
        programModel$1.setValue(`import { VObject, VArray, VEnum, VTuple, VACError } from "easy-vac"
import incoming from "incoming"

const XXX = VObject({
  // ...
})

var data = XXX.vac(incoming)
playground.log(data)
`);
        return false;
    };

});
