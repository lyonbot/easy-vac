import { VACData } from './core';

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