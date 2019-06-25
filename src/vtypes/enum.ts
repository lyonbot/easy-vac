/**
 * This module provides a function that
 * creates an enum VType
 */

import { VType, VPropMetas } from "../core";
import getVACContext from "../vcontext";

type StringOrNumber = string | number

interface VEnumOptions {
  /**
   * `true`: use case insensitive string comparasion.
   * This will affect performance.
   *
   * The original value you defined while creating this `VEnum`, will be used as the output.
   */
  ignoreCase?: boolean

  /**
   * `true`: trim string spaces before comparing strings.
   * This will affect performance.
   *
   * The original value you defined while creating this `VEnum`, will be used as the output.
   */
  trim?: boolean
}

type VEnumAliasPair<EnumValue extends StringOrNumber> = [EnumValue, StringOrNumber];

/**
 * VEnum is a VType for enum constants (string or number).
 * To create one VEnum instance, you may call `VEnum` *without* `new`:
 *
 * @example
 *
 *     const UserRole = VEnum(['admin', 'staff', 'visitor'])
 *     const UserInfo = VObject({
 *       name: { type: String },
 *       role: { type: UserRole },
 *     })
 */
class VEnumType<EnumValue extends StringOrNumber> extends VType<EnumValue>{
  constructor(
    public enumItems: EnumValue[],
    public aliases: VEnumAliasPair<EnumValue>[] = [],
    public options: VEnumOptions = {}
  ) {
    super()
    this.setResultPrototype(Object.getPrototypeOf(enumItems[0]))
  }

  vac(incoming: any, meta?: VPropMetas): EnumValue {
    const context = getVACContext()

    // handle root
    if (context.stack.length == 0) return context.operateRoot(this, meta, incoming)


    const enumItems = this.enumItems
    const { ignoreCase, trim } = this.options

    function preproc(x: any) {
      if (typeof x === 'string') {
        if (ignoreCase) x = x.toLowerCase()
        if (trim) x = x.trim()
      }
      return x
    }

    incoming = preproc(incoming)

    for (let i = 0; i < enumItems.length; i++) {
      let v = enumItems[i]
      if (preproc(v) == incoming) return v
    }

    const enumAliases = this.aliases

    for (let i = 0; i < enumAliases.length; i++) {
      let kv = enumAliases[i]
      if (preproc(kv[1]) == incoming) return kv[0]
    }

    // not found
    throw new Error("value is not defined in enum")
  }

  /**
   * Make a copy of this VEnum, and use some new options
   */
  withOptions(opt: VEnumOptions): VEnumType<EnumValue> {
    return new VEnumType(
      this.enumItems.slice(),
      this.aliases.map(<T extends VEnumAliasPair<any>>(x: T) => x.slice() as T),
      { ...this.options, ...opt }
    )
  }
}

/**
 * VEnum is a VType for enum constants (string or number).
 * This function creates an VEnum from array
 *
 * @example
 *
 *     const UserRole = VEnum(['admin', 'staff', 'visitor'])
 *     const UserInfo = VObject({
 *       name: { type: String },
 *       role: { type: UserRole },
 *     })
 */
function makeVEnum<BogusDict extends any>(enumItems: (keyof BogusDict)[], options?: VEnumOptions)
  : VEnumType<StringOrNumber & keyof BogusDict>

/**
 * VEnum is a VType for enum constants (string or number).
 * This function creates an VEnum from array
 *
 * @example
 *
 *     const UserRole = VEnum(['admin', 'staff', 'visitor'])
 *     const UserInfo = VObject({
 *       name: { type: String },
 *       role: { type: UserRole },
 *     })
 */
function makeVEnum<EnumType extends StringOrNumber>(enumItems: EnumType[], options?: VEnumOptions)
  : VEnumType<EnumType>

/**
 * VEnum is a VType for enum constants (string or number).
 * This function creates an VEnum from a dictionary
 *
 * @example
 *
 *     const ComparatorOp = VEnum({
 *       lt: "Less Than",
 *       gt: "Greater Than",
 *       eq: ["Equal", "Equals"], // array of more aliases
 *     })
 *     const Card = VObject({
 *       op1: { type: ComparatorOp },
 *       op2: { type: ComparatorOp },
 *     })
 *
 * input:
 *
 *     const test = Card.vac({
 *       op1: "eq",         // value can be eq, lt or gt
 *       op2: "Less Than",  // or a known alias
 *     })
 *
 * result:
 *
 *     test.op1 === "eq"
 *     test.op2 === "lt"   // "Less Than" becomes "lt"
 */
function makeVEnum<EnumDict extends Record<StringOrNumber, StringOrNumber | Array<StringOrNumber>>>
  (enumDict: EnumDict, options?: VEnumOptions): VEnumType<Extract<keyof EnumDict, StringOrNumber>>

function makeVEnum(arrOrDict: object, options?: VEnumOptions): VEnumType<any> {
  let enumItems: any[]
  let enumAliases: [any, any][]

  if (Array.isArray(arrOrDict)) {
    enumItems = arrOrDict
  } else {
    enumItems = Object.keys(arrOrDict)
    enumAliases = []

    for (let i = 0; i < enumItems.length; i++) {
      const key = enumItems[i], value = arrOrDict[key]
      if (Array.isArray(value)) value.forEach(value => enumAliases.push([key, value]))
      else enumAliases.push([key, value])
    }
  }

  return new VEnumType<any>(enumItems, enumAliases, options)
}

namespace makeVEnum {
  export const prototype = VEnumType.prototype
}

type VEnum<T extends StringOrNumber> = VEnumType<T>
const VEnum = makeVEnum as (typeof VEnumType & typeof makeVEnum)

export default VEnum
