/// <reference types="easy-vac" />

declare const monaco: any
declare const ts: typeof import("typescript")
declare const preact: typeof import("preact")
declare function define(name: string, deps: string[], factory: Function): void
declare function define(name: string, factory: Function): void
declare function loadText(path: string): Promise<string>
