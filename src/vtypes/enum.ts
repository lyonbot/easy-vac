/**
 * This module provides a function that
 * creates an enum VType
 */

import { VType } from "../core";

type StringOrNumber = string | number

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
  public enumAliases: [EnumValue, StringOrNumber][]

  constructor(
    public enumItems: EnumValue[],
    enumAliases?: [EnumValue, StringOrNumber][]
  ) {
    super()
    this.enumAliases = enumAliases || []
    this.setResultPrototype(Object.getPrototypeOf(enumItems[0]))
  }

  vac(incoming: any): EnumValue {
    const enumItems = this.enumItems

    for (let i = 0; i < enumItems.length; i++) {
      let v = enumItems[i]
      if (v == incoming) return v
    }

    const enumAliases = this.enumAliases

    for (let i = 0; i < enumAliases.length; i++) {
      let kv = enumAliases[i]
      if (kv[1] == incoming) return kv[0]
    }

    // not found
    throw new Error("value is not defined in enum")
  }

  addAlias(key: EnumValue, alias: StringOrNumber): this {
    this.enumAliases.push([key, alias])
    return this
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
function makeVEnum<EnumType extends keyof Record<StringOrNumber, any>>(enumItems: EnumType[]): VEnumType<EnumType>

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
function makeVEnum<EnumType extends StringOrNumber>(enumItems: EnumType[]): VEnumType<EnumType>

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
  (enumDict: EnumDict): VEnumType<Extract<keyof EnumDict, StringOrNumber>>

function makeVEnum(arrOrDict: object): VEnumType<any> {
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

  return new VEnumType<any>(enumItems, enumAliases)
}

namespace makeVEnum {
  export const prototype = VEnumType.prototype
}

type VEnum<T extends StringOrNumber> = VEnumType<T>
const VEnum = makeVEnum as (typeof VEnumType & typeof makeVEnum)

export default VEnum
