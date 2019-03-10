import "reflect-metadata";

import { R, translate } from "./i18n";
import { getVACInfoOf, PrimitiveType, PrimitiveConstructor, isPrimitiveConstructor, ValidateAndCleanFunction, isPrimitive, isArray, VACDataType, VACDataConstructor, VACData, IsArrayOfOptions, ConstructorOf, FieldInfo } from "./core";

function getReflectType(target: any, key: string) {
  if (typeof Reflect === 'object' && typeof Reflect['getMetadata'] === 'function') {
    return Reflect.getMetadata("design:type", target, key)
  }
  return null
}

export function Optional(): PropertyDecorator;
export function Optional(type: PrimitiveConstructor | ConstructorOf<any>): PropertyDecorator;
export function Optional(target: Object, key: string): void;
export function Optional(arg1?: any, arg2?: any) {
  var type: any

  const doDecorate: PropertyDecorator = (target: Object | string, key: string) => {
    const field = getVACInfoOf(target).getFieldInfo(key)
    field.type = type || field.type || getReflectType(target, key)
  }

  if (arguments.length === 1) { type = arg1 }
  else return doDecorate(arg1, arg2)

  return doDecorate
}

export type RequiredOptions = {
  type: any,
  missingMessage?: string
}

export function Required(): PropertyDecorator;
export function Required(errorMessageWhenMissing: string): PropertyDecorator;
export function Required(type: PrimitiveConstructor | ConstructorOf<any>): PropertyDecorator;
export function Required(options: RequiredOptions): PropertyDecorator;
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

  if (arguments.length === 1) {
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

export function Label(labelText: string): PropertyDecorator {
  return function (target: Object, key: string) {
    const field = getVACInfoOf(target).getFieldInfo(key)
    field.label = labelText
  }
}

export function WithFieldInfo(info: Partial<FieldInfo>): PropertyDecorator
export function WithFieldInfo(infoModifier: (field: FieldInfo) => void): PropertyDecorator
export function WithFieldInfo(arg1: Partial<FieldInfo> | ((field: FieldInfo) => void)): PropertyDecorator {
  return function (target: Object, key: string) {
    const field = getVACInfoOf(target).getFieldInfo(key)
    if (typeof arg1 === 'function') arg1(field)
    else Object.assign(field, arg1)
  }
}

export function ProcessWith(fn: ValidateAndCleanFunction): PropertyDecorator {
  return function (target: Object, key: string) {
    getVACInfoOf(target).addVACFunc(key, fn)
  }
}

export function AssertWith(fn: (value: any, field: FieldInfo) => boolean, failedMessage?: string): PropertyDecorator {
  return function (target: Object, key: string) {
    getVACInfoOf(target).addAssertion(key, fn, failedMessage)
  }
}

export function Max(maxval: number, message?: string): PropertyDecorator {
  return function (target: Object, key: string) {
    getVACInfoOf(target).addAssertion(
      key,
      val => val <= maxval,
      field => message || translate(R.CANT_BE_GREATER_THAN, field.label, maxval)
    )
  }
}

export function Min(minval: number, message?: string): PropertyDecorator {
  return function (target: Object, key: string) {
    getVACInfoOf(target).addAssertion(
      key,
      val => val >= minval,
      field => message || translate(R.CANT_BE_LESS_THAN, field.label, minval)
    )
  }
}

function formatOptions(options: OptionType[]) {
  return options.map((x) => {
    if (isPrimitive(x)) return { value: x, label: "" + x }
    else return { value: x.value, label: x.label || ("" + x.value) }
  })
}

export type OptionType = PrimitiveType | { value: PrimitiveType, label?: string }
export function IsOneOf(options: OptionType[]): PropertyDecorator {
  return function (target: Object, key: string) {
    const vinfo = getVACInfoOf(target)
    const field = vinfo.getFieldInfo(key)
    field.enum = formatOptions(options)
    field.type = null // no need to check type; it is ensured by enum
    vinfo.addVACFunc(key, function (value, field) {
      if (!field.enum.some(item => item.value === value)) throw translate(R.HAS_WRONG_VALUE, field.label)
    })
  }
}

export { IsArrayOfOptions } from "./core"

export function IsArrayOf(
  enumOptions: OptionType[],
  isArrayOf_options?: IsArrayOfOptions
): PropertyDecorator
export function IsArrayOf(
  criteria: PrimitiveConstructor | VACDataConstructor | ConstructorOf<any> | ((value: any) => boolean),
  options?: IsArrayOfOptions
): PropertyDecorator
export function IsArrayOf(
  criteria: OptionType[] | PrimitiveConstructor | VACDataConstructor | ConstructorOf<any> | ((value: any) => boolean),
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

export function MatchRegExp(regexp: RegExp, message?: string): PropertyDecorator {
  return function (target: Object, key: string) {
    getVACInfoOf(target).addAssertion(
      key,
      checking => regexp.test(checking),
      field => message || translate(R.HAS_WRONG_FORMAT, field.label)
    )
  }
}

export function IsEmail(message: string): PropertyDecorator;
export function IsEmail(target: Object, key: string): void;
export function IsEmail(arg1: Object | string, arg2?: string) {
  const re_email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i
  let message: string

  function doDecorate(target: Object | string, key: string) {
    getVACInfoOf(target).addAssertion(
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
