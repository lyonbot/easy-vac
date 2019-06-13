easy-vac is a JavaScript library which helps you validate and clean data.

- **Better than JSON Schema**: get rid of JSON limits, define schemas in JavaScript style
- **Auto Type Inferrence**: works perfectly with TypeScript
- **Type Tolerance**: may convert values to correct type
- **Highly Extensible**: define your own types and reuse them everywhere

[![Build Status](https://travis-ci.org/lyonbot/easy-vac.svg?branch=master)](https://travis-ci.org/lyonbot/easy-vac)
[![npm](https://img.shields.io/npm/v/easy-vac.svg)](https://www.npmjs.com/package/easy-vac)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/easy-vac.svg)
![npm type definitions](https://img.shields.io/npm/types/easy-vac.svg)
![NPM License](https://img.shields.io/npm/l/easy-vac.svg)

## <i class="fas fa-mug-hot"></i> Get Started

All you need is:

1. Install easy-vac
2. Design your type schema
3. VAC (validate and clean) the data

### <i class="fas fa-cube"></i> Install

easy-vac can be installed via:

- via [NPM](https://www.npmjs.com/package/easy-vac): `npm install --save easy-vac`
- via CDN:
  - easy-vac only runs on modern browsers with ES6 support.
  - UMD version is provided by default, with global name `EasyVAC`
  - JSDelivr: <https://cdn.jsdelivr.net/npm/easy-vac>
  - UnPKG: <https://unpkg.com/easy-vac>

### <i class="fas fa-drafting-compass"></i> Design type Schema

Schema can't contains functions or `undefined`! Valid types in easy-vac schema:

- string, number, boolean
- Array, plain object
- Date, ObjectId etc. [(define before use &raquo;)][define-new-types]

Let's start with a simple example:

```javascript
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
```

The javascript code defined 2 object schemas: `OrderItem` and `Order`.

In TypeScript, the corresponding types can be written as:

```typescript
interface OrderItem {
  product: string
  count: number     // integer, value >= 1, default is 1
}

interface Order {
  guest: string,
  items: OrderItem[],  // array of OrderItem. 1 <= array length <= 3
}
```

You don't need to write that! **Types are automatically inferred** from your code by TypeScript and easy-vac.

<i class="fas fa-lightbulb"></i> Put the JavaScript code into [playground](#playground), hover your cursor on the Schema names and see the magic.

<i class="fas fa-lightbulb"></i> You may also define other types with [VTuple](), [VEnum]() and [makeVType](). See [Define new Types][define-new-types].

### <i class="fas fa-cogs"></i> VAC (validate and clean) the data

Now we've defined the schemas. Time to *VAC* some data!

```javascript
var incoming = {
  _id: "xxxxx",
  guest: 12345,
  items: [
    { product: "Ice Cream" },
    { product: "Toast", count: 3 },
  ]
}

var order = Order.vac(incoming)
console.log(order)
```

There is a `_id` which is unexpected. `guest` is a number rather than string, and `items[0]` lacks `count`.

However, in your schemas, `_id` is not defined, `guest` of *Order* is defined as a string, `count` of *OrderItem* has a default value.

easy-vac will validate and clean the data. Print `data` and you will find that those minor issues are fixed:

```javascript
{
  "guest": "12345",
  "items": [
    { "product": "Ice Cream", "count": 1 },
    { "product": "Toast", "count": 3 }
  ]
}
```

#### <i class="fas fa-hard-hat"></i> Handle Errors

If there are major problems, `Order.vac(...)` will throw a [VACError][].

```javascript
var incoming = {
  items: [
    { product: "Ice Cream" },
    { product: "Toast", count: 3 },
    { product: "Beer", count: -1 },
    { product: "Pizza", count: 0 },
  ]
}

try {
  var data = Order.vac(incoming)  // <- this throws a VACError
  console.log(data)               // <- will not reach this line
} catch (err) {
  if (err instanceof VACError) {
    console.error("easy-vac found Error!")
    err.errors.forEach(it => {
      console.error(`- ${it.label}: ${it.error.message}`)
    })
  }
}
```

Console will print this in red:

```
easy-vac found Error!
- root.guest: required property is missing
- root.items[2].count: value too small
- root.items[3].count: value too small
- root.items: array length is too long
```


[define-new-types]: xxx.html