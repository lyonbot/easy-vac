import { R, translate } from '../i18n';
import { VACData } from '../core';
import { VACErrorInfo } from '../error';
import { ConstructorOf } from '../util';

import { TypeDescriptor, isTypeDescriptor } from './base';
import { ArrayTypeDescriptor } from './array';
import { EnumTypeDescriptor } from './enum';
import { DateTypeDescriptor } from './builtin';
import * as BuiltinFieldTypes from "./primitive"

const registeredTypes = new Map<any, TypeDescriptor<any>>([
  [String, BuiltinFieldTypes.StringType],
  [Number, BuiltinFieldTypes.NumberType],
  [Boolean, BuiltinFieldTypes.BooleanType],
  [Date, DateTypeDescriptor],
  [Array, ArrayTypeDescriptor],
  ['enum', EnumTypeDescriptor],
])

/**
 * register or overwrite a value type
 */
export function registerType<T>(type: ConstructorOf<T>): void
export function registerType<T>(type: ConstructorOf<T>, factoryFn: (incomingValue: any) => T): void
export function registerType<T>(type: ConstructorOf<T>, typeDescriptor: TypeDescriptor<T>): void
export function registerType<T>(type: ConstructorOf<T>, arg2?: any): void {
  let typeDescriptor: TypeDescriptor<any>

  if (!arg2) arg2 = x => new type(x)

  if (typeof arg2 === 'function') typeDescriptor = {
    fromRaw(v, field, popt) {
      try {
        if (v instanceof type) return v
        return arg2(v)
      } catch (err) {
        if (!popt.silent) console.error(err)
        throw translate(R.FIELD_TYPE_FACTORY_FAILED, popt.labelPrefix + field.label)
      }
    }
  }
  else if (isTypeDescriptor(arg2)) typeDescriptor = arg2
  else throw new Error("A valid FieldType is required")

  registeredTypes.set(type, typeDescriptor)
}

/**
 * get a `TypeDescriptor` of known type, or a VACData.
 * 
 * note that this might returns null
 */
export function getTypeDescriptor<T=any>(type: any): TypeDescriptor<T> {
  let v = registeredTypes.get(type)
  if (!v) {
    if (Object.getPrototypeOf(type) === VACData) {
      // this is a nested VACData. generate a TypeDescriptor object for it
      v = {
        name: type.name,
        fromRaw(v, field, opt) {
          if (v instanceof type) return v
          if (!v && !field.required) return void 0  // optional field: use undefined

          var prefixedKey = opt.keyPrefix + field.key
          var prefixedLabel = opt.labelPrefix + field.label

          var result = new type() as VACData
          result.fillDataWith(v, {
            ...opt,
            keyPrefix: prefixedKey + ".",
            labelPrefix: prefixedLabel + "->"
          })

          if (result.hasErrors()) {
            throw [
              { key: prefixedKey, message: translate(R.HAS_WRONG_VALUE, prefixedLabel) } as VACErrorInfo,
              ...result.getErrors()
            ]
          } else {
            return result
          }
        }
      }
    }
  }
  return v || null
}
