easy-vac 是一个用于验证和清理数据的 JavaScript 库

- **比 JSON Schema 好用**: 脱离 JSON 的限制，使用 JavaScript 的方式定义数据类型
- **自动类型推导**: 和 TypeScript 一起使用效果更佳
- **类型容忍性**: 能把原始数据转换为你需要的类型
- **高度扩展性**: 类型定义可以随处重用

[![Build Status](https://travis-ci.org/lyonbot/easy-vac.svg?branch=master)](https://travis-ci.org/lyonbot/easy-vac)
[![npm](https://img.shields.io/npm/v/easy-vac.svg)](https://www.npmjs.com/package/easy-vac)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/easy-vac.svg)
![npm type definitions](https://img.shields.io/npm/types/easy-vac.svg)
![NPM License](https://img.shields.io/npm/l/easy-vac.svg)

## <i class="fas fa-mug-hot"></i> 现在开始

你需要做的是：

1. 安装 easy-vac
2. 设计数据结构
3. VAC (验证和清理，Validate and Clean) 数据

### <i class="fas fa-cube"></i> 安装

你可以通过下列方法安装 easy-vac:

- 使用 [NPM](https://www.npmjs.com/package/easy-vac): `npm install --save easy-vac`
- 使用 CDN:
  - easy-vac 只能在支持 ES6 的现代浏览器上运行。
  - 默认提供 UMD 版本，在全局下通过 `EasyVAC` 变量提供各项功能
  - JSDelivr: <https://cdn.jsdelivr.net/npm/easy-vac>
  - UnPKG: <https://unpkg.com/easy-vac>

### <i class="fas fa-drafting-compass"></i> 设计数据结构

首先，数据里不能含有函数或者 `undefined`！在 easy-vac 的数据结构中可用类型如下:

- string, number, boolean
- 数组, 普通的对象
- Date, ObjectId 等. [(使用前需要定义 &raquo;)][define-new-types]

从一个简单的例子开始吧:

```javascript
import { VObject, VArray, VEnum, VTuple, VACError } from "easy-vac"

const OrderItem = VObject({
  product: { type: "string", required: true },
  count:   { type: "int",    default: 1, minimum: 1 },
})

const Order = VObject.required({
  guest:  { type: String },           // <- type 可以是 "string"
  items:  { type: VArray({ items: { type: OrderItem },
                           minItems: 1,
                           maxItems: 3 })
          }
})
```

这段 JavaScript 代码定义了 2 个数据结构: `OrderItem` 和 `Order`。

在 TypeScript 中，相应的类型定义可写成：

```typescript
interface OrderItem {
  product: string
  count: number     // 整数, value >= 1, default is 1
}

interface Order {
  guest: string,
  items: OrderItem[],  // OrderItem 数组. 1 <= array length <= 3
}
```

但是你并不需要写这些类型定义！**类型定义是自动推导出来的**，TypeScript 和 easy-vac 会从你写的 JavaScript 代码完成推导。

<i class="fas fa-lightbulb"></i> 把 JavaScript 代码丢到[playground](#playground)，鼠标放在那数据结构的名字上，你会看到有意思的东西。

<i class="fas fa-lightbulb"></i> 你也可以用 [VTuple](), [VEnum]() 和 [makeVType]() 定义其他类型。参看 [Define new Types][define-new-types].

### <i class="fas fa-cogs"></i> 验证和清理 (VAC，Validate and Clean) 数据

定义了数据结构后，就可以 *VAC* 数据了。

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

这里多出了个没定义过的 `_id`，而且 `guest` 是个数字（我们定义的是字符串）， `items[0]` 缺少 `count`。

然而，在数据结构定义中，`_id` 不存在， *Order* 的 `guest` 是字符串, *OrderItem* 的 `count` 设置了默认值。

easy-vac 会按照定义的数据结构来验证和清理数据. 输出 `data`，你会发现那些小问题都被解决了：

```javascript
{
  "guest": "12345",
  "items": [
    { "product": "Ice Cream", "count": 1 },
    { "product": "Toast", "count": 3 }
  ]
}
```

#### <i class="fas fa-hard-hat"></i> 处理错误

如果遇到了一些大问题， `Order.vac(...)` 会抛出 [VACError][] 异常。

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
  var data = Order.vac(incoming)  // <- 抛出 VACError
  console.log(data)               // <- 程序到不了这儿
} catch (err) {
  if (err instanceof VACError) {
    console.error("easy-vac 发现错误!")
    err.errors.forEach(it => {
      console.error(`- ${it.label}: ${it.error.message}`)
    })
  }
}
```

控制台会用红色字输出:

```
easy-vac 发现错误!
- root.guest: required property is missing
- root.items[2].count: value too small
- root.items[3].count: value too small
- root.items: array length is too long
```


[define-new-types]: xxx.html