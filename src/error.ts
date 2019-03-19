import { FieldInfo, FillDataOption } from './core';

export type VACErrorInfo = { key: string, message: string, [k: string]: any }

export function toErrorInfo(a: string | Error | VACErrorInfo, field: FieldInfo, popt: FillDataOption): VACErrorInfo {
  if (!a) return { key: popt.keyPrefix + field.key, message: "Unknown error" }
  if (typeof a !== 'object') return { key: popt.keyPrefix + field.key, message: a + '' }
  if (a instanceof Error) return { key: popt.keyPrefix + field.key, message: a.message, error: a }
  return a
}