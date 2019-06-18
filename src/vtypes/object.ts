/**
 * This module provides a function that
 * compile your object schema into a VType instance,
 * with proper TypeScript typing infos.
 */

import { VType, ST2T, VProp, VPropMetas } from "../core";
import getVACContext from "../vcontext";

type ObjectPick<T, K> = {} & { [k in Extract<keyof T, K>]: T[k] }
type ObjectExclude<T, K> = {} & { [k in Exclude<keyof T, K>]: T[k] }

type ValidPropJsType = string | boolean | number | object
export interface ObjectProp extends VProp {
  required?: boolean
  default?: ValidPropJsType | (() => ValidPropJsType)
}

export interface VObjectOptions<T> {
  // https://json-schema.org/understanding-json-schema/reference/object.html
  dependencies?: { [k in keyof T]?: (keyof T)[] }
}

type ObjectSchema<Keys extends keyof any = string> =
  { [k in Keys]: ObjectProp }

/** Turn `{ [k: string]: ObjectProp }` into JavaScript Object Type */
type ObjectSchema2JsType<ST extends ObjectSchema> =
  { [k in keyof ST]: ST2T<ST[k]['type']> } & {}

/**
 * VObject is a kind of VType, which describe an plain js object.
 * You may call `VObject(...)` *without* `new` to create one VObject instance.
 *
 * @remarks by default all properties are optional. If you don't want this, use {@link VObject.required} to create the VObject instnacce.
 *
 * @example
 *
 *     const VisitorInfo = VObject({
 *       name: { type: String },
 *       age: { type: 'int' },
 *     })
 *
 *     const goodData = VisitorInfo.vac({ name: "John", age: "27.314159" })
 *     // goodData is { name: "John", age: 27 }
 */
class VObjectType<T extends Record<string, any>> extends VType<T>{

  constructor(
    public schema: ObjectSchema<keyof T>,
    public options?: VObjectOptions<T>
  ) {
    super()
    this.setResultPrototype(Object.prototype)
  }

  /**
   * Make a new VObject whose fields are optional (their `required` === `false`)
   *
   * In the new VObject, all fields are optional (which could be **dangerous**),
   * unless they are specified in `exclude`, or has a `default` value.
   *
   */
  partial(opts?: {
    /** these fields' `required` will not be changed */
    exclude?: (keyof T)[],

    /** update some fields' `default` value */
    default?: { [k in keyof T]?: T[k] }
  }): VObjectType<T> {
    const excludes = new Set(opts && opts.exclude)
    const defaults = opts && opts.default

    const schema = {} as ObjectSchema<keyof T>
    for (const k in this.schema) {
      const it = { ...this.schema[k] }
      if (!excludes.has(k)) it.required = false
      if (defaults && (k in defaults)) it.default = defaults[k]
      schema[k] = it
    }

    const ans = new VObjectType(schema, this.options)
    return ans
  }

  /**
   * Pick some fields from this VObject, and create a new VType from them.
   *
   * @example
   *
   *      const QA = VObject.required({
   *        id: { type: "int" },
   *        tags: { type: VArray({ items: { type: String } }) },
   *        question: { type: String },
   *        created_at: { type: Date },
   *        answer: { type: String },
   *        answerd_at: { type: Date },
   *      })
   *
   *      const Question = QA.pick("id", "tags", "question", "created_at")
   *
   *      // now you can
   *      Question.vac({ ... })
   *
   * @see {@link exclude}
   */
  pick<Keys extends keyof T>(...keys: Keys[]): VObjectType<ObjectPick<T, Keys>> {
    const schema = {} as ObjectSchema<Keys>
    keys.forEach(key => { schema[key] = this.schema[key] })
    return new VObjectType<ObjectPick<T, Keys>>(schema, this.options as any) // FIXME
  }


  /**
   * Create a new VType from this VObject's schema, without specified fields.
   *
   * @example
   *
   *      const QA = VObject.required({
   *        id: { type: "int" },
   *        tags: { type: VArray({ items: { type: String } }) },
   *        question: { type: String },
   *        created_at: { type: Date },
   *        answer: { type: String },
   *        answerd_at: { type: Date },
   *      })
   *
   *      const Question = QA.exclude("answer", "answerd_at")
   *
   *      // now you can
   *      Question.vac({ ... })
   *
   * @see {@link pick}
   */
  exclude<Keys extends keyof T>(...keys: Keys[]): VObjectType<ObjectExclude<T, Keys>> {
    const schema = { ...this.schema } as ObjectSchema<any>
    keys.forEach(key => { delete schema[key] })
    return new VObjectType<ObjectExclude<T, Keys>>(schema, this.options as any) // FIXME
  }

  vac(incoming: any, meta?: VPropMetas): T {
    const schema = this.schema
    const options = this.options || {}
    const context = getVACContext()

    if (context.stack.length == 0) {
      // handle root
      return context.operateRoot(this, meta, incoming)
    }

    var result = {} as T
    if (typeof incoming != 'object') throw new Error("not an object")
    if (incoming === null) throw new Error("cannot be null")

    for (const k in schema) {
      const p: ObjectProp = schema[k]
      context.operate(k, p, (vtype, vprop) => {
        // const vtype = getVType(p.type)
        let val: any

        if (k in incoming) {
          val = vtype.vac(incoming[k], vprop)
        }

        if (val === void 0) {
          if (p.required) throw new Error("required property is missing")
          if (p.default !== void 0) result[k] = typeof p.default === 'function' ? p.default() : p.default
        } else {
          result[k] = val
        }

        return val
      })
    }

    // Post Check

    if ('dependencies' in options) {
      const dependencies = options.dependencies
      for (const k in dependencies) {
        if (k in result) {
          dependencies[k].forEach(k2 => {
            if (!(k2 in result)) throw new Error(`${k} depends on ${k2} which is missing`)
          })
        }
      }
    }

    return result
  }
}

/**
 * compile your object schema into a VType instance,
 * with proper TypeScript typing infos.
 *
 * @remarks by default all properties are optional. If you don't want this, use {@link VObject.required} instead.
 *
 * @example
 *
 *     const VisitorInfo = VObject({
 *       name: { type: String },
 *       age: { type: 'int' },
 *     })
 *
 *     const goodData = VisitorInfo.vac({ name: "John", age: "27.314159" })
 *     // goodData is { name: "John", age: 27 }
 */
function makeVObject<ST extends ObjectSchema>(schema: ST, opts?: VObjectOptions<ObjectSchema2JsType<ST>>): VObjectType<ObjectSchema2JsType<ST>> {
  return new VObjectType<ObjectSchema2JsType<ST>>(schema, opts)
}

namespace makeVObject {
  export const prototype = VObjectType.prototype

  /**
   * compile your object schema into a VType instance, with proper TypeScript typing infos.
   *
   * In the object, **All properties are required** unless `required` or `default` is explicitly defined by you
   */
  export function required<ST extends ObjectSchema>(schema: ST, opts?: VObjectOptions<ObjectSchema2JsType<ST>>): VObjectType<ObjectSchema2JsType<ST>> {
    const newSchema = {} as ST
    for (const key in schema) {
      const op = schema[key]
      const required = !('default' in op) && !('required' in op)
      newSchema[key] = { required, ...op }
    }
    return makeVObject(newSchema, opts)
  }
}

type VObject<T> = VObjectType<T>
const VObject = makeVObject as (typeof VObjectType & typeof makeVObject)

export default VObject
