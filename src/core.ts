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

export function isVType<T>(x: any): x is VType<T> { return x instanceof VType }

/**
 * ST(SchemaType) can be a typename string(see {@link VTypeDict}), a {@link VType}, or a class constructor
 */
export type SchemaType = keyof VTypeDict | VType<any> | ConstructorOf<any>

/**
 * Infer the corresponding JavaScript type from a {@link SchemaType} type `ST`
 */
export type ST2T<ST> =
  ST extends VType<infer T> ? T :
  ST extends NumberConstructor ? number :
  ST extends BooleanConstructor ? boolean :
  ST extends StringConstructor ? string :
  ST extends keyof VTypeDict ? VTypeDict[ST] :
  ST extends ConstructorOf<infer T> ? T :
  unknown
