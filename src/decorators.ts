import "reflect-metadata";

import { R, translate } from "./i18n";
import { getVACInfoOf, PrimitiveType, PrimitiveConstructor, ValidateAndCleanFunction, isPrimitive, isArray, VACDataType, VACDataConstructor, VACData, IsArrayOfOptions, ConstructorOf, FieldInfo, IsArrayOf_CustomAssert } from "./core";

function getReflectType(target: any, key: string) {
  if (typeof Reflect === 'object' && typeof Reflect['getMetadata'] === 'function') {
    return Reflect.getMetadata("design:type", target, key)
  }
  return null
}

/**
 * Mark this field as optional.
 * 
 * - **JavaScript Users:** don't forget declaring the type here!
 * - **TypeScript Users:** don't forget `: THE_FIELD_TYPE`, even if a default value is given
 */
export function Optional(): PropertyDecorator;
/**
 * Mark this field as optional.
 * 
 * @param type Type of this field. Overrides TypeScript and reflect-metadata's default.
 */
export function Optional(type: PrimitiveConstructor | ConstructorOf<any>): PropertyDecorator;
/**
 * Mark this field as optional.
 * 
 * - **JavaScript Users:** don't forget declaring the type here!
 * - **TypeScript Users:** don't forget `: THE_FIELD_TYPE`, even if a default value is given
 */
export function Optional(target: Object, key: string): void;
export function Optional(arg1?: any, arg2?: any) {
  var type: any

  const doDecorate: PropertyDecorator = (target: Object | string, key: string) => {
    const field = getVACInfoOf(target).getFieldInfo(key)
    field.type = type || field.type || getReflectType(target, key)
  }

  if (arguments.length === 0) { return doDecorate }
  else if (arguments.length === 1) { type = arg1; return doDecorate }
  else doDecorate(arg1, arg2)
}

export type RequiredOptions = {
  type: any,
  missingMessage?: string
}

/**
 * Mark this field as required. 
 * 
 * - **JavaScript Users:** don't forget declaring the type here!
 */
export function Required(): PropertyDecorator;

/**
 * Mark this field as required.
 * 
 * - **JavaScript Users:** don't forget declaring the type here!
 * 
 * @param errorMessageWhenMissing (optional) error message to user, if the field is missing
 */
export function Required(errorMessageWhenMissing: string): PropertyDecorator;

/**
 * Mark this field as required.
 * 
 * @param type Type of this field. Overrides TypeScript and reflect-metadata's default.
 */
export function Required(type: PrimitiveConstructor | ConstructorOf<any>): PropertyDecorator;
export function Required(options: RequiredOptions): PropertyDecorator;

/**
 * Mark this field as required.
 * 
 * - **JavaScript Users:** don't forget declaring the type here!
 */
export function Required(target: Object, key: string): void;
export function Required(arg1?: any, arg2?: any) {
  var type: any
  var message: string

  const doDecorate: PropertyDecorator = (target: Object | string, key: string) => {
    const field = getVACInfoOf(target).getFieldInfo(key)
    field.type = type || field.type || getReflectType(target, key)
    field.required = true
    field.missingMessage = message
  }

  if (arguments.length === 0) {
    return doDecorate
  } else if (arguments.length === 1) {
    if (typeof arg1 === 'string') {
      message = arg1
    } else if (Object.getPrototypeOf(arg1) === Object && 'type' in arg1) {
      type = arg1.type
      message = arg1.missingMessage
    } else {
      type = arg1
    }
    return doDecorate
  } else {
    doDecorate(arg1, arg2)
  }
}

/**
 * Adding label for a field.
 * 
 * @param labelText label of this field
 * 
 * @see https://github.com/lyonbot/easy-vac/wiki/FieldInfo
 * @see WithFieldInfo
 */
export function Label(labelText: string): PropertyDecorator {
  return function (target: Object, key: string) {
    const field = getVACInfoOf(target).getFieldInfo(key)
    field.label = labelText
  }
}

/**
 * (Dangerously) Overwrite this field's FieldInfo, which might affect easy-vac's internal behavior.
 * 
 * You may add some doc-text or comment, which could help a lot whlie generating doc / UI.
 * 
 * @param info whatever you want to append / overwrite. easy-vac uses `Object.assign` to merge FieldInfo
 * 
 * @see https://github.com/lyonbot/easy-vac/wiki/FieldInfo
 * @see Label
 */
export function WithFieldInfo(info: Partial<FieldInfo>): PropertyDecorator
export function WithFieldInfo(infoModifier: (field: FieldInfo) => void): PropertyDecorator
export function WithFieldInfo(arg1: Partial<FieldInfo> | ((field: FieldInfo) => void)): PropertyDecorator {
  return function (target: Object, key: string) {
    const field = getVACInfoOf(target).getFieldInfo(key)
    if (typeof arg1 === 'function') arg1(field)
    else Object.assign(field, arg1)
  }
}

/**
 * Validate and Pre-process incoming value.
 * 
 * @param fn a function that accepts the raw input (or previous processing function's result, if any), 
 *           validates and returns new value (which could be in different type).
 *           **Throws a string as the error message, if the incoming value is invalid!**
 * 
 * @see https://github.com/lyonbot/easy-vac/wiki/Procedure
 */
export function ProcessWith(fn: ValidateAndCleanFunction): PropertyDecorator {
  return function (target: Object, key: string) {
    getVACInfoOf(target).addVACFunc(key, fn)
  }
}

/**
 * Check the cleaned value
 * 
 * @param fn a function that checks the value (which is in proper type now), returns a boolean, or
 *           **throws a string as the error message, if the value is invalid!**
 * 
 * @see https://github.com/lyonbot/easy-vac/wiki/Procedure
 */
export function AssertWith(fn: (value: any, field: FieldInfo) => boolean, failedMessage?: string): PropertyDecorator {
  return function (target: Object, key: string) {
    getVACInfoOf(target).addAssertion(key, fn, failedMessage)
  }
}

function formatOptions(options: OptionType[]) {
  return options.map((x) => {
    if (isPrimitive(x)) return { value: x, label: "" + x }
    else return { value: x.value, label: x.label || ("" + x.value) }
  })
}

export type OptionType = PrimitiveType | { value: PrimitiveType, label?: string }

/**
 * Mark that this field only accepts values in the enum options.
 * 
 * Enum options' value must be a primitive (string, number or boolean)
 */
export function IsOneOf(options: OptionType[]): PropertyDecorator {
  return function (target: Object, key: string) {
    const field = getVACInfoOf(target).getFieldInfo(key)
    field.enum = formatOptions(options)
    field.type = "enum"
  }
}

export { IsArrayOfOptions } from "./core"

/**
 * This field is an array, and all of its elements must meets the criteria
 * 
 * @param criteria can be `String`, `Number`, `Boolean`, `YourAnotherVACDataClass`, or an assertion function returning boolean
 * @param [isArrayOf_options] extra options for array-checking
 */
export function IsArrayOf(
  criteria: PrimitiveConstructor | VACDataConstructor | ConstructorOf<any> | IsArrayOf_CustomAssert,
  isArrayOf_options?: IsArrayOfOptions
): PropertyDecorator

/**
 * This field is an array, and all of its elements must be in the enum.
 * 
 * Enum options' value must be a primitive (string, number or boolean)
 * 
 * @param enumOptions the enum
 * @param [isArrayOf_options] extra options for array-checking
 */
export function IsArrayOf(
  enumOptions: OptionType[],
  isArrayOf_options?: IsArrayOfOptions
): PropertyDecorator


export function IsArrayOf(
  criteria: OptionType[] | PrimitiveConstructor | VACDataConstructor | ConstructorOf<any> | IsArrayOf_CustomAssert,
  options?: IsArrayOfOptions
): PropertyDecorator {
  return function (target: Object, key: string) {
    const vinfo = getVACInfoOf(target)
    const field = vinfo.getFieldInfo(key)

    vinfo.addVACFunc(key, "isArrayOf-check")

    field.type = Array
    field.isArrayOf_options = options || {}

    if (isArray(criteria)) {
      // Array of Enum
      field.enum = formatOptions(criteria)
      field.isArrayOf = "enum"
    } else {
      // other situation
      field.isArrayOf = criteria
    }
  }
}



export function Max(maxval: number, message?: string): PropertyDecorator {
  return function (target: Object, key: string) {
    const vinfo = getVACInfoOf(target)
    vinfo.getFieldInfo(key).type = Number
    vinfo.addAssertion(
      key,
      val => val <= maxval,
      field => message || translate(R.CANT_BE_GREATER_THAN, field.label, maxval)
    )
  }
}

export function Min(minval: number, message?: string): PropertyDecorator {
  return function (target: Object, key: string) {
    const vinfo = getVACInfoOf(target)
    vinfo.getFieldInfo(key).type = Number
    vinfo.addAssertion(
      key,
      val => val >= minval,
      field => message || translate(R.CANT_BE_LESS_THAN, field.label, minval)
    )
  }
}

export function MatchRegExp(regexp: RegExp, message?: string): PropertyDecorator {
  return function (target: Object, key: string) {
    const vinfo = getVACInfoOf(target)
    vinfo.getFieldInfo(key).type = String
    vinfo.addAssertion(
      key,
      checking => regexp.test(checking),
      field => message || translate(R.HAS_WRONG_FORMAT, field.label)
    )
  }
}

export function IsEmail(): PropertyDecorator;
export function IsEmail(message: string): PropertyDecorator;
export function IsEmail(target: Object, key: string): void;
export function IsEmail(arg1?: Object | string, arg2?: string) {
  const re_email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i
  let message: string

  function doDecorate(target: Object | string, key: string) {
    const vinfo = getVACInfoOf(target)
    vinfo.getFieldInfo(key).type = String
    vinfo.addAssertion(
      key,
      checking => re_email.test(checking),
      field => message || translate(R.MUST_BE_EMAIL, field.label)
    )
  }

  if (arguments.length > 1) {
    doDecorate(arg1, arg2)
  } else {
    message = arg1 as string
    return doDecorate
  }
}
