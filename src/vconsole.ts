import { renderObjectTo } from "./json-viewer";
import { debounce } from "./helpers";

export const VConsoleEl = document.getElementById('vconsole') as HTMLDivElement

export const VConsoleDts = `
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
`

export const VConsole = {
  autoScroll: false,
  clear() { VConsoleEl.innerHTML = '' },
  appendChild(...items: Node[]) {
    var line = document.createElement('div')
    line.className = "console-line"
    items.forEach(el => {
      line.appendChild(el)
    })
    VConsoleEl.appendChild(line)
    VConsole.scrollToBottom()
    return line
  },
  _log(extraClassName: string, ...items: any[]) {
    var line = document.createElement('div')
    line.className = "console-line " + extraClassName
    items.forEach(val => {
      if (typeof val === "string") {
        const frag = document.createElement('span')
        frag.style.whiteSpace = 'pre-wrap'
        frag.textContent = val
        line.appendChild(frag)
      }
      else renderObjectTo(line, val)
    })
    VConsoleEl.appendChild(line)
    VConsole.scrollToBottom()
  },
  scrollToBottom: debounce(() => {
    if (!VConsole.autoScroll) return
    const lastEl = VConsoleEl.lastElementChild
    if (lastEl) lastEl.scrollIntoView()
  }),
  log(...items: any[]) { VConsole._log("", ...items) },
  error(...items: any[]) { VConsole._log("error", ...items) },
  warn(...items: any[]) { VConsole._log("warn", ...items) },
  info(...items: any[]) { VConsole._log("info", ...items) },
  assert(value: any, message?: string) { if (!value) VConsole.error("Assertion Failed: " + (message || '')) },
}