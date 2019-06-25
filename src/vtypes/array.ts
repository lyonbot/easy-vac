/**
 * This module provides a function that
 * create VType for an array whose elements has the same type
 */

import { VType, ST2T, SchemaType, VProp, VPropMetas } from "../core";
import getVACContext from "../vcontext";

export interface VArrayOptions<ST extends SchemaType> {
  /** type of array elements */
  items: VProp<ST>

  minItems?: number
  maxItems?: number

  /**
   * - false: whatever
   * - true: remove duplicated items *after* VaC-ing each item, *before* checkings array length
   * - 'validate': throw an Error if find duplicated items.
   *
   * using JavaScript `indexOf` to compare
   */
  uniqueItems?: boolean | 'validate'

  /**
   * if the input value `X` is not an array:
   *
   * - `false`: throw an Error. (default)
   * - `true` : turn it into an array `[X]` and continue VaC-ing. (this could be dangerous)
   */
  ambiguousSingle?: boolean
}

class VArrayType<T> extends VType<T[]>{
  options: VArrayOptions<any>

  constructor(options: VArrayOptions<any>) {
    super()
    this.options = options
    this.setResultPrototype(Array.prototype)
  }

  vac(incoming: any, meta?: VPropMetas): T[] {
    const context = getVACContext()
    const opt = this.options

    if (context.stack.length == 0) {
      // handle root
      return context.operateRoot<T[]>(this, meta, incoming)
    }

    let incomingArray = incoming as any[]
    if (!Array.isArray(incoming)) {
      if (opt.ambiguousSingle) incomingArray = typeof incoming !== 'undefined' ? [incoming] : []
      else throw new Error("not an array")
    }

    let resultArray = new Array<T>(incomingArray.length)
    incomingArray.forEach((item, idx) => {
      context.operate<T>(idx, opt.items, (elementVtype, meta) => {
        return resultArray[idx] = elementVtype.vac(item, meta)
      })
      // return elementVType.vac(item)
    })

    if (context.errors.length) {
      // items has error. no need to continue checking
      return resultArray
    }

    if (opt.uniqueItems) {
      let deduped = resultArray.filter((x, i) => resultArray.indexOf(x) === i)
      if (deduped.length < resultArray.length) {
        if (opt.uniqueItems === 'validate') throw new Error("has duplicated items")
        else resultArray = deduped
      }
    }

    if ('minItems' in opt && resultArray.length < opt.minItems) throw new Error("array length is too short")
    if ('maxItems' in opt && resultArray.length > opt.maxItems) throw new Error("array length is too long")

    return resultArray
  }
}


/** create VType for an array whose elements has the same type */
function makeVArray<ST extends SchemaType>(opt: VArrayOptions<ST>): VArrayType<ST2T<ST>> {
  return new VArrayType<ST2T<ST>>(opt)
}

namespace makeVArray {
  export const prototype = VArrayType.prototype
}


type VArray<T> = VArrayType<T>
const VArray = makeVArray as (typeof VArrayType & typeof makeVArray)

export default VArray
