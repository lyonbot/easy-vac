import { FieldInfo, FillDataOption } from '../core';

export interface TypeDescriptor<T> {
  /**
   * name of this type. this is kinda meanless.
   */
  name?: string

  /**
   * a function that handle raw input and return a value with proper type, or an `undefined` to omit the field.
   * 
   * this function can also throws:
   *
   * - a error message string
   * - a `Error`
   * - a `VACErrorInfo` (which is declared in `../error.ts`)
   * - an Array of `VACErrorInfo`
   */
  fromRaw(data: any, field: FieldInfo, opt: FillDataOption): T | void
}

export function isTypeDescriptor<T>(x: any): x is TypeDescriptor<T> {
  return x && typeof x['fromRaw'] === 'function' && x.fromRaw.length >= 1
}
