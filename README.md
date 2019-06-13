# easy-vac

[![Build Status](https://travis-ci.org/lyonbot/easy-vac.svg?branch=master)](https://travis-ci.org/lyonbot/easy-vac)
[![npm](https://img.shields.io/npm/v/easy-vac.svg)](https://www.npmjs.com/package/easy-vac)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/easy-vac.svg)
![npm type definitions](https://img.shields.io/npm/types/easy-vac.svg)
![NPM License](https://img.shields.io/npm/l/easy-vac.svg)

[
  **[GitHub](https://github.com/lyonbot/easy-vac)** |
  **[Home](https://lyonbot.github.io/easy-vac/)** |
  **[Playground](https://lyonbot.github.io/easy-vac/#playground)** |
  **[Documentation](https://github.com/lyonbot/easy-vac/wiki)** |
  **[Examples](https://lyonbot.github.io/easy-vac/#examples)**
]

easy-vac is a JavaScript library which helps you validate and clean data.

- **Better than JSON Schema**: get rid of JSON limits, define schemas in JavaScript style
- **Auto Type Inferrence**: works perfectly with TypeScript
- **Type Tolerance**: may convert values to correct type
- **Highly Extensible**: define your own types and reuse them everywhere

## Install

easy-vac can be installed via:

- via [NPM](https://www.npmjs.com/package/easy-vac): `npm install --save easy-vac`
- via CDN:
  - easy-vac only runs on modern browsers with ES6 support.
  - UMD version is provided by default, with global name `EasyVAC`
  - JSDelivr: <https://cdn.jsdelivr.net/npm/easy-vac>
  - UnPKG: <https://unpkg.com/easy-vac>

## Example ([more...](https://lyonbot.github.io/easy-vac/#examples))

```typescript
import { VObject, VArray, VEnum, VTuple, VACError } from "easy-vac"

const OrderItem = VObject({
  product: { type: "string", required: true },
  count:   { type: "int",    default: 1, minimum: 1 },
})

const Order = VObject.required({
  guest:  { type: String },           // <- type can also be "string"
  items:  { type: VArray({ items: { type: OrderItem },
                           minItems: 1,
                           maxItems: 3 })
          }
})

var incoming = {
  _id: "xxxxx",
  guest: 12345,
  items: [
    { product: "Ice Cream" },
    { product: "Toast", count: 3 },
  ]
}

var order = Order.vac(incoming) // <-- throws VACError if failed
console.log(order)
```

Output:

```javascript
{
  "guest": "12345",
  "items": [
    { "product": "Ice Cream", "count": 1 },
    { "product": "Toast", "count": 3 }
  ]
}
```
