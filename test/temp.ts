import { VObject, VArray, VEnum, VTuple, makeVType, VACResultType } from "easy-vac";

const Integer = makeVType(x => parseInt(x), { result: Number })
const Point2 = VTuple({ type: "int" }, { type: "int" })

var ob = VObject({
  q: { type: VEnum(['a', 'b', 'c']) },
  pos: { type: Point2 },
  s: {
    type: VObject.required({
      a: { type: Integer, exclusiveMaximum: 5 },
      b: { type: Date },
      c: {
        type: VArray({
          items: {
            type: VObject.required({
              q: { type: Number, default: 3 },
              s: { type: 'string' }
            })
          },
        })
      }
    }),
  }
})

const out: VACResultType<typeof ob> = ob.vac({
  q: 'c',
  pos: ["fu12.35", 3.14159],
  s: {
    a: 4.6,
    b: '2019-12-30',
    c: [{ s: 12345 }, { s: true }]
  }
})

console.log(out)

// console.log(JSON.stringify(out, null, 2))
