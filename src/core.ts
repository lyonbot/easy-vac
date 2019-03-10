import { translate, R } from "./i18n";

const LOG_PREFIX_TAG = "[easy-vac] "
const S_VACInfo = Symbol("VACInfo")
const S_ErrorInfo = Symbol("VACErrors")

export type ConstructorOf<T=any> = new (...x: any[]) => T
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

export interface FieldInfo {
  key: string
  label: string
  type: any
  required: boolean
  fns: (ValidateAndCleanFunction | "isArrayOf-check")[]
  assertFns: Array<[(value: any, field: FieldInfo) => boolean, string | ((field: FieldInfo) => string)]>
  missingMessage?: string

  enum?: { value: PrimitiveType, label: string }[]

  isArrayOf?: "enum" | VACDataConstructor | PrimitiveConstructor | ConstructorOf<any> | ((value: any) => boolean)
  isArrayOf_options?: IsArrayOfOptions
}


export type FillDataOption = {
  /** adding prefix to "label" of error messages */
  labelPrefix?: string

  /** adding prefix to "key" of error messages */
  keyPrefix?: string

  /** do not output info to console.error() */
  silent?: boolean
}


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

  addAssertion(key: string, fn: (value: any, field: FieldInfo) => boolean, errmsg?: string | ((field: FieldInfo) => string)) {
    this.getFieldInfo(key).assertFns.push([fn, errmsg])
  }

  populate(dst, incoming, popt: FillDataOption = {}) {
    const errors: ErrorInfo[] = []

    const {
      labelPrefix = "",
      keyPrefix = "",
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

            newData = newData.slice()

            const elementType = info.isArrayOf
            const options = info.isArrayOf_options

            if (options.unique) {
              newData = newData.filter((v, i, a) => a.indexOf(v) === i)
            }

            if ('minLength' in options && newData.length < options.minLength) {
              pushError(key, translate(R.LENGTH_TOO_SHORT, label, options.minLength, newData.length))
              continue iter_each_field
            }

            if ('maxLength' in options && newData.length > options.maxLength) {
              pushError(key, translate(R.LENGTH_TOO_LONG, label, options.maxLength, newData.length))
              continue iter_each_field
            }

            if (registeredFieldTypes.has(elementType)) { // Array of a class that is registered by registerFieldType
              const fieldTypeFactory = registeredFieldTypes.get(elementType)

              for (let i = 0; i < newData.length; i++) {
                try {
                  newData[i] = fieldTypeFactory(newData[i])
                } catch (err) {
                  if (!popt.silent) {
                    console.error(LOG_PREFIX_TAG + `FieldTypeFactory at ${keyPrefix}${key}[${i}] with incoming value `, newData[i])
                    console.error(err)
                  }
                  pushError(key, translate(R.FIELD_TYPE_FACTORY_FAILED, label))
                }
              }
            } else if (Object.getPrototypeOf(elementType) === VACData) { // Array of [[VACData]]
              for (let i = 0; i < newData.length; i++) {
                const subPopt: FillDataOption = {
                  ...popt,
                  keyPrefix: keyPrefix + key + `[${i}].`,
                  labelPrefix: labelPrefix + label + `->[${i}]->`,
                }
                let item = new (elementType as VACDataConstructor)().fillDataWith(newData[i], subPopt)
                if (item.hasErrors()) {
                  pushError(key, translate(R.HAS_BAD_ELEMENT_AT, label, i))
                  errors.push(...item.getErrors())
                  continue iter_each_field
                }
                newData[i] = item
              }
            } else { // Array of enum, or primitive, or {{custom rule}}

              const isGoodElement: (v: any) => boolean =
                elementType === String ? (v => typeof v === 'string') :
                  elementType === Boolean ? (v => typeof v === 'boolean') :
                    elementType === Number ? (v => typeof v === 'number') :
                      elementType === "enum" ? (v => info.enum.some(it => it.value === v)) :
                        elementType as (v: any) => boolean

              for (let i = 0; i < newData.length; i++) {
                if (!isGoodElement(newData[i])) {
                  pushError(key, translate(R.HAS_BAD_ELEMENT_AT, label, i))
                  continue iter_each_field
                }
              }
            }
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
      } else if (type === String) {
        // newData shall be a string
        if (newData instanceof String) dst[key] = newData.toString()
        else if (typeof newData === 'string') dst[key] = newData
        else pushError(key, translate(R.MUST_BE_STRING, label))
      } else if (type === Number) {
        // newData shall be a number
        if (newData instanceof Number) dst[key] = newData.valueOf()
        else if (typeof newData === 'number') dst[key] = newData
        else pushError(key, translate(R.MUST_BE_NUMBER, label))
      } else if (type === Boolean) {
        // newData shall be a boolean
        if (newData instanceof Boolean) dst[key] = newData.valueOf()
        else if (typeof newData === 'boolean') dst[key] = newData
        else pushError(key, translate(R.MUST_BE_BOOLEAN, label))
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
          labelPrefix: labelPrefix + label + "->",
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
            const msg = typeof assertMsg === 'function' ? assertMsg(info) : (assertMsg || translate(R.CUSTOM_ASSERT_FAILED, label))
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

export function getVACInfoOf(prototype: any) {
  let ans = prototype[S_VACInfo] as VACInfo
  if (!ans) ans = prototype[S_VACInfo] = new VACInfo()
  return ans
}

export abstract class VACData {
  [S_ErrorInfo]?: ErrorInfo[]

  fromJSON(json: string | object): this {
    if (typeof json === 'string') json = JSON.parse(json)
    return this.fillDataWith(json)
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
