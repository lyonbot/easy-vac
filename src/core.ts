import { ConstructorOf } from "./helpers";

/**
 * While declaring object properties / array types etc., the `type` can also be a typename string.
 * The corresponding JavaScript type is defined by this look-up table
 *
 * @example
 *
 *     const UserInfo = VObject({
 *       username: { type: String },
 *       pin_code: { type: "int" },
 *       // "int" means `number`, which shall be declared in VTypeDict
 *     })
 *
 * @remarks
 *
 * This typing table may be expanded by other TypeScript files. For example, in your .ts files:
 *
 *     declare module "easy-vac" {
 *       interface VTypeDict {
 *         "int": number
 *         "email_address": string
 *         "price": number
 *         "your_typename": SomeClass
 *       }
 *     }
 *
 * @see {@link ./vtypes/builtin.ts} for example
 */
export interface VTypeDict {
}

/**
 * meta for every type field. see "extensions" dir
 * This typing table may be expanded by other TypeScript files. In your .ts files:
 *
 *     declare module "easy-vac" {
 *       interface VPropMetas {
 *         is_awesome?: boolean
 *       }
 *     }
 */
export interface VPropMetas {
  label?: string | number
  description?: string

  // VPropMetas is extensible. See <./extensions/json-schema-rules.ts> for example
}

/** @internal */
export interface VProp<ST extends SchemaType = SchemaType> extends VPropMetas {
  type: ST
}

/** @hidden */
declare const Maybe_you_need__makeVType: unique symbol

/**
 * Instances of VType-based classes are used for fields' `type` definition.
 *
 * A VType-based class shall implement `vac(incoming, meta)` method,
 * which may check input value and convert it into correct form.
 *
 * @remarks
 *
 * You may make your own `VType<T>` instances with these helper functions:
 *
 * + {@link VObject} for structed objects
 * + {@link VArray} for arrays
 * + {@link VEnum} for enum values
 * + {@link VTuple} for tuples
 * + {@link makeVType} for any type (eg. `ObjectId`, `Date`)
 */
export abstract class VType<T> {
  /** @hidden */
  private [Maybe_you_need__makeVType]: any

  /** the prototype of result */
  public resultPrototype: any

  /** the javascript type name of result's prototype. eg: String, RegExp */
  public typeName: string

  public setResultPrototype(prototype: any): this {
    this.resultPrototype = prototype
    if (!this.typeName) this.typeName = prototype && prototype.constructor && prototype.constructor.name
    return this
  }

  /**
   * check input value and convert it into correct form, or throw an `Error` if failed to convert/verify.
   *
   * @param incoming - incoming value can be any type.
   * @param meta - Additional infos for current field. The type of `meta` is defined in {@link VPropMetas}.
   *               You may ignore `meta` if you don't need it. (in most cases, it is kinda useless)
   */
  public abstract vac(incoming: any, meta?: VPropMetas): T
}

/**
 * create a simple VType from a convertor function and some information
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
    vac(x: any, meta?: VPropMetas): T { return convertor(x, meta) }
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

export function isVType<T>(x: any): x is VType<T> { return x instanceof VType }

/**
 * ST(SchemaType) can be a typename string(see {@link VTypeDict}), a {@link VType}, or a class constructor
 */
export type SchemaType = keyof VTypeDict | Object
// export type SchemaType = keyof VTypeDict | VType<any> | ConstructorOf<any>  // this ruins VEnum indexSignature feature somehow

/**
 * This helper turns ST({@link SchemaType}) into corresponding JavaScript type
 */
export type ST2T<ST> =
  ST extends VType<infer T> ? T :
  ST extends NumberConstructor ? number :
  ST extends BooleanConstructor ? boolean :
  ST extends StringConstructor ? string :
  ST extends keyof VTypeDict ? VTypeDict[ST] :
  ST extends ConstructorOf<infer T> ? T :
  never
