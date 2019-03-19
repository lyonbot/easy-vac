import { TypeDescriptor } from './base';
import { R, translate } from '../i18n';
import { isPrimitive } from '../util';

export const StringType: TypeDescriptor<string> = {
  name: "string",
  fromRaw(x, field, { loose, labelPrefix }) {
    if (x instanceof String) return x.valueOf()
    if (typeof x === 'string') return x
    if (loose && isPrimitive(x)) return "" + x

    throw translate(R.MUST_BE_STRING, labelPrefix + field.label)
  },
}

export const NumberType: TypeDescriptor<number> = {
  name: "number",
  fromRaw(x, field, { loose, labelPrefix }) {
    if (x instanceof Number) return x.valueOf()
    if (typeof x === 'number') return x
    if (loose && isPrimitive(x)) {
      if (typeof x === 'boolean') return x ? 1 : 0
      
      const num = parseFloat(x as string)
      if (!isNaN(num)) return num
    }

    throw translate(R.MUST_BE_NUMBER, labelPrefix + field.label)
  },
}

export const BooleanType: TypeDescriptor<boolean> = {
  name: "boolean",
  fromRaw(x, field, { loose, labelPrefix }) {
    if (x instanceof Boolean) return x.valueOf()
    if (typeof x === 'boolean') return x
    if (loose && isPrimitive(x)) {
      if (typeof x === "string") {
        if (/^(?:true|yes|y)$/i.test(x)) return true
        if (/^(?:false|no|n)$/i.test(x)) return false
      }
      return !!x
    }

    throw translate(R.MUST_BE_BOOLEAN, labelPrefix + field.label)
  },
}
