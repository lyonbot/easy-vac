/**
 * This module provides a function that
 * compile your object schema into a VType instance,
 * with proper TypeScript typing infos.
 */

import { VType, ST2T, VProp, VPropMetas } from "../core";
import getVACContext from "../vcontext";

type SimpleObject = Record<string, any>
type ObjectPick<T, K> = {} & { [k in Extract<keyof T, K>]: T[k] }
type ObjectExclude<T, K> = {} & { [k in Exclude<keyof T, K>]: T[k] }

/**
 * Mix Two Object types.
 * if field keys have conflict, use latter's field type
 */
type MTO<T1 extends SimpleObject, T2 extends SimpleObject> = {} & {
  [k in keyof T1 | keyof T2]: (k extends keyof T2 ? T2[k] : k extends keyof T1 ? T1[k] : never)
}

/* script that generate the VObjectMixMany mess

var out = []
for (let j=10; j>=1; j--) {
  var arr = [], wrap = "T0"
  for (let i=1; i<=j; i++) {
    arr.push(`T${i}`)
    wrap = `MTO<${wrap}, T${i}>`
  }
  out.push(': PS extends [' +
          arr.map(x=>`VObjectType<infer ${x}>`).join(', ') +
          '] ? ' + wrap)
}
console.log(out.join("\n"))

*/

type VObjectMixMany<T0 extends SimpleObject, PS extends VObjectType<any>[]>
  = PS extends [VObjectType<infer T1>, VObjectType<infer T2>, VObjectType<infer T3>, VObjectType<infer T4>, VObjectType<infer T5>, VObjectType<infer T6>, VObjectType<infer T7>, VObjectType<infer T8>, VObjectType<infer T9>, VObjectType<infer T10>] ? MTO<MTO<MTO<MTO<MTO<MTO<MTO<MTO<MTO<MTO<T0, T1>, T2>, T3>, T4>, T5>, T6>, T7>, T8>, T9>, T10>
  : PS extends [VObjectType<infer T1>, VObjectType<infer T2>, VObjectType<infer T3>, VObjectType<infer T4>, VObjectType<infer T5>, VObjectType<infer T6>, VObjectType<infer T7>, VObjectType<infer T8>, VObjectType<infer T9>] ? MTO<MTO<MTO<MTO<MTO<MTO<MTO<MTO<MTO<T0, T1>, T2>, T3>, T4>, T5>, T6>, T7>, T8>, T9>
  : PS extends [VObjectType<infer T1>, VObjectType<infer T2>, VObjectType<infer T3>, VObjectType<infer T4>, VObjectType<infer T5>, VObjectType<infer T6>, VObjectType<infer T7>, VObjectType<infer T8>] ? MTO<MTO<MTO<MTO<MTO<MTO<MTO<MTO<T0, T1>, T2>, T3>, T4>, T5>, T6>, T7>, T8>
  : PS extends [VObjectType<infer T1>, VObjectType<infer T2>, VObjectType<infer T3>, VObjectType<infer T4>, VObjectType<infer T5>, VObjectType<infer T6>, VObjectType<infer T7>] ? MTO<MTO<MTO<MTO<MTO<MTO<MTO<T0, T1>, T2>, T3>, T4>, T5>, T6>, T7>
  : PS extends [VObjectType<infer T1>, VObjectType<infer T2>, VObjectType<infer T3>, VObjectType<infer T4>, VObjectType<infer T5>, VObjectType<infer T6>] ? MTO<MTO<MTO<MTO<MTO<MTO<T0, T1>, T2>, T3>, T4>, T5>, T6>
  : PS extends [VObjectType<infer T1>, VObjectType<infer T2>, VObjectType<infer T3>, VObjectType<infer T4>, VObjectType<infer T5>] ? MTO<MTO<MTO<MTO<MTO<T0, T1>, T2>, T3>, T4>, T5>
  : PS extends [VObjectType<infer T1>, VObjectType<infer T2>, VObjectType<infer T3>, VObjectType<infer T4>] ? MTO<MTO<MTO<MTO<T0, T1>, T2>, T3>, T4>
  : PS extends [VObjectType<infer T1>, VObjectType<infer T2>, VObjectType<infer T3>] ? MTO<MTO<MTO<T0, T1>, T2>, T3>
  : PS extends [VObjectType<infer T1>, VObjectType<infer T2>] ? MTO<MTO<T0, T1>, T2>
  : PS extends [VObjectType<infer T1>] ? MTO<T0, T1>
  : unknown

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


  /**
   * create a new VObject instance, whose fields are from *this* VObject & *other* VObjects.
   *
   * - if field keys have conflict, the latter VObjects' field types will be used.
   * - if `this.options` is defined, it will be used in the new VObject.
   *   - this behavior may change in the future.
   *
   * @example
   *
   *     // First, define some VObject types
   *
   *     const PostcardBase = VObject.required({
   *        id: { type: Number },  // this will be overwritten by `WithId`
   *        from: { type: String },
   *        message: { type: String },
   *     })
   *     const WithResponse = VObject.required({
   *        responder: { type: String },
   *        response: { type: String },
   *     })
   *     const WithCreateTime = VObject.required({
   *        created_at: { type: Date },
   *     })
   *     const WithId = VObject.required({
   *        id: { type: String },
   *     })
   *
   *     // Then compose a VObject from them
   *
   *     const SuperPostcard = PostcardBase.extend(WithResponse, WithCreateTime, WithId)
   *
   *     // now we get the mixed VObject type `SuperPostcard`
   *
   *     SuperPostcard.vac({
   *       id: "_not_number_anymore_",
   *       created_at: "2019-06-20",
   *       responder: "Bob",
   *       response: "Now I see you",
   *       from: "Alice",
   *       message: "Knock, knock"
   *     })
   *
   */
  extend<PS extends VObjectType<any>[]>(...others: PS): VObjectType<VObjectMixMany<T, PS>> {
    const schema = Object.assign({ ...this.schema }, ...others.map(it => it.schema))
    return new VObjectType<any>(schema, this.options as any) // FIXME: not good to use this.options
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
