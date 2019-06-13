/** VTypes Registry */

import { VTypeDict, VType, SchemaType, isVType } from "../core";
import { ConstructorOf } from "../helpers";

const vTypeDict = {} as { [k in keyof VTypeDict]: VType<any> }
const vTypeDict2 = new Map<any, VType<any>>()

/**
 *
 * @param name  the typename defined in {@link VTypeDict}
 * @param vtype an VType instance. see the remarks of {@link VType}
 */
export function define<K extends keyof VTypeDict>(name: K, vtype: VType<VTypeDict[K]>): void
export function define<K extends object>(clazz: ConstructorOf<K>, vtype: VType<K>): void
export function define<K extends object>(whateverYouLike: K, vtype: VType<K>): void

export function define(nameOrCtor: object | keyof VTypeDict, vtype: VType<any>) {
  if (typeof nameOrCtor === 'string') {
    vTypeDict[nameOrCtor] = vtype
  } else if (nameOrCtor) {
    vTypeDict2.set(nameOrCtor, vtype)
  }
}

export function getVType<T>(type: SchemaType): VType<T> {
  if (typeof type !== 'string') {
    if (vTypeDict2.has(type)) return vTypeDict2.get(type)
    else if (type === String) type = 'string'
    else if (type === Boolean) type = 'boolean'
    else if (type === Number) type = 'number'
    else if (isVType<T>(type)) return type
    else throw new Error("no defined vtype for " + type)
  }

  const defination = vTypeDict[type as string] as VType<T>
  if (!defination) throw new Error(`no defined vtype for "${type}"`)
  return defination
}
