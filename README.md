# easy-vac

Validate-and-Clean made easy with decorators and TypeScript / JavaScript.

[
  **[GitHub](https://github.com/lyonbot/easy-vac)** | 
  **[Home](https://lyonbot.github.io/easy-vac/)** | 
  **[Playground](https://lyonbot.github.io/easy-vac/#playground)** | 
  **[Documentation](https://github.com/lyonbot/easy-vac/wiki)** |
  **[Examples](https://lyonbot.github.io/easy-vac/#examples)**
]

[![Build Status](https://travis-ci.org/lyonbot/easy-vac.svg?branch=master)](https://travis-ci.org/lyonbot/easy-vac)
[![npm](https://img.shields.io/npm/v/easy-vac.svg)](https://www.npmjs.com/package/easy-vac)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/easy-vac.svg)
![npm type definitions](https://img.shields.io/npm/types/easy-vac.svg)
![NPM License](https://img.shields.io/npm/l/easy-vac.svg)

## Example ([more...](https://lyonbot.github.io/easy-vac/#examples))

```javascript
import { VACData, Required, Optional } from "easy-vac";

class MyData extends VACData {
  @Required(String) name
  @Optional(Number) age
  @Optional(Date) visited_at = new Date() // with default value
}

// Now we can validate and clean data easily:

var data = new MyData().fillDataWith({
  name: "hello",
  age: 18,
  visited_at: 123454654654,
  dirty_field: "hhhaha"
})

vconsole.assert(('dirty_field' in data) === false) // unwanted fields are excluded
vconsole.assert(data.hasErrors() === false) // no missing field, no bad input
vconsole.assert(data.visited_at instanceof Date) // birthday is Date object now

console.log(data.toJSON())
console.log(data) // or just get an instance of MyData
```

## Get Started

**Install**: 

- via NPM: `npm install --save easy-vac reflect-metadata`
- via CDN:
  - easy-vac only runs on modern browsers with ES6 support.
  - UMD version is provided by default, with global name `EasyVAC`
  - JSDelivr: <https://cdn.jsdelivr.net/npm/easy-vac>
  - UnPKG: <https://unpkg.com/easy-vac>

**JavaScript Users**: enable [Decorators Support](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) in Babel.

**TypeScript Users**: edit `tsconfig.json` and put this into `compilerOptions` section:

```js
  "emitDecoratorMetadata": true,
  "experimentalDecorators": true,
```

**Then copy and run the example above**. Feel free playing it in [Online Demo / Playground](https://lyonbot.github.io/easy-vac/).