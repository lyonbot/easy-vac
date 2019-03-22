import { translate, R } from "./i18n";
import { ConstructorOf, PrimitiveType, VACDataType, isArray } from './util';
import { VACErrorInfo } from './error';
import { getTypeDescriptor } from './value-type/registry';

const LOG_PREFIX_TAG = "[easy-vac] "
const S_VACInfo = Symbol("VACInfo")
const S_ErrorInfo = Symbol("VACErrors")

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
  type: ConstructorOf<any> | "enum"
  required: boolean
  fns: ValidateAndCleanFunction[]
  assertFns: Array<[(value: any, field: FieldInfo) => boolean, string | ((field: FieldInfo, value: any) => string)]>
  missingMessage?: string

  enum?: { value: PrimitiveType, label: string }[]

  isArrayOf?: ConstructorOf<any> | "enum"
  isArrayOf_options?: IsArrayOfOptions

  /** defined by `@Min` */
  min?: number

  /** defined by `@Max` */
  max?: number

  /** defined by `@IsEmail` */
  isEmail?: boolean

  /** defined by `@IsInt` */
  isInt?: boolean

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
   * if incoming value `val` has incorrect type, try to convert it.
   * 
   * eg:
   * 
   * - string field: 
   *   - val is number or boolean --> `"" + val`
   * - number field:
   *   - val is boolean --> `val ? 1 : 0`
   *   - val is string --> `parseFloat(val)` and result can't be NaN
   * - boolean field:
   *   - val is number --> `!!val`
   *   - val is string:
   *     - (case insenstive) "false", "no", "n"  --> `false`
   *     - (case insenstive) "true", "yes", "y"  --> `true`
   *     - (empty string)  --> `false`
   *     - (other patterns) --> `true`
   * - Date field:
   *   - val is a string _that contains only digits_ --> `new Date(parseInt(val))` and result can't be `invalid Date`
   *   - val is number or string --> `new Date(val)` and result can't be `invalid Date`
   * - Array field:
   *   - val is a string --> `val.split(',')` then do recrusive array checking
   *   - val is an array --> do recrusive array checking
   *   - (more info can be found in `@IsArrayOf` decorator's doc)
   * 
   * as for other types, see https://github.com/lyonbot/easy-vac/wiki/Field-Types
   */
  loose?: boolean

  /**
   * alias of `!loose`
   * 
   * if is provided, this overrides `loose` with negative boolean value
   */
  strict?: boolean
}

const defaultFillDataOption: Required<FillDataOption> = {
  keyPrefix: "",
  labelPrefix: "",
  loose: true,
  silent: false,
  strict: void 0,
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

  addVACFunc<T=any>(key: string, fn: ValidateAndCleanFunction<T>) {
    this.getFieldInfo(key).fns.unshift(fn)
  }

  addAssertion<T=any>(key: string, fn: (value: T, field: FieldInfo) => boolean, errmsg?: string | ((field: FieldInfo, value: T) => string)) {
    this.getFieldInfo(key).assertFns.push([fn, errmsg])
  }

  populate(dst: VACData, incoming: any, _popt: FillDataOption) {
    const popt: Required<FillDataOption> = { ...defaultFillDataOption, ..._popt }
    if (typeof popt['strict'] === 'boolean') popt.loose = !popt.strict
    else popt.strict = !popt.loose

    const { silent } = popt

    const errors: VACErrorInfo[] = []
    function pushError(key: string, message: string) {
      errors.push({ key, message })

      if (!silent) {
        console.error(LOG_PREFIX_TAG + key + ': ' + message)
      }
    }

    // Check Types and Fill data

    iter_each_field:
    for (const key in this.fields) {
      const field = this.fields[key]
      const { type } = field
      const prefixedKey = popt.keyPrefix + key
      const prefixedLabel = popt.labelPrefix + field.label

      // Check if it's required.

      if (!(key in incoming)) {
        if (field.required) pushError(prefixedKey, field.missingMessage || translate(R.IS_REQUIRED, prefixedLabel))
        continue iter_each_field
      }

      // Preprocessing

      for (let i = 0; i < field.fns.length; i++) {
        try {
          incoming[key] = field.fns[i](incoming[key], field, popt)
        } catch (err) {
          pushError(prefixedKey, typeof err === "string" ? err : translate(R.FAILED_AT_PREPROCESS, prefixedLabel, i))
          if (!silent) console.error(err)
          continue iter_each_field
        }
      }

      // Type check and conversion

      if (!type) {
        // No type info. Just use the value
        dst[key] = incoming[key]
      } else {
        // do type check and conversion
        const typeDescriptor = getTypeDescriptor(type)

        if (!typeDescriptor) {
          // Unknown type
          pushError(prefixedKey, translate(R.INTERNAL_UNKNOWN_TYPE, prefixedLabel))
          continue iter_each_field
        }

        try {
          const newValue = typeDescriptor.fromRaw(incoming[key], field, popt)
          if (typeof newValue !== 'undefined') dst[key] = newValue
        } catch (err) {
          if (typeof err === 'string') {
            pushError(prefixedKey, err)
          } else if (err instanceof Error) {
            pushError(prefixedKey, err.message)
            if (!silent) console.error(err)
          } else if (isArray(err)) {
            errors.push(...err)
            if (!silent) err.forEach((item: VACErrorInfo) => { console.error(LOG_PREFIX_TAG + item.key + ': ' + item.message) })
          } else { // TODO: check if this is a VACErrorInfo
            errors.push(err)
            if (!silent) console.error(LOG_PREFIX_TAG + err.key + ': ' + err.message)
          }

          continue iter_each_field
        }
      }

      // Final Assrtion

      for (const [assertFn, assertMsg] of field.assertFns) {
        try {
          if (!assertFn(dst[key], field)) {
            const msg = typeof assertMsg === 'function' ? assertMsg(field, dst[key]) : (assertMsg || translate(R.CUSTOM_ASSERT_FAILED, prefixedLabel))
            throw msg
          }
        } catch (err) {
          pushError(prefixedKey, err + '')
          continue iter_each_field
        }
      }
    }

    // update error status

    dst[S_ErrorInfo] = errors
    if (errors.length == 0) delete dst[S_ErrorInfo]
  }
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
  [S_ErrorInfo]?: VACErrorInfo[]

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

  getErrors(): VACErrorInfo[] {
    return this[S_ErrorInfo]
  }
}
