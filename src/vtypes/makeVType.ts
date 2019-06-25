import getVACContext from "../vcontext";
import { VPropMetas, VType } from "../core";

/**
 * create a simple VType from a factory function and some information
 *
 * @remarks
 * Without `makeVType`, to get a usable type, you must *declare* a new class that inherits from {@link VType},
 * *construct* an instance of it, then finally get a usable VType *instance*.
 *
 * `makeVType` can make a VType *instance* easily. For example:
 *
 * ```ts
 *     const Integer = makeVType(x => parseInt(x), { result: Number })
 *     const RawArray = makeVType(x => Uint8Array.from(x), { result: Uint8Array })
 * ```
 *
 * then you may register those VType instances with {@link define}, or directly use them like this:
 *
 * ```ts
 *     const SomeForm = VObject({
 *        num: { type: Integer },
 *        data: { type: RawArray },
 *     })
 * ```
 *
 * @param convertor - accept any value, and field meta info({@link VPropMetas}),
 *                    convert value to proper type or throw an `Error`.
 * @param info - extra info that VType requires. see {@link Info_MakeVType}
 * @returns `VType<T>` instance
 */
export function makeVType<T>(
  convertor: (x: any, meta?: VPropMetas) => T,
  info: Info_MakeVType
): VType<T> {
  const result = new class extends VType<T> {
    vac(x: any, meta?: VPropMetas): T {
      const context = getVACContext()
      // handle root
      if (context.stack.length == 0) return context.operateRoot(this, meta, x)

      return convertor(x, meta)
    }
  }

  result.typeName = info.typeName

  let prototype = info.result.prototype
  if (!prototype || prototype.constructor !== info.result) prototype = Object.getPrototypeOf(info.result)
  result.setResultPrototype(prototype)

  return result
}

export interface Info_MakeVType {
  /**
   * if your convertor results:
   *
   * - a string: use `String`
   * - a number: use `Number`
   * - a boolean: use `Boolean`
   * - a object: use `Object`
   * - anything else: use its constructor function (eg. `RegExp` the constructor function)
   *   or an instance of the result (eg. `/^$/` which is an RegExp)
   */
  result: any

  typeName?: string
}
