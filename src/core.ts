import { translate, R } from "./i18n";

const LOG_PREFIX_TAG = "[easy-vac] "
const S_VACInfo = Symbol("VACInfo")
const S_ErrorInfo = Symbol("VACErrors")

export type ConstructorOf<T> = new (...x: any[]) => T
export type PrimitiveType = string | boolean | number
export type PrimitiveConstructor = typeof String | typeof Number | typeof Boolean
export function isPrimitiveConstructor(o: any): o is PrimitiveConstructor {
  return o === String || o === Boolean || o === Number
}
export function isPrimitive(value: any): value is PrimitiveType {
  return (typeof value !== 'object' && typeof value !== 'function') || value === null
}
export function isArray(value: any): value is any[] {
  return Object.prototype.toString.call(value) === '[object Array]'
}


const registeredFieldTypes = new Map<any, (incomingValue: any) => any>([
  // by Default, Date and Buffer are valid field type
  [Date, (v: any) => new Date(v)],
  [typeof Buffer != 'undefined' && Buffer, (v: any) => new Buffer(v)],
])
export function registerFieldType<T extends ConstructorOf<any>>(s: T, factoryFn?: (incomingValue: any) => InstanceType<T>): void {
  registeredFieldTypes.set(s, typeof factoryFn === 'function' ? factoryFn : (v => new s(v)))
}

export type ErrorInfo = { key: string, message: string, [k: string]: any }

//#region VACDataType

export type VACDataType<T> =
  T extends object ? { [k in VDT_GoodFieldKeys<T>]: VDT_P2<T[k], k> } :
  T

// This version results clean type (no field with never type)
// But it ruins optional fields

type VDT_P1<T, K> =
  K extends symbol ? never :
  T extends (...args: any[]) => any ? never :
  K

type VDT_GoodFieldKeys<T> = ({ [P in keyof T]: VDT_P1<T[P], P> })[keyof T];

type VDT_P2<T, k> =
  T extends (infer U)[] ? VACDataType<U>[] :
  T extends VACData ? VACDataType<T> :
  T

//#endregion

export type VACDataConstructor = new () => VACData

export type ValidateAndCleanFunction<T=any> = (incomingValue: any, filedInfo: FieldInfo, fillDataOption: FillDataOption) => T | void

export type IsArrayOfOptions = {
  minLength?: number
  maxLength?: number
  /** Will remove duplicated items if set to true */
  unique?: boolean
}

export type IsArrayOf_CustomAssert<T=any> = (value: T) => boolean

export interface FieldInfo {
  key: string
  label: string
  type: ConstructorOf<any> | "enum"
  required: boolean
  fns: (ValidateAndCleanFunction | "isArrayOf-check")[]
  assertFns: Array<[(value: any, field: FieldInfo) => boolean, string | ((field: FieldInfo, value: any) => string)]>
  missingMessage?: string

  enum?: { value: PrimitiveType, label: string }[]

  isArrayOf?: "enum" | VACDataConstructor | PrimitiveConstructor | ConstructorOf<any> | IsArrayOf_CustomAssert
  isArrayOf_options?: IsArrayOfOptions

  /** defined by `@Min` */
  min?: number

  /** defined by `@Max` */
  max?: number

  /** defined by `@IsEmail` */
  isEmail?: boolean

  /** defined by `@MinLength` */
  minLength?: number

  /** defined by `@MaxLength` */
  maxLength?: number
}


export type FillDataOption = {
  /** adding prefix to "label" of error messages */
  labelPrefix?: string

  /** adding prefix to "key" of error messages */
  keyPrefix?: string

  /** do not output info to console.error() */
  silent?: boolean

  /** 
   * convert primitive to another primitive while filling fields that only accepts primitive:
   * 
   * | Received `val` | to string field  | to number field   | to boolean field |
   * |:--------------:|:-----------------|:------------------|:-----------------|
   * |  string        | as-is            | `parseFloat(val)` | `!!val`          |
   * |  number        | `"" + val`       | as-is             | `!!val`          |
   * |  boolean       | `"" + val`       | `val ? 1 : 0`     | as-is            |
   */
  loose?: boolean
}

/**
 * The container for `FieldInfo`s
 */
export class VACInfo {
  fields: Record<string, FieldInfo> = Object.create(null)

  getFieldInfo(key: string) {
    if (!(key in this.fields)) this.fields[key] = {
      key,
      label: key,
      type: null,
      required: false,
      fns: [],
      assertFns: [],
    }
    return this.fields[key]
  }

  addVACFunc(key: string, fn: FieldInfo['fns'][0]) {
    this.getFieldInfo(key).fns.unshift(fn)
  }

  addAssertion(key: string, fn: (value: any, field: FieldInfo) => boolean, errmsg?: string | ((field: FieldInfo, value: any) => string)) {
    this.getFieldInfo(key).assertFns.push([fn, errmsg])
  }

  populate(dst, incoming, popt: FillDataOption = {}) {
    const errors: ErrorInfo[] = []

    const {
      labelPrefix = "",
      keyPrefix = "",
      loose = false,
    } = popt

    function pushError(key: string, message: string | any) {
      let info: ErrorInfo = {
        ... (typeof message === 'string' ? { message } : message),
        key: keyPrefix + key
      }
      errors.push(info)
      if (!popt.silent) {
        console.error(LOG_PREFIX_TAG + "failed for " + keyPrefix + key, info)
      }
    }

    class PrimitiveConvertError { constructor(public msgId: R) { } }

    function primitiveConvert(val: any, type: PrimitiveConstructor): PrimitiveConvertError | PrimitiveType {
      if (type === String) {
        // newData shall be a string
        if (val instanceof String) return val.toString()
        else if (typeof val === 'string') return val
        else if (loose && isPrimitive(val)) return "" + val
        else return new PrimitiveConvertError(R.MUST_BE_STRING)
      } else if (type === Number) {
        // newData shall be a number
        if (val instanceof Number) return val.valueOf()
        else if (typeof val === 'number') return val
        else if (loose && typeof val === "string") return parseFloat(val)
        else if (loose && typeof val === "boolean") return val ? 1 : 0
        else return new PrimitiveConvertError(R.MUST_BE_NUMBER)
      } else if (type === Boolean) {
        // newData shall be a boolean
        if (val instanceof Boolean) return val.valueOf()
        else if (typeof val === 'boolean') return val
        else if (loose && typeof val === "string") return !!val
        else if (loose && typeof val === "number") return !!val
        else return new PrimitiveConvertError(R.MUST_BE_BOOLEAN)
      }
    }

    // Check Types and Fill data

    iter_each_field:
    for (const key in this.fields) {
      const info = this.fields[key]
      const { type } = info
      const label = labelPrefix + info.label

      // Check if it's required.

      if (!(key in incoming)) {
        if (info.required) pushError(key, info.missingMessage || translate(R.IS_REQUIRED, label))
        continue
      }

      let newData = incoming[key]

      // Run all ValidateAndCleanFunction

      for (const fn of info.fns) {
        try {
          if (fn === 'isArrayOf-check') { // Array Check
            // if (info.type === Array && info.isArrayOf) ... this will never happen unless the programmer is a monkey

            if (!isArray(newData)) {
              pushError(key, translate(R.MUST_BE_ARRAY, label))
              continue iter_each_field
            }

            let array = newData.slice()

            const elementType = info.isArrayOf
            const options = info.isArrayOf_options

            if (options.unique) {
              array = array.filter((v, i, a) => a.indexOf(v) === i)
            }

            if ('minLength' in options && array.length < options.minLength) {
              pushError(key, translate(R.LENGTH_TOO_SHORT, label, options.minLength, array.length))
              continue iter_each_field
            }

            if ('maxLength' in options && array.length > options.maxLength) {
              pushError(key, translate(R.LENGTH_TOO_LONG, label, options.maxLength, array.length))
              continue iter_each_field
            }

            if (registeredFieldTypes.has(elementType)) { // Array of a class that is registered by registerFieldType
              const fieldTypeFactory = registeredFieldTypes.get(elementType)

              for (let i = 0; i < array.length; i++) {
                try {
                  array[i] = fieldTypeFactory(array[i])
                } catch (err) {
                  if (!popt.silent) {
                    console.error(LOG_PREFIX_TAG + `FieldTypeFactory at ${keyPrefix}${key}[${i}] with incoming value `, array[i])
                    console.error(err)
                  }
                  const errmsg: string = ("" + err)
                  pushError(key, translate(R.FIELD_TYPE_FACTORY_FAILED, `${label}[${i}]`))
                  pushError(`${key}[${i}]`, errmsg)
                }
              }
            } else if (Object.getPrototypeOf(elementType) === VACData) { // Array of [[VACData]]
              for (let i = 0; i < array.length; i++) {
                const subPopt: FillDataOption = {
                  ...popt,
                  keyPrefix: keyPrefix + key + `[${i}].`,
                  labelPrefix: label + `->[${i}]->`,
                }
                let item = new (elementType as VACDataConstructor)().fillDataWith(array[i], subPopt)
                if (item.hasErrors()) {
                  pushError(key, translate(R.HAS_BAD_ELEMENT_AT, label, i))
                  errors.push(...item.getErrors())
                  continue iter_each_field
                }
                array[i] = item
              }
            } else { // Array of enum, or primitive, or {{custom rule}}
              let handleElement: (val: any, idx: number) => boolean

              if (isPrimitiveConstructor(elementType)) {
                handleElement = (val, i) => {
                  const cvtValue = primitiveConvert(val, elementType)
                  if (cvtValue instanceof PrimitiveConvertError) {
                    pushError(key, translate(R.HAS_BAD_ELEMENT_AT, label, i))
                    pushError(`${key}[${i}]`, translate(cvtValue.msgId, `${label}[${i}]`))
                    return false
                  }
                  array[i] = cvtValue
                  return true
                }
              } else if (elementType === "enum") {
                const enumOptions = info.enum
                handleElement = (val, i) => {
                  if (isGoodEnumValue(enumOptions, val, loose, correct_val => void (array[i] = correct_val))) return true

                  pushError(key, translate(R.HAS_BAD_ELEMENT_AT, label, i))
                  pushError(`${key}[${i}]`, translate(R.HAS_WRONG_VALUE, `${label}[${i}]`))
                  return false
                }
              } else { // {{custom rule}}
                const isGoodElement = elementType as IsArrayOf_CustomAssert
                handleElement = (val, i) => {
                  try {
                    if (!isGoodElement(val)) throw translate(R.HAS_WRONG_VALUE, `${label}[${i}]`)
                    return true
                  } catch (err) {
                    const errmsg: string = ("" + err)
                    pushError(key, translate(R.HAS_BAD_ELEMENT_AT, label, i))
                    pushError(`${key}[${i}]`, errmsg)
                    return false
                  }
                }
              }

              // VaC every element until one of them failed
              if (!array.every(handleElement)) continue iter_each_field
            }

            // finally the array may be modified
            newData = array
          } else { // Regular ValidateAndCleanFunction
            const val = fn(newData, info, popt)
            if (typeof val !== 'undefined') newData = val
          }
        } catch (err) {
          pushError(key, err)
          continue iter_each_field
        }
      }

      // Type check and conversion

      if (!type) {
        // No type info. Just use the value
        dst[key] = newData
      } else if (type === "enum") {
        // IsOneOf
        if (!info.enum || !isGoodEnumValue(info.enum, newData, loose, correct_val => void (newData = correct_val))) {
          pushError(key, translate(R.HAS_WRONG_VALUE, label))
          continue iter_each_field
        }
        dst[key] = newData
      } else if (isPrimitiveConstructor(type)) {
        // newData shall be a primitive
        const cvtValue = primitiveConvert(newData, type)
        if (cvtValue instanceof PrimitiveConvertError) {
          pushError(key, translate(cvtValue.msgId, label))
        } else {
          dst[key] = cvtValue
        }
      } else if (type !== Object && newData instanceof type) {
        // newData maybe already processed by a ValidateAndCleanFunction
        if (type === Array && !info.isArrayOf) {
          pushError(key, "@IsArrayOf is missing, see https://github.com/lyonbot/easy-vac/wiki/Field-Types")
        } else {
          dst[key] = newData
        }
      } else if (registeredFieldTypes.has(type)) {
        // type of newData needs instantialize
        try {
          const fieldTypeFactory = registeredFieldTypes.get(type)
          dst[key] = fieldTypeFactory(newData)
        } catch (err) {
          if (!popt.silent) {
            console.error(LOG_PREFIX_TAG + "FieldTypeFactory failed at " + keyPrefix + key + " with incoming value ", newData)
            console.error(err)
          }
          pushError(key, translate(R.FIELD_TYPE_FACTORY_FAILED, label))
        }
      } else if (Object.getPrototypeOf(type) === VACData) {
        // nested Form
        let nestedData: VACData = new type()
        nestedData.fillDataWith(newData, {
          ...popt,
          keyPrefix: keyPrefix + key + ".",
          labelPrefix: label + "->",
        })

        if (nestedData.hasErrors()) {
          errors.push(...nestedData.getErrors())
        } else {
          dst[key] = nestedData
        }
      } else {
        // Unknown type
        pushError(key, translate(R.INTERNAL_UNKNOWN_TYPE, label))
      }

      // Final Assrtion

      for (const [assertFn, assertMsg] of info.assertFns) {
        try {
          if (!assertFn(dst[key], info)) {
            const msg = typeof assertMsg === 'function' ? assertMsg(info, dst[key]) : (assertMsg || translate(R.CUSTOM_ASSERT_FAILED, label))
            throw msg
          }
        } catch (err) {
          pushError(key, err)
          continue iter_each_field
        }
      }
    }

    // update error status

    dst[S_ErrorInfo] = errors
    if (errors.length == 0) delete dst[S_ErrorInfo]
  }
}

function isGoodEnumValue(enumOptions: FieldInfo['enum'], value_incoming: any, loose?: boolean, applyLooseFix?: (correct_value: any) => void): boolean {
  if (!loose) return enumOptions.some(it => it.value === value_incoming);

  // loose check

  return enumOptions.some(({ value }) => {
    if (value_incoming == value) {
      if (typeof value_incoming !== typeof value) applyLooseFix(value); // # type sync
      return true;
    }
    else if (typeof value === 'boolean' && value === !!value_incoming) {
      applyLooseFix(value); // # type sync -- boolean
      return true;
    }
    else {
      return false;
    }
  })
}

export function getVACInfoOf(prototype: Object): VACInfo {
  if (typeof prototype !== 'object' || prototype === null) return null
  if (prototype.hasOwnProperty(S_VACInfo)) return prototype[S_VACInfo] as VACInfo
  else return prototype[S_VACInfo] = new VACInfo()
}

/**
 * The basic class of your Schemas.
 * 
 * @example
 * ```
 *   class MyForm extends VACData {
 *     @Required(String) name;
 *     @Optional(Number) age = 18;
 *   }
 * ```
 */
export abstract class VACData {
  [S_ErrorInfo]?: ErrorInfo[]

  fromJSON(json: string | object, options?: FillDataOption): this {
    if (typeof json === 'string') json = JSON.parse(json)
    return this.fillDataWith(json, options)
  }

  toJSON(): VACDataType<this> {
    const vinfo = getVACInfoOf(Object.getPrototypeOf(this))
    const result: any = {}
    for (const key in vinfo.fields) {
      let v = this[key]
      if (v instanceof VACData) v = v.toJSON()
      else if (v instanceof Array && v[0] instanceof VACData) v = v.map(it => it.toJSON())
      if (typeof v === 'undefined') continue
      result[key] = v
    }
    return result
  }

  fillDataWith(object: any, options?: FillDataOption): this {
    var vinfo = getVACInfoOf(Object.getPrototypeOf(this))
    vinfo.populate(this, object, options)
    return this
  }

  hasErrors(): boolean {
    return S_ErrorInfo in this
  }

  getErrors(): ErrorInfo[] {
    return this[S_ErrorInfo]
  }
}
