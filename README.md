# easy-vac

Validate-and-Clean made easy with TypeScript / JavaScript.

[
  **[GitHub](https://github.com/lyonbot/easy-vac)** | 
  **[Online Demo / Playground](https://lyonbot.github.io/easy-vac/)** | 
  **[Documentation](https://github.com/lyonbot/easy-vac/wiki)** | 
  **[NPM](https://www.npmjs.com/package/easy-vac)**
]

```javascript
import { VACData, Required, Optional } from "easy-vac";

class MyData extends VACData {
  @Required(String) name
  @Optional(Number) age
  @Optional(Date) visited_at = new Date() // with default value
}

var data = new MyData().fillDataWith({
  name: "hello",
  age: 18,
  visited_at: 123454654654,
  dirty_field: "hhhaha"
})

assert(('dirty_field' in data) === false) // unwanted fields are excluded
assert(data.hasError() === false) // no missing field, no bad input
assert(data.birthday instanceof Date) // it is Date object now

console.log(data)
```
