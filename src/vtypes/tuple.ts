/**
 * This module provides a function that
 * create VType for an tuple
 */

import { VType, ST2T, VProp, VPropMetas, SchemaType } from "../core";
import getVACContext from "../vcontext";

interface VTupleItemProp<ST extends SchemaType = SchemaType> extends VProp<ST> {
  /**
   * mark this tuple item as optional
   *
   * **WARNING**: If possible, please use `default` instead of `optional`
   *
   * 1. this flag can't be reflected on the inferred type info. (very dangerous!)
   * 2. if follow-up items have default values, this will make holes in the result array
   *
   */
  optional?: true

  /** mark this tuple item as optional, and set the default value */
  default?: ST2T<ST>
}

/* script that generate the VTuplePropList2TupleType mess

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

type VTuplePropList2TupleType<PS extends VTupleItemProp[]>
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


interface VTupleOptions {
  additionalItems?: 'remove' | 'keep' | VProp | 'error'
}

/**
 * VTuple is a kind of VType, which describe a tuple (in js: an array with fixed length and pattern).
 * You may call `VTuple(...)` *without* `new` to create one VTuple instance.
 *
 * @example
 *
 *     const Point3 = VTuple([{ type: Number }, { type: Number }, { type: Number }])
 *     const Target = VObject({
 *       name: { type: String },
 *       pos: { type: Point3 },
 *     })
 *
 *     const t1 = Target.vac({ name: "John", pos: [3.23, true, "8.65"] })
 *     // t1 => { name: "John", pos: [3.23, 1, 8.65] }
  */
class VTupleType<T extends any[]> extends VType<T>{
  /** minimal length */
  public length: number

  constructor(public items: VTupleItemProp[], public options: VTupleOptions) {
    super()
    this.setResultPrototype(Array.prototype)

    let len = 0
    for (; len < items.length; len++) {
      let it = items[len]
      if ('default' in it || it.optional) {
        for (let j = len + 1; j < items.length; j++) {
          let it = items[len]
          if (!('default' in it || it.optional)) {
            throw new Error(`Tuple item #${len} is optional, #${j} is required`)
          }
        }
        break
      }
    }
    this.length = len
  }

  /**
   * Create a copy of this VTuple, and apply some new options
   */
  withOptions(options: VTupleOptions): VTupleType<T> {
    return new VTupleType(this.items.slice(), { ...this.options, ...options })
  }

  vac(incoming: any, meta?: VPropMetas): T {
    const items = this.items
    const { additionalItems: additional } = this.options
    const context = getVACContext()

    if (context.stack.length == 0) {
      // handle root
      return context.operateRoot(this, meta, incoming)
    }

    if (!Array.isArray(incoming)) throw new Error("not an array thus can't be a tuple")

    if (incoming.length < this.length) throw new Error("tuple length is too short")

    let resultArray = incoming.slice(0) as T

    let maxLength = items.length
    if (incoming.length > maxLength) {
      if (additional === 'error') {
        throw new Error("tuple has additional items which is not acceptable")
      } else if (typeof additional === 'object') {
        // `additional` is VProp
        for (let idx = maxLength; idx < resultArray.length; idx++) {
          context.operate(idx, additional, (itemType, vprop) => {
            return resultArray[idx] = itemType.vac(incoming[idx], vprop)
          })
        }
      } else if (additional === 'keep') {
        // just keep
      } else {
        // default is "remove"
        resultArray.splice(maxLength) // remove additional items
      }
    }

    let procLength = Math.min(resultArray.length, maxLength)
    for (let idx = 0; idx < procLength; idx++) {
      context.operate(idx, items[idx], (itemType, vprop) => {
        return resultArray[idx] = itemType.vac(incoming[idx], vprop)
      })
    }
    for (let idx = procLength; idx < maxLength; idx++) {
      let X = items[idx]
      if ('default' in X) resultArray[idx] = X.default
    }

    return resultArray
  }
}


/**
 * create VType for an tuple
 *
 * @example
 *
 *     const Point3d = VTuple([{ type: Number }, { type: Number }, { type: Number }])
 *     const t1 = Point3d.vac([3.23, true, "8.65"])
 *     // t1 == [3.23, 1, 8.65]
 *
 *     // if this VTuple has no options, the square brackets may be omitted:
 *     const Point3i = VTuple({ type: "int" }, { type: "int" }, { type: "int" })
 *     const t2 = Point3d.vac([3.23, true, "8.65"])
 *     // t2 == [3, 1, 8]
 *
 * @remarks
 *
 * By default additional items are removed. This policy may be changed
 *
 * Change the policy like this:
 *
 * ```ts
 *     const Point2 = VTuple(
 *        [{ type: Number }, { type: Number }],
 *        { additionalItems: 'error' }   // throw Error if get additional items
 *     )
 * ```
 *
 * or use {@link withOptions} method, which create a copy of current VType, then apply new options
 *
 * ```ts
 *     const Point2 = VTuple([{ type: Number }, { type: Number }]).withOptions({ additionalItems: 'error'})
 * ```
 */


/* script that generate the makeVTuple mess

var out = []
for (let j=10; j>=1; j--) {
  var arr = []
  for (let i=1; i<=j; i++) {
    arr.push(`T${i}`)
  }
  out.push('function makeVTuple<' +
          arr.join(', ') +
          '>(items: [' +
          arr.map(x=>`VTupleItemProp<${x}>`).join(', ') +
          '], options?: VTupleOptions): VTupleType<[' +
          arr.map(x=>`ST2T<${x}>`).join(', ') +
          ']')
}
console.log(out.join("\n"))

*/
function makeVTuple<T1 extends SchemaType, T2 extends SchemaType, T3 extends SchemaType, T4 extends SchemaType, T5 extends SchemaType, T6 extends SchemaType, T7 extends SchemaType, T8 extends SchemaType, T9 extends SchemaType, T10 extends SchemaType>(items: [VTupleItemProp<T1>, VTupleItemProp<T2>, VTupleItemProp<T3>, VTupleItemProp<T4>, VTupleItemProp<T5>, VTupleItemProp<T6>, VTupleItemProp<T7>, VTupleItemProp<T8>, VTupleItemProp<T9>, VTupleItemProp<T10>], options?: VTupleOptions): VTupleType<[ST2T<T1>, ST2T<T2>, ST2T<T3>, ST2T<T4>, ST2T<T5>, ST2T<T6>, ST2T<T7>, ST2T<T8>, ST2T<T9>, ST2T<T10>]>;
function makeVTuple<T1 extends SchemaType, T2 extends SchemaType, T3 extends SchemaType, T4 extends SchemaType, T5 extends SchemaType, T6 extends SchemaType, T7 extends SchemaType, T8 extends SchemaType, T9 extends SchemaType>(items: [VTupleItemProp<T1>, VTupleItemProp<T2>, VTupleItemProp<T3>, VTupleItemProp<T4>, VTupleItemProp<T5>, VTupleItemProp<T6>, VTupleItemProp<T7>, VTupleItemProp<T8>, VTupleItemProp<T9>], options?: VTupleOptions): VTupleType<[ST2T<T1>, ST2T<T2>, ST2T<T3>, ST2T<T4>, ST2T<T5>, ST2T<T6>, ST2T<T7>, ST2T<T8>, ST2T<T9>]>;
function makeVTuple<T1 extends SchemaType, T2 extends SchemaType, T3 extends SchemaType, T4 extends SchemaType, T5 extends SchemaType, T6 extends SchemaType, T7 extends SchemaType, T8 extends SchemaType>(items: [VTupleItemProp<T1>, VTupleItemProp<T2>, VTupleItemProp<T3>, VTupleItemProp<T4>, VTupleItemProp<T5>, VTupleItemProp<T6>, VTupleItemProp<T7>, VTupleItemProp<T8>], options?: VTupleOptions): VTupleType<[ST2T<T1>, ST2T<T2>, ST2T<T3>, ST2T<T4>, ST2T<T5>, ST2T<T6>, ST2T<T7>, ST2T<T8>]>;
function makeVTuple<T1 extends SchemaType, T2 extends SchemaType, T3 extends SchemaType, T4 extends SchemaType, T5 extends SchemaType, T6 extends SchemaType, T7 extends SchemaType>(items: [VTupleItemProp<T1>, VTupleItemProp<T2>, VTupleItemProp<T3>, VTupleItemProp<T4>, VTupleItemProp<T5>, VTupleItemProp<T6>, VTupleItemProp<T7>], options?: VTupleOptions): VTupleType<[ST2T<T1>, ST2T<T2>, ST2T<T3>, ST2T<T4>, ST2T<T5>, ST2T<T6>, ST2T<T7>]>;
function makeVTuple<T1 extends SchemaType, T2 extends SchemaType, T3 extends SchemaType, T4 extends SchemaType, T5 extends SchemaType, T6 extends SchemaType>(items: [VTupleItemProp<T1>, VTupleItemProp<T2>, VTupleItemProp<T3>, VTupleItemProp<T4>, VTupleItemProp<T5>, VTupleItemProp<T6>], options?: VTupleOptions): VTupleType<[ST2T<T1>, ST2T<T2>, ST2T<T3>, ST2T<T4>, ST2T<T5>, ST2T<T6>]>;
function makeVTuple<T1 extends SchemaType, T2 extends SchemaType, T3 extends SchemaType, T4 extends SchemaType, T5 extends SchemaType>(items: [VTupleItemProp<T1>, VTupleItemProp<T2>, VTupleItemProp<T3>, VTupleItemProp<T4>, VTupleItemProp<T5>], options?: VTupleOptions): VTupleType<[ST2T<T1>, ST2T<T2>, ST2T<T3>, ST2T<T4>, ST2T<T5>]>;
function makeVTuple<T1 extends SchemaType, T2 extends SchemaType, T3 extends SchemaType, T4 extends SchemaType>(items: [VTupleItemProp<T1>, VTupleItemProp<T2>, VTupleItemProp<T3>, VTupleItemProp<T4>], options?: VTupleOptions): VTupleType<[ST2T<T1>, ST2T<T2>, ST2T<T3>, ST2T<T4>]>;
function makeVTuple<T1 extends SchemaType, T2 extends SchemaType, T3 extends SchemaType>(items: [VTupleItemProp<T1>, VTupleItemProp<T2>, VTupleItemProp<T3>], options?: VTupleOptions): VTupleType<[ST2T<T1>, ST2T<T2>, ST2T<T3>]>;
function makeVTuple<T1 extends SchemaType, T2 extends SchemaType>(items: [VTupleItemProp<T1>, VTupleItemProp<T2>], options?: VTupleOptions): VTupleType<[ST2T<T1>, ST2T<T2>]>;
function makeVTuple<T1 extends SchemaType>(items: [VTupleItemProp<T1>], options?: VTupleOptions): VTupleType<[ST2T<T1>]>;

function makeVTuple<PS extends VTupleItemProp[]>(...items: PS): VTupleType<VTuplePropList2TupleType<PS>>;

function makeVTuple(items: VTupleItemProp[], options?: VTupleOptions): VTupleType<any[]> {
  if (!Array.isArray(items)) { items = [].slice.call(arguments); options = {} }
  return new VTupleType<any[]>(items, options || {})
}

namespace makeVTuple {
  export const prototype = VTupleType.prototype
}


type VTuple<T extends any[]> = VTupleType<T>
const VTuple = makeVTuple as (typeof VTupleType & typeof makeVTuple)

export default VTuple
