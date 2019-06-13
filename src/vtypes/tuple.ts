/**
 * This module provides a function that
 * create VType for an tuple
 */

import { VType, ST2T, VProp, VPropMetas } from "../core";
import getVACContext from "../vcontext";

/* script that generate the VPropList2TupleType mess

var out = []
for (let j=10; j>=1; j--) {
  var arr = []
  for (let i=1; i<=j; i++) {
    arr.push(`T${i}`)
  }
  out.push(': PS extends [' +
          arr.map(x=>`{ type: infer ${x}}`).join(', ') +
          '] ? [' +
          arr.map(x=>`ST2T<${x}>`).join(', ') +
          ']')
}
console.log(out.join("\n"))

*/

type VPropList2TupleType<PS extends VProp[]>
  = PS extends [{ type: infer T1 }, { type: infer T2 }, { type: infer T3 }, { type: infer T4 }, { type: infer T5 }, { type: infer T6 }, { type: infer T7 }, { type: infer T8 }, { type: infer T9 }, { type: infer T10 }] ? [ST2T<T1>, ST2T<T2>, ST2T<T3>, ST2T<T4>, ST2T<T5>, ST2T<T6>, ST2T<T7>, ST2T<T8>, ST2T<T9>, ST2T<T10>]
  : PS extends [{ type: infer T1 }, { type: infer T2 }, { type: infer T3 }, { type: infer T4 }, { type: infer T5 }, { type: infer T6 }, { type: infer T7 }, { type: infer T8 }, { type: infer T9 }] ? [ST2T<T1>, ST2T<T2>, ST2T<T3>, ST2T<T4>, ST2T<T5>, ST2T<T6>, ST2T<T7>, ST2T<T8>, ST2T<T9>]
  : PS extends [{ type: infer T1 }, { type: infer T2 }, { type: infer T3 }, { type: infer T4 }, { type: infer T5 }, { type: infer T6 }, { type: infer T7 }, { type: infer T8 }] ? [ST2T<T1>, ST2T<T2>, ST2T<T3>, ST2T<T4>, ST2T<T5>, ST2T<T6>, ST2T<T7>, ST2T<T8>]
  : PS extends [{ type: infer T1 }, { type: infer T2 }, { type: infer T3 }, { type: infer T4 }, { type: infer T5 }, { type: infer T6 }, { type: infer T7 }] ? [ST2T<T1>, ST2T<T2>, ST2T<T3>, ST2T<T4>, ST2T<T5>, ST2T<T6>, ST2T<T7>]
  : PS extends [{ type: infer T1 }, { type: infer T2 }, { type: infer T3 }, { type: infer T4 }, { type: infer T5 }, { type: infer T6 }] ? [ST2T<T1>, ST2T<T2>, ST2T<T3>, ST2T<T4>, ST2T<T5>, ST2T<T6>]
  : PS extends [{ type: infer T1 }, { type: infer T2 }, { type: infer T3 }, { type: infer T4 }, { type: infer T5 }] ? [ST2T<T1>, ST2T<T2>, ST2T<T3>, ST2T<T4>, ST2T<T5>]
  : PS extends [{ type: infer T1 }, { type: infer T2 }, { type: infer T3 }, { type: infer T4 }] ? [ST2T<T1>, ST2T<T2>, ST2T<T3>, ST2T<T4>]
  : PS extends [{ type: infer T1 }, { type: infer T2 }, { type: infer T3 }] ? [ST2T<T1>, ST2T<T2>, ST2T<T3>]
  : PS extends [{ type: infer T1 }, { type: infer T2 }] ? [ST2T<T1>, ST2T<T2>]
  : PS extends [{ type: infer T1 }] ? [ST2T<T1>]
  : PS extends { type: infer T1 }[] ? ST2T<T1>[] // extra situation
  : any[]

type VTupleAdditionalOptions = 'keep' | VProp | 'remove' | 'error'

/**
 * VTuple is a kind of VType, which describe a tuple (in js: an array with fixed length and pattern).
 * You may call `VTuple(...)` *without* `new` to create one VTuple instance.
 *
 * @example
 *
 *     const Point3 = VTuple({ type: Number }, { type: Number }, { type: Number })
 *     const Target = VTuple({
 *       name: { type: String },
 *       pos: { type: Point3 },
 *     })
 *
 *     const t1 = Target.vac({ name: "John", pos: [3.23, true, "8.65"] })
 *     // t1 => { name: "John", pos: [3.23, 1, 8.65] }
  */
class VTupleType<T extends any[]> extends VType<T>{
  constructor(public items: VProp[]) {
    super()
    this.setResultPrototype(Array.prototype)
  }

  additionalItems: VTupleAdditionalOptions = 'remove'

  setAdditionalItems(rule: VTupleAdditionalOptions): this {
    this.additionalItems = rule
    return this
  }

  vac(incoming: any, meta?: VPropMetas): T {
    const items = this.items
    const additional = this.additionalItems
    const context = getVACContext()

    if (context.stack.length == 0) {
      // handle root
      return context.operateRoot(this, meta, incoming)
    }

    if (!Array.isArray(incoming)) throw new Error("not an array thus can't be a tuple")

    let expectedLength = items.length
    if (incoming.length < expectedLength) throw new Error("tuple length is too short")

    let resultArray = incoming.slice(0) as T

    if (incoming.length > expectedLength) {
      if (additional === 'error') {
        throw new Error("tuple has additional items which is not acceptable")
      } else if (typeof additional === 'object') {
        // `additional` is VProp
        for (let idx = expectedLength; idx < resultArray.length; idx++) {
          context.operate(idx, additional, (itemType, vprop) => {
            return resultArray[idx] = itemType.vac(incoming[idx], vprop)
          })
        }
      } else if (additional === 'remove') {
        resultArray.splice(expectedLength) // remove additional items
      }
    }

    for (let idx = 0; idx < expectedLength; idx++) {
      context.operate(idx, items[idx], (itemType, vprop) => {
        return resultArray[idx] = itemType.vac(incoming[idx], vprop)
      })
    }

    return resultArray
  }
}


/**
 * create VType for an tuple
 *
 * @example
 *
 *     const Point3 = VTuple({ type: Number }, { type: Number }, { type: Number })
 *     const Target = VTuple({
 *       name: { type: String },
 *       pos: { type: Point3 },
 *     })
 *
 *     const t1 = Target.vac({ name: "John", pos: [3.23, true, "8.65"] })
 *     // t1 => { name: "John", pos: [3.23, 1, 8.65] }
 *
 * @remarks
 *
 * By default additional items are removed. This policy may be changed (see {@link setAdditionalItems})
 *
 * Change the policy like this:
 *
 * ```ts
 *     const Point2 = VTuple({ type: Number }, { type: Number })
 *     Point2.additionalItems = 'error'  // throw Error if get additional items
 * ```
 *
 * or use {@link setAdditionalItems} method, which allows you do Method Chaining like this:
 *
 * ```ts
 *     const Point2 = VTuple({ type: Number }, { type: Number }).setAdditionalItems('error')
 * ```
 */
function makeVTuple<PS extends VProp[]>(...items: PS): VTupleType<VPropList2TupleType<PS>> {
  return new VTupleType<VPropList2TupleType<PS>>(items)
}

namespace makeVTuple {
  export const prototype = VTupleType.prototype
}


type VTuple<T extends any[]> = VTupleType<T>
const VTuple = makeVTuple as (typeof VTupleType & typeof makeVTuple)

export default VTuple
